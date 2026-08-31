import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ContactForm } from "@/components/contacts/ContactForm";
import { SalesSection } from "@/components/contacts/SalesSection";
import { ChecklistSection } from "@/components/contacts/ChecklistSection";
import type { ChecklistItem, Contact, Product, SaleWithProduct } from "@/types/database.types";

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: contact }, { data: products }, { data: sales }, { data: checklist }] =
    await Promise.all([
      supabase.from("contacts").select("*").eq("id", id).single(),
      supabase.from("products").select("*").order("name"),
      supabase
        .from("sales")
        .select("*, products(*)")
        .eq("contact_id", id)
        .order("sale_date", { ascending: false }),
      supabase
        .from("onboarding_checklist_items")
        .select("*")
        .eq("contact_id", id)
        .order("created_at", { ascending: true }),
    ]);

  if (!contact) notFound();

  return (
    <div className="mx-auto w-full max-w-md flex-1 space-y-6">
      <div>
        <Link
          href="/contactos"
          className="mb-4 inline-block text-sm text-muted-foreground underline underline-offset-2"
        >
          ← Volver a contactos
        </Link>
        <h1 className="mb-4 text-lg font-semibold">{(contact as Contact).full_name}</h1>
        <ContactForm contact={contact as Contact} />
      </div>

      <SalesSection
        contactId={id}
        products={(products ?? []) as Product[]}
        sales={(sales ?? []) as SaleWithProduct[]}
      />

      {(contact as Contact).type === "equipo" && (
        <ChecklistSection items={(checklist ?? []) as ChecklistItem[]} />
      )}
    </div>
  );
}
