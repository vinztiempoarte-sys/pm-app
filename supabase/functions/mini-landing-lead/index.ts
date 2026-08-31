// Recibe un lead desde el formulario de la mini-landing pública y lo crea
// como contacto (prospecto) del distribuidor dueño de esa página. No
// requiere autenticación — lo llama un visitante anónimo.

import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const body = await req.json().catch(() => ({}));
  const slug = body.slug as string | undefined;
  const fullName = (body.full_name as string | undefined)?.trim();
  const phone = (body.phone as string | undefined)?.trim();
  const email = (body.email as string | undefined)?.trim();
  const honeypot = body.website as string | undefined;

  // Campo trampa: invisible para una persona, pero un bot de formularios
  // suele rellenarlo. Si viene relleno, fingimos éxito y no hacemos nada.
  if (honeypot) {
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!slug || !fullName || (!phone && !email)) {
    return new Response(
      JSON.stringify({ error: "Faltan datos (nombre y teléfono o email)" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  const { data: profile } = await adminClient
    .from("profiles")
    .select("id")
    .eq("mini_landing_slug", slug)
    .maybeSingle();

  if (!profile) {
    return new Response(JSON.stringify({ error: "No encontrado" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { error } = await adminClient.from("contacts").insert({
    owner_id: profile.id,
    full_name: fullName,
    phone: phone || null,
    email: email || null,
    type: "prospecto",
    temperature: "caliente",
    source: "mini-landing",
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
