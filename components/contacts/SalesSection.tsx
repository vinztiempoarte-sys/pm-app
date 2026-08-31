"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addDays, todayISODate } from "@/lib/utils/date";
import type { Product, SaleStatus, SaleWithProduct } from "@/types/database.types";

const statusLabel: Record<SaleStatus, string> = {
  pendiente_recompra: "Pendiente de recompra",
  recomprado: "Recomprado",
  perdido: "Perdido",
};

const statusVariant: Record<SaleStatus, "warning" | "success" | "destructive"> = {
  pendiente_recompra: "warning",
  recomprado: "success",
  perdido: "destructive",
};

function SaleRow({ sale }: { sale: SaleWithProduct }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  async function setStatus(status: SaleStatus) {
    setLoading(true);
    await supabase.from("sales").update({ status }).eq("id", sale.id);
    setLoading(false);
    router.refresh();
  }

  async function onDelete() {
    if (!confirm("¿Borrar esta venta? No se puede deshacer.")) return;
    setLoading(true);
    await supabase.from("sales").delete().eq("id", sale.id);
    setLoading(false);
    router.refresh();
  }

  return (
    <li className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="truncate font-medium">
          {sale.products.name} × {sale.quantity}
        </p>
        <p className="text-xs text-muted-foreground">
          Vendido el {sale.sale_date} · recompra estimada {sale.estimated_reorder_date}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Badge variant={statusVariant[sale.status]}>{statusLabel[sale.status]}</Badge>
        {sale.status === "pendiente_recompra" && (
          <>
            <Button size="sm" variant="outline" disabled={loading} onClick={() => setStatus("recomprado")}>
              Recompró
            </Button>
            <Button size="sm" variant="ghost" disabled={loading} onClick={() => setStatus("perdido")}>
              Perdido
            </Button>
          </>
        )}
        <Button size="sm" variant="ghost" disabled={loading} onClick={onDelete}>
          Borrar
        </Button>
      </div>
    </li>
  );
}

export function SalesSection({
  contactId,
  products,
  sales,
}: {
  contactId: string;
  products: Product[];
  sales: SaleWithProduct[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const [showForm, setShowForm] = useState(false);
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [quantity, setQuantity] = useState("1");
  const [price, setPrice] = useState(products[0]?.default_price?.toString() ?? "");
  const [saleDate, setSaleDate] = useState(todayISODate());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onProductChange(id: string) {
    setProductId(id);
    const p = products.find((p) => p.id === id);
    setPrice(p?.default_price?.toString() ?? "");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    setLoading(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("sales").insert({
      owner_id: user!.id,
      contact_id: contactId,
      product_id: productId,
      quantity: Number(quantity) || 1,
      price: price ? Number(price) : null,
      sale_date: saleDate,
      estimated_reorder_date: addDays(saleDate, product.avg_duration_days),
    });

    setLoading(false);
    if (error) {
      setError("No se pudo registrar la venta. " + error.message);
      return;
    }
    setShowForm(false);
    router.refresh();
  }

  return (
    <div className="space-y-3 border-t pt-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Ventas</h2>
        {products.length > 0 && (
          <Button size="sm" variant="outline" onClick={() => setShowForm((v) => !v)}>
            {showForm ? "Cancelar" : "+ Registrar venta"}
          </Button>
        )}
      </div>

      {products.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Necesitas al menos un{" "}
          <Link href="/productos/nuevo" className="underline underline-offset-2">
            producto creado
          </Link>{" "}
          para poder registrar ventas.
        </p>
      )}

      {showForm && (
        <form onSubmit={onSubmit} className="space-y-3 rounded-lg border p-3">
          <div className="space-y-1.5">
            <Label htmlFor="product">Producto</Label>
            <select
              id="product"
              value={productId}
              onChange={(e) => onProductChange(e.target.value)}
              className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1.5">
              <Label htmlFor="quantity">Cantidad</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="price">Precio</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sale_date">Fecha</Label>
              <Input
                id="sale_date"
                type="date"
                value={saleDate}
                onChange={(e) => setSaleDate(e.target.value)}
              />
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" size="sm" disabled={loading} className="w-full">
            {loading ? "Guardando..." : "Guardar venta"}
          </Button>
        </form>
      )}

      {sales.length > 0 && (
        <ul className="divide-y rounded-lg border">
          {sales.map((s) => (
            <SaleRow key={s.id} sale={s} />
          ))}
        </ul>
      )}
    </div>
  );
}
