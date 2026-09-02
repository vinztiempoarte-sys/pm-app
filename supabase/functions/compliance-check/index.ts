// Revisa un texto que el distribuidor quiere publicar/enviar, buscando
// afirmaciones de salud problemáticas (curas, promesas médicas) y sugiere
// una versión segura que mantenga el tono persuasivo entre pares.
// Requiere autenticación (JWT) — es una función solo para usuarios logueados.

import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Eres un revisor de compliance para distribuidores independientes de PM International (línea FitLine, nutrición celular). Tu trabajo es revisar textos que un distribuidor quiere publicar o enviar (redes sociales, WhatsApp, guiones) y detectar afirmaciones que la normativa de PM International y la legislación de la UE sobre alegaciones de salud no permiten:

- Afirmaciones de que un producto cura, trata o previene una enfermedad concreta.
- Promesas médicas o de resultados garantizados de salud.
- Comparar el producto con medicamentos o tratamientos médicos.

Sí están permitidas las afirmaciones generales de apoyo a la nutrición celular, bienestar y energía, en tono profesional y cercano entre pares (nunca publicitario ni "hype").

Responde ÚNICAMENTE con un JSON con esta forma exacta, sin texto adicional:
{
  "issues": [{"phrase": "fragmento problemático del texto original", "reason": "por qué es un problema, en una frase"}],
  "safe_version": "una reescritura completa del texto, manteniendo el tono y la intención, pero sin las afirmaciones problemáticas"
}

Si el texto no tiene ningún problema, "issues" debe ser un array vacío y "safe_version" debe ser el texto original sin cambios.`;

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
  const text = (body.text as string | undefined)?.trim();

  if (!text) {
    return new Response(JSON.stringify({ error: "Falta el texto a revisar" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

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
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: text }],
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error("Anthropic API error:", res.status, errBody);
      return new Response(
        JSON.stringify({ error: "No se pudo completar la revisión" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await res.json();
    const raw = (data.content?.[0]?.text ?? "{}")
      .trim()
      .replace(/^```(?:json)?\n?/, "")
      .replace(/\n?```$/, "");
    const parsed = JSON.parse(raw);

    return new Response(
      JSON.stringify({
        issues: parsed.issues ?? [],
        safe_version: parsed.safe_version ?? text,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("compliance-check failed:", err);
    return new Response(
      JSON.stringify({ error: "No se pudo completar la revisión" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
