import { AppError, fromResponse } from "@/lib/errors";

const RETRYABLE_STATUSES = new Set([429, 502, 503]);
const DEFAULT_TIMEOUT_MS = 8_000;
const DEFAULT_MAX_RETRIES = 2;

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type RequestOptions = {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: unknown;
  timeoutMs?: number;
  maxRetries?: number;
  signal?: AbortSignal;
};

let authHeaderProvider: (() => Promise<Record<string, string>>) | null = null;

export function setAuthHeaderProvider(
  provider: (() => Promise<Record<string, string>>) | null
): void {
  authHeaderProvider = provider;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableStatus(status: number): boolean {
  return RETRYABLE_STATUSES.has(status);
}

async function parseJsonBody<T>(response: Response): Promise<T> {
  try {
    return (await response.json()) as T;
  } catch (cause) {
    throw new AppError("Failed to parse response JSON", {
      code: "PARSE",
      status: response.status,
      cause,
    });
  }
}

export async function request<T>(
  url: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    method = "GET",
    headers = {},
    body,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    maxRetries = DEFAULT_MAX_RETRIES,
    signal: externalSignal,
  } = options;

  const authHeaders = authHeaderProvider ? await authHeaderProvider() : {};

  let lastError: AppError | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const onExternalAbort = () => controller.abort();
    externalSignal?.addEventListener("abort", onExternalAbort);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
          ...authHeaders,
          ...headers,
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        const error = fromResponse(response.status, payload);

        if (isRetryableStatus(response.status) && attempt < maxRetries) {
          lastError = error;
          await sleep(2 ** attempt * 300);
          continue;
        }

        throw error;
      }

      return await parseJsonBody<T>(response);
    } catch (error) {
      if (error instanceof AppError) {
        if (error.isRetryable && attempt < maxRetries) {
          lastError = error;
          await sleep(2 ** attempt * 300);
          continue;
        }
        throw error;
      }

      if (error instanceof DOMException && error.name === "AbortError") {
        const timeoutError = new AppError("Request timed out", {
          code: "TIMEOUT",
          isRetryable: attempt < maxRetries,
        });
        if (attempt < maxRetries) {
          lastError = timeoutError;
          await sleep(2 ** attempt * 300);
          continue;
        }
        throw timeoutError;
      }

      const networkError = new AppError(
        error instanceof Error ? error.message : "Network request failed",
        { code: "NETWORK", isRetryable: attempt < maxRetries, cause: error }
      );
      if (attempt < maxRetries) {
        lastError = networkError;
        await sleep(2 ** attempt * 300);
        continue;
      }
      throw networkError;
    } finally {
      clearTimeout(timeoutId);
      externalSignal?.removeEventListener("abort", onExternalAbort);
    }
  }

  throw lastError ?? new AppError("Request failed after retries");
}
