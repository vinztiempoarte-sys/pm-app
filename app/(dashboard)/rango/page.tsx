import { createClient } from "@/lib/supabase/server";
import { RankCalculator } from "@/components/rank/RankCalculator";
import type { Profile, Rank } from "@/types/database.types";

export default async function RankPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, { data: ranks }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, current_personal_volume, current_group_volume")
      .eq("id", user!.id)
      .single(),
    supabase.from("ranks").select("*"),
  ]);

  return (
    <div className="mx-auto w-full max-w-md flex-1">
      <h1 className="mb-4 text-lg font-semibold">Calculadora de rango</h1>
      <RankCalculator
        profileId={user!.id}
        initialPersonalVolume={(profile as Partial<Profile> | null)?.current_personal_volume ?? null}
        initialGroupVolume={(profile as Partial<Profile> | null)?.current_group_volume ?? null}
        ranks={(ranks ?? []) as Rank[]}
      />
    </div>
  );
}
