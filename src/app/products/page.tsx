import { Suspense } from "react";
import ErrorBoundary from "@/components/ErrorBoundary";
import ProductsCatalog from "@/components/ProductsCatalog";
import { listProducts } from "@/lib/product-data";

export const revalidate = 60;

export default function ProductsPage() {
  const products = listProducts();
  return (
    <ErrorBoundary>
      <Suspense
        fallback={
          <div className="shop-container py-8 text-sm text-ink-muted">
            Loading catalog…
          </div>
        }
      >
        <ProductsCatalog initialProducts={products} />
      </Suspense>
    </ErrorBoundary>
  );
}
