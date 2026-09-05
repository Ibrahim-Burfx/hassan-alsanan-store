import { notFound } from "next/navigation";
import { supabase } from "@/supabase";
import { normalizeProduct, type ProductRow } from "@/lib/products";
import ProductDetail from "./ProductDetail";

export const revalidate = 60;

export async function generateStaticParams() {
  const { data: products, error } = await supabase.from("products").select("id");
  if (error) {
    console.error("Failed to load product ids:", error);
    return [];
  }

  return (products as Pick<ProductRow, "id">[]).map((product) => ({ id: String(product.id) }));
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) notFound();

  return <ProductDetail product={normalizeProduct(data as ProductRow)} />;
}
