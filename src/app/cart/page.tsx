"use client";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "../context/CartContext";
import { getProductById, getProducts } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
  } = useCart();

  const cartItemsWithData = cart
    .map((item) => {
      const product = getProductById(item.id);
      if (!product) return null;

      return {
        ...product,
        quantity: item.quantity,
        subtotal: product.price * item.quantity,
      };
    })
    .filter(Boolean);

  const suggestedProducts = getProducts().slice(0, 3);

  const total = cartItemsWithData.reduce(
    (acc, item) => acc + item!.subtotal,
    0
  );

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        Cart
      </h1>

      {cartItemsWithData.length === 0 ? (
        <>
          <section className="border border-dashed border-violet-300/70 rounded-2xl p-10 text-center bg-violet-50/40">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-600/10 text-violet-700">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-8 w-8"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="9" cy="20" r="1.8" />
                <circle cx="17" cy="20" r="1.8" />
                <path d="M3 4h2l2.6 11h9.8l2.1-7H7.1" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Your cart is empty
            </h2>
            <p className="mt-2 text-gray-600">
              Looks like you haven&apos;t added anything yet. Find something you
              love.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <Link
                href="/products"
                className="px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition"
              >
                Browse products
              </Link>
              <Link
                href="/"
                className="px-6 py-3 border border-violet-200 text-violet-700 rounded-lg hover:bg-white transition"
              >
                Back home
              </Link>
            </div>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-bold mb-6">
              Products you might be interested in
            </h2>
            <ul className="columns-[12rem] sm:columns-[13rem] md:columns-[14rem] lg:columns-[15rem] gap-x-2">
              {suggestedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </ul>
          </section>
        </>
      ) : (
        <>
          <ul className="space-y-4">
            {cartItemsWithData.map((item) => (
              <li
                key={item!.id}
                className="border rounded-xl p-4 flex gap-4 items-start"
              >
                {/* Image placeholder */}
                <Image
                  src={item!.image}
                  alt={item!.title}
                  width={80}
                  height={80}
                  className="rounded-lg object-cover shrink-0"
                />

                {/* Product info */}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">
                    {item!.title}
                  </h3>

                  <p className="text-sm text-gray-500 mt-1">
                    {item!.description}
                  </p>

                  {/* Quantity & actions */}
                  <div className="mt-4 flex items-center gap-4">
                    <span className="font-semibold">
                      Quantity: {item!.quantity}
                    </span>

                    <button
                      onClick={() =>
                        decreaseQuantity(item!.id)
                      }
                      className="px-3 py-1 border rounded-lg hover:bg-gray-100"
                    >
                      -
                    </button>

                    <button
                      onClick={() =>
                        increaseQuantity(item!.id)
                      }
                      className="px-3 py-1 border rounded-lg hover:bg-gray-100"
                    >
                      +
                    </button>

                    <button
                      onClick={() =>
                        removeFromCart(item!.id)
                      }
                      className="text-red-600 hover:underline text-sm"
                    >
                      Remove
                    </button>
                  </div>

                  <p className="mt-2 font-semibold">
                    Subtotal: ${item!.subtotal}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          {/* Footer */}
          <div className="mt-8 flex justify-between items-center">
            <button
              onClick={clearCart}
              className="
                px-4 py-2
                border border-red-300
                text-red-600
                rounded-lg
                hover:bg-red-50
                hover:border-red-400
                transition
              "
            >
              Clear cart
            </button>

            <p className="text-xl font-bold">
              Total: ${total}
            </p>
            <Link
              href="/checkout"
              className="
                px-6 py-3
                bg-violet-600 text-white
                rounded-lg
                hover:bg-violet-700
                transition
              "
            >
              Proceed to checkout
            </Link>
          </div>
        </>
      )}
    </main>
  );
}
