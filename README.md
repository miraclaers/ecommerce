# Mini Ecommerce (Next.js)

A learning-focused ecommerce platform built with Next.js App Router that demonstrates end-to-end product flows: product discovery, cart management, checkout simulation, and order updates.

Live URL: `https://mini-ecommerce-nextjs-psi.vercel.app`

---

## Problem and Context

I wanted a project that goes beyond static UI and reflects real commerce behavior: dynamic catalog pages, cart/session handling, checkout transitions, and API-backed interactions.

This project is designed to showcase my ability to build frontend-heavy product flows while integrating backend patterns (REST/GraphQL, caching, realtime updates).

## My Role

- Built the full application architecture across UI, APIs, and state contexts
- Implemented product/cart/checkout flows in Next.js App Router
- Added Redis-based caching/session patterns with local fallback
- Added realtime order update behavior through a WebSocket gateway
- Set up Docker local stack and CI/deployment scaffolding

## Architecture Overview

- `src/app`: pages, route handlers, and app-level contexts
- `src/components`: reusable UI building blocks
- `src/lib`: shared utilities and service logic
- `realtime-server.mjs`: local websocket gateway
- `aws/`: ECS deployment templates and notes
- `.github/workflows`: CI and deployment automation

### Core System Capabilities

- Product list and detail pages driven by API routes
- Cart persistence and update flows via session patterns
- Checkout and order status transitions
- REST + GraphQL API surface for data access and mutations
- Redis integration for caching/session acceleration
- WebSocket updates for realtime order-status events

---

## Key Features

- Catalog browsing with product detail pages
- Cart add/update/remove behavior
- Checkout flow with success/error states
- REST routes for products/orders/cart
- GraphQL endpoint for product and order operations
- Redis-backed cache/session behavior with fallback mode
- Realtime messaging channel for order status updates

## Technical Decisions and Tradeoffs

- **Next.js App Router:** chosen for modern full-stack routing and server/client composition.
- **REST + GraphQL together:** useful for learning both API paradigms; adds complexity but improves architectural breadth.
- **Redis + in-memory fallback:** improves resilience for local/dev scenarios while preserving distributed-cache patterns.
- **Docker + ECS scaffolding:** demonstrates deployment readiness, even in a learning project context.

---

## CI / Quality Baseline

GitHub Actions CI runs on pull requests and pushes to `main` with:

- lint (`npm run lint`)
- type-check (`npm run type-check`)
- production build (`npm run build`)

Note: the CI workflow is fully configured. If GitHub Actions appears as "not started," it may be due to temporary account billing restrictions on hosted runners; the same checks still run locally via `npm run ci`.

Run locally:

```bash
npm install
npm run ci
```

---

## Tech Stack

- Next.js 16 (App Router), React, TypeScript
- Tailwind CSS
- Node.js Route Handlers (REST + GraphQL)
- Redis (`redis`)
- WebSockets (`ws`)
- Docker / Docker Compose
- GitHub Actions
- AWS ECS deployment scaffolding

## Local Development

### App only

```bash
npm install
npm run dev
```

### Full local stack (app + Redis + realtime gateway)

```bash
docker compose up --build
```

Required environment values are listed in `.env.example`.

## API Surface

- `GET /api/products`
- `GET /api/products/[id]`
- `GET|POST|PATCH /api/orders`
- `GET|PUT /api/cart/[sessionId]`
- `POST /api/graphql`

## Realtime Gateway

```bash
npm run dev:realtime
```

Default URL: `ws://localhost:4001` (configured by `NEXT_PUBLIC_WS_URL`).

## Deployment Notes

- CI workflow: `.github/workflows/ci.yml`
- AWS deploy workflow: `.github/workflows/deploy-aws.yml`
- Task definition template: `aws/task-definition.json`
- Deployment notes: `aws/deploy.md`

---

## Case Study Highlights (Portfolio Use)

- **Challenge:** model a realistic ecommerce flow with multiple data-access patterns and state boundaries.
- **Approach:** separate UI concerns from API concerns, then layer caching/realtime capabilities incrementally.
- **Result:** a portfolio project that demonstrates product UX plus production-oriented engineering decisions.

## What I Would Improve Next

- Add test pyramid coverage (unit, integration, e2e critical path)
- Add stricter API validation and typed error contracts
- Add metrics/observability dashboards for API and realtime channels
- Add performance budget tracking and accessibility audits
