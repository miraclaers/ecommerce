"use client";

import type { AppError } from "@/lib/errors";
import type { ApiState } from "@/lib/api-state";

type ApiStatusBannerProps<T> = {
  state: ApiState<T>;
  onRetry?: () => void;
  className?: string;
};

export default function ApiStatusBanner<T>({
  state,
  onRetry,
  className = "",
}: ApiStatusBannerProps<T>) {
  if (state.status === "loading") {
    return (
      <p
        role="status"
        className={`rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 ${className}`}
      >
        Loading…
      </p>
    );
  }

  if (state.status === "error") {
    return (
      <div
        role="alert"
        className={`rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200 ${className}`}
      >
        <p className="font-medium">{formatError(state.error)}</p>
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 text-sm font-semibold underline underline-offset-2"
          >
            Try again
          </button>
        ) : null}
      </div>
    );
  }

  return null;
}

function formatError(error: AppError): string {
  if (error.code === "TIMEOUT") {
    return "The request took too long. Check your connection and try again.";
  }
  if (error.code === "NETWORK") {
    return "Network error. Please try again.";
  }
  return error.message;
}
