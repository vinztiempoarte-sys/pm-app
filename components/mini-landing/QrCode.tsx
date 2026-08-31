"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";

export function QrCode({ slug }: { slug: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const url = `${window.location.origin}/l/${slug}`;
    QRCode.toCanvas(canvasRef.current, url, { width: 200, margin: 1 });
  }, [slug]);

  function download() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `qr-${slug}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border p-4">
      <p className="text-sm font-semibold">Código QR</p>
      <canvas ref={canvasRef} className="rounded-lg" />
      <Button type="button" variant="outline" onClick={download} className="w-full">
        Descargar
      </Button>
    </div>
  );
}
