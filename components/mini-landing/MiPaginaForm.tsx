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
import { getYoutubeEmbedUrl } from "@/lib/youtube";
import type { Profile } from "@/types/database.types";

const schema = z.object({
  mini_landing_slug: z
    .string()
    .min(3, "Mínimo 3 caracteres")
    .regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones, sin espacios"),
  mini_landing_bio: z.string().max(160, "Máximo 160 caracteres").optional(),
  brand_color: z.string().optional(),
  brand_logo_url: z.string().url("URL no válida").optional().or(z.literal("")),
  mini_landing_video_url: z
    .string()
    .refine((v) => !v || !!getYoutubeEmbedUrl(v), "Tiene que ser un enlace de YouTube")
    .optional()
    .or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

export function MiPaginaForm({ profile }: { profile: Profile | null }) {
  const router = useRouter();
  const supabase = createClient();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      mini_landing_slug: profile?.mini_landing_slug ?? "",
      mini_landing_bio: profile?.mini_landing_bio ?? "",
      brand_color: profile?.brand_color ?? "#dc2669",
      brand_logo_url: profile?.brand_logo_url ?? "",
      mini_landing_video_url: profile?.mini_landing_video_url ?? "",
    },
  });

  async function onSubmit(values: FormValues) {
    setLoading(true);
    setError(null);
    setSaved(false);

    const { error } = await supabase
      .from("profiles")
      .update({
        mini_landing_slug: values.mini_landing_slug,
        mini_landing_bio: values.mini_landing_bio || null,
        brand_color: values.brand_color || null,
        brand_logo_url: values.brand_logo_url || null,
        mini_landing_video_url: values.mini_landing_video_url || null,
      })
      .eq("id", profile!.id);

    setLoading(false);

    if (error) {
      if (error.code === "23505") {
        setError("Ese nombre de página ya lo está usando otra persona.");
      } else {
        setError("No se pudo guardar. " + error.message);
      }
      return;
    }

    setSaved(true);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 rounded-2xl border p-4"
    >
      <div className="space-y-1.5">
        <Label htmlFor="mini_landing_slug">Tu enlace</Label>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <span className="shrink-0">pmapp-crm.vercel.app/l/</span>
          <Input
            id="mini_landing_slug"
            placeholder="tu-nombre"
            {...register("mini_landing_slug")}
          />
        </div>
        {errors.mini_landing_slug && (
          <p className="text-sm text-destructive">
            {errors.mini_landing_slug.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="mini_landing_bio">Descripción breve</Label>
        <Textarea
          id="mini_landing_bio"
          rows={2}
          placeholder="Distribuidora independiente FitLine · Nutrición celular"
          {...register("mini_landing_bio")}
        />
        {errors.mini_landing_bio && (
          <p className="text-sm text-destructive">
            {errors.mini_landing_bio.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="brand_color">Color</Label>
          <Input id="brand_color" type="color" {...register("brand_color")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="brand_logo_url">Foto (URL)</Label>
          <Input
            id="brand_logo_url"
            placeholder="https://..."
            {...register("brand_logo_url")}
          />
          {errors.brand_logo_url && (
            <p className="text-sm text-destructive">
              {errors.brand_logo_url.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="mini_landing_video_url">Vídeo de presentación (YouTube)</Label>
        <Input
          id="mini_landing_video_url"
          placeholder="https://youtu.be/..."
          {...register("mini_landing_video_url")}
        />
        {errors.mini_landing_video_url && (
          <p className="text-sm text-destructive">
            {errors.mini_landing_video_url.message}
          </p>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {saved && !error && (
        <p className="text-sm text-success">Guardado.</p>
      )}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Guardando..." : "Guardar"}
      </Button>

      {profile?.mini_landing_slug && (
        <a
          href={`/l/${profile.mini_landing_slug}`}
          target="_blank"
          rel="noreferrer"
          className="block text-center text-sm underline underline-offset-2 text-muted-foreground"
        >
          Ver mi página pública
        </a>
      )}
    </form>
  );
}
