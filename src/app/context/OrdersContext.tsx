"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  createOrderWithGraphQL,
  fetchOrders,
  markOrderPaid,
} from "@/lib/api-client";
import type { Order, OrderDraft } from "@/lib/types";

interface OrdersContextType {
  orders: Order[];
  addOrder: (order: OrderDraft) => Promise<Order>;
  setOrderPaid: (orderId: string) => Promise<void>;
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

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(() =>
    typeof window === "undefined"
      ? []
      : parseStoredOrders(window.localStorage.getItem(ordersStorageKey))
  );

  useEffect(() => {
    fetchOrders()
      .then((remoteOrders) => {
        setOrders((prev) => mergeOrders(prev, remoteOrders));
      })
      .catch(() => {
        // Keep local orders if API is unavailable.
      });
  }, []);

  useEffect(() => {
    window.localStorage.setItem(ordersStorageKey, JSON.stringify(orders));
  }, [orders]);

  const addOrder = async (order: OrderDraft) => {
    let created: Order;
    try {
      created = await createOrderWithGraphQL(order);
    } catch {
      created = {
        id: crypto.randomUUID(),
        total: order.total,
        items: order.items,
        date: new Date().toISOString(),
        status: "processing",
      };
    }
    setOrders((prev) => [created, ...prev]);
    return created;
  };

  const setOrderPaid = async (orderId: string) => {
    let updated: Order | null = null;
    try {
      updated = await markOrderPaid(orderId);
    } catch {
      // Fall back to local update.
    }
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        return updated ?? { ...order, status: "paid" };
      })
    );
  };

  return (
    <OrdersContext.Provider value={{ orders, addOrder, setOrderPaid }}>
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
