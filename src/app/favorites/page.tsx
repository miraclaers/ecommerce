"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ProductCard from "@/components/ProductCard";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";
import { useFavorites } from "@/app/context/FavoritesContext";
import { fetchProducts } from "@/lib/api-client";
import type { Product } from "@/lib/types";

export default function FavoritesPage() {
  const { favorites } = useFavorites();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setIsLoading(false));
  }, []);

  const favoriteProducts = useMemo(() => {
    const orderMap = new Map(
      favorites.map((productId, index) => [productId, index])
    );
    return products
      .filter((product) => orderMap.has(product.id))
      .sort(
        (a, b) =>
          (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0)
      );
  }, [favorites, products]);

  if (!isLoading && favoriteProducts.length === 0) {
    return (
      <main className="mx-auto max-w-4xl p-8">
        <section className="rounded-2xl border border-dashed border-amber-300/70 bg-amber-50/40 p-10 text-center dark:border-amber-500/40 dark:bg-amber-950/20">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">
            No favorites yet
          </h1>
          <p className="mt-2 text-gray-600 dark:text-zinc-300">
            Tap the favorites button on any product to save it here.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex rounded-lg bg-violet-600 px-6 py-3 text-white transition hover:bg-violet-700"
          >
            Browse products
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="p-8">
      <h1 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Favorites
      </h1>
      <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
        {favorites.length} saved {favorites.length === 1 ? "product" : "products"}.
      </p>

      <ul className="columns-[12rem] sm:columns-[13rem] md:columns-[14rem] lg:columns-[15rem] gap-x-4">
        {isLoading
          ? Array.from({ length: 6 }).map((_, index) => (
              <ProductCardSkeleton key={`favorite-skeleton-${index}`} />
            ))
          : favoriteProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
      </ul>
    </main>
  );
}
