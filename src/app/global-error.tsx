"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    void import("@sentry/nextjs").then((Sentry) =>
      Sentry.captureException(error)
    );
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-white p-8 text-center dark:bg-zinc-950">
        <h1 className="text-2xl font-bold">Application error</h1>
        <p className="mt-2 text-sm text-zinc-600">{error.message}</p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-lg bg-accent px-4 py-2 text-sm text-white"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
