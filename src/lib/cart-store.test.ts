import { describe, it, expect, beforeEach } from "vitest";
import { getCartItems, saveCartItems } from "./cart-store";

const sessionId = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";

describe("cart-store", () => {
  beforeEach(async () => {
    await saveCartItems(sessionId, []);
  });

  it("round-trips cart items for a valid session", async () => {
    const items = [{ id: "1", quantity: 2 }];

    const saved = await saveCartItems(sessionId, items);
    expect(saved).toEqual({ ok: true, items });

    const loaded = await getCartItems(sessionId);
    expect(loaded).toEqual(items);
  });

  it("rejects invalid session ids", async () => {
    const result = await saveCartItems("not-a-uuid", [{ id: "p1", quantity: 1 }]);
    expect(result).toEqual({ ok: false, error: "Invalid session id" });
    expect(await getCartItems("not-a-uuid")).toEqual([]);
  });

  it("rejects invalid cart payloads", async () => {
    const result = await saveCartItems(sessionId, [{ id: "not-in-catalog", quantity: 1 }]);
    expect(result).toEqual({ ok: false, error: "Invalid cart payload" });
  });
});
