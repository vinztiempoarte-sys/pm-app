"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Status = "checking" | "invalid" | "valid";

export default function ActualizarContrasenaPage() {
  const router = useRouter();
  const supabase = createClient();
  const [status, setStatus] = useState<Status>("checking");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    async function verify() {
      const code = new URLSearchParams(window.location.search).get("code");

      // Cierra cualquier sesión que ya hubiera en este navegador antes de
      // canjear el código, para no arrastrar por error la sesión de otra
      // cuenta que estuviera abierta.
      await supabase.auth.signOut();

      if (!code) {
        setStatus("invalid");
        return;
      }

      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        setStatus("invalid");
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setStatus("invalid");
        return;
      }

      setUserEmail(user.email ?? null);
      setStatus("valid");
    }
    verify();
  }, [supabase]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);
    if (error) {
      setError("No se pudo actualizar la contraseña. Pide un enlace nuevo.");
      return;
    }
    setDone(true);
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
            <h1 className="text-lg font-semibold">Nueva contraseña</h1>
            {status === "valid" && userEmail && (
              <p className="text-sm text-muted-foreground">
                Vas a cambiar la contraseña de {userEmail}.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          {status === "checking" && (
            <p className="text-sm text-muted-foreground">Comprobando enlace...</p>
          )}

          {status === "invalid" && (
            <div className="space-y-4 text-center">
              <p className="text-sm text-destructive">
                Este enlace no es válido o ha caducado.
              </p>
              <Button className="w-full" onClick={() => router.push("/recuperar")}>
                Pedir uno nuevo
              </Button>
            </div>
          )}

          {status === "valid" && done && (
            <div className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground">
                Contraseña actualizada.
              </p>
              <Button className="w-full" onClick={() => router.push("/login")}>
                Ir a entrar
              </Button>
            </div>
          )}

          {status === "valid" && !done && (
            <form onSubmit={onSubmit} className="space-y-4">
              <Input
                type="password"
                required
                autoFocus
                minLength={6}
                placeholder="Nueva contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Guardando..." : "Guardar contraseña"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
