import { ComplianceChecker } from "@/components/compliance/ComplianceChecker";

export default function CompliancePage() {
  return (
    <div className="mx-auto w-full max-w-md flex-1 space-y-6">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold">Revisor de compliance</h1>
        <p className="text-sm text-muted-foreground">
          Pega el texto que quieres publicar o enviar. Revisamos si tiene
          afirmaciones de salud problemáticas antes de que lo mandes.
        </p>
      </div>

      <ComplianceChecker />
    </div>
  );
}
