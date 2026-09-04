"use client";

import { createClient } from "@/lib/supabase/client";
import { ChatWidget, type ChatMessage } from "@/components/chat/ChatWidget";

export function HelpChat() {
  const supabase = createClient();

  async function onSend(messages: ChatMessage[]) {
    const { data, error } = await supabase.functions.invoke("help-chat", {
      body: { messages },
    });
    if (error || data?.error) throw new Error(data?.error ?? error?.message);
    return data.reply as string;
  }

  return (
    <ChatWidget
      onSend={onSend}
      greeting="¿Tienes dudas sobre cómo usar PM App? Pregúntame aquí."
      placeholder="¿Cómo hago para...?"
    />
  );
}
