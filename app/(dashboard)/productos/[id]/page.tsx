import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/products/ProductForm";
import type { Product } from "@/types/database.types";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("products").select("*").eq("id", id).single();

  if (!data) notFound();

  return (
    <div className="mx-auto w-full max-w-md flex-1">
      <Link
        href="/productos"
        className="mb-4 inline-block text-sm text-muted-foreground underline underline-offset-2"
      >
        ← Volver a productos
      </Link>
      <h1 className="mb-4 text-lg font-semibold">{(data as Product).name}</h1>
      <ProductForm product={data as Product} />
    </div>
  );
}
