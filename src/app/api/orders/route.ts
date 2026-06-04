import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createOrder, listOrders, markOrderAsPaid } from "@/lib/order-store";
import { log } from "@/lib/logger";
import type { CartItem, OrderDraft } from "@/lib/types";

function isValidCart(items: unknown): items is CartItem[] {
  return (
    Array.isArray(items) &&
    items.every(
      (item) =>
        item &&
        typeof item === "object" &&
        typeof item.id === "string" &&
        typeof item.quantity === "number"
    )
  );
}

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

  if (
    typeof body.total !== "number" ||
    Number.isNaN(body.total) ||
    !isValidCart(body.items)
  ) {
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
  if (!body.id) {
    return NextResponse.json(
      { error: "Missing order id" },
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
