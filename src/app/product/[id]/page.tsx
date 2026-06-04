import { notFound } from "next/navigation";
import ProductDetailView from "@/components/ProductDetailView";
import { listProducts, readProductById } from "@/lib/product-data";

export const revalidate = 60;

export function generateStaticParams() {
  return listProducts().map((product) => ({ id: product.id }));
}

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = readProductById(id);

  if (!product) {
    notFound();
  }

  const relatedProducts = listProducts().filter((item) => item.id !== id);

  return (
    <ProductDetailView product={product} relatedProducts={relatedProducts} />
  );
}
