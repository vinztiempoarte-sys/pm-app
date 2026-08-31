import Link from "next/link";
import { TemplateForm } from "@/components/templates/TemplateForm";

export default function NewTemplatePage() {
  return (
    <div className="mx-auto w-full max-w-md flex-1">
      <Link
        href="/plantillas"
        className="mb-4 inline-block text-sm text-muted-foreground underline underline-offset-2"
      >
        ← Volver a plantillas
      </Link>
      <h1 className="mb-4 text-lg font-semibold">Nueva plantilla</h1>
      <TemplateForm />
    </div>
  );
}
