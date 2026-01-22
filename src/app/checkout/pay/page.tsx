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

      if (success) {
        router.push("/checkout/success");
      } else {
        router.push("/checkout/error");
      }
    }, 1500);
  };

  return (
    <main className="p-8 max-w-md mx-auto text-center">
      <h1 className="text-2xl font-bold mb-6">Processing payment</h1>

      <button
        onClick={handlePayment}
        disabled={loading}
        className="bg-violet-600 text-white px-6 py-3 rounded-lg hover:bg-violet-700 disabled:opacity-50"
      >
        {loading ? "Processing..." : "Confirm payment"}
      </button>
    </main>
  );
}
