"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import type { ChatAlert } from "@/types/database.types";

function AlertRow({ alert }: { alert: ChatAlert }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  async function resolve() {
    setLoading(true);
    await supabase.from("chat_alerts").update({ resolved: true }).eq("id", alert.id);
    setLoading(false);
    router.refresh();
  }

  return (
    <li className="space-y-2 p-3">
      <div>
        <p className="text-xs text-muted-foreground">Preguntó en tu página:</p>
        <p className="text-sm font-medium">{alert.question}</p>
      </div>
      <div>
        <p className="text-xs text-muted-foreground">El chatbot respondió:</p>
        <p className="text-sm text-muted-foreground">{alert.bot_reply}</p>
      </div>
      <Button size="sm" variant="outline" disabled={loading} onClick={resolve}>
        Marcar como resuelto
      </Button>
    </li>
  );
}

export function ChatAlertsList({ alerts }: { alerts: ChatAlert[] }) {
  if (alerts.length === 0) return null;

  return (
    <section>
      <h2 className="mb-2 text-sm font-semibold text-primary">
        Tu chatbot necesita ayuda ({alerts.length})
      </h2>
      <ul className="divide-y rounded-lg border">
        {alerts.map((a) => (
          <AlertRow key={a.id} alert={a} />
        ))}
      </ul>
    </section>
  );
}
