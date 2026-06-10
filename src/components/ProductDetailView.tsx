"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useCart } from "@/app/context/CartContext";
import { useFavorites } from "@/app/context/FavoritesContext";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/types";
import CollectionPicker from "@/components/CollectionPicker";

type ProductDetailViewProps = {
  product: Product;
  relatedProducts: Product[];
};

export default function ProductDetailView({
  product,
  relatedProducts,
}: ProductDetailViewProps) {
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [activeTab, setActiveTab] = useState<
    "description" | "shipping" | "reviews"
  >("description");
  const [showToast, setShowToast] = useState(false);
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimer.current) {
        clearTimeout(toastTimer.current);
      }
    };
  }, []);

  const activeImage = product.image;
  const favorite = isFavorite(product.id);
  const handleAddToCart = () => {
    addToCart(product.id);
    setShowToast(true);

    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
    }
    toastTimer.current = setTimeout(() => {
      setShowToast(false);
    }, 2000);
  };

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-16 pb-24">
      <section className="grid md:grid-cols-2 gap-12">
        <div className="relative">
          <div className="border-4 border-violet-600 rounded-xl overflow-hidden">
            <div
              className="relative"
              onMouseEnter={() => setIsZooming(true)}
              onMouseLeave={() => setIsZooming(false)}
              onMouseMove={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                const x = ((event.clientX - rect.left) / rect.width) * 100;
                const y = ((event.clientY - rect.top) / rect.height) * 100;
                setZoomPos({
                  x: Math.max(0, Math.min(100, x)),
                  y: Math.max(0, Math.min(100, y)),
                });
              }}
            >
              <Image
                src={activeImage}
                alt={product.title}
                width={500}
                height={500}
                className="object-cover w-full h-full"
                priority
              />
            </div>
          </div>

          <div
            className={`pointer-events-none hidden md:block absolute top-0 left-full ml-6 h-[36rem] w-[36rem] rounded-xl border border-zinc-200 bg-white/70 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60 ${
              isZooming ? "opacity-100" : "opacity-0"
            }`}
            style={{
              backgroundImage: `url(${activeImage})`,
              backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
              backgroundSize: "220%",
              transition: "opacity 150ms ease-out",
            }}
          />
        </div>

        <div>
          <h1 className="text-3xl font-bold">{product.title}</h1>
          <p className="text-2xl text-violet-600 font-semibold mt-4">
            ${product.price}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleAddToCart}
              className="bg-violet-600 text-white px-6 py-3 rounded-xl hover:bg-violet-700 transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/70"
            >
              Add to cart
            </button>
            <button
              type="button"
              onClick={() => toggleFavorite(product.id)}
              aria-label={
                favorite ? "Remove from favorites" : "Add to favorites"
              }
              aria-pressed={favorite}
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition ${
                favorite
                  ? "border-amber-300 bg-amber-100 text-amber-700 dark:border-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                  : "border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
              }`}
            >
              {favorite ? "Favorited" : "Favorite"}
            </button>
            <CollectionPicker
              productId={product.id}
              buttonClassName="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-indigo-300 bg-indigo-100 px-4 py-3 text-sm font-medium text-indigo-700 transition hover:bg-indigo-200 dark:border-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 dark:hover:bg-indigo-900/60"
            />
          </div>

          <div className="mt-10">
            <div
              role="tablist"
              aria-label="Product information"
              className="-mx-1 flex gap-4 overflow-x-auto border-b border-zinc-200 px-1 sm:gap-6 dark:border-zinc-800"
            >
              {(["description", "shipping", "reviews"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  id={`product-tab-${tab}`}
                  aria-selected={activeTab === tab}
                  aria-controls={`product-panel-${tab}`}
                  onClick={() => setActiveTab(tab)}
                  className={`shrink-0 pb-2 capitalize ${
                    activeTab === tab
                      ? "border-b-2 border-violet-600 font-semibold"
                      : "text-gray-500 dark:text-zinc-400"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div
              role="tabpanel"
              id={`product-panel-${activeTab}`}
              aria-labelledby={`product-tab-${activeTab}`}
              className="mt-6 text-gray-600 dark:text-zinc-300 text-sm"
            >
              {activeTab === "description" && (
                <p>
                  {product.description} Built for daily use with a focus on
                  comfort, durability, and clean aesthetics.
                </p>
              )}
              {activeTab === "shipping" && (
                <p>Free shipping over $100 · 30-day returns · 1-year warranty.</p>
              )}
              {activeTab === "reviews" && (
                <p>Average rating: {product.rating} / 5</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-200 bg-white/95 p-4 shadow-lg backdrop-blur md:hidden dark:border-zinc-800 dark:bg-zinc-900/95">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div>
            <p className="text-xs text-zinc-500">Total</p>
            <p className="text-lg font-semibold">${product.price}</p>
          </div>
          <button
            type="button"
            onClick={handleAddToCart}
            className="rounded-lg bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700 transition"
          >
            Add to cart
          </button>
        </div>
      </div>

      <section>
        <h2 className="text-2xl font-bold mb-6">Related products</h2>
        <ul className="columns-1 gap-x-4 sm:columns-[13rem] md:columns-[14rem] lg:columns-[15rem]">
          {relatedProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </ul>
      </section>

      {showToast ? (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 rounded-xl border border-violet-200 bg-white px-4 py-3 text-sm font-medium text-zinc-900 shadow-lg dark:border-violet-500/40 dark:bg-zinc-900 dark:text-zinc-100 toast-pop"
        >
          Added to cart
        </div>
      ) : null}
    </div>
  );
}
