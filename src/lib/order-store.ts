import type { Order, OrderDraft } from "@/lib/types";
import { getJson, setJson } from "@/lib/redis";

const ORDERS_INDEX_KEY = "orders:users";

function userOrdersKey(userId: string) {
  return `orders:user:${userId}`;
}

async function getUserOrders(userId: string): Promise<Order[]> {
  return (await getJson<Order[]>(userOrdersKey(userId))) ?? [];
}

async function saveUserOrders(userId: string, orders: Order[]): Promise<void> {
  await setJson(userOrdersKey(userId), orders);

  const index = (await getJson<string[]>(ORDERS_INDEX_KEY)) ?? [];
  if (!index.includes(userId)) {
    await setJson(ORDERS_INDEX_KEY, [...index, userId]);
  }
}

export async function listOrders(userId: string): Promise<Order[]> {
  return [...(await getUserOrders(userId))];
}

export async function createOrder(
  userId: string,
  input: OrderDraft
): Promise<Order> {
  const nextOrder: Order = {
    id: crypto.randomUUID(),
    userId,
    date: new Date().toISOString(),
    status: "processing",
    ...input,
  };
  const bucket = await getUserOrders(userId);
  bucket.unshift(nextOrder);
  await saveUserOrders(userId, bucket);
  return nextOrder;
}

export async function markOrderAsPaid(
  userId: string,
  orderId: string
): Promise<Order | undefined> {
  const bucket = await getUserOrders(userId);
  const target = bucket.find((order) => order.id === orderId);
  if (!target) {
    return undefined;
  }
  target.status = "paid";
  await saveUserOrders(userId, bucket);
  return target;
}

export async function listAllOrders(): Promise<Order[]> {
  const index = (await getJson<string[]>(ORDERS_INDEX_KEY)) ?? [];
  const all: Order[] = [];

  for (const userId of index) {
    all.push(...(await getUserOrders(userId)));
  }

  return all.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}
