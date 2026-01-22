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
      <main className="p-8">
        <p>Your cart is empty.</p>
        <Link href="/" className="text-violet-600 underline">
          Go back to products
        </Link>
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
