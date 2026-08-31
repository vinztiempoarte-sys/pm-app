import Link from "next/link";
import { ContactForm } from "@/components/contacts/ContactForm";
import type { ContactType } from "@/types/database.types";

const validTypes: ContactType[] = ["cliente", "prospecto", "equipo"];

export default async function NewContactPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const defaultType = validTypes.includes(type as ContactType)
    ? (type as ContactType)
    : undefined;

  return (
    <div className="mx-auto w-full max-w-md flex-1">
      <Link
        href="/contactos"
        className="mb-4 inline-block text-sm text-muted-foreground underline underline-offset-2"
      >
        ← Volver a contactos
      </Link>
      <h1 className="mb-4 text-lg font-semibold">Nuevo contacto</h1>
      <ContactForm defaultType={defaultType} />
    </div>
  );
}
