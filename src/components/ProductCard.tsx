"use client";

import Link from "next/link";
import type { Product } from "@/lib/types";
import Image from "next/image";
import { useFavorites } from "@/app/context/FavoritesContext";
import CollectionPicker from "@/components/CollectionPicker";

type Props = {
  product: Product;
};
export default function ProductCard({ product }: Props) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(product.id);

  return (
    <li className="
        border rounded-lg p-4 bg-white/80 dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800
        w-full mb-4 break-inside-avoid
        transition-all duration-300
        hover:shadow-xl hover:scale-[0.98]
        group/card
        relative"
        >
    <button
      type="button"
      aria-label={
        favorite ? "Remove from favorites" : "Add to favorites"
      }
      onClick={() => toggleFavorite(product.id)}
      className={`absolute left-3 top-3 z-10 rounded-full border p-2 transition ${
        favorite
          ? "border-amber-300 bg-amber-100 text-amber-700 dark:border-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
          : "border-zinc-200 bg-white/90 text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900/90 dark:text-zinc-300 dark:hover:text-zinc-100"
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
    ) : null }
      {/* Link to product detail */}
      <Link href={`/product/${product.id}`} className="block">
      <Image
      src={product.image}
      alt={product.image}
      width={600}
      height={400}
      sizes="(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
      className="relative z-0 w-full h-40 rounded-md object-cover mb-4 bg-zinc-100/5 transition-all duration-300 ease-out group-hover/card:h-[12.5rem] group-hover/card:scale-[0.99]"
      />
        <h3 className="font-semibold text-base text-zinc-900 dark:text-zinc-100">{product.title}</h3>
        <p className="text-gray-600 mt-1 text-sm dark:text-zinc-400">${product.price}</p>
      </Link>

      {/* Animated expandable section */}
      <div
        className="
          mt-4
          max-h-0
          overflow-hidden
          transition-[max-height] duration-300 ease-in-out
          group-hover/card:max-h-56
        "
      >
        <p className="text-sm text-gray-500 dark:text-zinc-400">
          {product.description}
        </p>

        <div className="mt-3">
          <CollectionPicker productId={product.id} />
        </div>

        <Link
          href={`/product/${product.id}`}
          className="mt-4 w-full py-2 rounded-md transition bg-violet-600 text-white hover:bg-violet-700 inline-flex items-center justify-center text-sm"
        >
          View product
        </Link>
      </div>
    </li>
  );
}
