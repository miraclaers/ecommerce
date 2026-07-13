"use server";

import { getUserIdSafe } from "@/lib/auth";
import { computeOrderTotal, validateCartStock } from "@/lib/order-pricing";
import { readProductById } from "@/lib/product-data";
import { getAppUrl, getStripe, isStripeConfigured } from "@/lib/stripe";
import type { CartItem } from "@/lib/types";
import { isValidCart } from "@/lib/validate";

export type CreateCheckoutSessionResult =
  | { ok: true; url: string }
  | { ok: false; error: string; demo?: true };

/**
 * Starts a Stripe Checkout Session (test mode when using sk_test_* keys).
 * Returns `{ demo: true }` when Stripe is not configured so the pay page
 * can fall back to the local demo path (CI / local without keys).
 */
export async function createCheckoutSessionAction(
  items: CartItem[]
): Promise<CreateCheckoutSessionResult> {
  if (!isStripeConfigured()) {
    return { ok: false, error: "Stripe is not configured", demo: true };
  }

  const userId = await getUserIdSafe();
  if (!userId) {
    return { ok: false, error: "Sign in to complete payment with Stripe" };
  }

  if (!isValidCart(items) || items.length === 0) {
    return { ok: false, error: "Cart is empty or invalid" };
  }

  const stock = validateCartStock(items);
  if (!stock.ok) {
    return { ok: false, error: stock.error };
  }

  const total = computeOrderTotal(items);
  if (total === null || total <= 0) {
    return { ok: false, error: "Unable to price cart against catalog" };
  }

  const stripe = getStripe();
  if (!stripe) {
    return { ok: false, error: "Stripe is not configured", demo: true };
  }

  const lineItems = items.map((item) => {
    const product = readProductById(item.id);
    if (!product) {
      throw new Error(`Unknown product: ${item.id}`);
    }
    return {
      quantity: item.quantity,
      price_data: {
        currency: "usd",
        unit_amount: Math.round(product.price * 100),
        product_data: {
          name: product.title,
          metadata: { productId: product.id },
        },
      },
    };
  });

  const appUrl = getAppUrl();

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/checkout/error`,
      client_reference_id: userId,
      metadata: {
        userId,
        items: JSON.stringify(items),
        total: String(total),
      },
    });

    if (!session.url) {
      return { ok: false, error: "Stripe did not return a checkout URL" };
    }

    return { ok: true, url: session.url };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Failed to start Stripe Checkout",
    };
  }
}
