# 0008. Adopt shadcn/ui (Base UI) as the component layer

- Status: Accepted
- Date: 2026-09-24
- Supersedes: [0006](0006-minimal-ui-dependencies.md)

## Context

ADR 0006 kept the UI dependency-free for the first event release, with hand-rolled `Button`, `Bar`,
checkbox cards and a local `cn`. The project is meant to grow into a form platform, the team works
with shadcn/ui (the agent skills in `.agents/skills/shadcn` codify its rules), and hand-rolled
primitives would drift as more surfaces are added.

## Decision

- Initialise shadcn/ui with the `base-nova` style: **Base UI** primitives, `lucide-react` icons,
  `cva` variants, `cn` from `@/lib/utils`. Components live in `components/ui/` as owned source.
- Use components instead of custom markup, following the skill's rules:
  - questionnaire options are the **choice card** pattern: `FieldLabel` › `Field` › `Checkbox`,
    grouped by `FieldSet` / `FieldLegend` / `FieldDescription` / `FieldGroup`;
  - `Button` (with `Spinner` + `data-icon`) for actions, `Alert` for the submission error and test
    notice, `Progress` (+ `ProgressLabel`) for every bar, `Table`, `Badge`, `Accordion`, `Empty`;
  - navigation links keep link semantics: `next/link` styled with `buttonVariants`, never a `Button`
    rendered as `<a>` (Base UI would add `role="button"`).
- **Tokens**: the palette now uses shadcn's semantic names. The brand colour is `--primary` (and
  `--ring`); `branding.accentColor` overrides both per form. shadcn's `--accent` is the subtle hover
  surface. This deliberately departs from the `--accent` naming in the product brief (CLAUDE.md §27)
  so that every shadcn component picks up the brand without overrides.
- **Dark mode** stays system-driven: the `dark:` variant is bound to
  `@media (prefers-color-scheme: dark)` instead of a `.dark` class, so there's no `next-themes`
  and no client JS.
- **Project additions to owned components** are marked with a comment. So far that's the `xl` Button
  size (48px) for mobile touch targets (brief §9: ~44px minimum).
- Progress bars used for static scores set `aria-valuetext` ("2 sur 5") because shadcn has no Meter.
  Server components pass it as a string, since function props can't cross the server/client boundary.

## Consequences

- New dependencies: `@base-ui/react`, `class-variance-authority`, `cn`, `lucide-react`, `shadcn`
  (CSS only), `tw-animate-css`. The form route's client bundle grows accordingly.
- Update components with `npx shadcn@latest add <name> --dry-run` / `--diff` and merge by hand;
  never `--overwrite` owned components without review (see the skill's "Updating Components").
- The CSS `@keyframes` step transitions from ADR 0006 remain; no motion library was added.
