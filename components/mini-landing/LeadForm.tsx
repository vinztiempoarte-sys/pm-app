"use client";

import { useState } from "react";

export function LeadForm({ slug, accent }: { slug: string; accent: string }) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">(
    "idle"
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/mini-landing-lead`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug,
            full_name: fullName,
            phone,
            website,
          }),
        }
      );
      if (!res.ok) throw new Error();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="w-full rounded-2xl border px-4 py-6 text-center text-sm">
        ¡Gracias! Te contactaré en breve.
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="w-full space-y-2 rounded-2xl border p-4"
    >
      <p className="text-sm font-medium">¿Quieres que te escriba?</p>
      <input
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        required
        placeholder="Tu nombre"
        className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
      />
      <input
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        required
        placeholder="Tu teléfono"
        className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
      />
      <input
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />
      {status === "error" && (
        <p className="text-sm text-destructive">
          No se pudo enviar. Inténtalo de nuevo.
        </p>
      )}
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-lg px-4 py-2 text-sm font-medium text-white"
        style={{ backgroundColor: accent }}
      >
        {status === "loading" ? "Enviando..." : "Enviar"}
      </button>
    </form>
  );
}
