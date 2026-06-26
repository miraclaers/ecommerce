import { auth } from "@clerk/nextjs/server";
import { log } from "@/lib/logger";

/**
 * Resolve the current user id without letting a Clerk failure crash the route.
 *
 * `auth()` can throw under load (handshake/network hiccups, misconfigured keys).
 * When that happens we treat the request as unauthenticated and return null so
 * the caller can respond with a clean 401 instead of an unhandled 500.
 */
export async function getUserIdSafe(): Promise<string | null> {
  try {
    const { userId } = await auth();
    return userId ?? null;
  } catch (error) {
    log("error", "auth.resolve_failed", {
      error: error instanceof Error ? error.message : "unknown",
    });
    return null;
  }
}
