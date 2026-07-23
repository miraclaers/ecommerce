"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useOrders } from "@/app/context/OrdersContext";
import { useCart } from "@/app/context/CartContext";
import { computeOrderTotal } from "@/lib/order-pricing";
import { useRealtime } from "@/app/context/RealtimeContext";
import { fetchOrderByStripeSession } from "@/lib/api-client";
import type { Order } from "@/lib/types";

const IDEMPOTENCY_STORAGE_KEY = "minishop_checkout_idempotency_key";

function getOrCreateIdempotencyKey(): string {
  const existing = sessionStorage.getItem(IDEMPOTENCY_STORAGE_KEY);
  if (existing) {
    return existing;
  }
  const key = crypto.randomUUID();
  sessionStorage.setItem(IDEMPOTENCY_STORAGE_KEY, key);
  return key;
}

function clearIdempotencyKey() {
  sessionStorage.removeItem(IDEMPOTENCY_STORAGE_KEY);
}

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const stripeSessionId = searchParams.get("session_id");
  const { addOrder, setOrderPaid } = useOrders();
  const { cart, clearCart } = useCart();
  const { sendEvent } = useRealtime();
  const hasSubmitted = useRef(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [waitingForWebhook, setWaitingForWebhook] = useState(
    Boolean(stripeSessionId)
  );
  const cartTotal = computeOrderTotal(cart) ?? 0;
  const displayTotal = confirmedOrder?.total ?? cartTotal;

  useEffect(() => {
    if (!stripeSessionId) {
      return;
    }
    if (hasSubmitted.current) {
      return;
    }
    hasSubmitted.current = true;

    let cancelled = false;
    let attempts = 0;

    const poll = async () => {
      while (!cancelled && attempts < 15) {
        attempts += 1;
        try {
          const order = await fetchOrderByStripeSession(stripeSessionId);
          if (cancelled) {
            return;
          }
          setConfirmedOrder(order);
          setWaitingForWebhook(false);
          clearCart();
          sendEvent({
            type: "order.status.paid",
            payload: { orderId: order.id, total: order.total },
          });
          return;
        } catch {
          await new Promise((resolve) => setTimeout(resolve, 800));
        }
      }
      if (!cancelled) {
        setWaitingForWebhook(false);
        clearCart();
      }
    };

    void poll();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once per session_id
  }, [stripeSessionId]);

  useEffect(() => {
    if (stripeSessionId) {
      return;
    }
    if (hasSubmitted.current) {
      return;
    }
    if (cart.length === 0) {
      return;
    }

    const items = cart.map((item) => ({ ...item }));
    const orderTotal = computeOrderTotal(items);
    if (orderTotal === null || orderTotal <= 0) {
      return;
    }

    hasSubmitted.current = true;
    const idempotencyKey = getOrCreateIdempotencyKey();

    void (async () => {
      try {
        const created = await addOrder(
          { total: orderTotal, items },
          idempotencyKey
        );
        await setOrderPaid(created.id);
        setConfirmedOrder({ ...created, status: "paid" });
        clearIdempotencyKey();
        sendEvent({
          type: "order.status.paid",
          payload: {
            orderId: created.id,
            total: created.total,
          },
        });
      } catch (error) {
        console.error("[checkout/success] order submission failed", error);
        hasSubmitted.current = false;
      } finally {
        clearCart();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional
  }, [cart.length, stripeSessionId]);

  return (
    <div className="p-8 max-w-lg mx-auto">
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
          {waitingForWebhook
            ? "Confirming your Stripe payment…"
            : "Thanks for your purchase. Your order is confirmed."}
        </p>

        <div className="mt-6 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-4 text-left">
          <p className="text-sm text-gray-500 dark:text-zinc-400">Total paid</p>
          <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            ${displayTotal}
          </p>
          {confirmedOrder?.id ? (
            <p className="mt-2 text-xs text-gray-500 dark:text-zinc-400 break-all">
              Order ID: {confirmedOrder.id}
            </p>
          ) : null}
        </div>

        <div className="mt-6 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <Link
            href="/products"
            className="px-6 py-3 bg-accent text-white rounded-lg hover:brightness-110 transition"
          >
            Continue shopping
          </Link>
          <Link
            href="/"
            className="px-6 py-3 border border-accent/30 text-accent rounded-lg hover:bg-white transition dark:border-accent/40 dark:text-accent dark:hover:bg-zinc-900"
          >
            Back home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 max-w-lg mx-auto text-center text-gray-600">
          Loading order…
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
