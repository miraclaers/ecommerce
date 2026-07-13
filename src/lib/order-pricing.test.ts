import { describe, it, expect } from "vitest";
import {
  computeOrderTotal,
  validateCartStock,
  verifyOrderTotal,
} from "./order-pricing";

describe("order-pricing", () => {
  describe("computeOrderTotal", () => {
    it("sums catalog prices for valid cart items", () => {
      expect(computeOrderTotal([{ id: "1", quantity: 2 }])).toBe(258);
      expect(
        computeOrderTotal([
          { id: "1", quantity: 1 },
          { id: "2", quantity: 1 },
        ])
      ).toBe(278);
    });

    it("returns null when a product id is unknown", () => {
      expect(computeOrderTotal([{ id: "999", quantity: 1 }])).toBeNull();
    });

    it("returns zero for an empty cart", () => {
      expect(computeOrderTotal([])).toBe(0);
    });
  });

  describe("verifyOrderTotal", () => {
    it("accepts totals that match the catalog", () => {
      expect(verifyOrderTotal(129, [{ id: "1", quantity: 1 }])).toBe(true);
    });

    it("rejects tampered totals", () => {
      expect(verifyOrderTotal(1, [{ id: "1", quantity: 1 }])).toBe(false);
    });

    it("rejects totals when items reference unknown products", () => {
      expect(verifyOrderTotal(100, [{ id: "999", quantity: 1 }])).toBe(false);
    });
  });

  describe("validateCartStock", () => {
    it("accepts quantities within catalog stock", () => {
      expect(validateCartStock([{ id: "1", quantity: 2 }])).toEqual({
        ok: true,
      });
      expect(validateCartStock([{ id: "3", quantity: 8 }])).toEqual({
        ok: true,
      });
    });

    it("rejects quantities above available stock", () => {
      expect(validateCartStock([{ id: "3", quantity: 9 }])).toEqual({
        ok: false,
        error:
          "Insufficient stock for Gaming Mouse Pad: requested 9, available 8",
      });
    });

    it("rejects unknown products", () => {
      expect(validateCartStock([{ id: "999", quantity: 1 }])).toEqual({
        ok: false,
        error: "Unknown product: 999",
      });
    });
  });
});
