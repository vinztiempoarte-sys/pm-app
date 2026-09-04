import { createClient } from "@/lib/supabase/server";
import { TodayList } from "@/components/dashboard/TodayList";
import { ReorderList, type ReorderSale } from "@/components/dashboard/ReorderList";
import { PushBanner } from "@/components/dashboard/PushBanner";
import { ChatAlertsList } from "@/components/dashboard/ChatAlertsList";
import { todayISODate } from "@/lib/utils/date";
import type { ChatAlert, Contact } from "@/types/database.types";

export default async function DashboardHomePage() {
  const supabase = await createClient();
  const today = todayISODate();

  const [{ data: contactsData }, { data: salesData }, { data: alertsData }] = await Promise.all([
    supabase
      .from("contacts")
      .select("*")
      .not("next_action_at", "is", null)
      .order("next_action_at", { ascending: true }),
    supabase
      .from("sales")
      .select("*, products(*), contacts(id, full_name)")
      .eq("status", "pendiente_recompra")
      .lte("estimated_reorder_date", today)
      .order("estimated_reorder_date", { ascending: true }),
    supabase
      .from("chat_alerts")
      .select("*")
      .eq("resolved", false)
      .order("created_at", { ascending: false }),
  ]);

  const contacts = (contactsData ?? []) as Contact[];
  const overdue = contacts.filter((c) => c.next_action_at!.slice(0, 10) < today);
  const dueToday = contacts.filter((c) => c.next_action_at!.slice(0, 10) === today);

  const hour = new Date().getHours();
  const greeting = hour < 13 ? "Buenos días" : hour < 20 ? "Buenas tardes" : "Buenas noches";
  const dateLabel = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold">{greeting} 👋</h1>
        <p className="text-sm text-muted-foreground capitalize">{dateLabel}</p>
      </div>
      <PushBanner />
      <ChatAlertsList alerts={(alertsData ?? []) as ChatAlert[]} />
      <ReorderList sales={(salesData ?? []) as ReorderSale[]} />
      <TodayList overdue={overdue} today={dueToday} />
    </div>
  );
}
