# Mini Ecommerce (Next.js)

[![local CI](https://img.shields.io/badge/local%20CI-passing-brightgreen?logo=github-actions&logoColor=white)](.github/workflows/ci.yml) [![Vercel](https://img.shields.io/badge/deployed-Vercel-black?logo=vercel&logoColor=white)](https://mini-ecommerce-nextjs-psi.vercel.app/)

A learning-focused ecommerce platform built with Next.js App Router. It demonstrates catalog and checkout flows, **Clerk authentication**, resilient API access, intentional rendering (SSG/ISR), and production-oriented patterns (tests, CI, observability).

**Live:** [mini-ecommerce-nextjs-psi.vercel.app](https://mini-ecommerce-nextjs-psi.vercel.app)  
**Repo:** [github.com/alejosworkstuff/mini-ecommerce-nextjs](https://github.com/alejosworkstuff/mini-ecommerce-nextjs)

## Screenshots

| Home | Product catalog | Cart | Clerk sign-in |
|:---:|:---:|:---:|:---:|
| ![Home](./docs/screenshots/main.webp) | ![Products](./docs/screenshots/products.webp) | ![Cart](./docs/screenshots/cart.webp) | ![Sign in](./docs/screenshots/sign-in.webp) |

---

## Problem and Context

I wanted a project that goes beyond static UI and reflects real commerce behavior: dynamic catalog pages, cart/session handling, multi-step checkout, authenticated account areas, and API-backed interactions.

The app showcases frontend-heavy product flows plus backend patterns (REST, GraphQL, **Postgres + Prisma**, Redis caching, WebSockets, Docker, and deployment scaffolding).

## My Role

- Built the full application architecture across UI, API routes, and React contexts
- Implemented product, cart, checkout, favorites, collections, and order flows
- Added **Clerk auth** (proxy middleware, protected routes, per-user orders)
- Implemented a **resilient HTTP client** (timeout, retry, typed errors) and **SSG/ISR** catalog pages
- Integrated Sentry, error boundaries, and structured API logging
- Added Vitest + Playwright tests and GitHub Actions CI (including E2E on push)
- Set up Docker Compose and AWS ECS deployment scaffolding

---

## Tech Stack

- Next.js 16 (App Router), React 19, TypeScript 5 (strict)
- Tailwind CSS 3
- **Clerk** (`@clerk/nextjs`) — OIDC sessions, protected routes
- **Sentry** (`@sentry/nextjs`) — optional error monitoring
- Node.js route handlers (REST + GraphQL)
- **PostgreSQL (Neon)** + **Prisma** — orders (`Order`, `OrderItem`)
- **Redis** — cart sessions and product cache
- WebSockets (`ws`)
- Vitest 4, Testing Library, Playwright
- Docker / Docker Compose, GitHub Actions

---

## Architecture Overview

```text
mini-ecommerce/
├── src/app/              # App Router pages, API routes, error boundaries
├── src/app/context/      # Cart, orders, favorites, collections, messages, realtime
├── src/components/       # UI, ProductsCatalog, ProductDetailView, AccountMenu
├── src/hooks/            # useDebouncedValue, useAsyncResource, useApiMutation, …
├── src/lib/              # http-client, api-client, product-data, order-store, prisma
├── prisma/               # schema + migrations (orders)
├── src/proxy.ts          # Clerk clerkMiddleware + protected routes
├── docs/                 # Architecture, DoD, testing strategy
├── e2e/                  # Playwright specs
├── realtime-server.mjs   # WebSocket gateway (local/Docker)
├── aws/                  # ECS task definition and deploy notes
└── .github/workflows/    # CI (+ optional AWS deploy)
```

See [`docs/frontend-architecture.md`](docs/frontend-architecture.md) for route-level rendering decisions and the Server Action cart sync flow.

### Server Actions

Cart writes use a **Server Action** instead of a client `fetch` to the REST route:

```text
CartContext (client) ──► syncCartAction() ──► cart-store.ts ──► Redis
```

- **Action:** [`src/app/actions/cart.ts`](src/app/actions/cart.ts) — `syncCartAction(sessionId, items)`
- **Shared logic:** [`src/lib/cart-store.ts`](src/lib/cart-store.ts) — also used by `GET|PUT /api/cart/[sessionId]` for tests and external callers
- **Reads:** still `GET /api/cart/[sessionId]` via `fetchRemoteCart` on mount (hydration from Redis)


### Routes (UI)

| Path | Purpose | Access |
|------|---------|--------|
| `/` | Home | Public |
| `/products` | Product listing (server data + client filters/search) | Public |
| `/product/[id]` | Product detail (SSG/ISR + client cart/favorites) | Public |
| `/cart`, `/checkout/*` | Cart and checkout flow | Public |
| `/sign-in`, `/sign-up` | Clerk auth UI | Public |
| `/my-purchases` | Order history | Signed in |
| `/favorites`, `/collections`, `/messages`, `/settings` | Account features | Signed in |
| `/admin/orders` | All orders (demo admin) | Signed in + `role: admin` in Clerk |

### API Surface

**REST**

- `GET /api/products`, `GET /api/products/[id]`
- `GET|POST|PATCH /api/orders` — requires Clerk session; scoped by `userId`. `POST` accepts optional `Idempotency-Key` (replay → 200). `GET ?session_id=` looks up a Stripe-backed order.
- `POST /api/webhooks/stripe` — Stripe signature-verified; `checkout.session.completed` creates a paid Prisma order (idempotent on `stripeSessionId`)
- `GET|PUT /api/cart/[sessionId]` — REST surface; **client cart sync uses Server Action** (`syncCartAction`) instead of `PUT`

**GraphQL** — `POST /api/graphql` (products public; orders require auth)

**Realtime** — `realtime-server.mjs` on port 4001. Override with `NEXT_PUBLIC_WS_URL`; otherwise the browser connects to `ws://<page-host>:4001` (works with Docker Compose port mapping).

### Data persistence (Redis vs Postgres)

Orders and cart data use **different stores on purpose** — each fits the access pattern:

| Data | Store | Why |
|------|-------|-----|
| **Cart** (`/api/cart/[sessionId]`) | Redis (or in-memory `Map` without `REDIS_URL`) | Session-scoped, high-churn key/value; no relational queries needed |
| **Product cache** (`/api/products`) | Redis | Short-lived catalog cache |
| **Orders** (`/api/orders`, GraphQL `createOrder`) | **PostgreSQL via Prisma** | Relational `Order` + `OrderItem` + `IdempotencyRecord`; Stripe session id for webhook dedupe |

**Migration story:** v1 stored orders as Redis JSON blobs (`orders:user:{userId}`) for a fast demo. Phase 6 swapped the `order-store.ts` adapter to Prisma + Postgres on Neon **without changing the public API** — same REST/GraphQL surface, Clerk `userId` scoping unchanged. Cart stayed on Redis.

**Production:** Neon (`neon-cerulean-curtain`) via Vercel Marketplace; pooled `DATABASE_URL` with `?pgbouncer=true`. Migrations run on deploy: `prisma migrate deploy && next build`.

**Legacy data cutover:** the app no longer writes orders to Redis. A one-off script handles any leftover `orders:user:*` blobs from the v1 Redis store — optionally backfilling them into Postgres, then deleting the stale keys. It is dry-run by default and idempotent:

```bash
npm run orders:migrate-legacy                 # dry run (report only)
npm run orders:migrate-legacy -- --apply      # backfill to Postgres + delete Redis keys
npm run orders:migrate-legacy -- --apply --skip-backfill   # delete keys only
npm run orders:migrate-legacy -- --apply --keep-redis      # backfill only
```

**Local options (pick one):**

- **A — Docker Compose:** `docker compose up postgres` starts the `postgres:16-alpine` service; use `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mini_ecommerce`.
- **B — Prisma local Postgres (no Docker):** `npx prisma dev` starts a local Prisma Postgres instance and prints a `prisma+postgres://...` URL — copy it into `DATABASE_URL` in `.env.local`, then run `npm run db:migrate` in a second terminal.
- **C — Neon dev branch:** point `DATABASE_URL` at a Neon branch connection string.

```bash
npx prisma dev      # option B: start a local Prisma Postgres (keep running)
npm run db:migrate   # apply migrations
npm run db:studio    # Prisma Studio (local)
```

---

## Key Features

- Product catalog with SSG/ISR detail pages, debounced search, and filters
- Cart with session-backed persistence and multi-step checkout
- **Stripe Checkout (test mode)** — Server Action session + webhook order create; demo fallback without keys
- **Order idempotency** — `Idempotency-Key` on `POST /api/orders` (Prisma `IdempotencyRecord`)
- **Clerk authentication** — sign-in/up, `UserButton`, protected account routes
- Favorites, collections, messages (demo), and per-user order history
- **HTTP resilience** — centralized client with timeout, retry, `AppError`, `ApiState<T>`
- Dark mode, Open Graph metadata, REST + GraphQL, Redis cart cache + Postgres orders, WebSocket demos
- **Observability** — Sentry (optional), `error.tsx`, `ErrorBoundary`, structured logs

---

## Authentication (Clerk)

- `clerkMiddleware()` in [`src/proxy.ts`](src/proxy.ts) (includes `/__clerk/:path*` matcher)
- `<ClerkProvider>` in [`src/app/layout.tsx`](src/app/layout.tsx)
- Header: `<Show>`, `<SignInButton>`, `<SignUpButton>`, `<UserButton>` + account menu
- Server routes use `auth()` from `@clerk/nextjs/server` for orders
- Admin: set `publicMetadata.role` to `"admin"` in Clerk for `/admin/orders`

**Local setup:** copy `.env.example` → `.env.local` and add keys from [dashboard.clerk.com](https://dashboard.clerk.com).

**Vercel:** add the same variables in Project → Settings → Environment Variables (never commit real keys).

---

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes (auth) | Clerk publishable key |
| `CLERK_SECRET_KEY` | Yes (auth) | Clerk secret key (server only) |
| `NEXT_PUBLIC_SENTRY_DSN` | No | Sentry DSN (client + server) |
| `SENTRY_AUTH_TOKEN` | No | Sentry upload token (builds) |
| `NEXT_PUBLIC_API_BASE_URL` | No | API base override (empty = same origin) |
| `NEXT_PUBLIC_WS_URL` | No | WebSocket URL override; default is `ws://<page-host>:4001` in the browser |
| `REDIS_URL` | No | Redis for cart + product cache (default `redis://localhost:6379`; in-memory fallback if unset) |
| `DATABASE_URL` | Yes (orders) | Postgres connection string — use Neon pooler URL in production (`?pgbouncer=true`) |
| `STRIPE_SECRET_KEY` | No | Stripe secret (`sk_test_…` for test mode). Without it, `/checkout/pay` uses the local demo path |
| `STRIPE_WEBHOOK_SECRET` | No (required for webhooks) | Stripe webhook signing secret (`whsec_…`) for `POST /api/webhooks/stripe` |
| `NEXT_PUBLIC_APP_URL` | No | Canonical app URL for Stripe success/cancel redirects (falls back to `VERCEL_URL` or localhost) |

---

## Local Development

```bash
npm install
cp .env.example .env.local   # then add Clerk keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Realtime (optional, second terminal):** `npm run dev:realtime`  
**Full stack:** `docker compose up --build`

---

## CI / Quality

GitHub Actions on PRs and `main` (`.github/workflows/ci.yml`):

- lint → type-check → Vitest → build → Playwright E2E

Local equivalents:

```bash
npm run ci          # lint, type-check, test, build
npm run ci:full     # above + Playwright E2E
npm run test:e2e    # E2E only (starts production server)
```

CI runs the full pipeline on **GitHub Actions** (lint, type-check, Vitest, build, and Playwright E2E) on every push and pull request, against a Postgres service container. It uses Clerk **test** keys from repo secrets (`CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY`), with placeholder fallback — never production secrets. The same checks run locally with the commands above.

`main` is protected: the `quality-checks` job is a **required status check**, so a pull request cannot be merged until CI is green.

### Tests

| Area | Files |
|------|--------|
| Cart logic | `src/lib/cart-logic.test.ts` |
| Cart persistence | `src/lib/cart-store.test.ts` |
| Cart context | `src/app/context/cart-context.integration.test.tsx` |
| HTTP client | `src/lib/http-client.test.ts` |
| Hooks | `src/hooks/useDebouncedValue.test.ts` |
| E2E checkout | `e2e/checkout-happy-path.spec.ts` |

Details: [`docs/testing-strategy.md`](docs/testing-strategy.md)

---

## Engineering Docs

- [`docs/frontend-architecture.md`](docs/frontend-architecture.md) — SSR/SSG/ISR/Client split
- [`docs/definition-of-done.md`](docs/definition-of-done.md)
- [`docs/testing-strategy.md`](docs/testing-strategy.md)
- `.github/pull_request_template.md`

---

## Deployment

- **Vercel:** primary live URL (configure Clerk + optional Sentry env vars in the dashboard). Every pull request gets an automatic **preview deployment** via the Vercel ↔ GitHub integration; pushes to `main` deploy to production. The build runs `prisma migrate deploy` on production/CI/local builds but **skips migrations on Preview builds** (`VERCEL_ENV=preview`) — see `scripts/build.mjs`.
- **AWS ECS:** `.github/workflows/deploy-aws.yml`, `aws/task-definition.json`, `aws/deploy.md`.

---

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Auth buttons do nothing / Clerk errors | Keys in `.env.local`; restart `npm run dev` |
| Redirect loop on account pages | Valid Clerk keys; routes `/sign-in`, `/sign-up` exist |
| Orders empty after login | Sign in before checkout; orders are per Clerk `userId` and stored in Postgres |
| `DATABASE_URL` missing on Vercel | Set pooled Neon URL on Preview + Production; build runs `prisma migrate deploy` |
| API timeout errors | Network tab; default 8s timeout in `http-client` |
| Build fails on Vercel | Clerk env vars in Vercel project settings |
| Sentry not receiving events | `NEXT_PUBLIC_SENTRY_DSN` set in env |
| E2E fails with Clerk `host_invalid` | Set real Clerk **test** keys in `CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` repo secrets |

---

## Case Study Highlights (Portfolio Use)

- **Challenge:** Model realistic ecommerce with auth, resilient APIs, and clear rendering choices.
- **Approach:** Clerk for sessions; server-loaded catalog with client islands; typed HTTP layer; **Prisma + Postgres for orders**, Redis for cart; tests + CI + docs.
- **Result:** A demo that reads as "junior with SaaS-style mechanics," not only a UI exercise — including a live Postgres migration without breaking the API.

## What I Would Improve Next

- Clerk auth E2E with test users
- Performance budgets and accessibility audit with before/after notes
- Portfolio case-study page with the Redis → Postgres migration narrative
