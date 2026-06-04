# Definition of Done

A task is **done** when:

1. **Behavior** — Acceptance criteria met; happy path and main error path handled.
2. **Types** — TypeScript passes (`npm run type-check`) with no new `any` escapes.
3. **Tests** — Unit/integration tests added or updated for changed logic; `npm run test` passes.
4. **Lint & build** — `npm run lint` and `npm run build` succeed locally.
5. **Auth & security** — Protected routes use middleware; APIs use server `auth()` where needed; no secrets in git.
6. **Docs** — README or `docs/` updated if behavior, env vars, or architecture changed.
7. **Review** — PR description explains what/why; screenshots for UI changes when useful.
