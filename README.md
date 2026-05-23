# Mini Ecommerce (Next.js)

A learning-focused ecommerce platform built with Next.js App Router. It demonstrates end-to-end product flows: catalog browsing, cart and checkout, order history, favorites, collections, and realtime order updates backed by REST and GraphQL APIs.

**Live:** [mini-ecommerce-nextjs-psi.vercel.app](https://mini-ecommerce-nextjs-psi.vercel.app)  
**Repo:** [github.com/alejosworkstuff/mini-ecommerce-nextjs](https://github.com/alejosworkstuff/mini-ecommerce-nextjs)

---

## Problem and Context

I wanted a project that goes beyond static UI and reflects real commerce behavior: dynamic catalog pages, cart/session handling, multi-step checkout, and API-backed interactions.

The app is designed to showcase frontend-heavy product flows with backend patterns (REST, GraphQL, Redis caching, WebSockets, Docker, and deployment scaffolding).

## My Role

- Built the full application architecture across UI, API routes, and React contexts
- Implemented product, cart, checkout, favorites, collections, and order flows
- Added Redis-based caching/session patterns with in-memory fallback
- Integrated a WebSocket gateway for realtime order-status events
- Added Vitest tests and GitHub Actions CI
- Set up Docker Compose and AWS ECS deployment scaffolding

## Architecture Overview

```text
mini-ecommerce/
├── src/app/              # App Router pages and API route handlers
├── src/app/context/      # Cart, orders, favorites, collections, messages, realtime
├── src/components/       # Header, footer, product cards, checkout stepper, skeletons
├── src/lib/              # Products, cart, Redis, API client, order store
├── realtime-server.mjs   # Standalone WebSocket gateway (local/Docker)
├── aws/                  # ECS task definition and deploy notes
├── .github/workflows/    # CI and optional AWS deploy
└── docker-compose.yml    # web + Redis + realtime
```

### Routes (UI)

| Path | Purpose |
|------|---------|
| `/` | Home |
| `/products` | Product listing |
| `/product/[id]` | Product detail (tabs, favorite toggle, add to cart) |
| `/cart` | Cart review |
| `/checkout` | Checkout summary |
| `/checkout/pay` | Payment step (simulated) |
| `/checkout/success` | Success state |
| `/checkout/error` | Error state |
| `/my-purchases` | Order history |
| `/favorites` | Saved products |
| `/collections` | User-defined product collections |
| `/messages` | In-app messages (demo inbox) |

### React Contexts

- **CartContext** — cart state and persistence via session API
- **OrdersContext** — order list and creation
- **FavoritesContext** — favorite product IDs (client persistence)
- **CollectionsContext** — named collections of products
- **MessagesContext** — demo messaging state
- **RealtimeContext** — WebSocket connection to order-status events

### API Surface (REST)

- `GET /api/products` — list products
- `GET /api/products/[id]` — product by ID
- `GET|POST|PATCH /api/orders` — list, create, update orders
- `GET|PUT /api/cart/[sessionId]` — read/update cart session

### GraphQL

- `POST /api/graphql` — queries: `products`, `product(id)`, `orders`; mutation: `createOrder`

### Realtime Gateway

- Standalone process: `realtime-server.mjs` (not a Next.js route)
- Default URL: `ws://localhost:4001` (`NEXT_PUBLIC_WS_URL`)
- Broadcasts parsed JSON messages to all connected clients

---

## Key Features

- Product catalog with detail pages, skeleton loading, and page transitions
- Cart add/update/remove with session-backed persistence
- Multi-step checkout (summary → pay → success/error) with **CheckoutStepper**
- **Favorites** and **collections** for organizing products
- **My purchases** order history
- **Messages** demo inbox
- **Dark mode** toggle with `localStorage` (`minishop-theme`) and system preference fallback
- Open Graph and Twitter metadata on the root layout
- REST + GraphQL API surface
- Redis-backed cache/session with in-memory fallback when Redis is unavailable
- WebSocket order-status updates
- Fixed footer navigation (portfolio and GitHub links)

## Technical Decisions and Tradeoffs

- **Next.js 16 App Router** — server/client composition and route handlers in one codebase.
- **REST + GraphQL** — compares two API styles; adds complexity but broadens the portfolio story.
- **Redis + in-memory fallback** — resilient local/dev runs without a running Redis instance.
- **Separate realtime server** — keeps WebSocket concerns out of the Next.js server process; matches Docker Compose layout.
- **Docker + ECS scaffolding** — demonstrates deployment readiness without requiring a live AWS deploy.

---

## Tech Stack

- Next.js 16 (App Router), React 19, TypeScript 5
- Tailwind CSS 3
- Node.js route handlers (REST + GraphQL)
- Redis 5 (`redis` package)
- WebSockets (`ws`)
- Vitest 4, Testing Library, jsdom
- Docker / Docker Compose
- GitHub Actions
- AWS ECS deployment scaffolding (optional)

---

## CI / Quality Baseline

GitHub Actions (`.github/workflows/ci.yml`) on pull requests and pushes to `main`:

- `npm run lint`
- `npm run type-check`
- `npm run test` (Vitest)
- `npm run build`

Run the same pipeline locally:

```bash
npm install
npm run ci
```

### Tests

| File | Coverage |
|------|----------|
| `src/lib/cart-logic.test.ts` | Pure cart helpers |
| `src/app/context/cart-context.integration.test.tsx` | Cart context behavior |

Configured in `vitest.config.ts` with `@/` path alias and jsdom.

---

## Environment Variables

Copy `.env.example` to `.env.local`:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Optional API base override |
| `NEXT_PUBLIC_WS_URL` | WebSocket gateway URL (default `ws://localhost:4001`) |
| `REDIS_URL` | Redis connection (default `redis://localhost:6379`) |
| `REALTIME_PORT` | Port for `realtime-server.mjs` (default `4001`) |

---

## Local Development

### App only

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Realtime gateway (separate terminal)

```bash
npm run dev:realtime
```

### Full stack (app + Redis + realtime)

```bash
docker compose up --build
```

Services: **web** (port 3000), **redis** (6379), **realtime** (4001).

---

## Deployment

- **Vercel:** primary live deployment (see live URL above).
- **AWS ECS:** workflow `.github/workflows/deploy-aws.yml`, task template `aws/task-definition.json`, notes in `aws/deploy.md`.
- Requires GitHub variables/secrets for ECR, ECS cluster/service, and `AWS_ROLE_TO_ASSUME`.

---

## Case Study Highlights (Portfolio Use)

- **Challenge:** Model a realistic ecommerce flow with multiple data-access patterns and clear UI state boundaries.
- **Approach:** Separate UI contexts from API routes; layer Redis caching and realtime updates incrementally.
- **Result:** A demo that shows product UX plus production-oriented patterns (tests, CI, containers, optional cloud deploy).

## What I Would Improve Next

- Expand test coverage (checkout path, API routes, GraphQL resolvers)
- Stricter API validation and typed error contracts
- E2E tests for the critical purchase flow
- Metrics/observability for API and realtime channels
- Performance budgets and accessibility audits
