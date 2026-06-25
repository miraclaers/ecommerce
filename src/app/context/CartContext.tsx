"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { fetchRemoteCart, syncRemoteCart } from "../../lib/api-client";
import type { CartItem } from "@/lib/types";

import {
  addToCart as addToCartLogic,
  removeFromCart as removeFromCartLogic,
  increaseQuantity as increaseQuantityLogic,
  decreaseQuantity as decreaseQuantityLogic,
  clearCart as clearCartLogic,
} from "../../lib/cart-logic" ;


export type CartContextType = {
  cart: CartItem[];
  addToCart: (id: string) => void;
  removeFromCart: (id: string) => void;
  increaseQuantity: (id: string) => void;
  decreaseQuantity: (id: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(
  undefined
);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const hasLoaded = useRef(false);
  const storageKey = "minishop_cart";
  const sessionStorageKey = "minishop_cart_session";
  const cartSessionRef = useRef<string | null>(null);

  useEffect(() => {
    const existingSession = localStorage.getItem(sessionStorageKey);
    const sessionId = existingSession ?? crypto.randomUUID();
    if (!existingSession) {
      localStorage.setItem(sessionStorageKey, sessionId);
    }
    cartSessionRef.current = sessionId;

    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrating persisted cart from localStorage on mount
        setCart(
          parsed.filter(
            (item: CartItem) =>
              item &&
              typeof item.id === "string" &&
              typeof item.quantity === "number"
          )
        );
      }
    } catch {
      // Ignore corrupted storage values
    } finally {
      hasLoaded.current = true;
    }

    fetchRemoteCart(sessionId)
      .then((remoteItems) => {
        if (remoteItems.length > 0) {
          setCart(remoteItems);
        }
      })
      .catch(() => {
        // Demo mode: keep local cart when API/Redis is unavailable.
      });
  }, []);

  useEffect(() => {
    if (!hasLoaded.current) return;
    localStorage.setItem(storageKey, JSON.stringify(cart));
    if (!cartSessionRef.current) return;
    syncRemoteCart(cartSessionRef.current, cart).catch(() => {
      // Demo mode fallback.
    });
  }, [cart]);

  const addToCart = (id: string) => {
    setCart(addToCartLogic(cart, id));
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => removeFromCartLogic(prev, id));
  };

  const increaseQuantity = (id: string) => {
    setCart((prev) => increaseQuantityLogic(prev, id));
  };

  const decreaseQuantity = (id: string) => {
    setCart((prev) => decreaseQuantityLogic(prev, id));
  };

  const clearCart = () => {
    setCart(clearCartLogic());
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error(
      "useCart must be used within a CartProvider"
    );
  }
  return context;
}
