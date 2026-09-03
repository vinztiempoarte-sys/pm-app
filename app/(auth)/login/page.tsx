"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

type Stage = "email" | "code";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [stage, setStage] = useState<Stage>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signInWithGoogle() {
    setError(null);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  async function requestCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });

    setLoading(false);
    if (error) {
      setError("No hemos podido enviar el código. Revisa el email e inténtalo de nuevo.");
      return;
    }
    setStage("code");
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "email",
    });

    setLoading(false);
    if (error) {
      setError("Código incorrecto o caducado. Pide uno nuevo.");
      return;
    }
    router.push("/");
    router.refresh();
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
            <h1 className="text-lg font-semibold">Entrar en PM App</h1>
            <p className="text-sm text-muted-foreground">
              {stage === "email"
                ? "Sin contraseñas que recordar: te enviamos un código por email."
                : `Escribe el código de 8 dígitos que hemos enviado a ${email}.`}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-4">
          {stage === "email" && (
            <>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={signInWithGoogle}
              >
                Continuar con Google
              </Button>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="h-px flex-1 bg-border" />
                o
                <div className="h-px flex-1 bg-border" />
              </div>
            </>
          )}
          {stage === "email" ? (
            <form onSubmit={requestCode} className="space-y-4">
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
                {loading ? "Enviando..." : "Enviar código"}
              </Button>
            </form>
          ) : (
            <form onSubmit={verifyCode} className="flex flex-col items-center gap-4">
              <InputOTP maxLength={8} value={code} onChange={setCode} autoFocus>
                <InputOTPGroup>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <InputOTPSlot key={i} index={i} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button
                type="submit"
                className="w-full"
                disabled={loading || code.length < 8}
              >
                {loading ? "Comprobando..." : "Entrar"}
              </Button>
              <button
                type="button"
                className="text-xs text-muted-foreground underline underline-offset-2"
                onClick={() => {
                  setStage("email");
                  setCode("");
                  setError(null);
                }}
              >
                Usar otro email
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Al continuar, aceptas nuestra{" "}
          <a href="/privacidad" className="underline underline-offset-2">
            Política de Privacidad
          </a>
          .
        </p>
      </div>
    </main>
  );
}
