"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PayPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handlePayment = () => {
    setLoading(true);

    setTimeout(() => {
      const success = Math.random() > 0.5;
      router.push(success ? "/checkout/success" : "/checkout/error");
    }, 1500);
  };

  return (
    <main className="p-8 max-w-lg mx-auto">
      <div className="border rounded-2xl p-8 bg-white shadow-sm text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-600/10 text-violet-700">
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
        <p className="mt-2 text-gray-600">
          Secure checkout powered by a demo flow. Click confirm to simulate payment.
        </p>

        <div className="mt-6 rounded-xl border bg-zinc-50 p-4 text-left">
          <p className="text-sm text-gray-500">Payment method</p>
          <p className="font-semibold">Demo card •••• 4242</p>
        </div>

        <button
          onClick={handlePayment}
          disabled={loading}
          className="mt-6 w-full bg-violet-600 text-white px-6 py-3 rounded-lg hover:bg-violet-700 transition disabled:opacity-50"
        >
          {loading ? "Processing..." : "Confirm payment"}
        </button>

        <p className="mt-4 text-xs text-gray-500">
          This is a demo checkout. No real payment is processed.
        </p>
      </div>
    </main>
  );
}
