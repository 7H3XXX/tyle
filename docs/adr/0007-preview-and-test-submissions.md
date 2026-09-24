# 0007. Admin preview writing to segregated test storage

- Status: Accepted
- Date: 2026-09-24

## Context

Before the event, organisers need to exercise the real pipeline (form → API → storage → analytics)
and see exactly what gets recorded, without polluting the statistics they'll present afterwards.
Options considered:

1. **Submit real responses and delete them afterwards.** Error-prone under time pressure; needs a
   delete tool on production health data.
2. **A `isTest` flag on records in the same prefix, filtered at read time.** Every consumer must
   remember the filter; one missed filter leaks test data into live analytics.
3. **Separate storage namespaces, selected by a `mode` on the submission.** Chosen.

## Decision

- `Submission.mode` is `"live" | "test"`. The API treats only an exact `"test"` as test; anything
  else (missing, typo, other values) is live, so a bug can't silently divert real responses.
- Test records are stored under `test-submissions/`, live ones under `submissions/`
  (`.data/test-submissions` and `.data/submissions` locally). `listSubmissions(mode)` takes the
  mode explicitly, and the namespaces are disjoint, so a live listing can't include test data.
- `/admin/preview` renders the real `FormShell` with `mode="test"` and a notice. It sits under
  `/admin`, so the same auth (ADR 0004) protects it and respondents can't reach it by accident.
- `/admin?data=test` shows the same dashboard over test data, plus a **record inspector**:
  - the 10 most recent test records, exactly as stored (pretty JSON);
  - the checked choices resolved to their labels;
  - a field guide, and an explicit list of what is never collected;
  - an integrity check (`checkSubmissionIntegrity`) comparing stored totals, band and domain scores
    with what `scoring.ts` computes from the stored answers. A green badge proves the wiring end to end.
- Raw records are rendered **only for test data**. Live responses are never listed individually.

## Consequences

- The public API accepts `mode: "test"` without auth, so anyone could write test records. That's
  harmless: they never reach live analytics, and they're bounded like any submission (ADR 0005).
  If it becomes noisy, require an admin credential for test writes.
- Test data persists in production storage until deleted. To reset before the event, delete the
  `test-submissions/` prefix in the Vercel Blob dashboard; live data is unaffected.
- Adding a field to `Submission` means updating the inspector's field guide (noted in code).
