"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { Contact, ContactType, Temperature } from "@/types/database.types";

const typeLabel: Record<ContactType, string> = {
  cliente: "Cliente",
  prospecto: "Prospecto",
  equipo: "Equipo",
};

const temperatureLabel: Record<Temperature, string> = {
  frio: "Frío",
  tibio: "Tibio",
  caliente: "Caliente",
};

const temperatureVariant: Record<Temperature, "outline" | "warning" | "success"> = {
  frio: "outline",
  tibio: "warning",
  caliente: "success",
};

export function ContactList({ contacts }: { contacts: Contact[] }) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<ContactType | "todos">("todos");

  const filtered = useMemo(() => {
    return contacts.filter((c) => {
      const matchesQuery = c.full_name.toLowerCase().includes(query.toLowerCase());
      const matchesType = typeFilter === "todos" || c.type === typeFilter;
      return matchesQuery && matchesType;
    });
  }, [contacts, query, typeFilter]);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          placeholder="Buscar por nombre..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="sm:max-w-xs"
        />
        <div className="flex gap-1 overflow-x-auto">
          {(["todos", "prospecto", "cliente", "equipo"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                typeFilter === t
                  ? "bg-primary text-primary-foreground border-primary"
                  : "text-muted-foreground"
              }`}
            >
              {t === "todos" ? "Todos" : typeLabel[t]}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          {contacts.length === 0
            ? "Todavía no tienes contactos. Añade el primero."
            : "Ningún contacto coincide con la búsqueda."}
        </p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {filtered.map((c) => (
            <li key={c.id}>
              <Link
                href={`/contactos/${c.id}`}
                className="flex items-center justify-between gap-3 p-3 hover:bg-muted/50"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{c.full_name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {c.phone || c.email || "Sin datos de contacto"}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  {c.temperature && (
                    <Badge variant={temperatureVariant[c.temperature]}>
                      {temperatureLabel[c.temperature]}
                    </Badge>
                  )}
                  <Badge variant="outline">{typeLabel[c.type]}</Badge>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
