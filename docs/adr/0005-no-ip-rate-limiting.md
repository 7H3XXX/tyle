# 0005. No IP-based rate limiting for the event release

- Status: Accepted
- Date: 2026-09-24

## Context

The brief asks for rate limiting "if practical". Respondents will mostly be at a single venue,
often behind one shared Wi-Fi NAT, so many legitimate phones share one public IP. Serverless
instances also don't share memory, so an in-process limiter would be inaccurate anyway.

## Decision

No IP-based rate limiting in v1. Abuse is bounded by a 16 KB body cap and strict payload
validation, and each request writes at most one small object. The UI prevents double submission.

## Consequences

- A determined actor could inflate response counts. If that becomes a real problem, add Vercel
  Firewall rate rules or a per-event token, not per-IP limits in app code.
