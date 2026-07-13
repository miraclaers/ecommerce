"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { cancelOrderAction } from "@/app/actions/orders";
import { fetchOrders, markOrderPaid, postOrder } from "@/lib/api-client";
import { isAppError } from "@/lib/errors";
import type { Order, OrderDraft } from "@/lib/types";

interface OrdersContextType {
  orders: Order[];
  addOrder: (order: OrderDraft, idempotencyKey?: string) => Promise<Order>;
  setOrderPaid: (orderId: string) => Promise<void>;
  cancelOrder: (
    orderId: string
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);
const ordersStorageKey = "minishop_orders";

function parseStoredOrders(raw: string | null): Order[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (order) =>
        order &&
        typeof order.id === "string" &&
        typeof order.total === "number" &&
        typeof order.date === "string" &&
        Array.isArray(order.items)
    );
  } catch {
    return [];
  }
}

function mergeOrders(localOrders: Order[], remoteOrders: Order[]): Order[] {
  const byId = new Map<string, Order>();
  [...remoteOrders, ...localOrders].forEach((order) => {
    byId.set(order.id, order);
  });
  return Array.from(byId.values()).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

function createLocalOrder(order: OrderDraft): Order {
  return {
    id: crypto.randomUUID(),
    userId: "local",
    total: order.total,
    items: order.items,
    date: new Date().toISOString(),
    status: "processing",
  };
}

function isExpectedAuthFailure(error: unknown): boolean {
  return isAppError(error) && error.status === 401;
}

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useAuth();
  const [orders, setOrders] = useState<Order[]>(() =>
    typeof window === "undefined"
      ? []
      : parseStoredOrders(window.localStorage.getItem(ordersStorageKey))
  );

  useEffect(() => {
    if (isSignedIn === false) {
      return;
    }
    fetchOrders()
      .then((remoteOrders) => {
        setOrders((prev) => mergeOrders(prev, remoteOrders));
      })
      .catch((error) => {
        // Guests and demo mode stay on localStorage; only log unexpected failures.
        if (!isExpectedAuthFailure(error)) {
          console.error("[orders] fetchOrders failed", error);
        }
      });
  }, [isSignedIn]);

  useEffect(() => {
    window.localStorage.setItem(ordersStorageKey, JSON.stringify(orders));
  }, [orders]);

  const addOrder = async (order: OrderDraft, idempotencyKey?: string) => {
    let created: Order;

    // Demo / guest checkout: persist locally without hitting the auth-gated API.
    if (isSignedIn === false) {
      created = createLocalOrder(order);
    } else {
      try {
        created = await postOrder(order, idempotencyKey);
      } catch (error) {
        if (!isExpectedAuthFailure(error)) {
          console.error(
            "[orders] createOrder API failed, using local fallback",
            error
          );
        }
        created = createLocalOrder(order);
      }
    }

    setOrders((prev) => {
      if (prev.some((existing) => existing.id === created.id)) {
        return prev;
      }
      return [created, ...prev];
    });
    return created;
  };

  const setOrderPaid = async (orderId: string) => {
    let updated: Order | null = null;

    if (isSignedIn !== false) {
      try {
        updated = await markOrderPaid(orderId);
      } catch (error) {
        if (!isExpectedAuthFailure(error)) {
          console.error(
            "[orders] markOrderPaid API failed, using local fallback",
            error
          );
        }
      }
    }

    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        return updated ?? { ...order, status: "paid" };
      })
    );
  };

  const cancelOrder = async (orderId: string) => {
    const result = await cancelOrderAction(orderId);
    if (!result.ok) {
      return { ok: false as const, error: result.error };
    }
    setOrders((prev) =>
      prev.map((order) => (order.id === orderId ? result.order : order))
    );
    return { ok: true as const };
  };

  return (
    <OrdersContext.Provider
      value={{ orders, addOrder, setOrderPaid, cancelOrder }}
    >
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error("useOrders must be used within an OrdersProvider");
  }
  return context;
}
