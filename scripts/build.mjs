import { execSync } from "node:child_process";

// Vercel sets VERCEL_ENV to "production" | "preview" | "development".
// Preview deployments build against the Preview-scoped DATABASE_URL, which may
// point at an ephemeral/branch database (or none). Running `prisma migrate deploy`
// there is both unnecessary and a failure point, so skip it on Preview builds.
// Production Vercel builds, GitHub Actions CI, and local builds (VERCEL_ENV unset)
// still run migrations so the target database stays in sync.
const isVercelPreview = process.env.VERCEL_ENV === "preview";

if (isVercelPreview) {
  console.log("[build] Vercel Preview build — skipping `prisma migrate deploy`.");
} else {
  console.log("[build] Running `prisma migrate deploy`.");
  execSync("prisma migrate deploy", { stdio: "inherit" });
}

execSync("next build", { stdio: "inherit" });
