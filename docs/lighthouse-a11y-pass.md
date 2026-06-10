# Lighthouse & accessibility pass

**Date:** 10 June 2026  
**Target:** [mini-ecommerce](https://mini-ecommerce-nextjs-psi.vercel.app/) — home, products catalog, product detail, cart  
**Tooling:** Lighthouse 12 (Chrome for Testing via Playwright), mobile default profile

## Summary

| Page | Perf (before → after) | A11y (before → after) | Notes |
|------|------------------------|------------------------|-------|
| `/` | 75 → 75 | 100 → 100 | Already clean; skip link added |
| `/products` | 73 → **76** | **93 → 100** | Fixed heading order + sort `<select>` label |
| `/product/1` | 76 → **77** | 100 → 100 | Tab semantics + single `<main>` landmark |
| `/cart` | 75 → **82** | 100 → 100 | Quantity controls labeled; landmark cleanup |

**Before** scores were captured against production (Vercel). **After** scores were captured against a local production build (`npm run build && npm run start`) with valid Clerk env vars.

Accessibility is **100 on all four routes** after fixes. Performance improved modestly on catalog/cart; remaining perf debt is mostly third-party JS (Clerk, Sentry) and LCP image weight—not addressed in this pass to avoid scope creep.

---

## Issues found (before)

### Accessibility

1. **`/products` — heading order** — Product cards used `<h3>` under page `<h1>` without an `<h2>` level.
2. **`/products` — select name** — “Sort by” `<label>` was not associated with the `<select>` (`htmlFor` / `id` missing).
3. **All routes — duplicate `<main>`** — `layout.tsx` and page components each rendered a `<main>` landmark.
4. **Product cards — image alt text** — `alt` echoed the file path (`/products/keyboard.jpg`) instead of the product title.
5. **Cart — icon-only quantity buttons** — `+` / `-` controls had no accessible names.
6. **PDP — tabs** — Description / shipping / reviews buttons lacked tablist/tab/panel roles.
7. **PDP — favorite toggle** — No `aria-label` / `aria-pressed` on the favorites button.
8. **PDP — add-to-cart toast** — No `role="status"` / `aria-live`.

### Performance (documented, not fully fixed)

- **LCP** ~4–6s on catalog/PDP — product hero images; mitigated by `priority` on first catalog card image.
- **Unused JavaScript** ~314 KiB — Clerk + Sentry client bundles on every route.
- **Home redirects** — Clerk handshake adds latency on cold production loads (production-only audit).

---

## Changes made

| Area | Change |
|------|--------|
| Landmarks | One `<main id="main-content">` in `layout.tsx`; pages use `<div>` wrappers |
| Skip link | “Skip to main content” in layout + `.skip-link` styles in `globals.css` |
| Navigation | `aria-label="Primary"` on header `<nav>` |
| Products catalog | `h3` → `h2` on cards; `htmlFor`/`id` on sort control; LCP `priority` on first card image |
| Product cards | `alt={product.title}`; optional `priority` prop |
| Product detail | Tab roles; favorite `aria-label`/`aria-pressed`; toast `role="status"` |
| Cart | `aria-label` on quantity buttons; `type="button"` on controls |

---

## How to re-run

```bash
npm run build && npm run start
# In another terminal (Chrome for Testing + remote debugging port):
npx lighthouse http://127.0.0.1:3000/products --port=9222 \
  --only-categories=performance,accessibility,best-practices,seo \
  --output=html --output-path=./lighthouse-reports/products.html
```

Use Playwright’s Chromium if system Chrome is not installed:

```powershell
$chrome = "$env:LOCALAPPDATA\ms-playwright\chromium-1223\chrome-win64\chrome.exe"
Start-Process $chrome -ArgumentList "--headless=new","--remote-debugging-port=9222","about:blank"
```

---

## Follow-ups (out of scope)

- Lazy-load or defer Sentry client on non-error paths
- Convert footer social icons from `<img>` to `next/image` (lint warnings)
- Add `og-image.png` to `public/` if social previews are required
- Re-audit production after deploy to confirm Vercel CDN scores match local build
