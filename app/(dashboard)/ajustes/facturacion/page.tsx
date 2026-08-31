import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { BillingSection } from "@/components/settings/BillingSection";

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ trial_expired?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_status, trial_ends_at")
    .eq("id", user!.id)
    .single();

  const { trial_expired } = await searchParams;

  return (
    <div className="mx-auto w-full max-w-md flex-1 space-y-6">
      <Link
        href="/ajustes"
        className="inline-block text-sm text-muted-foreground underline underline-offset-2"
      >
        ← Volver a ajustes
      </Link>
      <h1 className="text-lg font-semibold">Facturación</h1>

      {trial_expired === "1" && (
        <div className="rounded-2xl border border-warning/40 bg-warning/10 p-4 text-sm">
          Tu periodo de prueba ha terminado. Suscríbete para seguir usando PM
          App.
        </div>
      )}

      <BillingSection
        status={profile?.subscription_status ?? "trialing"}
        trialEndsAt={profile?.trial_ends_at ?? null}
      />
    </div>
  );
}
