import { NextResponse } from "next/server";
import { getUserIdSafe } from "@/lib/auth";
import { createOrder, listOrders, markOrderAsPaid } from "@/lib/order-store";
import { log } from "@/lib/logger";
import { computeOrderTotal } from "@/lib/order-pricing";
import type { OrderDraft } from "@/lib/types";
import { isValidCart, isValidOrderId, isValidTotal } from "@/lib/validate";

export async function GET() {
  const userId = await getUserIdSafe();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ data: await listOrders(userId) });
}

export async function POST(request: Request) {
  const userId = await getUserIdSafe();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as Partial<OrderDraft>;

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

  try {
    const order = await createOrder(userId, {
      total: verifiedTotal,
      items: body.items,
    });
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
