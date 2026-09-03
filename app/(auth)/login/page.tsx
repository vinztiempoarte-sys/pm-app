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

type Method = "code" | "password";
type CodeStage = "email" | "code";
type PasswordMode = "signin" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [method, setMethod] = useState<Method>("code");

  const [codeStage, setCodeStage] = useState<CodeStage>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");

  const [passwordMode, setPasswordMode] = useState<PasswordMode>("signin");
  const [passwordEmail, setPasswordEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signupSent, setSignupSent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signInWithGoogle() {
    setError(null);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { prompt: "select_account" },
      },
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
    setCodeStage("code");
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

  async function submitPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (passwordMode === "signup") {
      const { error } = await supabase.auth.signUp({
        email: passwordEmail,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      setLoading(false);
      if (error) {
        setError(error.message);
        return;
      }
      setSignupSent(true);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: passwordEmail,
      password,
    });

    setLoading(false);
    if (error) {
      setError("Email o contraseña incorrectos.");
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
              {method === "code" && codeStage === "email" &&
                "Sin contraseñas que recordar: te enviamos un código por email."}
              {method === "code" && codeStage === "code" &&
                `Escribe el código de 8 dígitos que hemos enviado a ${email}.`}
              {method === "password" &&
                (passwordMode === "signin" ? "Entra con tu email y contraseña." : "Crea tu cuenta con email y contraseña.")}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-4">
          {!(method === "code" && codeStage === "code") && (
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

          {method === "code" && codeStage === "email" && (
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
          )}

          {method === "code" && codeStage === "code" && (
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
                  setCodeStage("email");
                  setCode("");
                  setError(null);
                }}
              >
                Usar otro email
              </button>
            </form>
          )}

          {method === "password" && signupSent && (
            <p className="text-sm text-muted-foreground">
              Te hemos enviado un enlace de confirmación a {passwordEmail}.
              Ábrelo para activar tu cuenta.
            </p>
          )}

          {method === "password" && !signupSent && (
            <form onSubmit={submitPassword} className="space-y-4">
              <Input
                type="email"
                required
                autoFocus
                placeholder="tu@email.com"
                value={passwordEmail}
                onChange={(e) => setPasswordEmail(e.target.value)}
              />
              <div className="space-y-1">
                <Input
                  type="password"
                  required
                  minLength={8}
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {passwordMode === "signup" && (
                  <p className="text-xs text-muted-foreground">
                    Mínimo 8 caracteres, con mayúsculas, minúsculas, números y
                    un símbolo (ej. Segura#123).
                  </p>
                )}
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading
                  ? "Comprobando..."
                  : passwordMode === "signin"
                    ? "Entrar"
                    : "Crear cuenta"}
              </Button>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <button
                  type="button"
                  className="underline underline-offset-2"
                  onClick={() => {
                    setPasswordMode(passwordMode === "signin" ? "signup" : "signin");
                    setError(null);
                  }}
                >
                  {passwordMode === "signin" ? "Crear cuenta nueva" : "Ya tengo cuenta"}
                </button>
                {passwordMode === "signin" && (
                  <a href="/recuperar" className="underline underline-offset-2">
                    Olvidé mi contraseña
                  </a>
                )}
              </div>
            </form>
          )}

          {!(method === "code" && codeStage === "code") && (
            <button
              type="button"
              className="block w-full text-center text-xs text-muted-foreground underline underline-offset-2"
              onClick={() => {
                setMethod(method === "code" ? "password" : "code");
                setError(null);
                setSignupSent(false);
              }}
            >
              {method === "code" ? "Prefiero usar una contraseña" : "Prefiero un código por email"}
            </button>
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
