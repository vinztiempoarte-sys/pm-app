import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DeleteAccount } from "@/components/settings/DeleteAccount";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="mx-auto w-full max-w-md flex-1 space-y-6">
      <h1 className="text-lg font-semibold">Ajustes</h1>

      <section className="space-y-1 rounded-2xl border p-4">
        <h2 className="text-sm font-semibold">Tu cuenta</h2>
        <p className="text-sm text-muted-foreground">{user?.email}</p>
      </section>

      <section className="flex flex-col gap-2">
        <Link
          href="/guia"
          className="text-sm underline underline-offset-2 text-muted-foreground"
        >
          Guía rápida
        </Link>
        <Link
          href="/ajustes/facturacion"
          className="text-sm underline underline-offset-2 text-muted-foreground"
        >
          Facturación
        </Link>
        <Link
          href="/privacidad"
          className="text-sm underline underline-offset-2 text-muted-foreground"
        >
          Ver Política de Privacidad
        </Link>
      </section>

      <DeleteAccount email={user!.email!} />
    </div>
  );
}
