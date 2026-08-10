import type { captureRouterTransitionStart } from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

let sentryPromise: Promise<typeof import("@sentry/nextjs")> | null = null;

function loadSentry() {
  if (!sentryPromise) {
    sentryPromise = import("@sentry/nextjs").then((Sentry) => {
      Sentry.init({
        dsn: SENTRY_DSN,
        enabled: Boolean(SENTRY_DSN),
        tracesSampleRate: 0.1,
      });
      return Sentry;
    });
  }
  return sentryPromise;
}

if (typeof window !== "undefined" && SENTRY_DSN) {
  const schedule =
    window.requestIdleCallback ??
    ((cb: () => void) => window.setTimeout(cb, 1500));
  schedule(() => {
    void loadSentry();
  });
}

export const onRouterTransitionStart: typeof captureRouterTransitionStart = (
  ...args
) => {
  void loadSentry().then((Sentry) =>
    Sentry.captureRouterTransitionStart(...args)
  );
};
