import { getProducts, Product } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

export default function ProductsPage() {
  const products: Product[] = getProducts();

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6">Products</h1>

      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </ul>
    </main>
  );
}
