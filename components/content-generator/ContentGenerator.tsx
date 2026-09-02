"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const TYPES = [
  { value: "carrusel", label: "Carrusel de Instagram" },
  { value: "tiktok", label: "Guion de TikTok Live" },
  { value: "ideas", label: "Ideas semanales" },
];

type Section = { heading: string; body: string };

export function ContentGenerator() {
  const supabase = createClient();
  const [type, setType] = useState("carrusel");
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    title: string;
    sections: Section[];
  } | null>(null);

  async function onGenerate() {
    setLoading(true);
    setError(null);
    setResult(null);

    const { data, error } = await supabase.functions.invoke("content-generator", {
      body: { type, topic },
    });

    setLoading(false);

    if (error || data?.error) {
      setError("No se pudo generar el contenido. " + (data?.error ?? error?.message ?? ""));
      return;
    }

    setResult(data);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="type">Tipo de contenido</Label>
        <select
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none"
        >
          {TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="topic">Tema (opcional)</Label>
        <Input
          id="topic"
          placeholder="Recompra, energía, testimonio de cliente..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button onClick={onGenerate} disabled={loading} className="w-full">
        {loading ? "Generando..." : "Generar"}
      </Button>

      {result && (
        <div className="space-y-3 rounded-2xl border p-4">
          <p className="text-sm font-semibold">{result.title}</p>
          <div className="space-y-3">
            {result.sections.map((section, i) => (
              <div key={i} className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase">
                  {section.heading}
                </p>
                <p className="text-sm whitespace-pre-wrap">{section.body}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
