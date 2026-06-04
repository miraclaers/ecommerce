import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { request } from "@/lib/http-client";

describe("http-client", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("returns parsed JSON on success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: [1, 2] }),
      })
    );

    const result = await request<{ data: number[] }>("/api/test");
    expect(result).toEqual({ data: [1, 2] });
  });

  it("throws AppError for non-retryable 400", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ error: "Bad request" }),
      })
    );

    await expect(request("/api/test")).rejects.toMatchObject({
      message: "Bad request",
      status: 400,
      isRetryable: false,
    });
  });

  it("retries on 503 then succeeds", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 503,
        json: async () => ({}),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true }),
      });
    vi.stubGlobal("fetch", fetchMock);

    const promise = request("/api/test", { maxRetries: 1 });
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("throws timeout AppError when request aborts", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((_url, init) => {
        return new Promise((_resolve, reject) => {
          if (init?.signal?.aborted) {
            reject(new DOMException("Aborted", "AbortError"));
            return;
          }
          init?.signal?.addEventListener("abort", () => {
            reject(new DOMException("Aborted", "AbortError"));
          });
        });
      })
    );

    const assertion = expect(
      request("/api/slow", { timeoutMs: 100, maxRetries: 0 })
    ).rejects.toMatchObject({ code: "TIMEOUT" });

    await vi.advanceTimersByTimeAsync(150);
    await assertion;
  });
});
