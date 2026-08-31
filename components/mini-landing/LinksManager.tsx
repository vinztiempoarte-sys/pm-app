"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { MiniLandingLink } from "@/types/database.types";

export function LinksManager({
  profileId,
  links,
}: {
  profileId: string;
  links: MiniLandingLink[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function addLink() {
    if (!label.trim() || !url.trim()) return;
    setLoading(true);
    setError(null);

    const nextPosition = links.length
      ? Math.max(...links.map((l) => l.position)) + 1
      : 0;

    const { error } = await supabase.from("mini_landing_links").insert({
      profile_id: profileId,
      label: label.trim(),
      url: url.trim(),
      position: nextPosition,
    });

    setLoading(false);

    if (error) {
      setError("No se pudo añadir el enlace. " + error.message);
      return;
    }

    setLabel("");
    setUrl("");
    router.refresh();
  }

  async function removeLink(id: string) {
    if (!confirm("¿Borrar este enlace?")) return;
    const { error } = await supabase
      .from("mini_landing_links")
      .delete()
      .eq("id", id);
    if (error) {
      setError("No se pudo borrar. " + error.message);
      return;
    }
    router.refresh();
  }

  async function move(link: MiniLandingLink, direction: -1 | 1) {
    const sorted = [...links].sort((a, b) => a.position - b.position);
    const index = sorted.findIndex((l) => l.id === link.id);
    const swapWith = sorted[index + direction];
    if (!swapWith) return;

    await Promise.all([
      supabase
        .from("mini_landing_links")
        .update({ position: swapWith.position })
        .eq("id", link.id),
      supabase
        .from("mini_landing_links")
        .update({ position: link.position })
        .eq("id", swapWith.id),
    ]);

    router.refresh();
  }

  const sortedLinks = [...links].sort((a, b) => a.position - b.position);

  return (
    <div className="space-y-3 rounded-2xl border p-4">
      <h2 className="text-sm font-semibold">Enlaces</h2>

      {sortedLinks.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Todavía no tienes enlaces. Añade el primero abajo.
        </p>
      )}

      <ul className="space-y-2">
        {sortedLinks.map((link, i) => (
          <li
            key={link.id}
            className="flex items-center gap-2 rounded-lg border p-2"
          >
            <div className="flex flex-col">
              <button
                type="button"
                onClick={() => move(link, -1)}
                disabled={i === 0}
                className="text-xs text-muted-foreground disabled:opacity-30"
              >
                ▲
              </button>
              <button
                type="button"
                onClick={() => move(link, 1)}
                disabled={i === sortedLinks.length - 1}
                className="text-xs text-muted-foreground disabled:opacity-30"
              >
                ▼
              </button>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{link.label}</p>
              <p className="truncate text-xs text-muted-foreground">
                {link.url}
              </p>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">
              {link.click_count} clics
            </span>
            <button
              type="button"
              onClick={() => removeLink(link.id)}
              className="shrink-0 text-xs text-destructive"
            >
              Borrar
            </button>
          </li>
        ))}
      </ul>

      <div className="space-y-2 border-t pt-3">
        <div className="space-y-1.5">
          <Label htmlFor="new_link_label">Texto</Label>
          <Input
            id="new_link_label"
            placeholder="WhatsApp"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="new_link_url">Enlace</Label>
          <Input
            id="new_link_url"
            placeholder="https://wa.me/34..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button
          type="button"
          variant="outline"
          onClick={addLink}
          disabled={loading}
          className="w-full"
        >
          {loading ? "Añadiendo..." : "+ Añadir enlace"}
        </Button>
      </div>
    </div>
  );
}
