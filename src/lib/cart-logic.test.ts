import { describe, it, expect } from "vitest";
import {
  addToCart,
  removeFromCart,
  increaseQuantity,
  decreaseQuantity,
  clearCart,
  type CartItem,
} from "./cart-logic";

describe("cart logic", () => {
  it("adds a new item with quantity 1", () => {
    const cart: CartItem[] = [];
    const result = addToCart(cart, "p1");

    expect(result).toEqual([{ id: "p1", quantity: 1 }]);
  });

  it("adds same item twice and increases quantity", () => {
    const cart: CartItem[] = [{ id: "p1", quantity: 1 }];
    const result = addToCart(cart, "p1");

    expect(result).toEqual([{ id: "p1", quantity: 2 }]);
  });

  it("removes an item", () => {
    const cart: CartItem[] = [{ id: "p1", quantity: 2 }];
    const result = removeFromCart(cart, "p1");

    expect(result).toEqual([]);
  });

  it("increases quantity", () => {
    const cart: CartItem[] = [{ id: "p1", quantity: 1 }];
    const result = increaseQuantity(cart, "p1");

    expect(result).toEqual([{ id: "p1", quantity: 2 }]);
  });

  it("decreases quantity and removes item at zero", () => {
    const cart: CartItem[] = [{ id: "p1", quantity: 1 }];
    const result = decreaseQuantity(cart, "p1");

    expect(result).toEqual([]);
  });

  it("clears cart", () => {
    const cart: CartItem[] = [{ id: "p1", quantity: 3 }];
    const result = clearCart();

    expect(result).toEqual([]);
    expect(cart).toEqual([{ id: "p1", quantity: 3 }]); // old cart unchanged
  });
});