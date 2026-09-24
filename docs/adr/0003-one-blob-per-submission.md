# 0003. One private Vercel Blob object per submission, behind a store interface

- Status: Accepted
- Date: 2026-09-24

## Context

The first release serves a live event within hours. A database (Postgres/Supabase/Prisma) adds
provisioning, migrations and failure modes we don't need yet. Many phones may submit at the same
time, and responses are self-reported health data.

## Decision

- Each submission is an immutable JSON object at `submissions/{uuid}.json` in a **private** Vercel Blob
  store (`allowOverwrite: false`). There is no shared mutable file, so concurrent writes can't clobber
  each other.
- IDs are generated server-side (`crypto.randomUUID()`).
- Storage sits behind `saveSubmission`, `listSubmissions` and `getSubmission`
  (`lib/storage/submissions.ts`, marked `server-only`). Nothing else knows Blob exists, and the
  token never reaches the browser.
- Drivers: Blob when `BLOB_READ_WRITE_TOKEN` (or `BLOB_STORE_ID`) is set; a local file driver (`.data/`)
  in development or with `STORAGE_DRIVER=local`. In production without credentials, saving **fails**
  (503 to the client, logged server-side) rather than silently dropping data.
- No personal data is collected: no name, email, IP, user agent or location.

## Consequences

- `listSubmissions` reads every object (16 concurrent reads). That's fine for hundreds of responses.
  For thousands, add a cached aggregate snapshot or move to Postgres; only the store drivers change.
- No server-side deduplication. The client prevents double submits, but a retry after a lost
  response can create a duplicate. Accepted for v1.
