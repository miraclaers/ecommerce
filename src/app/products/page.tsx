import { getProducts, Product } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

export default function ProductsPage() {
  const products: Product[] = getProducts();

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6">Products</h1>

      <ul className="columns-[12rem] sm:columns-[13rem] md:columns-[14rem] lg:columns-[15rem] gap-x-2">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </ul>
    </main>
  );
}
