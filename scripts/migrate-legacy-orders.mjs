// One-off maintenance script for the Redis -> Postgres order cutover.
//
// The live `order-store` already writes orders only to Postgres (Prisma). This
// script handles the leftover legacy data that the old Redis adapter wrote under
// `orders:user:{userId}` (indexed by `orders:users`):
//
//   1. (Phase 6.1, optional P3) Backfill those legacy orders into Postgres.
//   2. (Phase 6.1, P2) Delete the stale `orders:user:*` keys + index from Redis.
//
// It is safe to run repeatedly: backfill skips orders whose id already exists in
// Postgres, and key deletion is idempotent.
//
// Usage (PowerShell examples):
//   node scripts/migrate-legacy-orders.mjs                 # dry run (default)
//   node scripts/migrate-legacy-orders.mjs --apply         # backfill + delete keys
//   node scripts/migrate-legacy-orders.mjs --apply --keep-redis     # backfill only
//   node scripts/migrate-legacy-orders.mjs --apply --skip-backfill  # delete keys only
//
// Requires DATABASE_URL (for backfill) and REDIS_URL in the environment. The
// script auto-loads `.env.local` then `.env` if present.

import { readFileSync, existsSync } from "node:fs";
import { createClient } from "redis";
import { PrismaClient } from "@prisma/client";

const ORDERS_INDEX_KEY = "orders:users";
const userOrdersKey = (userId) => `orders:user:${userId}`;

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  const content = readFileSync(path, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    if (process.env[key] !== undefined) continue;
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const args = new Set(process.argv.slice(2));
const apply = args.has("--apply");
const skipBackfill = args.has("--skip-backfill");
const keepRedis = args.has("--keep-redis");
const dryRun = !apply;

function log(...parts) {
  console.log(...parts);
}

async function main() {
  if (!process.env.REDIS_URL) {
    throw new Error(
      "REDIS_URL is not set. Legacy orders only exist in a real Redis instance; " +
        "the in-memory fallback has nothing to migrate."
    );
  }
  if (!skipBackfill && !process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not set but backfill is enabled. Set it or pass --skip-backfill."
    );
  }

  log(
    dryRun
      ? "DRY RUN — no changes will be made. Re-run with --apply to execute."
      : "APPLY mode — changes will be written."
  );
  log(`  backfill to Postgres: ${skipBackfill ? "no" : "yes"}`);
  log(`  delete Redis keys:    ${keepRedis ? "no" : "yes"}`);
  log("");

  const redis = createClient({ url: process.env.REDIS_URL });
  redis.on("error", (err) => console.error("Redis error:", err.message));
  await redis.connect();

  const prisma = skipBackfill ? null : new PrismaClient();

  try {
    const rawIndex = await redis.get(ORDERS_INDEX_KEY);
    const userIds = rawIndex ? JSON.parse(rawIndex) : [];

    if (!Array.isArray(userIds) || userIds.length === 0) {
      log("No legacy `orders:users` index found — nothing to migrate.");
      return;
    }

    log(`Found ${userIds.length} user(s) with legacy orders.\n`);

    let totalOrders = 0;
    let backfilled = 0;
    let skipped = 0;
    const keysToDelete = [];

    for (const userId of userIds) {
      const key = userOrdersKey(userId);
      const rawOrders = await redis.get(key);
      const orders = rawOrders ? JSON.parse(rawOrders) : [];
      keysToDelete.push(key);

      if (!Array.isArray(orders) || orders.length === 0) {
        log(`  ${key}: (empty)`);
        continue;
      }

      totalOrders += orders.length;
      log(`  ${key}: ${orders.length} order(s)`);

      if (skipBackfill) continue;

      for (const order of orders) {
        const existing = await prisma.order.findUnique({
          where: { id: order.id },
        });
        if (existing) {
          skipped += 1;
          continue;
        }
        if (dryRun) {
          backfilled += 1;
          continue;
        }
        await prisma.order.create({
          data: {
            id: order.id,
            userId: order.userId ?? userId,
            total: order.total,
            status: order.status ?? "processing",
            createdAt: order.date ? new Date(order.date) : new Date(),
            items: {
              create: (order.items ?? []).map((item) => ({
                productId: item.id,
                quantity: item.quantity,
              })),
            },
          },
        });
        backfilled += 1;
      }
    }

    log("");
    if (!skipBackfill) {
      log(
        dryRun
          ? `Backfill (dry run): ${backfilled} would be inserted, ${skipped} already in Postgres (of ${totalOrders} legacy).`
          : `Backfill: ${backfilled} inserted, ${skipped} already in Postgres (of ${totalOrders} legacy).`
      );
    }

    if (!keepRedis) {
      keysToDelete.push(ORDERS_INDEX_KEY);
      if (dryRun) {
        log(`Cleanup (dry run): would delete ${keysToDelete.length} Redis key(s):`);
        for (const key of keysToDelete) log(`    - ${key}`);
      } else {
        const deleted = await redis.del(keysToDelete);
        log(`Cleanup: deleted ${deleted} Redis key(s).`);
      }
    }

    log("\nDone.");
  } finally {
    await redis.quit();
    if (prisma) await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
