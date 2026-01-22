"use client";

import Link from "next/link";
import { Product } from "@/lib/products";
import { useCart } from "@/app/context/CartContext";
import { useState } from "react";
import Image from "next/image"

type Props = {
  product: Product;
};

export default function ProductCard({ product }: Props) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart(product.id);
    setAdded(true);

    setTimeout(() => {
      setAdded(false);
    }, 3000);
  };

  return (
    <li
      className="
        border rounded-xl p-4
        transition-all duration-300
        hover:shadow-xl
        group
      "
    >
      {/* Link to product detail */}
      <Link href={`/product/${product.id}`} className="block">
      <Image
      src={product.image}
      alt={product.image}
      width={300}
      height={200}
      className="rounded-lg object-cover mb-3"
      />
        <h3 className="font-semibold text-lg">{product.title}</h3>
        <p className="text-gray-600 mt-2">${product.price}</p>
      </Link>

      {/* Animated expandable section */}
      <div
        className="
          mt-3
          max-h-0
          overflow-hidden
          transition-[max-height] duration-300 ease-in-out
          group-hover:max-h-48
        "
      >
        <p className="text-sm text-gray-500">
          {product.description}
        </p>

        <button
          onClick={handleAddToCart}
          className={`
            mt-4 w-full py-2 rounded-lg transition
            ${added ? "bg-green-600" : "bg-violet-600"}
            text-white hover:bg-violet-700
          `}
        >
          {added ? "Added!" : "Add to cart"}
        </button>
      </div>
    </li>
  );
}
