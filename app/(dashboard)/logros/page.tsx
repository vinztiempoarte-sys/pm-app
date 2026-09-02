import { createClient } from "@/lib/supabase/server";

function calculateStreak(dates: string[]): number {
  const daySet = new Set(dates.map((d) => d.slice(0, 10)));
  const cursor = new Date();
  const todayStr = cursor.toISOString().slice(0, 10);
  if (!daySet.has(todayStr)) {
    cursor.setDate(cursor.getDate() - 1);
  }
  let streak = 0;
  while (daySet.has(cursor.toISOString().slice(0, 10))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export default async function LogrosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: contacts }, { count: salesCount }] = await Promise.all([
    supabase
      .from("contacts")
      .select("last_interaction_at, type, activity_status")
      .eq("owner_id", user!.id),
    supabase
      .from("sales")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", user!.id),
  ]);

  const rows = contacts ?? [];
  const interactionDates = rows
    .map((c) => c.last_interaction_at)
    .filter((d): d is string => !!d);
  const streak = calculateStreak(interactionDates);

  const contactsCount = rows.length;
  const teamCount = rows.filter((c) => c.type === "equipo").length;
  const activeTeamCount = rows.filter(
    (c) => c.type === "equipo" && c.activity_status === "activo"
  ).length;
  const sales = salesCount ?? 0;

  const badges = [
    { label: "Primer contacto", unlocked: contactsCount >= 1 },
    { label: "Red en marcha (10 contactos)", unlocked: contactsCount >= 10 },
    { label: "Primera venta", unlocked: sales >= 1 },
    { label: "Vendedora constante (10 ventas)", unlocked: sales >= 10 },
    { label: "Constructora de equipo", unlocked: teamCount >= 1 },
    { label: "Líder de equipo (5 activos)", unlocked: activeTeamCount >= 5 },
    { label: "Racha de 7 días", unlocked: streak >= 7 },
    { label: "Racha de 30 días", unlocked: streak >= 30 },
  ];

  return (
    <div className="mx-auto w-full max-w-md flex-1 space-y-6">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold">Logros</h1>
        <p className="text-sm text-muted-foreground">
          Tu constancia y los hitos que vas alcanzando.
        </p>
      </div>

      <div className="rounded-2xl border bg-muted/40 p-6 text-center">
        <p className="text-4xl font-bold">{streak}</p>
        <p className="text-sm text-muted-foreground">
          {streak === 1 ? "día seguido" : "días seguidos"} haciendo seguimiento
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {badges.map((badge) => (
          <div
            key={badge.label}
            className={`rounded-2xl border p-4 text-center ${
              badge.unlocked ? "border-success/40 bg-success/10" : "opacity-40"
            }`}
          >
            <p className="text-2xl">{badge.unlocked ? "🏅" : "🔒"}</p>
            <p className="mt-1 text-xs font-medium">{badge.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
