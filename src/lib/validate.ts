import { listProducts } from "@/lib/product-data";
import type { CartItem } from "@/lib/types";

const VALID_CATEGORIES = new Set(listProducts().map((p) => p.category));
const VALID_PRODUCT_IDS = new Set(listProducts().map((p) => p.id));

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const MAX_CART_ITEMS = 50;
export const MAX_ITEM_QUANTITY = 99;
export const MAX_ORDER_TOTAL = 1_000_000;
export const MAX_GRAPHQL_QUERY_LENGTH = 2000;
export const MAX_GRAPHQL_QUERY_DEPTH = 10;

export function isValidUuid(value: string): boolean {
  return value.length <= 36 && UUID_REGEX.test(value);
}

export function isValidSessionId(sessionId: string): boolean {
  return isValidUuid(sessionId);
}

export function isValidOrderId(orderId: string): boolean {
  return isValidUuid(orderId);
}

export function isValidCategory(category: string): boolean {
  return category.length > 0 && category.length <= 50 && VALID_CATEGORIES.has(category);
}

export function isValidProductId(id: string): boolean {
  return id.length > 0 && id.length <= 20 && VALID_PRODUCT_IDS.has(id);
}

export function isValidCart(items: unknown): items is CartItem[] {
  if (!Array.isArray(items) || items.length > MAX_CART_ITEMS) {
    return false;
  }

  return items.every(
    (item) =>
      item &&
      typeof item === "object" &&
      typeof item.id === "string" &&
      isValidProductId(item.id) &&
      typeof item.quantity === "number" &&
      Number.isInteger(item.quantity) &&
      item.quantity > 0 &&
      item.quantity <= MAX_ITEM_QUANTITY
  );
}

export function isValidTotal(total: unknown): total is number {
  return (
    typeof total === "number" &&
    Number.isFinite(total) &&
    total > 0 &&
    total <= MAX_ORDER_TOTAL
  );
}
