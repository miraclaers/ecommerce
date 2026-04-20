import type { Product } from "@/lib/types";

const PRODUCTS: Product[] = [
  {
    id: "1",
    title: "Wireless Headphones",
    price: 129,
    description:
      "Over-ear wireless headphones with clear audio and active noise canceling.",
    image: "/products/headphones.jpg",
    category: "Audio",
    createdAt: "2026-02-05",
    popularity: 92,
    rating: 4.6,
    discountPercent: 15,
  },
  {
    id: "2",
    title: "Mechanical Keyboard",
    price: 149,
    description:
      "Tactile mechanical keyboard with durable switches and customizable RGB lighting.",
    image: "/products/keyboard.jpg",
    category: "Peripherals",
    createdAt: "2026-02-18",
    popularity: 88,
    rating: 4.3,
    discountPercent: 20,
  },
  {
    id: "3",
    title: "Gaming Mouse Pad",
    price: 39,
    description:
      "Large gaming mouse pad with smooth tracking, stitched edges, and spill resistance.",
    image: "/products/mousepad.jpg",
    category: "Accessories",
    createdAt: "2026-01-26",
    popularity: 73,
    rating: 4.9,
    discountPercent: 35,
  },
];

export function listProducts(): Product[] {
  return PRODUCTS;
}

export function readProductById(id: string): Product | undefined {
  return PRODUCTS.find((product) => product.id === id);
}
