import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createPaidOrderFromStripe } from "@/lib/order-store";
import { log } from "@/lib/logger";
import { computeOrderTotal } from "@/lib/order-pricing";
import { getStripe } from "@/lib/stripe";
import type { CartItem } from "@/lib/types";
import { isValidCart, isValidTotal } from "@/lib/validate";

export const runtime = "nodejs";

function parseCartItems(raw: string | undefined): CartItem[] | null {
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    return isValidCart(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId =
    session.metadata?.userId?.trim() ||
    session.client_reference_id?.trim() ||
    null;
  if (!userId) {
    log("error", "stripe.webhook.missing_user", { sessionId: session.id });
    return;
  }

  const items = parseCartItems(session.metadata?.items);
  if (!items) {
    log("error", "stripe.webhook.invalid_items", { sessionId: session.id });
    return;
  }

  const verifiedTotal = computeOrderTotal(items);
  const metadataTotal = Number(session.metadata?.total);
  if (
    verifiedTotal === null ||
    !isValidTotal(verifiedTotal) ||
    (Number.isFinite(metadataTotal) && metadataTotal !== verifiedTotal)
  ) {
    log("error", "stripe.webhook.total_mismatch", {
      sessionId: session.id,
      verifiedTotal,
      metadataTotal,
    });
    return;
  }

  const { order, created } = await createPaidOrderFromStripe(
    userId,
    { total: verifiedTotal, items },
    session.id
  );

  log("info", created ? "stripe.order.created" : "stripe.order.replay", {
    userId,
    orderId: order.id,
    sessionId: session.id,
  });
}

export async function POST(request: Request) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();

  if (!stripe || !webhookSecret) {
    return NextResponse.json(
      { error: "Stripe webhook is not configured" },
      { status: 503 }
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    log("error", "stripe.webhook.signature_failed", {
      error: error instanceof Error ? error.message : "unknown",
    });
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 }
    );
  }

  try {
    if (event.type === "checkout.session.completed") {
      await handleCheckoutCompleted(
        event.data.object as Stripe.Checkout.Session
      );
    }
  } catch (error) {
    log("error", "stripe.webhook.handler_failed", {
      type: event.type,
      error: error instanceof Error ? error.message : "unknown",
    });
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
