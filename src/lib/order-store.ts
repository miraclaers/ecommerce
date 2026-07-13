import { Prisma } from "@prisma/client";
import type { Order as PrismaOrder, OrderItem } from "@prisma/client";
import type { Order, OrderDraft } from "@/lib/types";
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
    stripeSessionId: record.stripeSessionId ?? undefined,
  };
}

export type CreateOrderResult = {
  order: Order;
  created: boolean;
};

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

/**
 * Creates an order once per (userId, idempotencyKey). Replays return the
 * original order without inserting a duplicate row.
 */
export async function createOrderWithIdempotency(
  userId: string,
  input: OrderDraft,
  idempotencyKey: string
): Promise<CreateOrderResult> {
  const existing = await prisma.idempotencyRecord.findUnique({
    where: { userId_key: { userId, key: idempotencyKey } },
    include: { order: { include: { items: true } } },
  });
  if (existing) {
    return { order: mapOrder(existing.order), created: false };
  }

  try {
    const order = await prisma.$transaction(async (tx) => {
      const record = await tx.order.create({
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

      await tx.idempotencyRecord.create({
        data: {
          key: idempotencyKey,
          userId,
          orderId: record.id,
        },
      });

      return record;
    });

    return { order: mapOrder(order), created: true };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const raced = await prisma.idempotencyRecord.findUnique({
        where: { userId_key: { userId, key: idempotencyKey } },
        include: { order: { include: { items: true } } },
      });
      if (raced) {
        return { order: mapOrder(raced.order), created: false };
      }
    }
    throw error;
  }
}

/**
 * Persists a paid order from a Stripe Checkout Session. Unique on
 * `stripeSessionId` so webhook retries are safe.
 */
export async function createPaidOrderFromStripe(
  userId: string,
  input: OrderDraft,
  stripeSessionId: string
): Promise<CreateOrderResult> {
  const existing = await prisma.order.findUnique({
    where: { stripeSessionId },
    include: { items: true },
  });
  if (existing) {
    return { order: mapOrder(existing), created: false };
  }

  try {
    const record = await prisma.order.create({
      data: {
        userId,
        total: input.total,
        status: "paid",
        stripeSessionId,
        items: {
          create: input.items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
          })),
        },
      },
      include: { items: true },
    });
    return { order: mapOrder(record), created: true };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const raced = await prisma.order.findUnique({
        where: { stripeSessionId },
        include: { items: true },
      });
      if (raced) {
        return { order: mapOrder(raced), created: false };
      }
    }
    throw error;
  }
}

export async function findOrderByStripeSessionId(
  userId: string,
  stripeSessionId: string
): Promise<Order | undefined> {
  const record = await prisma.order.findFirst({
    where: { stripeSessionId, userId },
    include: { items: true },
  });
  return record ? mapOrder(record) : undefined;
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

  if (existing.status === "cancelled") {
    return undefined;
  }

  const record = await prisma.order.update({
    where: { id: orderId },
    data: { status: "paid" },
    include: { items: true },
  });
  return mapOrder(record);
}

export type CancelOrderResult =
  | { ok: true; order: Order }
  | { ok: false; error: string; notFound?: true };

/**
 * Cancels a processing order owned by the user. Paid orders cannot be
 * cancelled here (would need a refund flow).
 */
export async function cancelOrder(
  userId: string,
  orderId: string
): Promise<CancelOrderResult> {
  const existing = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: { items: true },
  });
  if (!existing) {
    return { ok: false, error: "Order not found", notFound: true };
  }

  if (existing.status === "cancelled") {
    return { ok: true, order: mapOrder(existing) };
  }

  if (existing.status === "paid") {
    return {
      ok: false,
      error: "Paid orders cannot be cancelled from this flow",
    };
  }

  if (existing.status !== "processing") {
    return {
      ok: false,
      error: `Order cannot be cancelled while status is ${existing.status}`,
    };
  }

  const record = await prisma.order.update({
    where: { id: orderId },
    data: { status: "cancelled" },
    include: { items: true },
  });
  return { ok: true, order: mapOrder(record) };
}

export async function listAllOrders(): Promise<Order[]> {
  const records = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
  return records.map(mapOrder);
}
