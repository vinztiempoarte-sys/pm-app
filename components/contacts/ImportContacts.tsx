"use client";

import { useRef, useState } from "react";
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

type Mode = "paste" | "file";
type Step = "input" | "preview" | "done";

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

function parseVCard(text: string): ParsedContact[] {
  return text
    .split(/BEGIN:VCARD/i)
    .slice(1)
    .map((block) => {
      const name = block.match(/^FN:(.*)$/im)?.[1]?.trim() ?? "";
      const phone = block.match(/^TEL[^:]*:(.*)$/im)?.[1]?.trim() ?? null;
      const email = block.match(/^EMAIL[^:]*:(.*)$/im)?.[1]?.trim() ?? null;
      return { full_name: name, phone, email };
    })
    .filter((c) => c.full_name.length > 0);
}

const typeLabel: Record<ContactType, string> = {
  cliente: "Cliente",
  equipo: "Equipo",
  prospecto: "Prospecto",
};

export function ImportContacts() {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<Mode>("paste");
  const [type, setType] = useState<ContactType>("prospecto");
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState<ParsedContact[]>([]);
  const [step, setStep] = useState<Step>("input");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importedCount, setImportedCount] = useState(0);

  function onPreviewPaste() {
    setParsed(parseLines(text));
    setStep("preview");
  }

  async function onFileSelected(file: File) {
    setLoading(true);
    setError(null);

    const content = await file.text();
    const isVCard = file.name.toLowerCase().endsWith(".vcf");

    if (isVCard) {
      setParsed(parseVCard(content));
      setLoading(false);
      setStep("preview");
      return;
    }

    const { data, error } = await supabase.functions.invoke("import-contacts-ai", {
      body: { csv: content },
    });

    setLoading(false);

    if (error || data?.error) {
      setError("No se pudo analizar el archivo. " + (data?.error ?? error?.message ?? ""));
      return;
    }

    setParsed(data.contacts ?? []);
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
    setStep("input");
    setImportedCount(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  if (step === "done") {
    return (
      <div className="space-y-4 rounded-2xl border p-4 text-center">
        <p className="text-sm">
          {importedCount} {importedCount === 1 ? "contacto importado" : "contactos importados"} como{" "}
          {typeLabel[type]}.
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
            {typeLabel[type]}.
          </p>
          {parsed.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hemos podido reconocer ningún contacto. Vuelve atrás y
              revisa el archivo o el texto pegado.
            </p>
          ) : (
            <ul className="max-h-80 space-y-1 overflow-y-auto text-sm">
              {parsed.map((c, i) => (
                <li key={i} className="border-b py-1 last:border-0">
                  <span className="font-medium">{c.full_name}</span>
                  {c.phone && <span className="text-muted-foreground"> · {c.phone}</span>}
                  {c.email && <span className="text-muted-foreground"> · {c.email}</span>}
                </li>
              ))}
            </ul>
          )}
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => setStep("input")}>
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

      <div className="flex gap-2 rounded-lg border p-1 text-sm">
        <button
          type="button"
          onClick={() => setMode("paste")}
          className={`flex-1 rounded-md py-1.5 ${mode === "paste" ? "bg-muted font-medium" : "text-muted-foreground"}`}
        >
          Pegar lista
        </button>
        <button
          type="button"
          onClick={() => setMode("file")}
          className={`flex-1 rounded-md py-1.5 ${mode === "file" ? "bg-muted font-medium" : "text-muted-foreground"}`}
        >
          Subir archivo
        </button>
      </div>

      {mode === "paste" ? (
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
      ) : (
        <div className="space-y-1.5">
          <Label htmlFor="import-file">Archivo CSV o vCard (.vcf)</Label>
          <input
            id="import-file"
            ref={fileInputRef}
            type="file"
            accept=".csv,.vcf,text/csv"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onFileSelected(file);
            }}
            className="block w-full text-sm"
          />
          <p className="text-xs text-muted-foreground">
            CSV: cualquier hoja de cálculo exportada como CSV, con las
            columnas que tengas — una IA identifica nombre, teléfono y
            email. vCard (.vcf): el formato en que el móvil exporta tus
            contactos. Si tienes un Excel, guárdalo primero como CSV
            (Archivo → Guardar como → CSV).
          </p>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {mode === "paste" && (
        <Button className="w-full" disabled={!text.trim()} onClick={onPreviewPaste}>
          Ver vista previa
        </Button>
      )}
      {mode === "file" && loading && (
        <p className="text-center text-sm text-muted-foreground">Analizando archivo...</p>
      )}
    </div>
  );
}
