"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Issue = { phrase: string; reason: string };

export function ComplianceChecker() {
  const supabase = createClient();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    issues: Issue[];
    safe_version: string;
  } | null>(null);

  async function onCheck() {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    const { data, error } = await supabase.functions.invoke("compliance-check", {
      body: { text },
    });

    setLoading(false);

    if (error || data?.error) {
      setError("No se pudo revisar el texto. " + (data?.error ?? error?.message ?? ""));
      return;
    }

    setResult(data);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Textarea
          rows={6}
          placeholder="Pega aquí tu mensaje, publicación o guion..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button onClick={onCheck} disabled={loading || !text.trim()} className="w-full">
        {loading ? "Revisando..." : "Revisar"}
      </Button>

      {result && (
        <div className="space-y-4">
          {result.issues.length === 0 ? (
            <div className="rounded-2xl border border-success/40 bg-success/10 p-4 text-sm">
              Sin problemas detectados. El texto es seguro tal como está.
            </div>
          ) : (
            <div className="space-y-2 rounded-2xl border border-destructive/40 bg-destructive/10 p-4">
              <p className="text-sm font-semibold">
                {result.issues.length} {result.issues.length === 1 ? "problema detectado" : "problemas detectados"}
              </p>
              <ul className="space-y-2">
                {result.issues.map((issue, i) => (
                  <li key={i} className="text-sm">
                    <span className="font-medium">&ldquo;{issue.phrase}&rdquo;</span>
                    <span className="text-muted-foreground"> — {issue.reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-1.5 rounded-2xl border p-4">
            <p className="text-sm font-semibold">Versión sugerida</p>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {result.safe_version}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
