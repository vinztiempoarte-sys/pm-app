import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { EventType, EventWithContact } from "@/types/database.types";

const typeLabel: Record<EventType, string> = {
  llamada: "Llamada",
  reunion: "Reunión",
  evento_empresa: "Evento de empresa",
  formacion: "Formación",
};

function formatDateHeading(iso: string) {
  const date = new Date(iso);
  return date.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function EventList({ events }: { events: EventWithContact[] }) {
  if (events.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        No tienes ningún evento próximo. Añade el primero.
      </p>
    );
  }

  const groups = new Map<string, EventWithContact[]>();
  for (const ev of events) {
    const day = ev.start_at.slice(0, 10);
    const list = groups.get(day) ?? [];
    list.push(ev);
    groups.set(day, list);
  }

  return (
    <div className="flex flex-col gap-6">
      {[...groups.entries()].map(([day, dayEvents]) => (
        <section key={day}>
          <h2 className="mb-2 text-sm font-semibold capitalize">
            {formatDateHeading(dayEvents[0].start_at)}
          </h2>
          <ul className="divide-y rounded-lg border">
            {dayEvents.map((ev) => (
              <li key={ev.id}>
                <Link
                  href={`/agenda/${ev.id}`}
                  className="flex items-center justify-between gap-3 p-3 hover:bg-muted/50"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{ev.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {formatTime(ev.start_at)}
                      {ev.location ? ` · ${ev.location}` : ""}
                      {ev.contacts ? ` · ${ev.contacts.full_name}` : ""}
                    </p>
                  </div>
                  <Badge variant="outline" className="shrink-0">
                    {typeLabel[ev.type]}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
