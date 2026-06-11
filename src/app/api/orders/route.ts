import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createOrder, listOrders, markOrderAsPaid } from "@/lib/order-store";
import { log } from "@/lib/logger";
import type { OrderDraft } from "@/lib/types";
import { isValidCart, isValidOrderId, isValidTotal } from "@/lib/validate";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ data: listOrders(userId) });
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as Partial<OrderDraft>;

  if (!isValidTotal(body.total) || !isValidCart(body.items)) {
    return NextResponse.json(
      { error: "Invalid order payload" },
      { status: 400 }
    );
  }

  try {
    const order = createOrder(userId, {
      total: body.total,
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
  const { userId } = await auth();
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

  const order = markOrderAsPaid(userId, body.id);
  if (!order) {
    return NextResponse.json(
      { error: "Order not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: order });
}
