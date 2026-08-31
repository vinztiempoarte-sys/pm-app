"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Contact } from "@/types/database.types";

function TeamRow({ member }: { member: Contact }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const isActive = member.activity_status !== "inactivo";

  async function toggleStatus() {
    setLoading(true);
    await supabase
      .from("contacts")
      .update({ activity_status: isActive ? "inactivo" : "activo" })
      .eq("id", member.id);
    setLoading(false);
    router.refresh();
  }

  return (
    <li className="flex items-center justify-between gap-3 p-3">
      <Link href={`/contactos/${member.id}`} className="min-w-0 flex-1">
        <p className="truncate font-medium">{member.full_name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {member.team_rank || "Sin rango"}
          {member.team_join_date ? ` · desde ${member.team_join_date}` : ""}
        </p>
      </Link>
      <div className="hidden shrink-0 text-right text-xs text-muted-foreground sm:block">
        <p>VP: {member.team_personal_volume ?? "—"}</p>
        <p>VG: {member.team_group_volume ?? "—"}</p>
      </div>
      <Badge variant={isActive ? "success" : "warning"} className="shrink-0">
        {isActive ? "Activo" : "Inactivo"}
      </Badge>
      <Button size="sm" variant="outline" disabled={loading} onClick={toggleStatus}>
        {loading ? "..." : isActive ? "Marcar inactivo" : "Marcar activo"}
      </Button>
    </li>
  );
}

export function TeamList({ members }: { members: Contact[] }) {
  const active = members.filter((m) => m.activity_status !== "inactivo");
  const inactive = members.filter((m) => m.activity_status === "inactivo");

  if (members.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        Todavía no tienes miembros de equipo. Añade el primero.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h2 className="mb-2 text-sm font-semibold">Activos ({active.length})</h2>
        {active.length === 0 ? (
          <p className="text-sm text-muted-foreground">Ninguno por ahora.</p>
        ) : (
          <ul className="divide-y rounded-lg border">
            {active.map((m) => (
              <TeamRow key={m.id} member={m} />
            ))}
          </ul>
        )}
      </section>

      {inactive.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold text-muted-foreground">
            Inactivos ({inactive.length})
          </h2>
          <ul className="divide-y rounded-lg border opacity-70">
            {inactive.map((m) => (
              <TeamRow key={m.id} member={m} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
