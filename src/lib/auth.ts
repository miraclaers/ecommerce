import { auth } from "@clerk/nextjs/server";
import { log } from "@/lib/logger";

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
