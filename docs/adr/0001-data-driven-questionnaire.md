# 0001. Data-driven questionnaire, one generic step renderer

- Status: Accepted
- Date: 2026-09-24

## Context

The questionnaire has 7 sections and 30 choices. The product is expected to grow into a
Typeform/Tally-style builder (multiple forms, question types, logic). Content edits must not
require touching components, and the maximum score must never drift from the content
(an earlier draft of the brief said 28; the real total is 30).

## Decision

- All content (sections, choices, result bands, branding) lives in `lib/form/questionnaire.ts`
  as a typed `Questionnaire` object. No questionnaire text in JSX.
- Choice IDs are stable (`energie-1`, …) and answers are stored as `Record<sectionId, choiceId[]>`,
  never as label text, so wording can change without corrupting stored data.
- One `SectionStep` renders any section. Flow state (`step`, `answers`, `status`, `result`) lives in
  a single `useReducer` local to `FormShell`. No global state, no context.
- The maximum score is derived (`maximumScore()`), never hard-coded.

## Consequences

- Adding a form later means adding another `Questionnaire` object and a route (`/f/[formId]`).
- Choice IDs are positional. **Reordering or inserting choices in an existing section changes
  the meaning of stored IDs.** Once live data exists, append new choices or assign explicit IDs.
