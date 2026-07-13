import { NextResponse } from "next/server";
import { getUserIdSafe } from "@/lib/auth";
import {
  createOrder,
  createOrderWithIdempotency,
  findOrderByStripeSessionId,
  listOrders,
  markOrderAsPaid,
} from "@/lib/order-store";
import { log } from "@/lib/logger";
import { computeOrderTotal, validateCartStock } from "@/lib/order-pricing";
import type { OrderDraft } from "@/lib/types";
import {
  isValidCart,
  isValidIdempotencyKey,
  isValidOrderId,
  isValidTotal,
} from "@/lib/validate";

export async function GET(request: Request) {
  const userId = await getUserIdSafe();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sessionId = new URL(request.url).searchParams.get("session_id");
  if (sessionId) {
    if (sessionId.length < 8 || sessionId.length > 255) {
      return NextResponse.json(
        { error: "Invalid session id" },
        { status: 400 }
      );
    }
    const order = await findOrderByStripeSessionId(userId, sessionId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json({ data: order });
  }

  return NextResponse.json({ data: await listOrders(userId) });
}

export async function POST(request: Request) {
  const userId = await getUserIdSafe();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as Partial<OrderDraft>;
  const idempotencyKey = request.headers.get("Idempotency-Key")?.trim() ?? null;

  if (idempotencyKey !== null && !isValidIdempotencyKey(idempotencyKey)) {
    return NextResponse.json(
      { error: "Invalid Idempotency-Key header" },
      { status: 400 }
    );
  }

  if (!isValidCart(body.items)) {
    return NextResponse.json(
      { error: "Invalid order payload" },
      { status: 400 }
    );
  }

  const verifiedTotal = computeOrderTotal(body.items);
  if (verifiedTotal === null || !isValidTotal(body.total)) {
    return NextResponse.json(
      { error: "Invalid order payload" },
      { status: 400 }
    );
  }

  if (body.total !== verifiedTotal) {
    return NextResponse.json(
      { error: "Order total does not match catalog prices" },
      { status: 400 }
    );
  }

  const stock = validateCartStock(body.items);
  if (!stock.ok) {
    return NextResponse.json({ error: stock.error }, { status: 409 });
  }

  const draft: OrderDraft = {
    total: verifiedTotal,
    items: body.items,
  };

  try {
    if (idempotencyKey) {
      const { order, created } = await createOrderWithIdempotency(
        userId,
        draft,
        idempotencyKey
      );
      log("info", created ? "order.created" : "order.idempotent_replay", {
        userId,
        orderId: order.id,
        idempotencyKey,
      });
      return NextResponse.json({ data: order }, { status: created ? 201 : 200 });
    }

    const order = await createOrder(userId, draft);
    log("info", "order.created", { userId, orderId: order.id });
    return NextResponse.json({ data: order }, { status: 201 });
  } catch (error) {
    log("error", "order.create_failed", {
      userId,
      error: error instanceof Error ? error.message : "unknown",
    });
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const userId = await getUserIdSafe();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { id?: string };
  if (!body.id || !isValidOrderId(body.id)) {
    return NextResponse.json(
      { error: "Invalid order id" },
      { status: 400 }
    );
  }

  const order = await markOrderAsPaid(userId, body.id);
  if (!order) {
    return NextResponse.json(
      { error: "Order not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: order });
}
