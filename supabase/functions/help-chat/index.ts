// Chatbot de ayuda dentro de la app: responde dudas sobre cómo usar PM App,
// basándose en el contenido de la Guía. Requiere autenticación — solo para
// usuarios logueados, igual que compliance-check.

import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RATE_LIMIT = 30;
const RATE_LIMIT_WINDOW_SECONDS = 3600;

// Mantener alineado con las secciones de app/(dashboard)/guia/page.tsx
// cada vez que se añada o cambie una funcionalidad.
const APP_KNOWLEDGE = `
- Entrar en la app: Google, código de 8 dígitos por email, o email+contraseña (mínimo 8 caracteres, mayúsculas, minúsculas, números y símbolo). Recuperación de contraseña disponible.
- Hoy: resumen diario de seguimientos pendientes, recompras próximas y citas.
- Contactos: lista de clientes/prospectos/equipo, con estado caliente/tibio/frío. Botón "Importar" para pegar una lista, subir un CSV (con IA) o un .vcf del móvil.
- Productos: catálogo con duración media, usado para calcular recompras.
- Equipo: seguimiento de miembros del equipo, activo/inactivo.
- Agenda: citas y eventos.
- Plantillas: mensajes reutilizables por categoría.
- Rango: calculadora de volumen personal/grupo con progreso visual al siguiente rango.
- Métricas: panel con números del negocio.
- Mi página: mini-landing pública personalizable (foto, bio, vídeo, enlaces, QR, formulario de contacto que crea leads automáticamente, y un chatbot público entrenable que responde dudas de los visitantes).
- Hoy también muestra avisos cuando el chatbot de la mini-landing no supo responder algo, para que la usuaria conteste en persona.
- Compliance: revisor de textos con IA para detectar afirmaciones de salud no permitidas.
- Generador: genera carruseles, guiones de TikTok Live e ideas semanales con IA.
- Logros: racha de días seguidos con seguimiento, insignias por hitos.
- Duplicación: plantilla configurable del checklist de onboarding de 30/60/90 días para nuevos miembros de equipo.
- Recordatorios: notificaciones push en el móvil.
- Ajustes: cuenta, facturación, privacidad, eliminar cuenta.
`;

const SYSTEM_PROMPT = `Eres el asistente de ayuda de PM App, una aplicación de gestión (CRM) para distribuidores independientes de PM International (línea FitLine). Respondes dudas de la propia usuaria sobre cómo usar la app.

Esto es lo que existe en la app (no inventes funciones que no estén aquí):
${APP_KNOWLEDGE}

Si preguntan algo que no tiene que ver con el uso de la app, o algo que no existe, dilo con honestidad en vez de inventar. Tono cercano, cercano y sencillo (la usuaria puede no ser muy técnica). Respuestas breves y prácticas, indicando en qué sección de la app encontrar lo que buscan.`;

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

  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const adminClient = createClient(supabaseUrl, serviceRoleKey);
  const { data: allowed } = await adminClient.rpc("check_chat_rate_limit", {
    p_key: `help:${user.id}`,
    p_limit: RATE_LIMIT,
    p_window_seconds: RATE_LIMIT_WINDOW_SECONDS,
  });

  if (!allowed) {
    return new Response(
      JSON.stringify({
        reply: "Has hecho muchas preguntas en poco tiempo — espera un momento antes de seguir 🙂",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const body = await req.json().catch(() => ({}));
  const messages = body.messages as { role: string; content: string }[] | undefined;

  if (!messages || messages.length === 0) {
    return new Response(JSON.stringify({ error: "Falta la pregunta" }), {
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
        max_tokens: 512,
        system: SYSTEM_PROMPT,
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
    const reply = textBlock?.text ?? "Lo siento, no he podido procesar tu pregunta.";

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("help-chat failed:", err);
    return new Response(JSON.stringify({ error: "No se pudo responder" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
