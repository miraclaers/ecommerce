"use client";

import { memo } from "react";
import Link from "next/link";
import type { Product } from "@/lib/types";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { useFavorites } from "@/app/context/FavoritesContext";
import CollectionPicker from "@/components/CollectionPicker";
import { SpotlightCard } from "@/components/motion/SpotlightCard";

type Props = {
  product: Product;
  priority?: boolean;
  index?: number;
};

function ProductCard({ product, priority = false, index = 0 }: Props) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(product.id);
  const reduceMotion = useReducedMotion();

  return (
    <motion.li
      className="group/card list-none"
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { duration: 0.35, ease: [0.22, 1, 0.36, 1], delay: Math.min(index, 8) * 0.04 }
      }
    >
      <SpotlightCard className="flex h-full flex-col rounded-xl border border-line bg-surface-elevated shadow-card transition duration-shop hover:shadow-card-hover">
        <div className="relative">
          <button
            type="button"
            aria-label={
              favorite ? "Remove from favorites" : "Add to favorites"
            }
            onClick={() => toggleFavorite(product.id)}
            className={`absolute left-3 top-3 z-10 rounded-full border p-2 transition duration-shop ${
              favorite
                ? "border-amber-300 bg-amber-100 text-amber-700 dark:border-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                : "border-line bg-surface-elevated/95 text-ink-muted hover:border-ink/20 hover:text-ink"
            }`}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill={favorite ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
            </svg>
          </button>

          {product.discountPercent ? (
            <span className="absolute right-3 top-3 z-10 rounded-full bg-red-600 px-2 py-1 text-xs font-semibold text-white">
              -{product.discountPercent}%
            </span>
          ) : null}

          <Link
            href={`/product/${product.id}`}
            className="relative block aspect-[4/3] overflow-hidden bg-surface-muted"
          >
            <Image
              src={product.image}
              alt={product.title}
              width={600}
              height={450}
              priority={priority}
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="h-full w-full object-cover transition duration-300 ease-out group-hover/card:scale-[1.03] motion-reduce:group-hover/card:scale-100"
            />
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-transparent opacity-0 transition duration-300 group-hover/card:opacity-100 group-focus-within/card:opacity-100 motion-reduce:hidden"
              aria-hidden
            />
            <p className="pointer-events-none absolute inset-x-3 bottom-3 line-clamp-2 text-sm text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] opacity-0 transition duration-300 group-hover/card:opacity-100 group-focus-within/card:opacity-100 motion-reduce:hidden">
              {product.description}
            </p>
          </Link>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-4">
          <Link href={`/product/${product.id}`} className="block min-w-0">
            <h2 className="truncate font-display text-base font-semibold tracking-tight text-ink">
              {product.title}
            </h2>
            <p className="mt-1 text-sm font-medium tabular-nums text-ink-muted">
              ${product.price}
            </p>
          </Link>

          <div className="mt-auto space-y-2">
            <CollectionPicker productId={product.id} />
            <Link
              href={`/product/${product.id}`}
              className="btn-accent w-full"
            >
              View product
            </Link>
          </div>
        </div>
      </SpotlightCard>
    </motion.li>
  );
}

export default memo(ProductCard);
