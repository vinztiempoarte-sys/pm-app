import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { ContactList } from "@/components/contacts/ContactList";
import type { Contact } from "@/types/database.types";

export default async function ContactsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("contacts")
    .select("*")
    .order("created_at", { ascending: false });

  const contacts = (data ?? []) as Contact[];

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Contactos</h1>
        <Link href="/contactos/nuevo" className={buttonVariants({ size: "sm" })}>
          + Nuevo
        </Link>
      </div>
      <ContactList contacts={contacts} />
    </div>
  );
}
