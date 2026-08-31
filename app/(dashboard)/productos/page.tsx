import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import type { Product } from "@/types/database.types";

export default async function ProductsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("products").select("*").order("name");
  const products = (data ?? []) as Product[];

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Productos</h1>
        <Link href="/productos/nuevo" className={buttonVariants({ size: "sm" })}>
          + Nuevo
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Todavía no tienes productos. Añade el primero para poder registrar ventas.
        </p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {products.map((p) => (
            <li key={p.id}>
              <Link
                href={`/productos/${p.id}`}
                className="flex items-center justify-between gap-3 p-3 hover:bg-muted/50"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{p.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {p.category || "Sin categoría"} · dura ~{p.avg_duration_days} días
                  </p>
                </div>
                {p.default_price != null && (
                  <span className="shrink-0 text-sm text-muted-foreground">
                    {p.default_price.toFixed(2)} €
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
