import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { TeamList } from "@/components/team/TeamList";
import type { Contact } from "@/types/database.types";

export default async function TeamPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("contacts")
    .select("*")
    .eq("type", "equipo")
    .order("full_name");

  const members = (data ?? []) as Contact[];

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Equipo</h1>
        <Link
          href="/contactos/nuevo?type=equipo"
          className={buttonVariants({ size: "sm" })}
        >
          + Nuevo
        </Link>
      </div>
      <TeamList members={members} />
    </div>
  );
}
