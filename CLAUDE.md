# Prompt maestro — App de gestión para distribuidores PM International / FitLine

> Copia y pega esto directamente en Lovable, Claude Code, v0, etc. Está escrito para que la IA constructora entienda el negocio, no solo la interfaz.

---

## 🎯 Contexto de negocio (dale esto a la IA primero, siempre)

Estoy construyendo una aplicación móvil para **distribuidores independientes de PM International** (la línea FitLine — nutrición celular, NTC). Este NO es un negocio de nutrición tradicional: es **venta directa multinivel (network marketing)**, lo que significa que cada usuario de la app tiene simultáneamente tres roles:

1. **Vendedor** — capta y fideliza clientes finales de producto (PowerCocktail, Activize Oxyplus, Restorate, Optimal Set...).
2. **Reclutador/formador** — construye y desarrolla un equipo (downline) de otros distribuidores.
3. **Autoempleado sin estructura** — sin CRM, sin secretaria, sin sistema: gestiona todo desde WhatsApp, notas del móvil y memoria.

La app tiene que resolver el caos operativo de ese día a día, no ser "otra app de fitness". El usuario final no es el consumidor del producto, es **el distribuidor que vende y recluta**.

---

## 👤 Avatar del usuario (persona)

- Persona de 30-55 años, mayoritariamente sin formación previa en ventas ni gestión empresarial.
- Compagina esto con otro trabajo o es su única fuente de ingresos y depende 100% de su propia disciplina.
- Tiene entre 5 y 200 contactos activos entre clientes y equipo, gestionados a mano en WhatsApp/Excel/papel.
- Se siente abrumado por: no saber a quién tiene que hacer seguimiento, olvidar recompras de clientes, no saber en qué rango/bonificación está, no saber cómo formar a su equipo, y no tener una imagen profesional (usa capturas de pantalla y mensajes genéricos).
- Tiene **miedo a hacer afirmaciones de salud indebidas** (PM International es muy estricto con esto — Cologne List, certificación GMP) pero no tiene un sistema que le ayude a comunicar bien.
- Quiere sentirse un profesional, no un "vendedor pesado".

---

## 🩹 Dolores concretos que la app debe resolver (prioriza por aquí)

1. **Seguimiento de clientes y prospectos** — "¿A quién tengo que escribir hoy?" Sin esto, pierden ventas y recompras constantemente.
2. **Recompra / reposición de producto** — los productos FitLine son de consumo recurrente (mensual). Nadie avisa al cliente cuando se le está acabando. Esto es dinero que se pierde cada mes.
3. **Gestión de equipo (downline)** — saber quién está activo, quién necesita apoyo, quién lleva semanas sin vender ni comprar.
4. **Entender su propio plan de compensación** — la mayoría no sabe calcular en qué rango están ni qué les falta para el siguiente nivel de bonificación. Esto desmotiva y genera abandono.
5. **Onboarding de nuevos reclutas** — no hay checklist ni proceso, cada patrocinador improvisa. Esto hace que el 80% de los nuevos abandonen en los primeros 90 días.
6. **Contenido y guiones de venta/formación** — necesitan scripts para TikTok Live, objeciones frecuentes, textos de seguimiento, sin sonar "vendedores" ni incumplir normativa de claims de salud.
7. **Compliance / claims de salud** — riesgo real de decir algo que la empresa o la ley no permite. Un asistente que revise o sugiera lenguaje seguro es un diferencial enorme.
8. **Falta de marca personal profesional** — usan Linktree genérico, sin cohesión visual ni funcional (esto ya lo hemos trabajado en redes, la app debería conectar con esa estrategia de contenido).
9. **Gestión de citas/eventos** — reuniones de oportunidad, llamadas de equipo, lanzamientos, formaciones.
10. **Falta de métricas de negocio propias** — no saben si están creciendo o estancados; todo está en su cabeza.

---

## 🧩 Funcionalidades — MVP (lo mínimo imprescindible para lanzar)

1. **CRM ligero de contactos** — clasificar en Cliente / Prospecto / Equipo, con etiquetas de estado (frío/tibio/caliente, activo/inactivo), notas rápidas por contacto, y **última interacción + próxima acción sugerida**.
2. **Recordatorios inteligentes de recompra** — al registrar una venta, la app calcula automáticamente cuándo ese cliente se quedará sin producto (según duración media del pack) y genera una alerta antes de esa fecha.
3. **Panel de equipo (downline)** — lista de miembros del equipo con estado de actividad (activo/inactivo últimos 30 días), para saber a quién apoyar.
4. **Calculadora de rango/bonificación** — el usuario introduce (o la app importa) sus datos de volumen y la app le dice en qué rango está y qué le falta para el siguiente.
5. **Agenda de citas y eventos** — llamadas, reuniones, eventos de empresa, con recordatorios push.
6. **Biblioteca de guiones y respuestas a objeciones** — organizada por situación (primer contacto, seguimiento, objeción de precio, cierre, etc.), editable por el propio usuario.
7. **Checklist de onboarding para nuevos reclutas** — proceso de 30/60/90 días con tareas marcables, para que el patrocinador tenga un sistema replicable.
8. **Panel de métricas básico** — nº de contactos activos, ventas del mes, nuevos clientes, nuevos reclutas, tasa de recompra.

