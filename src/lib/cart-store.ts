import { getJson, setJson } from "@/lib/redis";
import type { CartItem } from "@/lib/types";
import { isValidCart, isValidSessionId } from "@/lib/validate";

const CART_TTL_SECONDS = 60 * 60 * 24;

function cartKey(sessionId: string) {
  return `cart:${sessionId}`;
}

export async function getCartItems(sessionId: string): Promise<CartItem[]> {
  if (!isValidSessionId(sessionId)) {
    return [];
  }

  const data = await getJson<CartItem[]>(cartKey(sessionId));
  return data ?? [];
}

export type SaveCartResult =
  | { ok: true; items: CartItem[] }
  | { ok: false; error: string };

export async function saveCartItems(
  sessionId: string,
  items: unknown
): Promise<SaveCartResult> {
  if (!isValidSessionId(sessionId)) {
    return { ok: false, error: "Invalid session id" };
  }

  if (!isValidCart(items)) {
    return { ok: false, error: "Invalid cart payload" };
  }

  await setJson(cartKey(sessionId), items, CART_TTL_SECONDS);
  return { ok: true, items };
}
