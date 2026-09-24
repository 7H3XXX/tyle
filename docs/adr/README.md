# Architecture Decision Records

Short records of the decisions that shape this codebase: the context, what we chose, and what it costs.
Add a new file for each decision. Never rewrite an accepted record; supersede it with a new one.

| # | Decision | Status |
|---|---|---|
| [0001](0001-data-driven-questionnaire.md) | Data-driven questionnaire, one generic step renderer | Accepted |
| [0002](0002-server-authoritative-scoring.md) | Scoring is pure and server-authoritative | Accepted |
| [0003](0003-one-blob-per-submission.md) | One private Vercel Blob object per submission, behind a store interface | Accepted |
| [0004](0004-admin-basic-auth.md) | Protect `/admin` with HTTP Basic auth in `proxy.ts`, re-checked in pages | Accepted |
| [0005](0005-no-ip-rate-limiting.md) | No IP-based rate limiting for the event release | Accepted |
| [0006](0006-minimal-ui-dependencies.md) | No UI kit or motion library; CSS tokens and keyframes | Superseded by 0008 |
| [0007](0007-preview-and-test-submissions.md) | Admin preview writing to segregated test storage | Accepted |
| [0008](0008-adopt-shadcn-ui.md) | Adopt shadcn/ui (Base UI) as the component layer | Accepted |

## Template

```md
# NNNN. Title

- Status: Proposed | Accepted | Superseded by NNNN
- Date: YYYY-MM-DD

## Context
## Decision
## Consequences
```
