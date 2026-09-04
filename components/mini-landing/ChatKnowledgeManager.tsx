"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ChatKnowledge } from "@/types/database.types";

export function ChatKnowledgeManager({
  profileId,
  knowledge,
}: {
  profileId: string;
  knowledge: ChatKnowledge[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [topic, setTopic] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function addEntry() {
    if (!topic.trim() || !answer.trim()) return;
    setLoading(true);
    setError(null);

    const { error } = await supabase.from("chat_knowledge").insert({
      owner_id: profileId,
      topic: topic.trim(),
      answer: answer.trim(),
    });

    setLoading(false);

    if (error) {
      setError("No se pudo guardar. " + error.message);
      return;
    }

    setTopic("");
    setAnswer("");
    router.refresh();
  }

  async function removeEntry(id: string) {
    if (!confirm("¿Borrar este dato de entrenamiento?")) return;
    const { error } = await supabase.from("chat_knowledge").delete().eq("id", id);
    if (error) {
      setError("No se pudo borrar. " + error.message);
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-3 rounded-2xl border p-4">
      <div>
        <h2 className="text-sm font-semibold">Entrena tu chatbot</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Añade datos que solo tú sabes (precios de envío en tu zona, horario
          de atención, promociones locales...) para que el chatbot de tu
          página los use al responder a tus visitantes.
        </p>
      </div>

      {knowledge.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Todavía no has añadido nada. El chatbot responderá solo con
          conocimiento general.
        </p>
      )}

      <ul className="space-y-2">
        {knowledge.map((entry) => (
          <li key={entry.id} className="rounded-lg border p-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{entry.topic}</p>
                <p className="text-xs text-muted-foreground">{entry.answer}</p>
              </div>
              <button
                type="button"
                onClick={() => removeEntry(entry.id)}
                className="shrink-0 text-xs text-destructive"
              >
                Borrar
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="space-y-2 border-t pt-3">
        <div className="space-y-1.5">
          <Label htmlFor="new_kb_topic">Tema</Label>
          <Input
            id="new_kb_topic"
            placeholder="Envíos a Canarias"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="new_kb_answer">Respuesta</Label>
          <Textarea
            id="new_kb_answer"
            placeholder="Los envíos a Canarias tardan 5-7 días laborables."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={3}
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button
          type="button"
          variant="outline"
          onClick={addEntry}
          disabled={loading}
          className="w-full"
        >
          {loading ? "Guardando..." : "+ Añadir"}
        </Button>
      </div>
    </div>
  );
}
