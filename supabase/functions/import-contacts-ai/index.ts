// Recibe el contenido en formato CSV de una hoja de cálculo (puede venir de
// un Excel o un CSV real, ya convertido a texto por el cliente) con
// cabeceras que pueden variar, y usa Claude para identificar qué columna es
// el nombre, el teléfono y el email de cada contacto. Requiere autenticación
// — solo para usuarios logueados, igual que compliance-check.

import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Recibes el contenido de una hoja de cálculo (en formato CSV) con una lista de contactos. Las cabeceras de las columnas pueden estar en cualquier idioma, orden o formato, y puede haber columnas irrelevantes que debes ignorar (por ejemplo, "rango", "fecha de alta", etc. — céntrate solo en identificar nombre, teléfono y email).

Para cada fila con al menos un nombre, extrae:
- full_name: el nombre completo de la persona.
- phone: el teléfono, si existe, tal cual aparece (o null si no hay).
- email: el email, si existe (o null si no hay).

Ignora filas sin ningún nombre reconocible (por ejemplo, filas vacías o de cabecera repetida).

Responde ÚNICAMENTE con un JSON con esta forma exacta, sin texto adicional:
{
  "contacts": [{"full_name": "...", "phone": "..." , "email": "..."}]
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
  const csv = (body.csv as string | undefined)?.trim();

  if (!csv) {
    return new Response(JSON.stringify({ error: "Falta el contenido a analizar" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Límite de tamaño para no disparar el coste/contexto con archivos enormes.
  const truncated = csv.split("\n").slice(0, 500).join("\n");

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
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: truncated }],
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error("Anthropic API error:", res.status, errBody);
      return new Response(
        JSON.stringify({ error: "No se pudo analizar el archivo" }),
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
      JSON.stringify({ contacts: parsed.contacts ?? [] }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("import-contacts-ai failed:", err);
    return new Response(
      JSON.stringify({ error: "No se pudo analizar el archivo" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