---

## 🚀 Funcionalidades diferenciadoras (el "moat" — por qué no pueden prescindir de ti)

- **Asistente de compliance con IA**: antes de publicar o enviar un mensaje, el usuario puede pegar su texto y la IA revisa si contiene afirmaciones de salud problemáticas y sugiere una versión segura y persuasiva (peer-to-peer, no hype).
- **Generador de contenido conectado a tu estrategia de marca** (carruseles, guiones de TikTok Live, ideas semanales) — que ya dominas y puedes ofrecer como servicio integrado.
- **Página de enlaces / mini landing personalizable** dentro de la app (sustituye a Linktree) con seguimiento de clics — para que cada distribuidor tenga su "tarjeta digital" profesional.
- **Gamificación interna**: rachas de seguimiento diario, insignias por hitos de equipo, progreso visual hacia el siguiente rango.
- **Modo "duplicación"**: todo lo que un patrocinador configura (guiones, checklist de onboarding, plantillas) se puede clonar automáticamente a los nuevos miembros de su equipo — esto es clave en MLM, la duplicabilidad es lo que hace crecer una red.

---

## 🎨 UX/UI — instrucciones para la IA constructora

- Mobile-first, de uso rápido entre clientes (pensado para usarse 2-3 minutos varias veces al día, no sesiones largas).
- Tono visual profesional y cálido, nunca "salesy" ni con estética de anuncio milagro — coherente con el posicionamiento peer-to-peer y de credibilidad científica que ya maneja la marca.
- Onboarding inicial ultra simple (menos de 60 segundos para registrar el primer contacto), e incluye ANTES de ese paso el mini-tutorial de instalación en pantalla de inicio descrito en "Consideraciones técnicas" (imprescindible para que funcione el push en iOS).
- Notificaciones push como motor central de la app (los recordatorios son el corazón del producto).
- Dashboard de inicio = "qué tengo que hacer HOY" (prioriza acción sobre datos).

---

## 🛠️ Consideraciones técnicas

- **Decisión de plataforma: PWA (Progressive Web App) instalable, no app nativa.** Motivo: una sola base de código, iteración rápida del MVP, sin comisión de tienda (15-30%) sobre la suscripción SaaS mensual, y actualizaciones instantáneas sin revisión de tienda. Stack: Claude Code con Supabase para backend, auth y base de datos.
- **Requisito crítico de onboarding para push en iOS**: en iOS, las notificaciones push SOLO funcionan si el usuario instala la PWA desde Safari con "Compartir → Añadir a pantalla de inicio" antes de suscribirse; una pestaña abierta en Safari no puede recibir push. Como las notificaciones son el motor central del producto y el usuario objetivo no es técnico (30-55 años), el flujo de onboarding inicial (los primeros 60 segundos) DEBE incluir un mini-tutorial visual paso a paso mostrando exactamente cómo añadir la app a la pantalla de inicio antes de pedir el primer contacto, con lenguaje simple y capturas o ilustraciones, no solo texto.
- Si en el futuro el negocio escala y se necesita push más robusto o funciones nativas, la misma base de código PWA puede envolverse con Capacitor y publicarse en las tiendas sin reescribir la app desde cero — no es necesario decidir esto ahora.
- Multi-tenant: cada distribuidor solo ve sus propios datos (contactos, equipo, métricas); pensar en roles si más adelante se vende a equipos/uplines.
- Estructura de datos preparada desde el inicio para: Contactos, Interacciones, Productos, Ventas, Equipo (relación patrocinador-downline), Eventos, Plantillas de contenido.
- Pensado para escalar a modelo de suscripción mensual (SaaS) — cada distribuidor paga una cuota pequeña y recurrente, coherente con su propio modelo de ingresos recurrentes.

---

## ⚠️ Nota de compliance a instruir explícitamente en el prompt

Indica a la IA que en NINGÚN texto generado por la app (guiones, sugerencias, plantillas) debe incluir afirmaciones médicas o de cura de enfermedades sobre los productos; todo debe enmarcarse como apoyo a la nutrición celular general, con lenguaje aprobado por PM International (Cologne List, certificación GMP), y siempre en tono profesional entre pares, no publicitario.
