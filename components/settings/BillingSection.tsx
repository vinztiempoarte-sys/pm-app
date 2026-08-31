"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

const statusLabel: Record<string, string> = {
  trialing: "En periodo de prueba",
  active: "Activa",
  past_due: "Pago pendiente",
  canceled: "Cancelada",
};

export function BillingSection({
  status,
  trialEndsAt,
}: {
  status: string;
  trialEndsAt: string | null;
}) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubscribe() {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.functions.invoke("create-checkout-session", {
      body: { origin: window.location.origin },
    });

    if (error || !data?.url) {
      setLoading(false);
      setError("No se pudo iniciar el pago. " + (error?.message ?? ""));
      return;
    }

    window.location.href = data.url;
  }

  return (
    <section className="space-y-3 rounded-2xl border p-4">
      <h2 className="text-sm font-semibold">Suscripción</h2>
      <div className="text-sm">
        <p>
          Estado: <span className="font-medium">{statusLabel[status] ?? status}</span>
        </p>
        {status === "trialing" && trialEndsAt && (
          <p className="text-muted-foreground">
            Tu prueba gratuita termina el{" "}
            {new Date(trialEndsAt).toLocaleDateString("es-ES", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
            .
          </p>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {status !== "active" && (
        <Button onClick={onSubscribe} disabled={loading} className="w-full">
          {loading ? "Redirigiendo..." : "Suscribirme"}
        </Button>
      )}
    </section>
  );
}
