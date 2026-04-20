import { NextResponse } from "next/server";
import { getJson, setJson } from "@/lib/redis";
import type { CartItem } from "@/lib/types";

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

export async function GET(
  _request: Request,
  context: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await context.params;
  const data = await getJson<CartItem[]>(`cart:${sessionId}`);
  return NextResponse.json({ data: data ?? [] });
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await context.params;
  const body = (await request.json()) as { items?: unknown };

  if (!isValidCart(body.items)) {
    return NextResponse.json(
      { error: "Invalid cart payload" },
      { status: 400 }
    );
  }

  await setJson(`cart:${sessionId}`, body.items, 60 * 60 * 24);
  return NextResponse.json({ data: body.items });
}
