"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SignInButton, useAuth } from "@clerk/nextjs";
import { createCheckoutSessionAction } from "@/app/actions/checkout";
import { useCart } from "@/app/context/CartContext";

export default function PayPage() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { cart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await createCheckoutSessionAction(cart);

      if (result.ok) {
        window.location.href = result.url;
        return;
      }

      if (result.demo) {
        // Local/CI without Stripe keys — keep the demo path working.
        router.push("/checkout/success");
        return;
      }

      setError(result.error);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg p-4 sm:p-8">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 text-accent">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-8 w-8"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 7h16M4 11h16M6 7v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7" />
            <path d="M9 15h6" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold">Review and pay</h1>
        <p className="mt-2 text-gray-600 dark:text-zinc-300">
          Stripe Checkout in test mode when keys are set; otherwise a local demo
          path completes the order for CI and offline work.
        </p>

        <div className="mt-6 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-4 text-left">
          <p className="text-sm text-gray-500 dark:text-zinc-400">Payment method</p>
          <p className="font-semibold">Stripe test card **** 4242</p>
        </div>

        {error ? (
          <p className="mt-4 text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
            {!isSignedIn ? (
              <>
                {" "}
                <SignInButton mode="modal">
                  <button className="underline">Sign in</button>
                </SignInButton>
              </>
            ) : null}
          </p>
        ) : null}

        <button
          onClick={() => void handlePayment()}
          disabled={loading || cart.length === 0}
          className="mt-6 w-full bg-accent text-white px-6 py-3 rounded-lg hover:brightness-110 transition disabled:opacity-50"
        >
          {loading ? "Processing..." : "Confirm payment"}
        </button>

        <p className="mt-4 text-xs text-gray-500 dark:text-zinc-400">
          Test mode only. Live charges are never taken in this portfolio app.
        </p>
      </div>
    </div>
  );
}
