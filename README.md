# Mini Ecommerce (Next.js)

Mini Ecommerce is a learning-focused full-stack demo built with Next.js App Router.  
It now includes REST + GraphQL APIs, Redis cache/session patterns, realtime updates with WebSockets, Docker local stack, and AWS ECS deployment scaffolding.

Live URL: `https://mini-ecommerce-nextjs-psi.vercel.app`

## Features

- Product listing and product detail pages fetched via API routes
- Cart and checkout flow with order creation and status updates
- REST API routes (`/api/products`, `/api/orders`, `/api/cart/[sessionId]`)
- GraphQL endpoint (`/api/graphql`) for order creation and product queries
- Redis-backed product caching and cart session sync (with local-memory fallback)
- Realtime order-status notifications via WebSocket provider and gateway
- CI quality checks (lint/build) and AWS ECS deploy workflow

## Tech Stack

- Next.js (App Router), React, TypeScript, Tailwind CSS
- Node.js route handlers (REST + GraphQL)
- Redis (`redis` package) for caching/session patterns
- WebSocket gateway (`ws`)
- Docker + Docker Compose
- GitHub Actions + AWS ECS deployment template

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

Required env values are documented in `.env.example`.

## API Surface

- `GET /api/products` and `GET /api/products/[id]`
- `GET|POST|PATCH /api/orders`
- `GET|PUT /api/cart/[sessionId]`
- `POST /api/graphql`

## Realtime Gateway

Start local gateway:

```bash
npm run dev:realtime
```

Default URL: `ws://localhost:4001` (`NEXT_PUBLIC_WS_URL`)

## Deployment Notes

- CI workflow: `.github/workflows/ci.yml`
- AWS ECS workflow: `.github/workflows/deploy-aws.yml`
- Task definition template: `aws/task-definition.json`
- Deployment notes: `aws/deploy.md`

