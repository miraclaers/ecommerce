

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
    price: 120,
    description: "High-quality wireless headphones with noise cancellation.",
    image: "/products/headphones.jpg",
  },
  {
    id: "2",
    title: "Mechanical Keyboard",
    price: 200,
    description: "Mechanical keyboard with customizable RGB lighting.",
    image: "/products/keyboard.jpg",
  },
  {
    id: "3",
    title: "Gaming Mouse Pad",
    price: 70,
    description: "Gaming mouse pad with resistent fiber and anti-liquid properties",
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

