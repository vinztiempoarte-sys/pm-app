import Link from "next/link";
import { ProductForm } from "@/components/products/ProductForm";

export default function NewProductPage() {
  return (
    <div className="mx-auto w-full max-w-md flex-1">
      <Link
        href="/productos"
        className="mb-4 inline-block text-sm text-muted-foreground underline underline-offset-2"
      >
        ← Volver a productos
      </Link>
      <h1 className="mb-4 text-lg font-semibold">Nuevo producto</h1>
      <ProductForm />
    </div>
  );
}
