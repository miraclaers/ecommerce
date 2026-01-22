"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useOrders } from "@/app/context/OrdersContext";
import { useCart } from "@/app/context/CartContext";
import { getProductById } from "@/lib/products";

export default function CheckoutSuccessPage() {
  const { addOrder } = useOrders();
  const { cart, clearCart } = useCart();

  const total = cart.reduce((acc, item) => {
    const product = getProductById(item.id);
    if (!product) return acc;
    return acc + product.price * item.quantity;
  }, 0);

  useEffect(() => {
    addOrder({
      id: crypto.randomUUID(),
      total,
      date: new Date().toISOString(),
      items: cart,
    });

    clearCart();
  }, [addOrder, clearCart, total, cart]);

  return (
    <main className="p-8 text-center">
      <h1 className="text-2xl font-bold mb-4">
        Order completed 🎉
      </h1>

      <p className="mb-6 text-gray-600">
        Total paid: <strong>${total}</strong>
      </p>

      <Link href="/" className="text-violet-600 underline">
        Back to products
      </Link>
    </main>
  );
}
