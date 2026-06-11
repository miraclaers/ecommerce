import { describe, it, expect } from "vitest";
import {
  isValidSessionId,
  isValidCategory,
  isValidProductId,
  isValidCart,
  isValidTotal,
  isValidOrderId,
} from "./validate";

describe("validate", () => {
  describe("isValidSessionId", () => {
    it("accepts a UUID", () => {
      expect(isValidSessionId("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
    });

    it("rejects malformed or oversized values", () => {
      expect(isValidSessionId("not-a-uuid")).toBe(false);
      expect(isValidSessionId("a".repeat(40))).toBe(false);
    });
  });

  describe("isValidCategory", () => {
    it("accepts known categories", () => {
      expect(isValidCategory("Audio")).toBe(true);
    });

    it("rejects unknown categories", () => {
      expect(isValidCategory("Injected")).toBe(false);
      expect(isValidCategory("")).toBe(false);
    });
  });

  describe("isValidProductId", () => {
    it("accepts known product ids", () => {
      expect(isValidProductId("1")).toBe(true);
    });

    it("rejects unknown ids", () => {
      expect(isValidProductId("999")).toBe(false);
    });
  });

  describe("isValidCart", () => {
    it("accepts a valid cart", () => {
      expect(isValidCart([{ id: "1", quantity: 2 }])).toBe(true);
    });

    it("accepts an empty cart", () => {
      expect(isValidCart([])).toBe(true);
    });

    it("rejects invalid quantities and product ids", () => {
      expect(isValidCart([{ id: "1", quantity: 0 }])).toBe(false);
      expect(isValidCart([{ id: "1", quantity: 1.5 }])).toBe(false);
      expect(isValidCart([{ id: "bad", quantity: 1 }])).toBe(false);
    });
  });

  describe("isValidTotal", () => {
    it("accepts finite positive totals", () => {
      expect(isValidTotal(129)).toBe(true);
    });

    it("rejects NaN, Infinity, zero, and negatives", () => {
      expect(isValidTotal(Number.NaN)).toBe(false);
      expect(isValidTotal(Number.POSITIVE_INFINITY)).toBe(false);
      expect(isValidTotal(0)).toBe(false);
      expect(isValidTotal(-10)).toBe(false);
    });
  });

  describe("isValidOrderId", () => {
    it("accepts UUID order ids", () => {
      expect(isValidOrderId("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
    });

    it("rejects arbitrary strings", () => {
      expect(isValidOrderId("order-1")).toBe(false);
    });
  });
});
