"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Template, TemplateCategory } from "@/types/database.types";

const categoryLabel: Record<TemplateCategory, string> = {
  primer_contacto: "Primer contacto",
  seguimiento: "Seguimiento",
  objecion_precio: "Objeción de precio",
  cierre: "Cierre",
  onboarding_equipo: "Onboarding de equipo",
  otro: "Otro",
};

function TemplateCard({ template }: { template: Template }) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(template.content);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
    setTimeout(() => setCopyState("idle"), 2000);
  }

  return (
    <li className="flex flex-col gap-2 p-3">
      <div className="flex items-start justify-between gap-3">
        <Link href={`/plantillas/${template.id}`} className="min-w-0 flex-1">
          <p className="font-medium">{template.title}</p>
        </Link>
        <Button
          size="sm"
          variant={copyState === "idle" ? "outline" : "secondary"}
          onClick={onCopy}
        >
          {copyState === "copied"
            ? "¡Copiado!"
            : copyState === "error"
              ? "No se pudo copiar"
              : "Copiar"}
        </Button>
      </div>
      <p className="whitespace-pre-wrap text-sm text-muted-foreground">{template.content}</p>
    </li>
  );
}

export function TemplateList({ templates }: { templates: Template[] }) {
  if (templates.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        Todavía no tienes plantillas. Añade la primera.
      </p>
    );
  }

  const groups = new Map<TemplateCategory, Template[]>();
  for (const t of templates) {
    const list = groups.get(t.category) ?? [];
    list.push(t);
    groups.set(t.category, list);
  }

  return (
    <div className="flex flex-col gap-6">
      {[...groups.entries()].map(([category, items]) => (
        <section key={category}>
          <h2 className="mb-2 text-sm font-semibold">{categoryLabel[category]}</h2>
          <ul className="divide-y rounded-lg border">
            {items.map((t) => (
              <TemplateCard key={t.id} template={t} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
