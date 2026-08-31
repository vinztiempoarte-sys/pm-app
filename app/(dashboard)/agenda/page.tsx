import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { EventList } from "@/components/agenda/EventList";
import type { EventWithContact } from "@/types/database.types";

export default async function AgendaPage() {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data } = await supabase
    .from("events")
    .select("*, contacts(id, full_name)")
    .gte("start_at", now)
    .order("start_at", { ascending: true });

  const events = (data ?? []) as EventWithContact[];

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Agenda</h1>
        <Link href="/agenda/nuevo" className={buttonVariants({ size: "sm" })}>
          + Nuevo
        </Link>
      </div>
      <EventList events={events} />
    </div>
  );
}
