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
import type { Contact } from "@/types/database.types";

const contactSchema = z.object({
  full_name: z.string().min(1, "El nombre es obligatorio"),
  phone: z.string().optional(),
  email: z.string().email("Email no válido").optional().or(z.literal("")),
  type: z.enum(["cliente", "prospecto", "equipo"]),
  temperature: z.enum(["frio", "tibio", "caliente"]).optional().or(z.literal("")),
  source: z.string().optional(),
  next_action_at: z.string().optional(),
  next_action_note: z.string().optional(),
  activity_status: z.enum(["activo", "inactivo"]).optional().or(z.literal("")),
  team_rank: z.string().optional(),
  team_join_date: z.string().optional(),
  team_personal_volume: z.string().optional(),
  team_group_volume: z.string().optional(),
});

type ContactFormValues = z.infer<typeof contactSchema>;

function toFormValues(contact?: Contact, defaultType?: Contact["type"]): ContactFormValues {
  return {
    full_name: contact?.full_name ?? "",
    phone: contact?.phone ?? "",
    email: contact?.email ?? "",
    type: contact?.type ?? defaultType ?? "prospecto",
    temperature: contact?.temperature ?? "",
    source: contact?.source ?? "",
    next_action_at: contact?.next_action_at?.slice(0, 10) ?? "",
    next_action_note: contact?.next_action_note ?? "",
    activity_status: contact?.activity_status ?? "",
    team_rank: contact?.team_rank ?? "",
    team_join_date: contact?.team_join_date ?? "",
    team_personal_volume: contact?.team_personal_volume?.toString() ?? "",
    team_group_volume: contact?.team_group_volume?.toString() ?? "",
  };
}

export function ContactForm({
  contact,
  defaultType,
}: {
  contact?: Contact;
  defaultType?: Contact["type"];
}) {
  const router = useRouter();
  const supabase = createClient();
  const isEditing = !!contact;

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: toFormValues(contact, defaultType),
  });

  const type = watch("type");

  async function onSubmit(values: ContactFormValues) {
    setLoading(true);
    setError(null);

    const payload = {
      full_name: values.full_name,
      phone: values.phone || null,
      email: values.email || null,
      type: values.type,
      temperature: values.temperature || null,
      source: values.source || null,
      next_action_at: values.next_action_at || null,
      next_action_note: values.next_action_note || null,
      activity_status: values.activity_status || null,
      team_rank: values.team_rank || null,
      team_join_date: values.team_join_date || null,
      team_personal_volume: values.team_personal_volume
        ? Number(values.team_personal_volume)
        : null,
      team_group_volume: values.team_group_volume
        ? Number(values.team_group_volume)
        : null,
    };

    if (isEditing) {
      const { error } = await supabase
        .from("contacts")
        .update(payload)
        .eq("id", contact.id);
      setLoading(false);
      if (error) {
        setError("No se pudo guardar el contacto. " + error.message);
        return;
      }
      router.push(`/contactos/${contact.id}`);
      router.refresh();
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("contacts")
        .insert({ ...payload, owner_id: user!.id })
        .select("id")
        .single();
      setLoading(false);
      if (error || !data) {
        setError("No se pudo crear el contacto. " + error?.message);
        return;
      }
      router.push(`/contactos/${data.id}`);
      router.refresh();
    }
  }

  async function onDelete() {
    if (!contact) return;
    if (!confirm(`¿Borrar a ${contact.full_name}? No se puede deshacer.`)) return;
    setDeleting(true);
    const { error } = await supabase.from("contacts").delete().eq("id", contact.id);
    setDeleting(false);
    if (error) {
      setError("No se pudo borrar el contacto. " + error.message);
      return;
    }
    router.push("/contactos");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="full_name">Nombre *</Label>
        <Input id="full_name" {...register("full_name")} />
        {errors.full_name && (
          <p className="text-sm text-destructive">{errors.full_name.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="phone">Teléfono</Label>
          <Input id="phone" {...register("phone")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register("email")} />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="type">Tipo *</Label>
          <select
            id="type"
            {...register("type")}
            className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none"
          >
            <option value="prospecto">Prospecto</option>
            <option value="cliente">Cliente</option>
            <option value="equipo">Equipo</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="temperature">Temperatura</Label>
          <select
            id="temperature"
            {...register("temperature")}
            className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none"
          >
            <option value="">—</option>
            <option value="frio">Frío</option>
            <option value="tibio">Tibio</option>
            <option value="caliente">Caliente</option>
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="source">Origen</Label>
        <Input
          id="source"
          placeholder="Redes, referido, evento..."
          {...register("source")}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="next_action_at">Próxima acción</Label>
          <Input id="next_action_at" type="date" {...register("next_action_at")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="next_action_note">Nota</Label>
          <Input id="next_action_note" {...register("next_action_note")} />
        </div>
      </div>

      {type === "equipo" && (
        <div className="space-y-4 rounded-lg border p-4">
          <p className="text-sm font-medium">Datos de equipo</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="team_rank">Rango</Label>
              <Input id="team_rank" {...register("team_rank")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="activity_status">Estado</Label>
              <select
                id="activity_status"
                {...register("activity_status")}
                className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none"
              >
                <option value="">—</option>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="team_join_date">Fecha de afiliación</Label>
            <Input id="team_join_date" type="date" {...register("team_join_date")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="team_personal_volume">Volumen personal</Label>
              <Input
                id="team_personal_volume"
                type="number"
                step="0.01"
                {...register("team_personal_volume")}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="team_group_volume">Volumen de grupo</Label>
              <Input
                id="team_group_volume"
                type="number"
                step="0.01"
                {...register("team_group_volume")}
              />
            </div>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear contacto"}
        </Button>
        {isEditing && (
          <Button
            type="button"
            variant="outline"
            onClick={onDelete}
            disabled={deleting}
          >
            {deleting ? "Borrando..." : "Borrar"}
          </Button>
        )}
      </div>
    </form>
  );
}
