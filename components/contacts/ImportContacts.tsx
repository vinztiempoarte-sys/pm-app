"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ContactType } from "@/types/database.types";

type ParsedContact = {
  full_name: string;
  phone: string | null;
  email: string | null;
};

type Step = "paste" | "preview" | "done";

function parseLines(text: string): ParsedContact[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      const parts = line.split(",").map((p) => p.trim()).filter(Boolean);
      const full_name = parts[0] ?? "";
      let phone: string | null = null;
      let email: string | null = null;
      for (const part of parts.slice(1)) {
        if (part.includes("@")) {
          email = part;
        } else if (!phone) {
          phone = part;
        }
      }
      return { full_name, phone, email };
    })
    .filter((c) => c.full_name.length > 0);
}

export function ImportContacts() {
  const router = useRouter();
  const supabase = createClient();

  const [type, setType] = useState<ContactType>("prospecto");
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState<ParsedContact[]>([]);
  const [step, setStep] = useState<Step>("paste");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importedCount, setImportedCount] = useState(0);

  function onPreview() {
    setParsed(parseLines(text));
    setStep("preview");
  }

  async function onConfirm() {
    setLoading(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error, count } = await supabase
      .from("contacts")
      .insert(
        parsed.map((c) => ({
          owner_id: user!.id,
          full_name: c.full_name,
          phone: c.phone,
          email: c.email,
          type,
        })),
        { count: "exact" }
      );

    setLoading(false);

    if (error) {
      setError("No se pudo importar. " + error.message);
      return;
    }

    setImportedCount(count ?? parsed.length);
    setStep("done");
    router.refresh();
  }

  function onImportAnother() {
    setText("");
    setParsed([]);
    setStep("paste");
    setImportedCount(0);
  }

  if (step === "done") {
    return (
      <div className="space-y-4 rounded-2xl border p-4 text-center">
        <p className="text-sm">
          {importedCount} {importedCount === 1 ? "contacto importado" : "contactos importados"} como{" "}
          {type === "cliente" ? "Cliente" : type === "equipo" ? "Equipo" : "Prospecto"}.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onImportAnother}>
            Importar otro lote
          </Button>
          <Button className="flex-1" onClick={() => router.push("/contactos")}>
            Ver contactos
          </Button>
        </div>
      </div>
    );
  }

  if (step === "preview") {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border p-4">
          <p className="mb-3 text-sm font-semibold">
            Hemos detectado {parsed.length} {parsed.length === 1 ? "contacto" : "contactos"}, tipo{" "}
            {type === "cliente" ? "Cliente" : type === "equipo" ? "Equipo" : "Prospecto"}.
          </p>
          <ul className="max-h-80 space-y-1 overflow-y-auto text-sm">
            {parsed.map((c, i) => (
              <li key={i} className="border-b py-1 last:border-0">
                <span className="font-medium">{c.full_name}</span>
                {c.phone && <span className="text-muted-foreground"> · {c.phone}</span>}
                {c.email && <span className="text-muted-foreground"> · {c.email}</span>}
              </li>
            ))}
          </ul>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => setStep("paste")}>
            Volver
          </Button>
          <Button
            className="flex-1"
            disabled={loading || parsed.length === 0}
            onClick={onConfirm}
          >
            {loading ? "Importando..." : `Importar ${parsed.length}`}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="import-type">Tipo de contacto para este lote</Label>
        <select
          id="import-type"
          value={type}
          onChange={(e) => setType(e.target.value as ContactType)}
          className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none"
        >
          <option value="prospecto">Prospecto</option>
          <option value="cliente">Cliente</option>
          <option value="equipo">Equipo</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="import-text">Pega tu lista (un contacto por línea)</Label>
        <Textarea
          id="import-text"
          rows={10}
          placeholder={"María López, 600111222\nJuan Pérez, 600333444, juan@email.com\nAna García"}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Formato: Nombre, Teléfono, Email (el teléfono y el email son
          opcionales).
        </p>
      </div>

      <Button className="w-full" disabled={!text.trim()} onClick={onPreview}>
        Ver vista previa
      </Button>
    </div>
  );
}
