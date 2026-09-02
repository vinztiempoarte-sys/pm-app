"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Rank } from "@/types/database.types";

function sortRanks(ranks: Rank[]) {
  return [...ranks].sort(
    (a, b) => a.min_personal_volume - b.min_personal_volume || a.min_group_volume - b.min_group_volume
  );
}

export function RankCalculator({
  profileId,
  initialPersonalVolume,
  initialGroupVolume,
  ranks,
}: {
  profileId: string;
  initialPersonalVolume: number | null;
  initialGroupVolume: number | null;
  ranks: Rank[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const [personalVolume, setPersonalVolume] = useState(
    initialPersonalVolume?.toString() ?? ""
  );
  const [groupVolume, setGroupVolume] = useState(initialGroupVolume?.toString() ?? "");
  const [savingVolume, setSavingVolume] = useState(false);

  const [name, setName] = useState("");
  const [minPv, setMinPv] = useState("");
  const [minGv, setMinGv] = useState("");
  const [addingRank, setAddingRank] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sorted = useMemo(() => sortRanks(ranks), [ranks]);

  const pv = Number(personalVolume) || 0;
  const gv = Number(groupVolume) || 0;

  const achieved = sorted.filter((r) => pv >= r.min_personal_volume && gv >= r.min_group_volume);
  const currentRank = achieved.at(-1) ?? null;
  const nextRank = sorted.find((r) => !achieved.includes(r)) ?? null;

  async function saveVolume() {
    setSavingVolume(true);
    await supabase
      .from("profiles")
      .update({
        current_personal_volume: personalVolume ? Number(personalVolume) : null,
        current_group_volume: groupVolume ? Number(groupVolume) : null,
      })
      .eq("id", profileId);
    setSavingVolume(false);
    router.refresh();
  }

  async function addRank(e: React.FormEvent) {
    e.preventDefault();
    if (!name) return;
    setAddingRank(true);
    setError(null);
    const { error } = await supabase.from("ranks").insert({
      owner_id: profileId,
      name,
      min_personal_volume: Number(minPv) || 0,
      min_group_volume: Number(minGv) || 0,
    });
    setAddingRank(false);
    if (error) {
      setError("No se pudo añadir. " + error.message);
      return;
    }
    setName("");
    setMinPv("");
    setMinGv("");
    router.refresh();
  }

  async function deleteRank(id: string) {
    if (!confirm("¿Borrar este rango?")) return;
    await supabase.from("ranks").delete().eq("id", id);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="space-y-3 rounded-lg border p-4">
        <h2 className="text-sm font-semibold">Tu volumen actual</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="pv">Volumen personal</Label>
            <Input
              id="pv"
              type="number"
              value={personalVolume}
              onChange={(e) => setPersonalVolume(e.target.value)}
              onBlur={saveVolume}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="gv">Volumen de grupo</Label>
            <Input
              id="gv"
              type="number"
              value={groupVolume}
              onChange={(e) => setGroupVolume(e.target.value)}
              onBlur={saveVolume}
            />
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={savingVolume}
          onClick={saveVolume}
        >
          {savingVolume ? "Guardando..." : "Guardar volumen"}
        </Button>
      </section>

      {sorted.length > 0 && (
        <section className="rounded-lg border bg-muted/40 p-4 text-center">
          <p className="text-xs text-muted-foreground">Tu rango actual</p>
          <p className="text-2xl font-semibold">{currentRank?.name ?? "Ninguno todavía"}</p>
          {nextRank && (
            <>
              <p className="mt-2 text-xs text-muted-foreground">
                Para <span className="font-medium">{nextRank.name}</span> te faltan{" "}
                {Math.max(0, nextRank.min_personal_volume - pv)} VP y{" "}
                {Math.max(0, nextRank.min_group_volume - gv)} VG
              </p>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(
                        0,
                        Math.min(
                          nextRank.min_personal_volume > 0 ? (pv / nextRank.min_personal_volume) * 100 : 100,
                          nextRank.min_group_volume > 0 ? (gv / nextRank.min_group_volume) * 100 : 100
                        )
                      )
                    )}%`,
                  }}
                />
              </div>
            </>
          )}
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Tus rangos</h2>
        {sorted.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Todavía no has definido ningún rango. Añade el primero abajo.
          </p>
        ) : (
          <ul className="divide-y rounded-lg border">
            {sorted.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 p-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {r.name}
                    {currentRank?.id === r.id && (
                      <span className="ml-2 text-xs font-normal text-primary">(actual)</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {r.min_personal_volume} VP · {r.min_group_volume} VG
                  </p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => deleteRank(r.id)}>
                  Borrar
                </Button>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={addRank} className="space-y-3 rounded-lg border p-3">
          <p className="text-sm font-medium">Añadir rango</p>
          <div className="space-y-1.5">
            <Label htmlFor="rank_name">Nombre</Label>
            <Input id="rank_name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="rank_pv">Volumen personal mínimo</Label>
              <Input
                id="rank_pv"
                type="number"
                value={minPv}
                onChange={(e) => setMinPv(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rank_gv">Volumen de grupo mínimo</Label>
              <Input
                id="rank_gv"
                type="number"
                value={minGv}
                onChange={(e) => setMinGv(e.target.value)}
              />
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" size="sm" disabled={addingRank || !name} className="w-full">
            {addingRank ? "Añadiendo..." : "+ Añadir rango"}
          </Button>
        </form>
      </section>
    </div>
  );
}
