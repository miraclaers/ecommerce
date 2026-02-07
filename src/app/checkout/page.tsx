"use client";

import { useCart } from "@/app/context/CartContext";
import { getProductById } from "@/lib/products";
import Link from "next/link";

export default function CheckoutPage() {
  const { cart } = useCart();

  const items = cart
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

  const total = items.reduce(
    (acc, item) => acc + item!.subtotal,
    0
  );

  if (items.length === 0) {
    return (
      <main className="p-8 max-w-3xl mx-auto">
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
          <h1 className="text-2xl font-bold text-gray-900">
            Your cart is empty
          </h1>
          <p className="mt-2 text-gray-600">
            Add items before checking out.
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
      </main>
    );
  }

  return (
    <main className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <ul className="space-y-4">
        {items.map((item) => (
          <li
            key={item!.id}
            className="border rounded-lg p-4 flex justify-between"
          >
            <div>
              <h3 className="font-semibold">{item!.title}</h3>
              <p className="text-sm text-gray-500">
                Quantity: {item!.quantity}
              </p>
            </div>

            <p className="font-semibold">
              ${item!.subtotal}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex justify-between items-center">
        <p className="text-xl font-bold">Total: ${total}</p>

        <Link
          href="/checkout/pay"
          className="bg-violet-600 text-white px-6 py-3 rounded-lg hover:bg-violet-700"
        >
          Pay now
        </Link>
      </div>
    </main>
  );
}
