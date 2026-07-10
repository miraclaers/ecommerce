import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const authState = vi.hoisted(() => ({
  userId: null as string | null,
}));

const stripeState = vi.hoisted(() => ({
  configured: false,
  constructEvent: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  getUserIdSafe: async () => authState.userId,
}));

vi.mock("@/lib/logger", () => ({
  log: vi.fn(),
}));

vi.mock("@/lib/stripe", () => ({
  isStripeConfigured: () => stripeState.configured,
  getStripe: () =>
    stripeState.configured
      ? {
          webhooks: {
            constructEvent: stripeState.constructEvent,
          },
        }
      : null,
  getAppUrl: () => "http://localhost:3000",
}));

const orderStore = vi.hoisted(() => ({
  createPaidOrderFromStripe: vi.fn(),
}));

vi.mock("@/lib/order-store", () => ({
  createPaidOrderFromStripe: (...args: unknown[]) =>
    orderStore.createPaidOrderFromStripe(...args),
}));

describe("Stripe webhook", () => {
  beforeEach(() => {
    authState.userId = "user-a";
    stripeState.configured = true;
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
    stripeState.constructEvent.mockReset();
    orderStore.createPaidOrderFromStripe.mockReset();
    orderStore.createPaidOrderFromStripe.mockResolvedValue({
      order: {
        id: "order-1",
        userId: "user-a",
        total: 258,
        date: new Date().toISOString(),
        status: "paid",
        items: [{ id: "1", quantity: 2 }],
        stripeSessionId: "cs_test_1",
      },
      created: true,
    });
  });

  afterEach(() => {
    delete process.env.STRIPE_WEBHOOK_SECRET;
    vi.resetModules();
  });

  it("returns 503 when Stripe is not configured", async () => {
    stripeState.configured = false;
    const { POST } = await import("./route");

    const res = await POST(
      new Request("http://localhost/api/webhooks/stripe", {
        method: "POST",
        body: "{}",
      })
    );

    expect(res.status).toBe(503);
  });

  it("returns 400 when the signature header is missing", async () => {
    const { POST } = await import("./route");

    const res = await POST(
      new Request("http://localhost/api/webhooks/stripe", {
        method: "POST",
        body: "{}",
      })
    );

    expect(res.status).toBe(400);
  });

  it("creates a paid order on checkout.session.completed", async () => {
    stripeState.constructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test_1",
          metadata: {
            userId: "user-a",
            items: JSON.stringify([{ id: "1", quantity: 2 }]),
            total: "258",
          },
          client_reference_id: "user-a",
        },
      },
    });

    const { POST } = await import("./route");
    const res = await POST(
      new Request("http://localhost/api/webhooks/stripe", {
        method: "POST",
        headers: { "stripe-signature": "sig_test" },
        body: "{}",
      })
    );

    expect(res.status).toBe(200);
    expect(orderStore.createPaidOrderFromStripe).toHaveBeenCalledWith(
      "user-a",
      { total: 258, items: [{ id: "1", quantity: 2 }] },
      "cs_test_1"
    );
  });
});
