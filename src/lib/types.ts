export interface Product {
  id: string;
  title: string;
  price: number;
  description: string;
  image: string;
  category: string;
  createdAt: string;
  popularity: number;
  rating: number;
  stock: number;
  discountPercent?: number;
}

export type CartItem = {
  id: string;
  quantity: number;
};

export interface Order {
  id: string;
  userId: string;
  total: number;
  date: string;
  items: CartItem[];
  status?: "processing" | "paid" | "cancelled";
  stripeSessionId?: string;
}

export type OrderDraft = {
  total: number;
  items: CartItem[];
};

export type UserRole = "user" | "admin";

export interface ChatMessage {
  id: string;
  sender: "me" | "other";
  text: string;
  sentAt: string;
  read: boolean;
}

export interface MessageThread {
  id: string;
  name: string;
  role: string;
  messages: ChatMessage[];
}
