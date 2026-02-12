

export interface Product {
  id: string;
  title: string;
  price: number;
  description: string;
  image : string;
}

/**
 * Fake product database
 */
const PRODUCTS: Product[] = [
  {
    id: "1",
    title: "Wireless Headphones",
    price: 129,
    description: "Over-ear wireless headphones with clear audio and active noise canceling.",
    image: "/products/headphones.jpg",
  },
  {
    id: "2",
    title: "Mechanical Keyboard",
    price: 149,
    description: "Tactile mechanical keyboard with durable switches and customizable RGB lighting.",
    image: "/products/keyboard.jpg",
  },
  {
    id: "3",
    title: "Gaming Mouse Pad",
    price: 39,
    description: "Large gaming mouse pad with smooth tracking, stitched edges, and spill resistance.",
    image: "/products/mousepad.jpg",
  },
];

/**
 * Return all products
 */
export function getProducts(): Product[] {
  return PRODUCTS;
}

/**
 * Return a product by id
 */
export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find(product => product.id === id);
}

