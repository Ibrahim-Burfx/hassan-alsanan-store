import { notFound } from "next/navigation";
import { makeProducts } from "@/lib/products";
import ProductDetail from "./ProductDetail";

export const revalidate = 60;

export function generateStaticParams() {
  return makeProducts().map((product) => ({ id: String(product.id) }));
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = makeProducts().find((item) => String(item.id) === id);

  if (!product) notFound();

  return <ProductDetail product={product} />;
}
