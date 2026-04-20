import { createClient, type RedisClientType } from "redis";

const memoryStore = new Map<string, string>();
let client: RedisClientType | null = null;

function canUseRedis() {
  return Boolean(process.env.REDIS_URL);
}

async function getClient() {
  if (!canUseRedis()) {
    return null;
  }
  if (!client) {
    client = createClient({ url: process.env.REDIS_URL });
    client.on("error", () => {
      // Silent fallback to in-memory behavior in local environments.
    });
    await client.connect();
  }
  return client;
}

export async function setJson(
  key: string,
  value: unknown,
  ttlSeconds?: number
) {
  const serialized = JSON.stringify(value);
  const redis = await getClient();

  if (!redis) {
    memoryStore.set(key, serialized);
    return;
  }

  if (ttlSeconds && ttlSeconds > 0) {
    await redis.set(key, serialized, { EX: ttlSeconds });
    return;
  }
  await redis.set(key, serialized);
}

export async function getJson<T>(key: string): Promise<T | null> {
  const redis = await getClient();
  const raw = redis ? await redis.get(key) : memoryStore.get(key) ?? null;
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}
