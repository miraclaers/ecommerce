"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useOrders } from "@/app/context/OrdersContext";
import { useCart } from "@/app/context/CartContext";
import { fetchProducts } from "@/lib/api-client";
import { useState } from "react";
import type { Product } from "@/lib/types";
import { useRealtime } from "@/app/context/RealtimeContext";

export default function CheckoutSuccessPage() {
  const { addOrder, setOrderPaid } = useOrders();
  const { cart, clearCart } = useCart();
  const { sendEvent } = useRealtime();
  const hasSubmitted = useRef(false);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts().then(setProducts).catch(() => setProducts([]));
  }, []);

  const productMap = new Map(products.map((product) => [product.id, product]));
  const total = cart.reduce((acc, item) => {
    const product = productMap.get(item.id);
    if (!product) return acc;
    return acc + product.price * item.quantity;
  }, 0);

  useEffect(() => {
    if (hasSubmitted.current) return;
    if (cart.length === 0) return;

    addOrder({ total, items: cart })
      .then(async (created) => {
        await setOrderPaid(created.id);
        sendEvent({
          type: "order.status.paid",
          payload: {
            orderId: created.id,
            total: created.total,
          },
        });
      })
      .catch(() => {
        // Keep UX smooth in demo mode if API is unavailable.
      })
      .finally(() => {
        clearCart();
        hasSubmitted.current = true;
      });
  }, [addOrder, clearCart, total, cart, setOrderPaid, sendEvent]);

  return (
    <main className="p-8 max-w-lg mx-auto">
      <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 bg-white dark:bg-zinc-900 shadow-sm text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-600/10 text-green-700">
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
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold">Order completed</h1>
        <p className="mt-2 text-gray-600 dark:text-zinc-300">
          Thanks for your purchase. Your order is confirmed.
        </p>

        <div className="mt-6 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-4 text-left">
          <p className="text-sm text-gray-500 dark:text-zinc-400">Total paid</p>
          <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            ${total}
          </p>
        </div>

        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            href="/products"
            className="px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition"
          >
            Continue shopping
          </Link>
          <Link
            href="/"
            className="px-6 py-3 border border-violet-200 text-violet-700 rounded-lg hover:bg-white transition dark:border-violet-400/40 dark:text-violet-300 dark:hover:bg-zinc-900"
          >
            Back home
          </Link>
        </div>
      </div>
    </main>
  );
}
