"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getExistingSubscription,
  isPushSupported,
  subscribeToPush,
} from "@/lib/push/subscribe";

type Status = "checking" | "unsupported" | "subscribed" | "off";

export function PushBanner() {
  const [status, setStatus] = useState<Status>("checking");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isPushSupported()) {
      setStatus("unsupported");
      return;
    }

    let settled = false;
    const timeout = setTimeout(() => {
      if (!settled) {
        settled = true;
        console.warn("getExistingSubscription timed out after 5s");
        setStatus("off");
      }
    }, 5000);

    getExistingSubscription()
      .then((sub) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        setStatus(sub ? "subscribed" : "off");
      })
      .catch((e) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        console.error("getExistingSubscription failed:", e);
        setStatus("off");
        setError(e instanceof Error ? e.message : "No se pudo comprobar el estado.");
      });

    return () => {
      settled = true;
      clearTimeout(timeout);
    };
  }, []);

  async function onEnable() {
    setLoading(true);
    setError(null);
    try {
      await subscribeToPush();
      setStatus("subscribed");
    } catch (e) {
      let message = "No se pudo activar.";
      if (e && typeof e === "object" && "message" in e && e.message) {
        message = String(e.message);
      }
      setError(message);
      console.error("subscribeToPush failed:", e);
    } finally {
      setLoading(false);
    }
  }

  if (status === "checking" || status === "subscribed") return null;

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/40 p-3">
      <div className="flex items-center gap-2">
        <Bell className="h-4 w-4 shrink-0 text-primary" />
        <div>
          <p className="text-sm font-medium">
            {status === "unsupported"
              ? "Este navegador no soporta notificaciones"
              : "Activa los recordatorios"}
          </p>
          {status === "off" && (
            <p className="text-xs text-muted-foreground">
              Te avisamos cuando algo necesite tu atención hoy.
            </p>
          )}
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      </div>
      {status === "off" && (
        <Button size="sm" disabled={loading} onClick={onEnable}>
          {loading ? "Activando..." : "Activar"}
        </Button>
      )}
    </div>
  );
}
