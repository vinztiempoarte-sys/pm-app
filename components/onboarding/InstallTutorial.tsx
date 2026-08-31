"use client";

import { useEffect, useState } from "react";
import {
  Share,
  SquarePlus,
  Plus,
  MoreVertical,
  Download,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { detectPlatform, isStandalone, type InstallPlatform } from "@/lib/utils/platform";

type Step = {
  title: string;
  description: string;
  illustration: React.ReactNode;
};

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[220px] rounded-[2rem] border-4 border-foreground/10 bg-muted p-3 shadow-sm">
      <div className="flex h-56 flex-col justify-end rounded-xl bg-background p-3">
        {children}
      </div>
    </div>
  );
}

function iosSteps(): Step[] {
  return [
    {
      title: "1. Toca el icono de compartir",
      description:
        'En la barra de Safari (arriba o abajo de la pantalla), toca el icono con la flecha hacia arriba.',
      illustration: (
        <PhoneFrame>
          <div className="flex items-center justify-around rounded-lg bg-muted/70 p-2">
            <div className="h-4 w-4 rounded-full bg-foreground/10" />
            <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground ring-4 ring-primary/30">
              <Share className="h-4 w-4" />
            </div>
            <div className="h-4 w-4 rounded-full bg-foreground/10" />
          </div>
        </PhoneFrame>
      ),
    },
    {
      title: "2. Busca \"Añadir a pantalla de inicio\"",
      description:
        "Desliza hacia abajo en el menú que aparece hasta encontrar esta opción.",
      illustration: (
        <PhoneFrame>
          <div className="space-y-1.5">
            <div className="h-2 w-2/3 rounded bg-foreground/10" />
            <div className="h-2 w-1/2 rounded bg-foreground/10" />
            <div className="flex items-center gap-2 rounded-md bg-primary/10 p-1.5 ring-1 ring-primary/40">
              <SquarePlus className="h-4 w-4 shrink-0 text-primary" />
              <span className="text-[10px] font-medium text-primary">
                Añadir a pantalla de inicio
              </span>
            </div>
            <div className="h-2 w-1/2 rounded bg-foreground/10" />
          </div>
        </PhoneFrame>
      ),
    },
    {
      title: '3. Toca "Añadir"',
      description: 'Confirma tocando el botón "Añadir" arriba a la derecha.',
      illustration: (
        <PhoneFrame>
          <div className="rounded-lg border border-foreground/10 bg-background p-2">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">
                Cancelar
              </span>
              <span className="rounded bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                Añadir
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-[10px] font-bold text-primary-foreground">
                PM
              </div>
              <span className="text-[10px] font-medium">PM App</span>
            </div>
          </div>
        </PhoneFrame>
      ),
    },
    {
      title: "4. Listo — abre PM App desde tu pantalla de inicio",
      description:
        "Verás el icono junto a tus demás apps. Ábrelo desde ahí para poder recibir los recordatorios.",
      illustration: (
        <PhoneFrame>
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-8 w-8 rounded-lg bg-foreground/10" />
            ))}
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-[10px] font-bold text-primary-foreground ring-2 ring-primary/40">
              PM
            </div>
          </div>
        </PhoneFrame>
      ),
    },
  ];
}

function androidSteps(): Step[] {
  return [
    {
      title: "1. Abre el menú del navegador",
      description: 'Toca los tres puntos (⋮) arriba a la derecha de Chrome.',
      illustration: (
        <PhoneFrame>
          <div className="flex items-center justify-end rounded-lg bg-muted/70 p-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground ring-4 ring-primary/30">
              <MoreVertical className="h-4 w-4" />
            </div>
          </div>
        </PhoneFrame>
      ),
    },
    {
      title: '2. Toca "Instalar aplicación"',
      description: "O \"Añadir a pantalla de inicio\", según tu versión de Chrome.",
      illustration: (
        <PhoneFrame>
          <div className="space-y-1.5">
            <div className="h-2 w-1/2 rounded bg-foreground/10" />
            <div className="flex items-center gap-2 rounded-md bg-primary/10 p-1.5 ring-1 ring-primary/40">
              <Download className="h-4 w-4 shrink-0 text-primary" />
              <span className="text-[10px] font-medium text-primary">
                Instalar aplicación
              </span>
            </div>
            <div className="h-2 w-2/3 rounded bg-foreground/10" />
          </div>
        </PhoneFrame>
      ),
    },
    {
      title: '3. Confirma tocando "Instalar"',
      description: "PM App se añadirá a tu pantalla de inicio automáticamente.",
      illustration: (
        <PhoneFrame>
          <div className="flex flex-col items-center gap-2 rounded-lg border border-foreground/10 p-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-[10px] font-bold text-primary-foreground">
              PM
            </div>
            <span className="rounded bg-primary px-3 py-1 text-[10px] font-semibold text-primary-foreground">
              Instalar
            </span>
          </div>
        </PhoneFrame>
      ),
    },
  ];
}

function getSteps(platform: InstallPlatform): Step[] {
  if (platform === "ios") return iosSteps();
  if (platform === "android") return androidSteps();
  return [];
}

export function InstallTutorial({ onDone }: { onDone: () => void }) {
  const [platform, setPlatform] = useState<InstallPlatform | null>(null);
  const [alreadyInstalled, setAlreadyInstalled] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    setPlatform(detectPlatform());
    setAlreadyInstalled(isStandalone());
  }, []);

  if (platform === null) return null;

  if (alreadyInstalled) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <Smartphone className="h-10 w-10 text-primary" />
        <p className="text-sm text-muted-foreground">
          Ya tienes PM App instalada en tu pantalla de inicio. Puedes
          continuar.
        </p>
        <Button onClick={onDone}>Continuar</Button>
      </div>
    );
  }

  const steps = getSteps(platform);

  if (steps.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <p className="text-sm text-muted-foreground">
          Estás en un ordenador. Abre esta página desde el móvil para
          instalar PM App y activar los recordatorios. Por ahora puedes
          continuar y probarla en el navegador.
        </p>
        <Button onClick={onDone}>Continuar en el navegador</Button>
      </div>
    );
  }

  const current = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="flex gap-1.5">
        {steps.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 w-6 rounded-full ${
              i <= step ? "bg-primary" : "bg-foreground/10"
            }`}
          />
        ))}
      </div>

      {current.illustration}

      <div className="space-y-1.5">
        <h2 className="text-base font-semibold">{current.title}</h2>
        <p className="text-sm text-muted-foreground">{current.description}</p>
      </div>

      <div className="flex w-full gap-2">
        {step > 0 && (
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setStep((s) => s - 1)}
          >
            Atrás
          </Button>
        )}
        <Button
          className="flex-1"
          onClick={() => (isLast ? onDone() : setStep((s) => s + 1))}
        >
          {isLast ? (
            <>
              <Plus className="h-4 w-4" /> Ya la he instalado
            </>
          ) : (
            "Siguiente"
          )}
        </Button>
      </div>

      {!isLast && (
        <button
          onClick={onDone}
          className="text-xs text-muted-foreground underline underline-offset-2"
        >
          Lo haré más tarde
        </button>
      )}
    </div>
  );
}
