import { NextResponse } from "next/server";
import { getCartItems, saveCartItems } from "@/lib/cart-store";
import { isValidSessionId } from "@/lib/validate";

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

  return NextResponse.json({ data: await getCartItems(sessionId) });
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await context.params;
  const body = (await request.json()) as { items?: unknown };
  const result = await saveCartItems(sessionId, body.items);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ data: result.items });
}
