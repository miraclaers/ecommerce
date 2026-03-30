"use client";

import { useMemo, useState } from "react";
import { getProducts, Product } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

export default function ProductsPage() {
  const products: Product[] = getProducts();
  const categories = useMemo(
    () => ["All", ...new Set(products.map((p) => p.category))],
    [products]
  );
  const prices = products.map((p) => p.price);
  const minProductPrice = Math.min(...prices);
  const maxProductPrice = Math.max(...prices);

  const [activeCategory, setActiveCategory] = useState("All");
  const [minPrice, setMinPrice] = useState(minProductPrice);
  const [maxPrice, setMaxPrice] = useState(maxProductPrice);
  const [sortBy, setSortBy] = useState<
    "newest" | "price-low" | "price-high" | "popular"
  >("newest");

  const filteredProducts = useMemo(() => {
    const normalizedMin = Math.min(minPrice, maxPrice);
    const normalizedMax = Math.max(minPrice, maxPrice);

    const filtered = products.filter((product) => {
      const matchesCategory =
        activeCategory === "All" || product.category === activeCategory;
      const matchesPrice =
        product.price >= normalizedMin && product.price <= normalizedMax;
      return matchesCategory && matchesPrice;
    });

    const sorted = [...filtered];
    if (sortBy === "newest") {
      sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );
    }
    if (sortBy === "price-low") {
      sorted.sort((a, b) => a.price - b.price);
    }
    if (sortBy === "price-high") {
      sorted.sort((a, b) => b.price - a.price);
    }
    if (sortBy === "popular") {
      sorted.sort((a, b) => b.popularity - a.popularity);
    }
    return sorted;
  }, [activeCategory, maxPrice, minPrice, products, sortBy]);

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6">Products</h1>

      <section className="mb-8 rounded-2xl border border-zinc-200 bg-white/80 p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/70">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
              Categories
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {categories.map((category) => {
                const isActive = category === activeCategory;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                      isActive
                        ? "bg-violet-600 text-white"
                        : "border border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:text-zinc-100"
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between lg:justify-end">
            <div>
              <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                Price range
              </p>
              <div className="mt-2 flex items-center gap-3">
                <input
                  type="number"
                  min={minProductPrice}
                  max={maxProductPrice}
                  value={minPrice}
                  onChange={(event) =>
                    setMinPrice(Number(event.target.value))
                  }
                  className="w-24 rounded-lg border border-zinc-200 bg-white px-2 py-1 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  aria-label="Minimum price"
                />
                <span className="text-zinc-400">to</span>
                <input
                  type="number"
                  min={minProductPrice}
                  max={maxProductPrice}
                  value={maxPrice}
                  onChange={(event) =>
                    setMaxPrice(Number(event.target.value))
                  }
                  className="w-24 rounded-lg border border-zinc-200 bg-white px-2 py-1 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  aria-label="Maximum price"
                />
              </div>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                ${Math.min(minPrice, maxPrice)} - $
                {Math.max(minPrice, maxPrice)}
              </p>
            </div>

            <div>
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                Sort by
              </label>
              <select
                value={sortBy}
                onChange={(event) =>
                  setSortBy(
                    event.target.value as
                      | "newest"
                      | "price-low"
                      | "price-high"
                      | "popular"
                  )
                }
                className="mt-2 w-44 rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price (low to high)</option>
                <option value="price-high">Price (high to low)</option>
                <option value="popular">Popular</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <ul className="columns-[12rem] sm:columns-[13rem] md:columns-[14rem] lg:columns-[15rem] gap-x-2">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </ul>
    </main>
  );
}
