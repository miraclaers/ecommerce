# Frontend architecture — Mini Ecommerce

## Rendering strategy by route

| Route | Mode | Why |
| --- | --- | --- |
| `/` | Static / Server | Marketing home, minimal client JS |
| `/products` | Server Component + ISR (`revalidate: 60`) + client catalog filters | Product list is stable; filters need browser state |
| `/product/[id]` | SSG (`generateStaticParams`) + ISR + client island | PDP paths are known at build; cart/favorites stay client |
| `/cart`, `/checkout/*` | Client | Cart session, multi-step checkout, realtime UX |
| `/my-purchases`, `/messages`, `/collections`, `/settings` | Client + Clerk proxy | Protected; orders synced per authenticated user |
| `/admin/orders` | SSR + role check | Admin-only server render with `auth()` + `publicMetadata.role` |
| `/sign-in`, `/sign-up` | Static + Clerk components | Hosted auth UI |

## Data flow

```text
Server (product-data.ts) ──► Products page / PDP (SSG+ISR)
Client contexts ──► Cart, favorites, collections (local + API)
Cart sync (write) ──► syncCartAction (Server Action) ──► cart-store ──► Redis
Cart hydrate (read) ──► GET /api/cart/[sessionId]
Clerk session ──► proxy.ts (clerkMiddleware) ──► /api/orders scoped by userId
http-client ──► timeout, retry, typed AppError ──► api-client
```

## Server Actions

One mutation runs as a **Server Action** (Roadmap keyword; keeps cart writes on the server without a client `fetch`):

| Action | File | Called from | Backend |
| --- | --- | --- | --- |
| `syncCartAction(sessionId, items)` | `src/app/actions/cart.ts` | `CartContext` on cart change | `cart-store.ts` → Redis |

`cart-store.ts` is shared with `PUT /api/cart/[sessionId]` so REST and the action stay in sync. Reads still use the GET route on mount for hydration.


## Auth

- **Clerk** provides OIDC session cookies.
- **proxy.ts** (`clerkMiddleware`) redirects unauthenticated users from protected routes; matcher includes `/__clerk/:path*`.
- **API routes** use `auth()` from `@clerk/nextjs/server` — never trust client-only checks for orders.

## When to choose each Next.js mode

- **SSG + ISR:** Catalog and PDP — SEO-friendly, fast TTFB, revalidate when product data changes.
- **Server Components:** Load catalog data without shipping fetch logic to the client.
- **Client Components:** Anything with React Context, cart, checkout, or Clerk hooks.
