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
  discountPercent?: number;
}

export type CartItem = {
  id: string;
  quantity: number;
};

export interface Order {
  id: string;
  total: number;
  date: string;
  items: CartItem[];
  status?: "processing" | "paid";
}

export type OrderDraft = {
  total: number;
  items: CartItem[];
};

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
