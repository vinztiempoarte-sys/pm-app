import { createClient } from "@/lib/supabase/server";
import { ChecklistTemplateManager } from "@/components/duplicacion/ChecklistTemplateManager";
import type { ChecklistTemplateItem } from "@/types/database.types";

export default async function DuplicacionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: items } = await supabase
    .from("checklist_templates")
    .select("*")
    .eq("owner_id", user!.id)
    .order("position", { ascending: true });

  return (
    <div className="mx-auto w-full max-w-md flex-1 space-y-6">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold">Modo duplicación</h1>
        <p className="text-sm text-muted-foreground">
          Esta es tu plantilla de onboarding de 30/60/90 días. Cada vez que
          añadas un nuevo miembro a tu equipo, se le clona automáticamente
          esta misma lista — así que lo que edites aquí afecta a todos los
          que añadas a partir de ahora.
        </p>
      </div>

      <ChecklistTemplateManager
        ownerId={user!.id}
        items={(items ?? []) as ChecklistTemplateItem[]}
      />
    </div>
  );
}
