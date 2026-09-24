# 0004. Protect `/admin` with HTTP Basic auth in `proxy.ts`, re-checked in pages

- Status: Accepted
- Date: 2026-09-24

## Context

The dashboard exposes aggregate health-related data and must not be public. There is a single
organiser team and no user accounts. We need something reliable today, not an auth product.

## Decision

- `proxy.ts` (Next 16's renamed middleware) gates `/admin` and `/admin/:path*` with HTTP Basic auth
  against `ADMIN_PASSWORD` (user `ADMIN_USER`, default `admin`), using a constant-time comparison.
- Without `ADMIN_PASSWORD`, the dashboard is open in development and returns **503 in production**,
  so a missing variable can't expose it.
- Admin pages re-check access server-side and render `notFound()` otherwise, so a future matcher
  change can't silently open them.
- Admin pages are `noindex`.

## Consequences

- One shared password. To rotate it, change the env var and redeploy.
- Replace this with real sessions (e.g. Auth.js) when workspaces or team members arrive.
  `checkAdminAccess` is the seam where that plugs in.
