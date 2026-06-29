import type { captureRouterTransitionStart } from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

let sentryPromise: Promise<typeof import("@sentry/nextjs")> | null = null;

// Load (and initialize) the Sentry client SDK on demand. The dynamic import
// keeps `@sentry/nextjs` out of the critical initial client bundle and pulls it
// in as a separate async chunk only when needed.
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

// Warm the SDK once the browser is idle so it is ready for later errors and
// navigations without competing with first paint. Skipped entirely when no DSN
// is configured (e.g. local dev, CI), so those builds never download Sentry.
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
