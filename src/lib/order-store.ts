import type { Order, OrderDraft } from "@/lib/types";

const ordersByUser = new Map<string, Order[]>();

function getUserOrders(userId: string): Order[] {
  if (!ordersByUser.has(userId)) {
    ordersByUser.set(userId, []);
  }
  return ordersByUser.get(userId)!;
}

export function listOrders(userId: string): Order[] {
  return [...getUserOrders(userId)];
}

export function createOrder(userId: string, input: OrderDraft): Order {
  const nextOrder: Order = {
    id: crypto.randomUUID(),
    userId,
    date: new Date().toISOString(),
    status: "processing",
    ...input,
  };
  const bucket = getUserOrders(userId);
  bucket.unshift(nextOrder);
  return nextOrder;
}

export function markOrderAsPaid(
  userId: string,
  orderId: string
): Order | undefined {
  const target = getUserOrders(userId).find((order) => order.id === orderId);
  if (!target) {
    return undefined;
  }
  target.status = "paid";
  return target;
}

export function listAllOrders(): Order[] {
  return [...ordersByUser.values()].flat();
}
