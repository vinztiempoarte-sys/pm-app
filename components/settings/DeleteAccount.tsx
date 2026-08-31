"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function DeleteAccount({ email }: { email: string }) {
  const router = useRouter();
  const supabase = createClient();

  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canDelete = confirmText.trim().toLowerCase() === email.toLowerCase();

  async function onDelete() {
    if (!canDelete) return;
    if (
      !confirm(
        "Esto borrará tu cuenta y todos tus datos (contactos, ventas, agenda, plantillas...) de forma permanente. ¿Seguro?"
      )
    ) {
      return;
    }

    setLoading(true);
    setError(null);

    const { error } = await supabase.functions.invoke("delete-account", {
      method: "POST",
    });

    if (error) {
      setLoading(false);
      setError("No se pudo borrar la cuenta. " + error.message);
      return;
    }

    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="space-y-3 rounded-2xl border border-destructive/30 p-4">
      <div>
        <h2 className="text-sm font-semibold text-destructive">Zona peligrosa</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Esto borra tu cuenta y todos tus datos de forma permanente e
          inmediata. No se puede deshacer.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirm_email">
          Escribe tu email (<span className="font-mono">{email}</span>) para confirmar
        </Label>
        <Input
          id="confirm_email"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder={email}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        variant="destructive"
        disabled={!canDelete || loading}
        onClick={onDelete}
        className="w-full"
      >
        {loading ? "Borrando..." : "Eliminar mi cuenta y todos mis datos"}
      </Button>
    </div>
  );
}
