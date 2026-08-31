import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EventForm } from "@/components/agenda/EventForm";
import type { Contact, Event } from "@/types/database.types";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: event }, { data: contacts }] = await Promise.all([
    supabase.from("events").select("*").eq("id", id).single(),
    supabase.from("contacts").select("*").order("full_name"),
  ]);

  if (!event) notFound();

  return (
    <div className="mx-auto w-full max-w-md flex-1">
      <Link
        href="/agenda"
        className="mb-4 inline-block text-sm text-muted-foreground underline underline-offset-2"
      >
        ← Volver a la agenda
      </Link>
      <h1 className="mb-4 text-lg font-semibold">{(event as Event).title}</h1>
      <EventForm event={event as Event} contacts={(contacts ?? []) as Contact[]} />
    </div>
  );
}
