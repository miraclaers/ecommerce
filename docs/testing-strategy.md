# Testing strategy

## Layers

| Layer | Tool | Scope |
| --- | --- | --- |
| Unit | Vitest | `http-client`, `cart-logic`, hooks (`useDebouncedValue`) |
| Integration | Vitest + Testing Library | `CartContext` + cart persistence |
| E2E | Playwright | Checkout happy path (browse → cart → success) |
| CI | GitHub Actions / local `npm run ci` | lint → type-check → test → build |

## Commands

```bash
npm run test          # Vitest once
npm run test:watch    # Vitest watch
npm run test:e2e      # Playwright
npm run ci            # Full pipeline
```

## What we do not cover yet

- Full Clerk auth flows in E2E (requires test user / Clerk testing tokens)
- WebSocket realtime server under load
- Visual regression

## Adding tests

- Prefer testing pure functions and hooks over snapshot-heavy UI.
- Mock `fetch` for HTTP client tests; use real cart logic for commerce rules.
- E2E: keep one stable happy path; add auth path when Clerk test instance is configured.
