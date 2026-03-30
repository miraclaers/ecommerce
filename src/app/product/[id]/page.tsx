"use client";

import { notFound, useParams } from "next/navigation";
import { getProductById, getProducts } from "@/lib/products";
import { useCart } from "@/app/context/CartContext";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import ProductCard from "@/components/ProductCard";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";
import ProductDetailSkeleton from "@/components/ProductDetailSkeleton";

export default function ProductDetail() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : null;
  const product = id ? getProductById(id) : undefined;

  const { addToCart } = useCart();
  const [activeTab, setActiveTab] = useState<
    "description" | "shipping" | "reviews"
  >("description");
  const [activeImage, setActiveImage] = useState(
    product?.image ?? ""
  );
  const [showRelatedSkeletons, setShowRelatedSkeletons] =
    useState(true);
  const [showDetailSkeleton, setShowDetailSkeleton] =
    useState(true);
  const [showToast, setShowToast] = useState(false);
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  if (!id || !product) {
    notFound();
  }
  const galleryImages = [
    product.image,
    "/products/headphones.jpg",
    "/products/keyboard.jpg",
    "/products/mousepad.jpg",
  ].filter(
    (img, index, all) => all.indexOf(img) === index
  );

  const relatedProducts = getProducts().filter(
    (p) => p.id !== product.id
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowRelatedSkeletons(false);
    }, 350);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowDetailSkeleton(false);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimer.current) {
        clearTimeout(toastTimer.current);
      }
    };
  }, []);

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

  if (showDetailSkeleton) {
    return (
      <main className="max-w-5xl mx-auto p-8 space-y-16 pb-24">
        <ProductDetailSkeleton />

        <section>
          <h2 className="text-2xl font-bold mb-6">
            Related products
          </h2>
          <ul className="columns-[12rem] sm:columns-[13rem] md:columns-[14rem] lg:columns-[15rem] gap-x-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <ProductCardSkeleton
                key={`related-skeleton-${index}`}
              />
            ))}
          </ul>
        </section>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto p-8 space-y-16 pb-24">
      {/* Top section */}
      <section className="grid md:grid-cols-2 gap-12">
        {/* Image */}
        <div className="relative">
          <div className="border-4 border-violet-600 rounded-xl overflow-hidden">
            <div
              className="relative"
              onMouseEnter={() => setIsZooming(true)}
              onMouseLeave={() => setIsZooming(false)}
              onMouseMove={(event) => {
                const rect =
                  event.currentTarget.getBoundingClientRect();
                const x =
                  ((event.clientX - rect.left) / rect.width) *
                  100;
                const y =
                  ((event.clientY - rect.top) / rect.height) *
                  100;
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


        {/* Info */}
        <div>
          <h1 className="text-3xl font-bold">{product.title}</h1>

          <p className="text-2xl text-violet-600 font-semibold mt-4">
            ${product.price}
          </p>

          <button
            onClick={handleAddToCart}
            className="mt-8 bg-violet-600 text-white px-6 py-3 rounded-xl hover:bg-violet-700 transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/70"
          >
            Add to cart
          </button>

          {/* Tabs */}
          <div className="mt-10">
            <div className="flex gap-6 border-b border-zinc-200 dark:border-zinc-800">
              {["description", "shipping", "reviews"].map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() =>
                      setActiveTab(
                        tab as typeof activeTab
                      )
                    }
                    className={`pb-2 capitalize ${
                      activeTab === tab
                        ? "border-b-2 border-violet-600 font-semibold"
                        : "text-gray-500 dark:text-zinc-400"
                    }`}
                  >
                    {tab}
                  </button>
                )
              )}
            </div>

            {/* Tab content */}
            <div className="mt-6 text-gray-600 dark:text-zinc-300 text-sm">
              {activeTab === "description" && (
                <div className="space-y-4">
                  <p>
                    {product.description} Built for daily use with a
                    focus on comfort, durability, and clean aesthetics.
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-zinc-200 bg-white/70 p-4 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-200">
                      <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                        Category
                      </p>
                      <p className="mt-1 font-semibold">
                        {product.category}
                      </p>
                    </div>
                    <div className="rounded-xl border border-zinc-200 bg-white/70 p-4 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-200">
                      <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                        Popularity
                      </p>
                      <p className="mt-1 font-semibold">
                        {product.popularity} / 100
                      </p>
                    </div>
                  </div>
                  <ul className="grid gap-3 sm:grid-cols-2">
                    <li className="rounded-lg border border-zinc-200 bg-white/70 p-3 dark:border-zinc-800 dark:bg-zinc-900/60">
                      Ergonomic fit for long sessions
                    </li>
                    <li className="rounded-lg border border-zinc-200 bg-white/70 p-3 dark:border-zinc-800 dark:bg-zinc-900/60">
                      Premium materials and matte finish
                    </li>
                    <li className="rounded-lg border border-zinc-200 bg-white/70 p-3 dark:border-zinc-800 dark:bg-zinc-900/60">
                      Balanced sound/feel with clear detail
                    </li>
                    <li className="rounded-lg border border-zinc-200 bg-white/70 p-3 dark:border-zinc-800 dark:bg-zinc-900/60">
                      Tested for everyday durability
                    </li>
                  </ul>
                </div>
              )}

              {activeTab === "shipping" && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-zinc-200 bg-white/70 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900/60">
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                      Estimated delivery
                    </p>
                    <p className="mt-1 text-zinc-600 dark:text-zinc-300">
                      2–4 business days standard · 1–2 days express
                    </p>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <span className="mt-1 h-2 w-2 rounded-full bg-violet-600" />
                      <span>
                        Free shipping over $100, otherwise $6 flat rate.
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1 h-2 w-2 rounded-full bg-violet-600" />
                      <span>
                        30‑day returns, no questions asked.
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1 h-2 w-2 rounded-full bg-violet-600" />
                      <span>
                        1‑year warranty with fast replacements.
                      </span>
                    </li>
                  </ul>
                </div>
              )}

              {activeTab === "reviews" && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-zinc-200 bg-white/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      Average rating
                    </p>
                    <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                      {product.rating} / 5
                    </p>
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                      Based on recent verified purchases.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-xl border border-zinc-200 bg-white/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                          Ana
                        </p>
                        <span className="text-xs text-zinc-500">
                          Verified · 5/5
                        </span>
                      </div>
                      <p className="mt-2 text-zinc-600 dark:text-zinc-300">
                        Great quality and comfort. The build feels solid
                        and the finish looks premium.
                      </p>
                    </div>
                    <div className="rounded-xl border border-zinc-200 bg-white/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                          Lucas
                        </p>
                        <span className="text-xs text-zinc-500">
                          Verified · 4/5
                        </span>
                      </div>
                      <p className="mt-2 text-zinc-600 dark:text-zinc-300">
                        Smooth experience overall and quick delivery.
                        I’d love a wider color selection.
                      </p>
                    </div>
                  </div>
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
            <p className="text-lg font-semibold">
              ${product.price}
            </p>
          </div>
          <button
            onClick={handleAddToCart}
            className="rounded-lg bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700 transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/70"
          >
            Add to cart
          </button>
        </div>
      </div>

      {/* Related products */}
      <section>
        <h2 className="text-2xl font-bold mb-6">
          Related products
        </h2>

        <ul className="columns-[12rem] sm:columns-[13rem] md:columns-[14rem] lg:columns-[15rem] gap-x-4">
          {showRelatedSkeletons
            ? Array.from({ length: 3 }).map((_, index) => (
                <ProductCardSkeleton
                  key={`related-skeleton-${index}`}
                />
              ))
            : relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
        </ul>
      </section>

      {showToast ? (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl border border-violet-200 bg-white px-4 py-3 text-sm font-medium text-zinc-900 shadow-lg dark:border-violet-500/40 dark:bg-zinc-900 dark:text-zinc-100 toast-pop">
          Added to cart
        </div>
      ) : null}
    </main>
  );
}
