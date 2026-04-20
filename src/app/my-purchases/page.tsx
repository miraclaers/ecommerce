"use client";

import Link from "next/link";
import { useMemo, useEffect, useState } from "react";
import { useOrders } from "@/app/context/OrdersContext";
import { fetchProducts } from "@/lib/api-client";
import type { Product } from "@/lib/types";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export default function MyPurchasesPage() {
  const { orders } = useOrders();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts().then(setProducts).catch(() => setProducts([]));
  }, []);

  const productMap = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products]
  );

  if (orders.length === 0) {
    return (
      <main className="mx-auto max-w-4xl p-8">
        <section className="rounded-2xl border border-dashed border-violet-300/70 bg-violet-50/40 p-10 text-center dark:border-violet-500/40 dark:bg-violet-950/20">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">
            No purchases yet
          </h1>
          <p className="mt-2 text-gray-600 dark:text-zinc-300">
            Your completed purchases will show up here.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex rounded-lg bg-violet-600 px-6 py-3 text-white transition hover:bg-violet-700"
          >
            Start shopping
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        My purchases
      </h1>
      <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
        {orders.length} {orders.length === 1 ? "order" : "orders"} remembered on
        this device.
      </p>

      <ul className="space-y-4">
        {orders.map((order) => (
          <li
            key={order.id}
            className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {formatDate(order.date)}
                </p>
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                  Order #{order.id.slice(0, 8)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  {formatCurrency(order.total)}
                </p>
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                    order.status === "paid"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                  }`}
                >
                  {order.status ?? "processing"}
                </span>
              </div>
            </div>

            <ul className="mt-4 space-y-2 border-t border-zinc-100 pt-4 dark:border-zinc-800">
              {order.items.map((item) => {
                const product = productMap.get(item.id);
                return (
                  <li
                    key={`${order.id}-${item.id}`}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-zinc-700 dark:text-zinc-200">
                      {product?.title ?? "Product unavailable"} x{item.quantity}
                    </span>
                    <span className="font-medium text-zinc-800 dark:text-zinc-100">
                      {product
                        ? formatCurrency(product.price * item.quantity)
                        : "N/A"}
                    </span>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>
    </main>
  );
}
