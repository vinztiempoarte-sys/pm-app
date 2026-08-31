import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { TemplateList } from "@/components/templates/TemplateList";
import type { Template } from "@/types/database.types";

export default async function TemplatesPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("templates").select("*").order("category");

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Plantillas</h1>
        <Link href="/plantillas/nuevo" className={buttonVariants({ size: "sm" })}>
          + Nueva
        </Link>
      </div>
      <TemplateList templates={(data ?? []) as Template[]} />
    </div>
  );
}
