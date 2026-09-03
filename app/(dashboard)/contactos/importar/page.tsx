import { ImportContacts } from "@/components/contacts/ImportContacts";

export default function ImportarContactosPage() {
  return (
    <div className="mx-auto w-full max-w-md flex-1 space-y-6">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold">Importar contactos</h1>
        <p className="text-sm text-muted-foreground">
          Pega tu lista de contactos ya existente en vez de meterlos uno a
          uno.
        </p>
      </div>

      <ImportContacts />
    </div>
  );
}
