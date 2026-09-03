"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ChecklistTemplateItem } from "@/types/database.types";

const BUCKETS = [30, 60, 90] as const;
const BUCKET_LABELS: Record<number, string> = {
  30: "Primeros 30 días",
  60: "Días 31-60",
  90: "Días 61-90",
};

function BucketSection({
  ownerId,
  dayBucket,
  items,
}: {
  ownerId: string;
  dayBucket: 30 | 60 | 90;
  items: ChecklistTemplateItem[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  async function addItem() {
    if (!title.trim()) return;
    setLoading(true);
    const nextPosition = items.length
      ? Math.max(...items.map((i) => i.position)) + 1
      : dayBucket;

    await supabase.from("checklist_templates").insert({
      owner_id: ownerId,
      title: title.trim(),
      day_bucket: dayBucket,
      position: nextPosition,
    });

    setLoading(false);
    setTitle("");
    router.refresh();
  }

  async function removeItem(id: string) {
    if (!confirm("¿Borrar este paso de la plantilla?")) return;
    await supabase.from("checklist_templates").delete().eq("id", id);
    router.refresh();
  }

  async function move(item: ChecklistTemplateItem, direction: -1 | 1) {
    const sorted = [...items].sort((a, b) => a.position - b.position);
    const index = sorted.findIndex((i) => i.id === item.id);
    const swapWith = sorted[index + direction];
    if (!swapWith) return;

    await Promise.all([
      supabase
        .from("checklist_templates")
        .update({ position: swapWith.position })
        .eq("id", item.id),
      supabase
        .from("checklist_templates")
        .update({ position: item.position })
        .eq("id", swapWith.id),
    ]);
    router.refresh();
  }

  const sorted = [...items].sort((a, b) => a.position - b.position);

  return (
    <section className="space-y-2 rounded-2xl border p-4">
      <h2 className="text-sm font-semibold">{BUCKET_LABELS[dayBucket]}</h2>

      {sorted.length === 0 && (
        <p className="text-sm text-muted-foreground">Sin pasos todavía.</p>
      )}

      <ul className="space-y-2">
        {sorted.map((item, i) => (
          <li
            key={item.id}
            className="flex items-center gap-2 rounded-lg border p-2"
          >
            <div className="flex flex-col">
              <button
                type="button"
                onClick={() => move(item, -1)}
                disabled={i === 0}
                className="text-xs text-muted-foreground disabled:opacity-30"
              >
                ▲
              </button>
              <button
                type="button"
                onClick={() => move(item, 1)}
                disabled={i === sorted.length - 1}
                className="text-xs text-muted-foreground disabled:opacity-30"
              >
                ▼
              </button>
            </div>
            <p className="min-w-0 flex-1 truncate text-sm">{item.title}</p>
            <button
              type="button"
              onClick={() => removeItem(item.id)}
              className="shrink-0 text-xs text-destructive"
            >
              Borrar
            </button>
          </li>
        ))}
      </ul>

      <div className="flex gap-2 pt-1">
        <Input
          placeholder="Nuevo paso..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={addItem}
          disabled={loading || !title.trim()}
        >
          {loading ? "..." : "+ Añadir"}
        </Button>
      </div>
    </section>
  );
}

export function ChecklistTemplateManager({
  ownerId,
  items,
}: {
  ownerId: string;
  items: ChecklistTemplateItem[];
}) {
  return (
    <div className="space-y-4">
      {BUCKETS.map((bucket) => (
        <BucketSection
          key={bucket}
          ownerId={ownerId}
          dayBucket={bucket}
          items={items.filter((i) => i.day_bucket === bucket)}
        />
      ))}
    </div>
  );
}
