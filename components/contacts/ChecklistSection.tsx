"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { ChecklistItem } from "@/types/database.types";

function ChecklistRow({ item }: { item: ChecklistItem }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    await supabase
      .from("onboarding_checklist_items")
      .update({
        completed: !item.completed,
        completed_at: !item.completed ? new Date().toISOString() : null,
      })
      .eq("id", item.id);
    setLoading(false);
    router.refresh();
  }

  return (
    <li className="flex items-center gap-3 p-2.5">
      <input
        type="checkbox"
        checked={item.completed}
        disabled={loading}
        onChange={toggle}
        className="h-4 w-4 shrink-0 accent-primary"
      />
      <span className={item.completed ? "text-sm text-muted-foreground line-through" : "text-sm"}>
        {item.title}
      </span>
    </li>
  );
}

export function ChecklistSection({ items }: { items: ChecklistItem[] }) {
  if (items.length === 0) return null;

  const buckets = [30, 60, 90] as const;
  const done = items.filter((i) => i.completed).length;

  return (
    <div className="space-y-3 border-t pt-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Checklist de onboarding</h2>
        <span className="text-xs text-muted-foreground">
          {done}/{items.length} completado
        </span>
      </div>

      {buckets.map((bucket) => {
        const bucketItems = items.filter((i) => i.day_bucket === bucket);
        if (bucketItems.length === 0) return null;
        return (
          <div key={bucket}>
            <p className="mb-1 text-xs font-medium text-muted-foreground">
              Primeros {bucket} días
            </p>
            <ul className="divide-y rounded-lg border">
              {bucketItems.map((item) => (
                <ChecklistRow key={item.id} item={item} />
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
