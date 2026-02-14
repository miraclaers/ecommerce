"use client";

import Link from "next/link";
import { Product } from "@/lib/products";
import Image from "next/image"

type Props = {
  product: Product;
};

export default function ProductCard({ product }: Props) {
  return (
    <li
      className="
        border rounded-lg p-4 bg-white/80 dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800
        w-full mb-2 break-inside-avoid
        transition-all duration-300
        hover:shadow-xl hover:scale-[0.98]
        group/card
      "
    >
      {/* Link to product detail */}
      <Link href={`/product/${product.id}`} className="block">
      <Image
      src={product.image}
      alt={product.image}
      width={600}
      height={400}
      sizes="(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
      className="w-full h-40 rounded-md object-cover mb-3 bg-zinc-100/5 transition-all duration-300 ease-out group-hover/card:h-[12.5rem] group-hover/card:scale-[0.99]"
      />
        <h3 className="font-semibold text-base text-zinc-900 dark:text-zinc-100">{product.title}</h3>
        <p className="text-gray-600 mt-1 text-sm dark:text-zinc-400">${product.price}</p>
      </Link>

      {/* Animated expandable section */}
      <div
        className="
          mt-3
          max-h-0
          overflow-hidden
          transition-[max-height] duration-300 ease-in-out
          group-hover/card:max-h-36
        "
      >
        <p className="text-sm text-gray-500 dark:text-zinc-400">
          {product.description}
        </p>

        <Link
          href={`/product/${product.id}`}
          className="mt-3 w-full py-2 rounded-md transition bg-violet-600 text-white hover:bg-violet-700 inline-flex items-center justify-center text-sm"
        >
          View product
        </Link>
      </div>
    </li>
  );
}
