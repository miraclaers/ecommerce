import { readProductById } from "@/lib/product-data";
import type { CartItem } from "@/lib/types";

export function computeOrderTotal(items: CartItem[]): number | null {
  let total = 0;

  for (const item of items) {
    const product = readProductById(item.id);
    if (!product) {
      return null;
    }
    total += product.price * item.quantity;
  }

  return total;
}

export function verifyOrderTotal(
  clientTotal: number,
  items: CartItem[]
): boolean {
  const expected = computeOrderTotal(items);
  if (expected === null) {
    return false;
  }
  return clientTotal === expected;
}

export type StockValidationResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Rejects carts that request more units than the catalog stock allows.
 * Does not mutate inventory — validation only against static product stock.
 */
export function validateCartStock(items: CartItem[]): StockValidationResult {
  for (const item of items) {
    const product = readProductById(item.id);
    if (!product) {
      return { ok: false, error: `Unknown product: ${item.id}` };
    }
    if (item.quantity > product.stock) {
      return {
        ok: false,
        error: `Insufficient stock for ${product.title}: requested ${item.quantity}, available ${product.stock}`,
      };
    }
  }
  return { ok: true };
}
