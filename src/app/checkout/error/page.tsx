import Link from "next/link";

export default function CheckoutErrorPage() {
  return (
    <main className="p-8 text-center">
      <h1 className="text-2xl font-bold text-red-600 mb-4">
        Payment failed
      </h1>

      <p className="mb-6 text-zinc-700 dark:text-zinc-300">
        Something went wrong. Please try again.
      </p>

      <Link
        href="/checkout"
        className="text-violet-600 underline"
      >
        Back to checkout
      </Link>
    </main>
  );
}
