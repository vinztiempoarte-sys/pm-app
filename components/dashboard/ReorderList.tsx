"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import type { SaleStatus, SaleWithProduct } from "@/types/database.types";

export type ReorderSale = SaleWithProduct & {
  contacts: { id: string; full_name: string };
};

function ReorderRow({ sale }: { sale: ReorderSale }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  async function setStatus(status: SaleStatus) {
    setLoading(true);
    await supabase.from("sales").update({ status }).eq("id", sale.id);
    setLoading(false);
    router.refresh();
  }

  return (
    <li className="flex items-center justify-between gap-3 p-3">
      <Link href={`/contactos/${sale.contacts.id}`} className="min-w-0 flex-1">
        <p className="truncate font-medium">{sale.contacts.full_name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {sale.products.name} · recompra estimada {sale.estimated_reorder_date}
        </p>
      </Link>
      <Button size="sm" variant="outline" disabled={loading} onClick={() => setStatus("recomprado")}>
        Recompró
      </Button>
      <Button size="sm" variant="ghost" disabled={loading} onClick={() => setStatus("perdido")}>
        Perdido
      </Button>
    </li>
  );
}

export function ReorderList({ sales }: { sales: ReorderSale[] }) {
  if (sales.length === 0) return null;

  return (
    <section>
      <h2 className="mb-2 text-sm font-semibold text-primary">
        Recompras pendientes ({sales.length})
      </h2>
      <ul className="divide-y rounded-lg border">
        {sales.map((s) => (
          <ReorderRow key={s.id} sale={s} />
        ))}
      </ul>
    </section>
  );
}
