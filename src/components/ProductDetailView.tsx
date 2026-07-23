"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useCart } from "@/app/context/CartContext";
import { useFavorites } from "@/app/context/FavoritesContext";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/types";
import { STORE_SHIPPING } from "@/lib/product-data";
import CollectionPicker from "@/components/CollectionPicker";

type ProductDetailViewProps = {
  product: Product;
  relatedProducts: Product[];
};

const TAB_LABELS = {
  description: "Description",
  shipping: "Shipping",
  reviews: "Reviews",
} as const;

function StarRow({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => {
        const filled = i + 1 <= Math.round(rating);
        return (
          <svg
            key={i}
            aria-hidden
            viewBox="0 0 20 20"
            className={`h-3.5 w-3.5 ${filled ? "text-amber-400" : "text-line"}`}
            fill="currentColor"
          >
            <path d="M10 1.5l2.4 4.9 5.4.8-3.9 3.8.9 5.4L10 13.8 5.2 16.4l.9-5.4L2.2 7.2l5.4-.8L10 1.5z" />
          </svg>
        );
      })}
    </span>
  );
}

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
          <div className="overflow-hidden rounded-xl border border-line shadow-card">
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
          <p className="text-2xl text-accent font-semibold mt-4">
            ${product.price}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleAddToCart}
              className="bg-accent text-white px-6 py-3 rounded-xl hover:brightness-110 transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70"
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
              buttonClassName="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-accent/30 bg-accent-soft px-4 py-3 text-sm font-medium text-accent transition hover:bg-accent-soft/80 dark:border-accent/40"
            />
          </div>

          <div className="mt-10">
            <div
              role="tablist"
              aria-label="Product information"
              className="-mx-1 flex gap-4 overflow-x-auto border-b border-line px-1 sm:gap-6"
            >
              {(
                Object.keys(TAB_LABELS) as Array<keyof typeof TAB_LABELS>
              ).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  id={`product-tab-${tab}`}
                  aria-selected={activeTab === tab}
                  aria-controls={`product-panel-${tab}`}
                  onClick={() => setActiveTab(tab)}
                  className={`shrink-0 pb-2 text-sm ${
                    activeTab === tab
                      ? "border-b-2 border-accent font-semibold text-ink"
                      : "text-ink-muted hover:text-ink"
                  }`}
                >
                  {TAB_LABELS[tab]}
                </button>
              ))}
            </div>

            <div
              role="tabpanel"
              id={`product-panel-${activeTab}`}
              aria-labelledby={`product-tab-${activeTab}`}
              className="mt-6 text-sm text-ink-muted"
            >
              {activeTab === "description" && (
                <div className="space-y-6">
                  <div className="space-y-3 leading-relaxed text-ink-muted">
                    {product.longDescription.split("\n\n").map((para) => (
                      <p key={para.slice(0, 48)}>{para}</p>
                    ))}
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-subtle">
                      Highlights
                    </h3>
                    <ul className="mt-3 list-disc space-y-1.5 pl-5 text-ink-muted">
                      {product.highlights.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-subtle">
                      Specs
                    </h3>
                    <dl className="mt-3 divide-y divide-line rounded-xl border border-line bg-surface-elevated/60">
                      {product.specs.map((spec) => (
                        <div
                          key={spec.label}
                          className="grid grid-cols-1 gap-1 px-4 py-2.5 sm:grid-cols-[12rem_1fr] sm:gap-4"
                        >
                          <dt className="font-medium text-ink">{spec.label}</dt>
                          <dd className="text-ink-muted">{spec.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
              )}

              {activeTab === "shipping" && (
                <div className="space-y-6">
                  <p className="rounded-lg border border-accent/30 bg-accent-soft/40 px-3 py-2.5 text-ink">
                    {STORE_SHIPPING.disclaimer}
                  </p>

                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-subtle">
                      Origin
                    </h3>
                    <p className="mt-2 text-ink-muted">{STORE_SHIPPING.origin}</p>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-subtle">
                      Delivery options
                    </h3>
                    <div className="mt-3 overflow-x-auto rounded-xl border border-line">
                      <table className="w-full min-w-[28rem] text-left text-sm">
                        <thead className="bg-surface-muted/80 text-ink">
                          <tr>
                            <th className="px-4 py-2.5 font-semibold">Method</th>
                            <th className="px-4 py-2.5 font-semibold">ETA</th>
                            <th className="px-4 py-2.5 font-semibold">Cost</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-line">
                          {STORE_SHIPPING.methods.map((row) => (
                            <tr key={row.method}>
                              <td className="px-4 py-2.5 font-medium text-ink">
                                {row.method}
                              </td>
                              <td className="px-4 py-2.5">{row.eta}</td>
                              <td className="px-4 py-2.5">{row.cost}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-line p-4">
                      <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-subtle">
                        Returns
                      </h3>
                      <p className="mt-2 leading-relaxed">{STORE_SHIPPING.returns}</p>
                    </div>
                    <div className="rounded-xl border border-line p-4">
                      <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-subtle">
                        Warranty
                      </h3>
                      <p className="mt-2 leading-relaxed">
                        {STORE_SHIPPING.warranty}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-dashed border-line p-4">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-subtle">
                      This product
                    </h3>
                    <p className="mt-2 leading-relaxed text-ink-muted">
                      {product.shipping.weightNote}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "reviews" && (
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface-elevated/60 px-4 py-3">
                    <StarRow rating={product.rating} />
                    <p className="font-semibold text-ink">
                      {product.rating.toFixed(1)} / 5
                    </p>
                    <p className="text-ink-muted">
                      Based on {product.reviews.length} demo reviews
                    </p>
                  </div>

                  <ul className="space-y-3">
                    {product.reviews.map((review) => (
                      <li
                        key={review.id}
                        className="rounded-xl border border-line bg-surface-elevated/40 p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <StarRow rating={review.rating} />
                            <p className="font-semibold text-ink">{review.title}</p>
                          </div>
                          <p className="text-xs text-ink-subtle">
                            {new Date(review.date).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                        <p className="mt-1 text-xs font-medium text-ink-muted">
                          {review.author}
                        </p>
                        <p className="mt-2 leading-relaxed text-ink-muted">
                          {review.body}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
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
            className="rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white hover:brightness-110 transition"
          >
            Add to cart
          </button>
        </div>
      </div>

      <section>
        <h2 className="text-2xl font-bold mb-6">Related products</h2>
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {relatedProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </ul>
      </section>

      {showToast ? (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 rounded-xl border border-accent/30 bg-white px-4 py-3 text-sm font-medium text-zinc-900 shadow-lg dark:border-accent/40 dark:bg-zinc-900 dark:text-zinc-100 toast-pop"
        >
          Added to cart
        </div>
      ) : null}
    </div>
  );
}
