import { execSync } from "node:child_process";

const isVercelPreview = process.env.VERCEL_ENV === "preview";

if (isVercelPreview) {
  console.log("[build] Vercel Preview build — skipping `prisma migrate deploy`.");
} else {
  console.log("[build] Running `prisma migrate deploy`.");
  execSync("prisma migrate deploy", { stdio: "inherit" });
}

execSync("next build", { stdio: "inherit" });
