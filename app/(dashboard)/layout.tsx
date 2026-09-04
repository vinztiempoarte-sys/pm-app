import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AccountMenu } from "@/components/shared/AccountMenu";

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
      <header className="flex items-center gap-3 border-b bg-card px-4 py-3">
        <AccountMenu />
        <nav className="flex min-w-0 flex-1 gap-3 overflow-x-auto text-sm text-muted-foreground [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Link href="/" className="shrink-0 whitespace-nowrap hover:text-foreground">
            Hoy
          </Link>
          <Link href="/contactos" className="shrink-0 whitespace-nowrap hover:text-foreground">
            Contactos
          </Link>
          <Link href="/productos" className="shrink-0 whitespace-nowrap hover:text-foreground">
            Productos
          </Link>
          <Link href="/equipo" className="shrink-0 whitespace-nowrap hover:text-foreground">
            Equipo
          </Link>
          <Link href="/agenda" className="shrink-0 whitespace-nowrap hover:text-foreground">
            Agenda
          </Link>
          <Link href="/plantillas" className="shrink-0 whitespace-nowrap hover:text-foreground">
            Plantillas
          </Link>
          <Link href="/rango" className="shrink-0 whitespace-nowrap hover:text-foreground">
            Rango
          </Link>
          <Link href="/metricas" className="shrink-0 whitespace-nowrap hover:text-foreground">
            Métricas
          </Link>
          <Link href="/mi-pagina" className="shrink-0 whitespace-nowrap hover:text-foreground">
            Mi página
          </Link>
          <Link href="/compliance" className="shrink-0 whitespace-nowrap hover:text-foreground">
            Compliance
          </Link>
          <Link href="/generador" className="shrink-0 whitespace-nowrap hover:text-foreground">
            Generador
          </Link>
          <Link href="/logros" className="shrink-0 whitespace-nowrap hover:text-foreground">
            Logros
          </Link>
          <Link href="/duplicacion" className="shrink-0 whitespace-nowrap hover:text-foreground">
            Duplicación
          </Link>
          <Link href="/guia" className="shrink-0 whitespace-nowrap hover:text-foreground">
            Guía
          </Link>
        </nav>
      </header>
      <main className="flex flex-1 flex-col p-4">{children}</main>
    </div>
  );
}
