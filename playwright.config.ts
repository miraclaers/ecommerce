import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run build && npm run start",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: {
      // Clerk v7 validates key shape (pk_test_<base64 of "*.clerk.accounts.dev$">).
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
        process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ??
        "pk_test_Y2ktcGxhY2Vob2xkZXIuY2xlcmsuYWNjb3VudHMuZGV2JA",
      CLERK_SECRET_KEY:
        process.env.CLERK_SECRET_KEY ?? "sk_test_e2e_placeholder",
    },
  },
});
