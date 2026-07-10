import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const authState = vi.hoisted(() => ({
  userId: null as string | null,
}));

const stripeState = vi.hoisted(() => ({
  configured: false,
  createSession: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  getUserIdSafe: async () => authState.userId,
}));

vi.mock("@/lib/stripe", () => ({
  isStripeConfigured: () => stripeState.configured,
  getStripe: () =>
    stripeState.configured
      ? {
          checkout: {
            sessions: {
              create: stripeState.createSession,
            },
          },
        }
      : null,
  getAppUrl: () => "http://localhost:3000",
}));

import { createCheckoutSessionAction } from "./checkout";

describe("createCheckoutSessionAction", () => {
  beforeEach(() => {
    authState.userId = "user-a";
    stripeState.configured = false;
    stripeState.createSession.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns demo mode when Stripe is not configured", async () => {
    const result = await createCheckoutSessionAction([
      { id: "1", quantity: 1 },
    ]);

    expect(result).toEqual({
      ok: false,
      error: "Stripe is not configured",
      demo: true,
    });
  });

  it("requires sign-in when Stripe is configured", async () => {
    stripeState.configured = true;
    authState.userId = null;

    const result = await createCheckoutSessionAction([
      { id: "1", quantity: 1 },
    ]);

    expect(result).toEqual({
      ok: false,
      error: "Sign in to complete payment with Stripe",
    });
  });

  it("creates a Checkout Session and returns the URL", async () => {
    stripeState.configured = true;
    stripeState.createSession.mockResolvedValue({
      url: "https://checkout.stripe.com/c/test_123",
    });

    const result = await createCheckoutSessionAction([
      { id: "1", quantity: 2 },
    ]);

    expect(result).toEqual({
      ok: true,
      url: "https://checkout.stripe.com/c/test_123",
    });
    expect(stripeState.createSession).toHaveBeenCalledOnce();
  });
});
