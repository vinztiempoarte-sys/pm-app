import { createClient } from "@/lib/supabase/server";
import { StatTile } from "@/components/metrics/StatTile";
import type { Contact, Sale } from "@/types/database.types";

function startOfMonthISO() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

export default async function MetricsPage() {
  const supabase = await createClient();
  const monthStart = startOfMonthISO();

  const [{ data: contactsData }, { data: salesData }, { data: eventsData }] =
    await Promise.all([
      supabase.from("contacts").select("id, type"),
      supabase.from("sales").select("id, quantity, price, sale_date, status"),
      supabase
        .from("events")
        .select("id")
        .gte("start_at", new Date().toISOString())
        .lte("start_at", new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()),
    ]);

  const contacts = (contactsData ?? []) as Pick<Contact, "id" | "type">[];
  const sales = (salesData ?? []) as Pick<
    Sale,
    "id" | "quantity" | "price" | "sale_date" | "status"
  >[];

  const totalContacts = contacts.length;
  const byType = {
    cliente: contacts.filter((c) => c.type === "cliente").length,
    prospecto: contacts.filter((c) => c.type === "prospecto").length,
    equipo: contacts.filter((c) => c.type === "equipo").length,
  };

  const salesThisMonth = sales.filter((s) => s.sale_date >= monthStart);
  const revenueThisMonth = salesThisMonth.reduce(
    (sum, s) => sum + (s.price ?? 0) * s.quantity,
    0
  );

  const pendingReorders = sales.filter((s) => s.status === "pendiente_recompra").length;
  const recovered = sales.filter((s) => s.status === "recomprado").length;
  const lost = sales.filter((s) => s.status === "perdido").length;

  const upcomingEvents = (eventsData ?? []).length;

  return (
    <div className="flex flex-1 flex-col gap-6">
      <h1 className="text-lg font-semibold">Métricas</h1>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-muted-foreground">Contactos</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label="Total" value={totalContacts} />
          <StatTile label="Clientes" value={byType.cliente} />
          <StatTile label="Prospectos" value={byType.prospecto} />
          <StatTile label="Equipo" value={byType.equipo} />
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-muted-foreground">Ventas este mes</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label="Ventas" value={salesThisMonth.length} />
          <StatTile label="Ingresos" value={`${revenueThisMonth.toFixed(2)} €`} />
          <StatTile label="Recompras pendientes" value={pendingReorders} hint="de siempre" />
          <StatTile label="Recompradas" value={recovered} hint="de siempre" />
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-muted-foreground">Otros</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label="Recompras perdidas" value={lost} hint="de siempre" />
          <StatTile label="Eventos próximos 7 días" value={upcomingEvents} />
        </div>
      </section>
    </div>
  );
}
