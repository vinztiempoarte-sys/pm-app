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
import { Textarea } from "@/components/ui/textarea";
import type { Template } from "@/types/database.types";

const templateSchema = z.object({
  category: z.enum([
    "primer_contacto",
    "seguimiento",
    "objecion_precio",
    "cierre",
    "onboarding_equipo",
    "otro",
  ]),
  title: z.string().min(1, "El título es obligatorio"),
  content: z.string().min(1, "El contenido es obligatorio"),
});

type TemplateFormValues = z.infer<typeof templateSchema>;

export function TemplateForm({ template }: { template?: Template }) {
  const router = useRouter();
  const supabase = createClient();
  const isEditing = !!template;

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      category: template?.category ?? "primer_contacto",
      title: template?.title ?? "",
      content: template?.content ?? "",
    },
  });

  async function onSubmit(values: TemplateFormValues) {
    setLoading(true);
    setError(null);

    if (isEditing) {
      const { error } = await supabase.from("templates").update(values).eq("id", template.id);
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
        .from("templates")
        .insert({ ...values, owner_id: user!.id });
      setLoading(false);
      if (error) {
        setError("No se pudo crear. " + error.message);
        return;
      }
    }
    router.push("/plantillas");
    router.refresh();
  }

  async function onDelete() {
    if (!template) return;
    if (!confirm(`¿Borrar "${template.title}"? No se puede deshacer.`)) return;
    setDeleting(true);
    const { error } = await supabase.from("templates").delete().eq("id", template.id);
    setDeleting(false);
    if (error) {
      setError("No se pudo borrar. " + error.message);
      return;
    }
    router.push("/plantillas");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="category">Categoría</Label>
        <select
          id="category"
          {...register("category")}
          className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none"
        >
          <option value="primer_contacto">Primer contacto</option>
          <option value="seguimiento">Seguimiento</option>
          <option value="objecion_precio">Objeción de precio</option>
          <option value="cierre">Cierre</option>
          <option value="onboarding_equipo">Onboarding de equipo</option>
          <option value="otro">Otro</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="title">Título *</Label>
        <Input id="title" {...register("title")} />
        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="content">Contenido *</Label>
        <Textarea id="content" rows={6} {...register("content")} />
        {errors.content && (
          <p className="text-sm text-destructive">{errors.content.message}</p>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear plantilla"}
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
