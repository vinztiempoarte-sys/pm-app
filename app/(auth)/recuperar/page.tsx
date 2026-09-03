"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RecuperarPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/actualizar-contrasena`,
    });

    setLoading(false);
    if (error) {
      setError("No se pudo enviar el enlace. Inténtalo de nuevo.");
      return;
    }
    setSent(true);
  }

  return (
    <main className="relative flex min-h-full flex-1 items-center justify-center overflow-hidden px-6 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_-10%,var(--color-primary)_0%,transparent_55%)] opacity-[0.08]"
      />

      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-accent text-lg font-bold text-white shadow-sm">
            PM
          </div>
          <div className="space-y-1">
            <h1 className="text-lg font-semibold">Recuperar contraseña</h1>
            <p className="text-sm text-muted-foreground">
              Te enviamos un enlace para elegir una contraseña nueva.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          {sent ? (
            <p className="text-sm text-muted-foreground">
              Revisa tu email ({email}) y sigue el enlace para continuar.
            </p>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <Input
                type="email"
                required
                autoFocus
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Enviando..." : "Enviar enlace"}
              </Button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground">
          <a href="/login" className="underline underline-offset-2">
            Volver a entrar
          </a>
        </p>
      </div>
    </main>
  );
}
