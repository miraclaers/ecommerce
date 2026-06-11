import { expect, test } from "@playwright/test";

/**
 * Auth guard — verifies that Clerk middleware protects private routes
 * and that auth pages are publicly reachable.
 *
 * These tests use placeholder Clerk keys in CI, so they only cover
 * unauthenticated-side behaviour (redirects + page availability).
 * Full sign-in / sign-up flows require real Clerk test credentials.
 *
 * Redirect assertions use the API request context (no redirect follow)
 * so we inspect middleware responses before the browser hits Clerk's host.
 */
test.describe("auth guard", () => {
  test("unauthenticated user visiting /my-purchases is redirected to sign-in", async ({
    request,
  }) => {
    const response = await request.get("/my-purchases", { maxRedirects: 0 });
    expect(response.status()).toBe(307);
    expect(response.headers().location).toMatch(/sign-in/);
  });

  test("unauthenticated user visiting /admin is redirected to sign-in", async ({
    request,
  }) => {
    const response = await request.get("/admin", { maxRedirects: 0 });
    expect(response.status()).toBe(307);
    expect(response.headers().location).toMatch(/sign-in/);
  });

  test("sign-in page is publicly accessible", async ({ request }) => {
    const response = await request.get("/sign-in", { maxRedirects: 0 });
    expect(response.status()).toBe(200);
  });

  test("sign-up page is publicly accessible", async ({ request }) => {
    const response = await request.get("/sign-up", { maxRedirects: 0 });
    expect(response.status()).toBe(200);
  });
});
