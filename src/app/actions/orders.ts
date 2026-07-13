"use server";

import { getUserIdSafe } from "@/lib/auth";
import { cancelOrder } from "@/lib/order-store";
import type { Order } from "@/lib/types";
import { isValidOrderId } from "@/lib/validate";

export type CancelOrderActionResult =
  | { ok: true; order: Order }
  | { ok: false; error: string };

/**
 * Cancels a processing order for the signed-in user (My Purchases).
 */
export async function cancelOrderAction(
  orderId: string
): Promise<CancelOrderActionResult> {
  const userId = await getUserIdSafe();
  if (!userId) {
    return { ok: false, error: "Sign in to cancel an order" };
  }

  if (!isValidOrderId(orderId)) {
    return { ok: false, error: "Invalid order id" };
  }

  const result = await cancelOrder(userId, orderId);
  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  return { ok: true, order: result.order };
}
