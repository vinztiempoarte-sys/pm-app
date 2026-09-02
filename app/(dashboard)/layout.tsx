import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/shared/SignOutButton";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="flex items-center justify-between border-b bg-card px-4 py-3">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-accent text-[10px] font-bold text-white">
              PM
            </span>
            <span className="text-sm font-semibold">PM App</span>
          </Link>
          <nav className="flex gap-3 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Hoy
            </Link>
            <Link href="/contactos" className="hover:text-foreground">
              Contactos
            </Link>
            <Link href="/productos" className="hover:text-foreground">
              Productos
            </Link>
            <Link href="/equipo" className="hover:text-foreground">
              Equipo
            </Link>
            <Link href="/agenda" className="hover:text-foreground">
              Agenda
            </Link>
            <Link href="/plantillas" className="hover:text-foreground">
              Plantillas
            </Link>
            <Link href="/rango" className="hover:text-foreground">
              Rango
            </Link>
            <Link href="/metricas" className="hover:text-foreground">
              Métricas
            </Link>
            <Link href="/mi-pagina" className="hover:text-foreground">
              Mi página
            </Link>
            <Link href="/compliance" className="hover:text-foreground">
              Compliance
            </Link>
            <Link href="/generador" className="hover:text-foreground">
              Generador
            </Link>
            <Link href="/logros" className="hover:text-foreground">
              Logros
            </Link>
            <Link href="/guia" className="hover:text-foreground">
              Guía
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/ajustes" className="text-sm text-muted-foreground hover:text-foreground">
            Ajustes
          </Link>
          <SignOutButton />
        </div>
      </header>
      <main className="flex flex-1 flex-col p-4">{children}</main>
    </div>
  );
}
