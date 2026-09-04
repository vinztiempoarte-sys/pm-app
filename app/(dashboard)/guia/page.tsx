import { HelpChat } from "@/components/chat/HelpChat";

const SECTIONS = [
  {
    title: "Entrar en la app",
    body: "Puedes elegir cómo entrar: con Google (un clic, sin nada que recordar), con un código de 8 dígitos por email (sin contraseña), o con email y contraseña propia. Si eliges contraseña, tiene que tener al menos 8 caracteres con mayúsculas, minúsculas, números y un símbolo — y si la olvidas, puedes pedir un enlace para elegir una nueva desde la pantalla de entrada.",
  },
  {
    title: "Hoy",
    body: "Tu resumen diario. Aquí aparecen los contactos a los que tienes que escribir hoy: un seguimiento pendiente, una recompra a punto de caducar o una cita en la agenda. También aparecen aquí, si las hay, las preguntas que el chatbot de tu página no supo responder con seguridad y necesita que contestes tú en persona. Es la pantalla con la que empezar cada día.",
  },
  {
    title: "Contactos",
    body: "Tu lista de clientes y prospectos. Cada contacto tiene un estado — caliente, tibio o frío — para que sepas a quién priorizar, y un histórico de ventas con la fecha de recompra estimada según el producto que le vendiste. Si ya tienes tu lista en otro sitio, usa el botón 'Importar': eliges primero si son Clientes, Prospectos o Equipo, y luego pegas una línea por persona, o subes directamente un CSV (una IA identifica las columnas aunque no coincidan con las nuestras) o un .vcf exportado desde el móvil. Siempre ves una vista previa antes de confirmar.",
  },
  {
    title: "Productos",
    body: "Tu catálogo de productos FitLine, con la duración media de cada uno (por ejemplo, un bote que dura ~30 días). La app usa ese dato para calcular automáticamente cuándo le tocará recomprar a cada cliente y avisarte. Al registrarte, tu cuenta ya viene con los productos principales de FitLine cargados (Basics, Restorate, Activize Oxyplus, PowerCocktail, Protein y Beauty) para que puedas empezar a registrar ventas desde el primer día — puedes editar, borrar o añadir los que quieras.",
  },
  {
    title: "Equipo",
    body: "Seguimiento de las personas de tu equipo (tu downline). Marca quién está activo o inactivo para detectar pronto a quien necesita apoyo o un empujón de motivación.",
  },
  {
    title: "Agenda",
    body: "Tus citas y eventos: llamadas, presentaciones, reuniones de equipo. Lo que anotes aquí también aparece en tu resumen de Hoy cuando toca.",
  },
  {
    title: "Plantillas",
    body: "Mensajes ya escritos que puedes reutilizar y personalizar — para el primer contacto, el seguimiento, el aviso de recompra, etc. Ahorra tiempo y evita el 'no sé qué escribirle'.",
  },
  {
    title: "Rango",
    body: "Calculadora de tu volumen personal y de grupo. Introduce tus cifras del mes y comprueba en qué rango estás y qué te falta para el siguiente.",
  },
  {
    title: "Métricas",
    body: "Un panel con tus números: contactos, ventas, recompras, equipo. Para ver de un vistazo cómo va tu negocio sin tener que sumarlo a mano.",
  },
  {
    title: "Mi página",
    body: "Tu tarjeta digital pública — sustituye a un Linktree genérico. Es una página con tu foto, una frase de presentación, un vídeo opcional y botones a tus canales (WhatsApp, Instagram, catálogo...), todo con tu propia marca. Compártela como enlace único en tus redes, o con el código QR descargable, listo para tarjetas o eventos presenciales. Además tiene un chatbot que responde dudas de tus visitantes al momento, y un formulario de contacto: cuando alguien lo rellena, se crea automáticamente como nuevo prospecto en tu lista de Contactos, sin que tengas que hacer nada. Cada clic en un enlace queda contado, para que sepas qué canal funciona mejor. Al final de esta misma página puedes 'entrenar' tu chatbot: añade temas y respuestas propias (precios de envío en tu zona, horarios, promociones locales...) y el bot los usará al responder. Si una pregunta es demasiado específica o el bot no está seguro, no se inventa nada: te lo deja como aviso en tu pantalla de Hoy para que respondas tú en persona, y te llega una notificación si las tienes activadas.",
  },
  {
    title: "Compliance",
    body: "Pega aquí cualquier texto antes de publicarlo o enviarlo — un mensaje de WhatsApp, una publicación, un guion. Una IA revisa si tiene afirmaciones de salud que PM International o la normativa no permiten (como decir que un producto cura una enfermedad concreta) y te propone una versión segura, manteniendo tu tono. Úsalo siempre que tengas dudas antes de publicar algo sobre los productos.",
  },
  {
    title: "Generador",
    body: "Elige el tipo de contenido (carrusel de Instagram, guion de TikTok Live, o ideas para la semana), pon un tema si quieres uno concreto, y genera una propuesta lista para adaptar a tu estilo. Sigue siempre las mismas reglas de compliance que el revisor, así que no debería proponerte nada problemático — pero revísalo igualmente antes de publicar.",
  },
  {
    title: "Logros",
    body: "Tu racha de días seguidos haciendo seguimiento (cada vez que marcas una acción como hecha en 'Hoy' cuenta para la racha), y las insignias que vas desbloqueando por hitos: tus primeros contactos, tus primeras ventas, hacer crecer tu equipo. También añadimos una barra de progreso visual en Rango, para ver de un vistazo qué tan cerca estás del siguiente nivel.",
  },
  {
    title: "Duplicación",
    body: "Aquí configuras la plantilla del checklist de onboarding de 30/60/90 días que se clona automáticamente cada vez que añades un contacto nuevo de tipo Equipo. Añade, borra o reordena los pasos a tu gusto — a partir de ese momento, cada nuevo miembro de tu equipo recibirá esa versión actualizada. Los checklists de miembros que ya tenías no cambian con esto.",
  },
  {
    title: "Recordatorios (notificaciones)",
    body: "Si activas las notificaciones (te lo pedirá la app), te avisamos en el móvil cuando algo necesite tu atención — un seguimiento, una recompra — aunque no tengas la app abierta.",
  },
  {
    title: "Ajustes",
    body: "Tu cuenta, la suscripción, la política de privacidad y la opción de eliminar tu cuenta y todos tus datos cuando quieras.",
  },
];

export default function GuiaPage() {
  return (
    <div className="mx-auto w-full max-w-md flex-1 space-y-6">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold">Guía rápida</h1>
        <p className="text-sm text-muted-foreground">
          Qué hace cada sección de PM App y para qué sirve.
        </p>
      </div>

      <div className="space-y-2">
        {SECTIONS.map((section) => (
          <details
            key={section.title}
            className="group rounded-2xl border p-4 open:pb-4"
          >
            <summary className="cursor-pointer list-none text-sm font-semibold marker:content-none">
              <span className="flex items-center justify-between">
                {section.title}
                <span className="text-muted-foreground transition-transform group-open:rotate-180">
                  ⌄
                </span>
              </span>
            </summary>
            <p className="mt-2 text-sm text-muted-foreground">
              {section.body}
            </p>
          </details>
        ))}
      </div>

      <HelpChat />
    </div>
  );
}
