"use client";

import { ChatWidget, type ChatMessage } from "@/components/chat/ChatWidget";

export function LandingChat({ slug, accent }: { slug: string; accent: string }) {
  async function onSend(messages: ChatMessage[]) {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/landing-chat`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, messages }),
      }
    );
    if (!res.ok) throw new Error("failed");
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data.reply as string;
  }

  return (
    <ChatWidget
      onSend={onSend}
      accent={accent}
      greeting="¿Tienes alguna pregunta? Escríbeme aquí."
      placeholder="Escribe tu pregunta..."
    />
  );
}
