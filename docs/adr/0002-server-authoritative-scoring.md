# 0002. Scoring is pure and server-authoritative

- Status: Accepted
- Date: 2026-09-24

## Context

Results are shown to respondents and aggregated for organisers. A browser can send anything,
and the result shown on screen must match what was persisted.

## Decision

- `calculateScore(answers, questionnaire)` is a pure function (no I/O, no React). It returns the total,
  maximum, percentage, result band and per-domain scores. Bands are configuration (`resultBands`),
  not conditionals in the UI.
- `POST /api/responses` accepts **answers only**. It rejects malformed payloads (400/413/415), drops
  unknown section and choice IDs, recomputes the score, persists, and only then returns the result.
  Client-supplied totals are ignored.
- The client shows the result screen only after a successful response. On failure it shows a calm
  message and a retry button, and keeps the answers in memory.
- The dashboard recomputes scores from stored answers instead of trusting stored totals, so
  analytics always agree with the current scoring code.

## Consequences

- Scoring is unit-tested in isolation (`lib/form/scoring.test.ts`).
- If scoring rules change, historical dashboards change with them. That's intended for this
  self-assessment. The stored `totalSelected` and `bandId` keep what the respondent actually saw.
