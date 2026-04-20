import type { Order, OrderDraft } from "@/lib/types";

const orders: Order[] = [];

export function listOrders(): Order[] {
  return orders;
}

export function createOrder(input: OrderDraft): Order {
  const nextOrder: Order = {
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    status: "processing",
    ...input,
  };
  orders.unshift(nextOrder);
  return nextOrder;
}

export function markOrderAsPaid(orderId: string): Order | undefined {
  const target = orders.find((order) => order.id === orderId);
  if (!target) {
    return undefined;
  }
  target.status = "paid";
  return target;
}
