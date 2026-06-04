import ErrorBoundary from "@/components/ErrorBoundary";
import ProductsCatalog from "@/components/ProductsCatalog";
import { listProducts } from "@/lib/product-data";

export const revalidate = 60;

export default function ProductsPage() {
  const products = listProducts();
  return (
    <ErrorBoundary>
      <ProductsCatalog initialProducts={products} />
    </ErrorBoundary>
  );
}
