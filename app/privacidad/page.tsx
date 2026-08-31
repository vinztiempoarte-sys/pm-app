export const metadata = {
  title: "Política de Privacidad — PM App",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
      <h1 className="mb-2 text-xl font-semibold">Política de Privacidad</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Última actualización: [FECHA]
      </p>

      <div className="space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="mb-2 font-semibold">1. Responsable del tratamiento</h2>
          <p>
            <strong>[NOMBRE DEL TITULAR / RAZÓN SOCIAL]</strong>, con contacto en{" "}
            <strong>[EMAIL DE CONTACTO]</strong>, es responsable del tratamiento
            de los datos de la cuenta que usas para acceder a PM App (tu email
            y los datos de tu perfil).
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold">
            2. Un matiz importante: los datos de tus contactos
          </h2>
          <p>
            PM App te permite registrar información sobre tus propios clientes,
            prospectos y equipo (nombre, teléfono, email, notas de seguimiento).
            Para esos datos, <strong>tú eres el responsable del tratamiento</strong>{" "}
            — eres quien decide qué información guardar y con qué finalidad,
            porque son tus contactos. PM App actúa como{" "}
            <strong>encargado del tratamiento</strong>: almacenamos esos datos
            de forma segura, siguiendo tus instrucciones (las acciones que
            realizas en la app), pero no los usamos para ningún fin propio.
          </p>
          <p className="mt-2">
            Esto significa que, si introduces datos de otras personas en la
            app, debes tener una base legal para tratarlos (por ejemplo, que
            te los hayan facilitado voluntariamente como clientes o
            prospectos) y cumplir tú mismo con tus obligaciones como
            responsable frente a esas personas.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold">3. Qué datos tratamos</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Datos de tu cuenta: email, y los campos de tu perfil.</li>
            <li>
              Datos de contactos que tú introduces: nombre, teléfono, email,
              notas, historial de ventas y seguimiento.
            </li>
            <li>
              Datos técnicos mínimos necesarios para el funcionamiento: la
              suscripción de notificaciones push de tu navegador (sin
              contenido asociado a tu identidad más allá de tu cuenta).
            </li>
          </ul>
          <p className="mt-2">
            No usamos cookies de publicidad ni de analítica de terceros. Solo
            usamos una cookie técnica esencial para mantener tu sesión
            iniciada.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold">4. Dónde se almacenan los datos</h2>
          <p>
            Los datos se almacenan en servidores de Supabase ubicados en la
            Unión Europea (Irlanda). El envío de los emails de acceso (código
            de inicio de sesión) se realiza a través de Resend.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold">5. Cuánto tiempo conservamos los datos</h2>
          <p>
            Conservamos tus datos mientras mantengas tu cuenta activa. Si
            eliminas tu cuenta, tus datos y los de tus contactos asociados se
            borran de forma permanente e inmediata (ver sección 7).
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold">6. Tus derechos</h2>
          <p>
            Puedes acceder, rectificar o eliminar tus datos en cualquier
            momento directamente desde la app (Contactos, Ajustes). También
            tienes derecho a la portabilidad y a oponerte al tratamiento.
            Para ejercer cualquiera de estos derechos, escribe a{" "}
            <strong>[EMAIL DE CONTACTO]</strong>.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold">7. Derecho al olvido</h2>
          <p>
            Desde <strong>Ajustes → Eliminar mi cuenta</strong> puedes borrar
            de forma permanente e inmediata tu cuenta y todos los datos
            asociados (contactos, ventas, productos, agenda, plantillas). Esta
            acción no se puede deshacer.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-semibold">8. Cambios en esta política</h2>
          <p>
            Podemos actualizar esta política ocasionalmente. Si los cambios
            son relevantes, te avisaremos dentro de la app.
          </p>
        </section>
      </div>
    </main>
  );
}
