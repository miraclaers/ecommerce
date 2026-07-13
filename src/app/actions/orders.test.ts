import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const authState = vi.hoisted(() => ({
  userId: null as string | null,
}));

const cancelState = vi.hoisted(() => ({
  result: null as
    | { ok: true; order: { id: string; status: string } }
    | { ok: false; error: string; notFound?: true }
    | null,
}));

vi.mock("@/lib/auth", () => ({
  getUserIdSafe: async () => authState.userId,
}));

vi.mock("@/lib/order-store", () => ({
  cancelOrder: async () => cancelState.result,
}));

import { cancelOrderAction } from "./orders";

const validOrderId = "11111111-1111-4111-8111-111111111111";

describe("cancelOrderAction", () => {
  beforeEach(() => {
    authState.userId = "user-a";
    cancelState.result = {
      ok: true,
      order: { id: validOrderId, status: "cancelled" },
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("requires sign-in", async () => {
    authState.userId = null;

    await expect(cancelOrderAction(validOrderId)).resolves.toEqual({
      ok: false,
      error: "Sign in to cancel an order",
    });
  });

  it("rejects an invalid order id", async () => {
    await expect(cancelOrderAction("not-a-uuid")).resolves.toEqual({
      ok: false,
      error: "Invalid order id",
    });
  });

  it("cancels a processing order for the signed-in user", async () => {
    const result = await cancelOrderAction(validOrderId);

    expect(result).toEqual({
      ok: true,
      order: { id: validOrderId, status: "cancelled" },
    });
  });

  it("surfaces store errors", async () => {
    cancelState.result = {
      ok: false,
      error: "Paid orders cannot be cancelled from this flow",
    };

    await expect(cancelOrderAction(validOrderId)).resolves.toEqual({
      ok: false,
      error: "Paid orders cannot be cancelled from this flow",
    });
  });
});
