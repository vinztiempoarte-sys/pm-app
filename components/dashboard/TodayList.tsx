"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Contact } from "@/types/database.types";

const typeLabel: Record<Contact["type"], string> = {
  cliente: "Cliente",
  prospecto: "Prospecto",
  equipo: "Equipo",
};

function ActionRow({ contact }: { contact: Contact }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  async function markDone() {
    setLoading(true);
    await supabase
      .from("contacts")
      .update({ next_action_at: null, last_interaction_at: new Date().toISOString() })
      .eq("id", contact.id);
    setLoading(false);
    router.refresh();
  }

  return (
    <li className="flex items-center justify-between gap-3 p-3">
      <Link href={`/contactos/${contact.id}`} className="min-w-0 flex-1">
        <p className="truncate font-medium">{contact.full_name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {contact.next_action_note || "Sin nota"}
        </p>
      </Link>
      <Badge variant="outline" className="shrink-0">
        {typeLabel[contact.type]}
      </Badge>
      <Button size="sm" variant="outline" disabled={loading} onClick={markDone}>
        {loading ? "..." : "Hecho ✓"}
      </Button>
    </li>
  );
}

export function TodayList({
  overdue,
  today,
}: {
  overdue: Contact[];
  today: Contact[];
}) {
  if (overdue.length === 0 && today.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 py-16 text-center">
        <p className="text-2xl">✨</p>
        <p className="font-medium">No tienes seguimientos pendientes</p>
        <p className="text-sm text-muted-foreground">
          Añade una próxima acción a tus contactos para que aparezcan aquí.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {overdue.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold text-destructive">
            Atrasados ({overdue.length})
          </h2>
          <ul className="divide-y rounded-lg border">
            {overdue.map((c) => (
              <ActionRow key={c.id} contact={c} />
            ))}
          </ul>
        </section>
      )}
      {today.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold">Para hoy ({today.length})</h2>
          <ul className="divide-y rounded-lg border">
            {today.map((c) => (
              <ActionRow key={c.id} contact={c} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
