// Devuelve los datos públicos de la mini-landing de un distribuidor a partir
// de su slug. No requiere autenticación — la llama cualquier visitante desde
// /l/[slug]. Usa la service role key para no depender de permisos públicos
// sobre "profiles" ni "mini_landing_links".

import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");

  if (!slug) {
    return new Response(JSON.stringify({ error: "Falta el parámetro slug" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  const { data: profile } = await adminClient
    .from("profiles")
    .select("id, full_name, mini_landing_bio, brand_color, brand_logo_url")
    .eq("mini_landing_slug", slug)
    .maybeSingle();

  if (!profile) {
    return new Response(JSON.stringify({ error: "No encontrado" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data: links } = await adminClient
    .from("mini_landing_links")
    .select("id, label, url")
    .eq("profile_id", profile.id)
    .order("position", { ascending: true });

  return new Response(
    JSON.stringify({
      full_name: profile.full_name,
      bio: profile.mini_landing_bio,
      brand_color: profile.brand_color,
      brand_logo_url: profile.brand_logo_url,
      links: links ?? [],
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
