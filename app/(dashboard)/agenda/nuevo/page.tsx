import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { EventForm } from "@/components/agenda/EventForm";
import type { Contact } from "@/types/database.types";

export default async function NewEventPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("contacts").select("*").order("full_name");

  return (
    <div className="mx-auto w-full max-w-md flex-1">
      <Link
        href="/agenda"
        className="mb-4 inline-block text-sm text-muted-foreground underline underline-offset-2"
      >
        ← Volver a la agenda
      </Link>
      <h1 className="mb-4 text-lg font-semibold">Nuevo evento</h1>
      <EventForm contacts={(data ?? []) as Contact[]} />
    </div>
  );
}
