import type { Order, OrderDraft } from "@/lib/types";
import type { Order as PrismaOrder, OrderItem } from "@prisma/client";
import { prisma } from "./prisma";

type OrderWithItems = PrismaOrder & { items: OrderItem[] };

function mapOrder(record: OrderWithItems): Order {
  return {
    id: record.id,
    userId: record.userId,
    total: Number(record.total),
    date: record.createdAt.toISOString(),
    status: record.status as Order["status"],
    items: record.items.map((item) => ({
      id: item.productId,
      quantity: item.quantity,
    })),
  };
}

export async function listOrders(userId: string): Promise<Order[]> {
  const records = await prisma.order.findMany({
    where: { userId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
  return records.map(mapOrder);
}

export async function createOrder(
  userId: string,
  input: OrderDraft
): Promise<Order> {
  const record = await prisma.order.create({
    data: {
      userId,
      total: input.total,
      status: "processing",
      items: {
        create: input.items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      },
    },
    include: { items: true },
  });
  return mapOrder(record);
}

export async function markOrderAsPaid(
  userId: string,
  orderId: string
): Promise<Order | undefined> {
  const existing = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: { items: true },
  });
  if (!existing) {
    return undefined;
  }

  const record = await prisma.order.update({
    where: { id: orderId },
    data: { status: "paid" },
    include: { items: true },
  });
  return mapOrder(record);
}

export async function listAllOrders(): Promise<Order[]> {
  const records = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
  return records.map(mapOrder);
}
