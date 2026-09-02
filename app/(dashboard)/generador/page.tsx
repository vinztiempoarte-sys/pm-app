import { ContentGenerator } from "@/components/content-generator/ContentGenerator";

export default function GeneradorPage() {
  return (
    <div className="mx-auto w-full max-w-md flex-1 space-y-6">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold">Generador de contenido</h1>
        <p className="text-sm text-muted-foreground">
          Carruseles, guiones de TikTok Live e ideas semanales, listos para
          adaptar a tu estilo.
        </p>
      </div>

      <ContentGenerator />
    </div>
  );
}
