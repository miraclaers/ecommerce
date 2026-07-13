"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/lib/types";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import ProductCard from "@/components/ProductCard";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";

type ProductsCatalogProps = {
  initialProducts: Product[];
};

export default function ProductsCatalog({
  initialProducts,
}: ProductsCatalogProps) {
  const products = initialProducts;
  const categories = useMemo(
    () => ["All", ...new Set(products.map((p) => p.category))],
    [products]
  );
  const prices = products.map((p) => p.price);
  const minProductPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxProductPrice = prices.length > 0 ? Math.max(...prices) : 0;

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebouncedValue(searchQuery, 300);
  const [activeCategory, setActiveCategory] = useState("All");
  const [minPrice, setMinPrice] = useState(minProductPrice);
  const [maxPrice, setMaxPrice] = useState(maxProductPrice);
  const [sortBy, setSortBy] = useState<
    "newest" | "price-low" | "price-high" | "popular"
  >("newest");

  const filteredProducts = useMemo(() => {
    const normalizedMin = Math.min(minPrice, maxPrice);
    const normalizedMax = Math.max(minPrice, maxPrice);

    const query = debouncedSearch.trim().toLowerCase();
    const filtered = products.filter((product) => {
      const matchesSearch =
        !query ||
        product.title.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query);
      const matchesCategory =
        activeCategory === "All" || product.category === activeCategory;
      const matchesPrice =
        product.price >= normalizedMin && product.price <= normalizedMax;
      return matchesSearch && matchesCategory && matchesPrice;
    });

    const sorted = [...filtered];
    if (sortBy === "newest") {
      sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
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
  }, [activeCategory, debouncedSearch, maxPrice, minPrice, products, sortBy]);

  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-2xl font-bold mb-6">Products</h1>

      <label className="mb-6 block max-w-md">
        <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
          Search
        </span>
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search products…"
          className="mt-2 h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
        />
      </label>

      <section className="mb-8 rounded-2xl border border-zinc-200 bg-white/80 p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/70">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
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

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4 lg:justify-end">
            <div className="flex flex-col justify-end">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                  Price range
                </p>
                <p className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold tabular-nums text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                  ${Math.min(minPrice, maxPrice)} - ${Math.max(minPrice, maxPrice)}
                </p>
              </div>
              <div className="mt-2 flex items-center gap-2.5">
                <input
                  type="number"
                  min={minProductPrice}
                  max={maxProductPrice}
                  value={minPrice}
                  onChange={(event) =>
                    setMinPrice(Number(event.target.value))
                  }
                  className="h-10 w-28 rounded-lg border border-zinc-200 bg-white px-3 py-1 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  aria-label="Minimum price"
                />
                <span className="text-sm text-zinc-400">to</span>
                <input
                  type="number"
                  min={minProductPrice}
                  max={maxProductPrice}
                  value={maxPrice}
                  onChange={(event) =>
                    setMaxPrice(Number(event.target.value))
                  }
                  className="h-10 w-28 rounded-lg border border-zinc-200 bg-white px-3 py-1 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  aria-label="Maximum price"
                />
              </div>
            </div>

            <div className="flex min-w-[11rem] flex-col justify-end">
              <label
                htmlFor="products-sort-by"
                className="text-sm font-semibold text-zinc-700 dark:text-zinc-200"
              >
                Sort by
              </label>
              <select
                id="products-sort-by"
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
                className="mt-2 h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
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

      <ul className="columns-1 gap-x-4 sm:columns-[13rem] md:columns-[14rem] lg:columns-[15rem]">
        {filteredProducts.length === 0
          ? Array.from({ length: 4 }).map((_, index) => (
              <ProductCardSkeleton key={`product-skeleton-${index}`} />
            ))
          : filteredProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                priority={index === 0}
                index={index}
              />
            ))}
      </ul>
    </div>
  );
}
