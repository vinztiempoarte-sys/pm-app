import { createClient } from "@/lib/supabase/server";
import { MiPaginaForm } from "@/components/mini-landing/MiPaginaForm";
import { LinksManager } from "@/components/mini-landing/LinksManager";
import type { MiniLandingLink, Profile } from "@/types/database.types";

export default async function MiPaginaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "id, full_name, mini_landing_slug, mini_landing_bio, brand_color, brand_logo_url"
    )
    .eq("id", user!.id)
    .single();

  const { data: links } = await supabase
    .from("mini_landing_links")
    .select("*")
    .eq("profile_id", user!.id)
    .order("position", { ascending: true });

  return (
    <div className="mx-auto w-full max-w-md flex-1 space-y-6">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold">Mi página</h1>
        <p className="text-sm text-muted-foreground">
          Tu tarjeta digital pública, para compartir en redes en vez de un
          Linktree genérico.
        </p>
      </div>

      <MiPaginaForm profile={profile as Profile} />

      <LinksManager
        profileId={user!.id}
        links={(links ?? []) as MiniLandingLink[]}
      />
    </div>
  );
}
