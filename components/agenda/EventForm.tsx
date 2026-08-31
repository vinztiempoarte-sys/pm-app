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
import type { Contact, Event } from "@/types/database.types";

const eventSchema = z.object({
  title: z.string().min(1, "El título es obligatorio"),
  type: z.enum(["llamada", "reunion", "evento_empresa", "formacion"]),
  start_at: z.string().min(1, "La fecha es obligatoria"),
  end_at: z.string().optional(),
  location: z.string().optional(),
  contact_id: z.string().optional(),
});

type EventFormValues = z.infer<typeof eventSchema>;

function toLocalInputValue(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export function EventForm({
  event,
  contacts,
}: {
  event?: EventFormEditable;
  contacts: Contact[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const isEditing = !!event;

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: event?.title ?? "",
      type: event?.type ?? "reunion",
      start_at: toLocalInputValue(event?.start_at ?? null),
      end_at: toLocalInputValue(event?.end_at ?? null),
      location: event?.location ?? "",
      contact_id: event?.contact_id ?? "",
    },
  });

  async function onSubmit(values: EventFormValues) {
    setLoading(true);
    setError(null);

    const payload = {
      title: values.title,
      type: values.type,
      start_at: new Date(values.start_at).toISOString(),
      end_at: values.end_at ? new Date(values.end_at).toISOString() : null,
      location: values.location || null,
      contact_id: values.contact_id || null,
    };

    if (isEditing) {
      const { error } = await supabase.from("events").update(payload).eq("id", event.id);
      setLoading(false);
      if (error) {
        setError("No se pudo guardar. " + error.message);
        return;
      }
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { error } = await supabase.from("events").insert({ ...payload, owner_id: user!.id });
      setLoading(false);
      if (error) {
        setError("No se pudo crear. " + error.message);
        return;
      }
    }
    router.push("/agenda");
    router.refresh();
  }

  async function onDelete() {
    if (!event) return;
    if (!confirm(`¿Borrar "${event.title}"? No se puede deshacer.`)) return;
    setDeleting(true);
    const { error } = await supabase.from("events").delete().eq("id", event.id);
    setDeleting(false);
    if (error) {
      setError("No se pudo borrar. " + error.message);
      return;
    }
    router.push("/agenda");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="title">Título *</Label>
        <Input id="title" {...register("title")} />
        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="type">Tipo</Label>
        <select
          id="type"
          {...register("type")}
          className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none"
        >
          <option value="reunion">Reunión</option>
          <option value="llamada">Llamada</option>
          <option value="evento_empresa">Evento de empresa</option>
          <option value="formacion">Formación</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="start_at">Empieza *</Label>
          <Input id="start_at" type="datetime-local" {...register("start_at")} />
          {errors.start_at && (
            <p className="text-sm text-destructive">{errors.start_at.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="end_at">Termina</Label>
          <Input id="end_at" type="datetime-local" {...register("end_at")} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="location">Lugar / enlace</Label>
        <Input id="location" placeholder="Cafetería, Zoom, dirección..." {...register("location")} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="contact_id">Contacto relacionado</Label>
        <select
          id="contact_id"
          {...register("contact_id")}
          className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none"
        >
          <option value="">— Ninguno —</option>
          {contacts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.full_name}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear evento"}
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

type EventFormEditable = Pick<
  Event,
  "id" | "title" | "type" | "start_at" | "end_at" | "location" | "contact_id"
>;
