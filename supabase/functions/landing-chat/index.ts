// Chatbot público en la mini-landing de un distribuidor: responde preguntas
// de visitantes sobre nutrición celular / FitLine, con las mismas reglas de
// compliance que compliance-check. Usa el conocimiento personalizado que el
// propio distribuidor haya añadido (chat_knowledge), y si no está seguro de
// la respuesta, avisa al distribuidor (chat_alerts + notificación push).
// No requiere autenticación.

import { createClient } from "jsr:@supabase/supabase-js@2";
import webpush from "npm:web-push@3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RATE_LIMIT = 20;
const RATE_LIMIT_WINDOW_SECONDS = 3600;

function systemPrompt(
  distributorName: string | null,
  bio: string | null,
  knowledge: { topic: string; answer: string }[]
) {
  const knowledgeBlock = knowledge.length
    ? `\n\nConocimiento adicional que te ha dado el distribuidor (úsalo cuando la pregunta encaje):\n${knowledge
        .map((k) => `- ${k.topic}: ${k.answer}`)
        .join("\n")}`
    : "";

  return `Eres el asistente virtual de ${distributorName ?? "un distribuidor independiente"} de PM International (línea FitLine, nutrición celular). ${bio ? `Sobre él/ella: "${bio}".` : ""}${knowledgeBlock}

Te presentas siempre como un asistente automático, nunca como si fueras la persona real — deja claro que eres una IA que ayuda a resolver dudas rápidas mientras el distribuidor no está disponible.

Reglas de compliance, obligatorias:
- Nunca afirmes que un producto cura, trata o previene una enfermedad concreta.
- Nunca prometas resultados médicos garantizados.
- Nunca compares el producto con medicamentos o tratamientos médicos.
- Solo puedes hablar en términos generales de apoyo a la nutrición celular, energía y bienestar.

Tono profesional y cercano entre pares, nunca publicitario. Respuestas breves (2-4 frases).

Responde ÚNICAMENTE con un JSON con esta forma exacta, sin texto adicional:
{
  "reply": "tu respuesta al visitante",
  "needs_human": true o false
}

Pon "needs_human": true cuando la pregunta sea muy específica, personal, sobre un pedido concreto, o cuando no tengas suficiente información (incluido el conocimiento adicional de arriba) para responder con seguridad — en ese caso, en "reply" anima igualmente a escribirle directamente (hay un formulario y enlaces de contacto justo debajo de este chat). Pon "needs_human": false cuando puedas responder con confianza tú mismo.`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const body = await req.json().catch(() => ({}));
  const slug = body.slug as string | undefined;
  const messages = body.messages as { role: string; content: string }[] | undefined;

  if (!slug || !messages || messages.length === 0) {
    return new Response(JSON.stringify({ error: "Faltan datos" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anthropicApiKey = Deno.env.get("ANTHROPIC_API_KEY")!;
  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { data: allowed } = await adminClient.rpc("check_chat_rate_limit", {
    p_key: `landing:${slug}:${clientIp}`,
    p_limit: RATE_LIMIT,
    p_window_seconds: RATE_LIMIT_WINDOW_SECONDS,
  });

  if (!allowed) {
    return new Response(
      JSON.stringify({
        reply:
          "Has hecho muchas preguntas seguidas — dame un momento antes de seguir, o escríbeme directamente por los enlaces de contacto de arriba 🙂",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const { data: profile } = await adminClient
    .from("profiles")
    .select("id, full_name, mini_landing_bio")
    .eq("mini_landing_slug", slug)
    .maybeSingle();

  if (!profile) {
    return new Response(JSON.stringify({ error: "No encontrado" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data: knowledge } = await adminClient
    .from("chat_knowledge")
    .select("topic, answer")
    .eq("owner_id", profile.id);

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": anthropicApiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 512,
        system: systemPrompt(profile.full_name, profile.mini_landing_bio, knowledge ?? []),
        messages: messages.slice(-10).map((m) => ({ role: m.role, content: m.content })),
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error("Anthropic API error:", res.status, errBody);
      return new Response(JSON.stringify({ error: "No se pudo responder" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await res.json();
    const textBlock = data.content?.find((b: { type: string }) => b.type === "text");
    const raw = (textBlock?.text ?? "{}")
      .trim()
      .replace(/^```(?:json)?\n?/, "")
      .replace(/\n?```$/, "");
    const parsed = JSON.parse(raw);
    const reply = parsed.reply ?? "Lo siento, no he podido procesar tu pregunta.";
    const needsHuman = parsed.needs_human === true;

    if (needsHuman) {
      const lastQuestion = messages[messages.length - 1]?.content ?? "";
      await adminClient.from("chat_alerts").insert({
        owner_id: profile.id,
        question: lastQuestion,
        bot_reply: reply,
      });

      const { data: subs } = await adminClient
        .from("push_subscriptions")
        .select("endpoint, p256dh, auth")
        .eq("owner_id", profile.id);

      if (subs && subs.length > 0) {
        const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY")!;
        const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY")!;
        webpush.setVapidDetails(
          "mailto:no-reply@nutriciondetransporte.com",
          vapidPublicKey,
          vapidPrivateKey
        );

        const payload = JSON.stringify({
          title: "PM App",
          body: "Tu chatbot no supo responder a una pregunta — échale un vistazo",
          url: "/",
        });

        for (const sub of subs) {
          try {
            await webpush.sendNotification(
              { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
              payload
            );
          } catch (e) {
            const statusCode = (e as { statusCode?: number }).statusCode;
            if (statusCode === 404 || statusCode === 410) {
              await adminClient.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
            }
          }
        }
      }
    }

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("landing-chat failed:", err);
    return new Response(JSON.stringify({ error: "No se pudo responder" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
