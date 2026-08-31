"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Product } from "@/types/database.types";

const productSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  category: z.string().optional(),
  avg_duration_days: z
    .string()
    .min(1, "Obligatorio")
    .refine((v) => Number(v) > 0, "Debe ser mayor que 0"),
  default_price: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const supabase = createClient();
  const isEditing = !!product;

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? "",
      category: product?.category ?? "",
      avg_duration_days: product?.avg_duration_days?.toString() ?? "30",
      default_price: product?.default_price?.toString() ?? "",
    },
  });

  async function onSubmit(values: ProductFormValues) {
    setLoading(true);
    setError(null);

    const payload = {
      name: values.name,
      category: values.category || null,
      avg_duration_days: Number(values.avg_duration_days),
      default_price: values.default_price ? Number(values.default_price) : null,
    };

    if (isEditing) {
      const { error } = await supabase.from("products").update(payload).eq("id", product.id);
      setLoading(false);
      if (error) {
        setError("No se pudo guardar. " + error.message);
        return;
      }
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("products")
        .insert({ ...payload, owner_id: user!.id });
      setLoading(false);
      if (error) {
        setError("No se pudo crear. " + error.message);
        return;
      }
    }
    router.push("/productos");
    router.refresh();
  }

  async function onDelete() {
    if (!product) return;
    if (!confirm(`¿Borrar "${product.name}"? No se puede deshacer.`)) return;
    setDeleting(true);
    const { error } = await supabase.from("products").delete().eq("id", product.id);
    setDeleting(false);
    if (error) {
      setError("No se pudo borrar. Puede que tenga ventas asociadas. " + error.message);
      return;
    }
    router.push("/productos");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="name">Nombre *</Label>
        <Input id="name" {...register("name")} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="category">Categoría</Label>
        <Input id="category" {...register("category")} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="avg_duration_days">Duración media (días) *</Label>
          <Input id="avg_duration_days" type="number" {...register("avg_duration_days")} />
          {errors.avg_duration_days && (
            <p className="text-sm text-destructive">{errors.avg_duration_days.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="default_price">Precio habitual</Label>
          <Input id="default_price" type="number" step="0.01" {...register("default_price")} />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        La duración media se usa para calcular automáticamente cuándo le tocará recomprar a cada cliente.
      </p>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear producto"}
        </Button>
        {isEditing && (
          <Button type="button" variant="outline" onClick={onDelete} disabled={deleting}>
            {deleting ? "Borrando..." : "Borrar"}
          </Button>
        )}
      </div>
    </form>
  );
}
