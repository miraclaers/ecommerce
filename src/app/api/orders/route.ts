import { NextResponse } from "next/server";
import { createOrder, listOrders, markOrderAsPaid } from "@/lib/order-store";
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
  return NextResponse.json({ data: listOrders() });
}

export async function POST(request: Request) {
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

  const order = createOrder({
    total: body.total,
    items: body.items,
  });

  return NextResponse.json({ data: order }, { status: 201 });
}

export async function PATCH(request: Request) {
  const body = (await request.json()) as { id?: string };
  if (!body.id) {
    return NextResponse.json(
      { error: "Missing order id" },
      { status: 400 }
    );
  }

  const order = markOrderAsPaid(body.id);
  if (!order) {
    return NextResponse.json(
      { error: "Order not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: order });
}
