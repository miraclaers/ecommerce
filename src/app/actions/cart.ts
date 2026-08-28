"use server";

import { saveCartItems } from "@/lib/cart-store";
import type { CartItem } from "@/lib/types";

export type SyncCartResult =
  | { ok: true; items: CartItem[] }
  | { ok: false; error: string };

export async function syncCartAction(
  sessionId: string,
  items: CartItem[]
): Promise<SyncCartResult> {
  return saveCartItems(sessionId, items);
}
