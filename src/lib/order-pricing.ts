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
