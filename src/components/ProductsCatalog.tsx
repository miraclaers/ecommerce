"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Product } from "@/lib/types";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import ProductCard from "@/components/ProductCard";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";
import { FadeIn } from "@/components/motion/FadeIn";

type ProductsCatalogProps = {
  initialProducts: Product[];
};

export default function ProductsCatalog({
  initialProducts,
}: ProductsCatalogProps) {
  const products = initialProducts;
  const searchParams = useSearchParams();
  const categories = useMemo(
    () => ["All", ...new Set(products.map((p) => p.category))],
    [products]
  );
  const prices = products.map((p) => p.price);
  const minProductPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxProductPrice = prices.length > 0 ? Math.max(...prices) : 0;

  const [searchQuery, setSearchQuery] = useState(
    () => searchParams.get("q") ?? ""
  );
  const debouncedSearch = useDebouncedValue(searchQuery, 300);
  const [activeCategory, setActiveCategory] = useState("All");
  const [minPrice, setMinPrice] = useState(minProductPrice);
  const [maxPrice, setMaxPrice] = useState(maxProductPrice);
  const [sortBy, setSortBy] = useState<
    "newest" | "price-low" | "price-high" | "popular"
  >("newest");

  useEffect(() => {
    setSearchQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

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
    <div className="shop-container py-6 sm:py-8">
      <FadeIn>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-subtle">
              Catalog
            </p>
            <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Products
            </h1>
          </div>
          <p className="text-sm text-ink-muted">
            {filteredProducts.length} item
            {filteredProducts.length === 1 ? "" : "s"}
            {debouncedSearch.trim()
              ? ` for “${debouncedSearch.trim()}”`
              : ""}
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={0.05}>
        <section className="mb-6 rounded-xl border border-line bg-surface-elevated/80 p-3 shadow-card sm:p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-1.5">
              {categories.map((category) => {
                const isActive = category === activeCategory;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition duration-shop ${
                      isActive
                        ? "bg-accent text-accent-fg"
                        : "border border-line text-ink-muted hover:border-accent/35 hover:text-ink"
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2">
                <label className="sr-only" htmlFor="min-price">
                  Minimum price
                </label>
                <input
                  id="min-price"
                  type="number"
                  min={minProductPrice}
                  max={maxProductPrice}
                  value={minPrice}
                  onChange={(event) =>
                    setMinPrice(Number(event.target.value))
                  }
                  className="h-9 w-20 rounded-lg border border-line bg-surface px-2.5 text-sm text-ink"
                  aria-label="Minimum price"
                />
                <span className="text-xs text-ink-subtle">–</span>
                <label className="sr-only" htmlFor="max-price">
                  Maximum price
                </label>
                <input
                  id="max-price"
                  type="number"
                  min={minProductPrice}
                  max={maxProductPrice}
                  value={maxPrice}
                  onChange={(event) =>
                    setMaxPrice(Number(event.target.value))
                  }
                  className="h-9 w-20 rounded-lg border border-line bg-surface px-2.5 text-sm text-ink"
                  aria-label="Maximum price"
                />
              </div>

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
                className="h-9 min-w-[9.5rem] rounded-lg border border-line bg-surface px-2.5 text-sm text-ink"
                aria-label="Sort by"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price ↑</option>
                <option value="price-high">Price ↓</option>
                <option value="popular">Popular</option>
              </select>
            </div>
          </div>
        </section>
      </FadeIn>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.length === 0
          ? Array.from({ length: 3 }).map((_, index) => (
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
