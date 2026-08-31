import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TemplateForm } from "@/components/templates/TemplateForm";
import type { Template } from "@/types/database.types";

export default async function TemplateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("templates").select("*").eq("id", id).single();

  if (!data) notFound();

  return (
    <div className="mx-auto w-full max-w-md flex-1">
      <Link
        href="/plantillas"
        className="mb-4 inline-block text-sm text-muted-foreground underline underline-offset-2"
      >
        ← Volver a plantillas
      </Link>
      <h1 className="mb-4 text-lg font-semibold">{(data as Template).title}</h1>
      <TemplateForm template={data as Template} />
    </div>
  );
}
