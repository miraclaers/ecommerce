import { listProducts, readProductById } from "@/lib/product-data";
import type { Product } from "@/lib/types";

export type { Product };

export function getProducts(): Product[] {
  return listProducts();
}

export function getProductById(id: string): Product | undefined {
  return readProductById(id);
}

