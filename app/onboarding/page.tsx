"use client";

import { useRouter } from "next/navigation";
import { InstallTutorial } from "@/components/onboarding/InstallTutorial";

export default function OnboardingPage() {
  const router = useRouter();

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
            <p className="text-xs font-medium tracking-wide text-primary uppercase">
              Antes de empezar
            </p>
            <h1 className="text-lg font-semibold">
              Instala PM App en tu pantalla de inicio
            </h1>
            <p className="text-sm text-muted-foreground">
              Es el único paso necesario para que los recordatorios de
              seguimiento y recompra te lleguen por notificación.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <InstallTutorial onDone={() => router.push("/login")} />
        </div>
      </div>
    </main>
  );
}
