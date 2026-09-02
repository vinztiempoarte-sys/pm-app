// Genera contenido (carrusel de Instagram, guion de TikTok Live, o ideas
// semanales) para un distribuidor de PM International/FitLine, respetando
// las mismas reglas de compliance que compliance-check. Requiere
// autenticación (JWT) — solo para usuarios logueados.

import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TYPE_LABELS: Record<string, string> = {
  carrusel: "un carrusel de Instagram de 5 a 7 diapositivas",
  tiktok: "un guion para un TikTok Live de unos 3-5 minutos",
  ideas: "una lista de 6 ideas de contenido para la próxima semana",
};

const SYSTEM_PROMPT = `Eres un generador de contenido para distribuidores independientes de PM International (línea FitLine, nutrición celular). Escribes en tono profesional y cercano entre pares, nunca publicitario ni "hype" — como alguien que comparte su experiencia real, no un vendedor.

Reglas de compliance, obligatorias en todo lo que escribas:
- Nunca afirmes que un producto cura, trata o previene una enfermedad concreta.
- Nunca prometas resultados médicos garantizados.
- Nunca compares el producto con medicamentos o tratamientos médicos.
- Solo se permiten afirmaciones generales de apoyo a la nutrición celular, energía y bienestar.

Responde ÚNICAMENTE con un JSON con esta forma exacta, sin texto adicional:
{
  "title": "título breve de la pieza de contenido",
  "sections": [{"heading": "encabezado corto (p. ej. 'Diapositiva 1', 'Apertura', 'Idea 1')", "body": "el texto de esa sección"}]
}`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "No autenticado" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const anthropicApiKey = Deno.env.get("ANTHROPIC_API_KEY")!;

  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const {
    data: { user },
    error: userError,
  } = await callerClient.auth.getUser();

  if (userError || !user) {
    return new Response(JSON.stringify({ error: "No autenticado" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const body = await req.json().catch(() => ({}));
  const type = (body.type as string | undefined) ?? "";
  const topic = (body.topic as string | undefined)?.trim();

  const typeDescription = TYPE_LABELS[type];
  if (!typeDescription) {
    return new Response(JSON.stringify({ error: "Tipo de contenido no válido" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const userPrompt = topic
    ? `Genera ${typeDescription} sobre este tema: ${topic}`
    : `Genera ${typeDescription} con un tema libre adecuado para un distribuidor de FitLine.`;

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
        max_tokens: 1536,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error("Anthropic API error:", res.status, errBody);
      return new Response(
        JSON.stringify({ error: "No se pudo generar el contenido" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await res.json();
    const textBlock = data.content?.find((b: { type: string }) => b.type === "text");
    const raw = (textBlock?.text ?? "{}")
      .trim()
      .replace(/^```(?:json)?\n?/, "")
      .replace(/\n?```$/, "");
    const parsed = JSON.parse(raw);

    return new Response(
      JSON.stringify({
        title: parsed.title ?? "",
        sections: parsed.sections ?? [],
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("content-generator failed:", err);
    return new Response(
      JSON.stringify({ error: "No se pudo generar el contenido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
