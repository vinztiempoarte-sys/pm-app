"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export type ChatMessage = { role: "user" | "assistant"; content: string };

export function ChatWidget({
  onSend,
  placeholder,
  greeting,
  accent,
}: {
  onSend: (messages: ChatMessage[]) => Promise<string>;
  placeholder?: string;
  greeting?: string;
  accent?: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const next: ChatMessage[] = [...messages, { role: "user", content: input.trim() }];
    setMessages(next);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const reply = await onSend(next);
      setMessages([...next, { role: "assistant", content: reply }]);
    } catch {
      setError("No se pudo enviar. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border p-4">
      {greeting && messages.length === 0 && (
        <p className="text-sm text-muted-foreground">{greeting}</p>
      )}

      {messages.length > 0 && (
        <div className="flex max-h-80 flex-col gap-2 overflow-y-auto">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                m.role === "user"
                  ? "self-end text-white"
                  : "self-start bg-muted"
              }`}
              style={m.role === "user" ? { backgroundColor: accent ?? undefined } : undefined}
            >
              {m.content}
            </div>
          ))}
          {loading && (
            <div className="self-start rounded-2xl bg-muted px-3 py-2 text-sm text-muted-foreground">
              Escribiendo...
            </div>
          )}
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <form onSubmit={send} className="flex gap-2">
        <input
          className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none"
          placeholder={placeholder ?? "Escribe tu pregunta..."}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <Button type="submit" size="sm" disabled={loading || !input.trim()}>
          Enviar
        </Button>
      </form>
    </div>
  );
}
