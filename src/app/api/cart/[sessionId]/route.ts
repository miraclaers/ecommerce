import { NextResponse } from "next/server";
import { getJson, setJson } from "@/lib/redis";
import type { CartItem } from "@/lib/types";
import { isValidCart, isValidSessionId } from "@/lib/validate";

export async function GET(
  _request: Request,
  context: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await context.params;

  if (!isValidSessionId(sessionId)) {
    return NextResponse.json(
      { error: "Invalid session id" },
      { status: 400 }
    );
  }

  const data = await getJson<CartItem[]>(`cart:${sessionId}`);
  return NextResponse.json({ data: data ?? [] });
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await context.params;

  if (!isValidSessionId(sessionId)) {
    return NextResponse.json(
      { error: "Invalid session id" },
      { status: 400 }
    );
  }

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
