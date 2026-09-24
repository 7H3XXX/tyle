# 0006. No UI kit or motion library; CSS tokens and keyframes

- Status: Superseded by [0008](0008-adopt-shadcn-ui.md)
- Date: 2026-09-24

## Context

The form is small and mobile-first, and most respondents load it once on event Wi-Fi. The brief
asks for restrained motion, configurable branding and no unjustified dependencies.

## Decision

- Colours are CSS variables (`--background`, `--foreground`, `--muted`, `--border`, `--accent`,
  `--accent-foreground`, …) mapped into Tailwind v4 via `@theme inline`, with a dark palette.
  `branding.accentColor` overrides `--accent` at runtime.
- Step transitions are CSS keyframes: enter-only, about 260 ms, direction-aware. Under
  `prefers-reduced-motion` they become a plain fade.
- Checkboxes are native `<input type="checkbox">` elements (visually hidden) inside a full-size
  `<label>`, so keyboard support, screen readers and form semantics come for free.
- No shadcn, Radix or Framer Motion. The handful of primitives (`Button`, `Spinner`, `Bar`) live
  next to where they're used.

## Consequences

- The client bundle stays React plus our own code.
- Exit animations would require keeping the old step mounted. We accept enter-only motion.
- If the builder grows a larger design system, shadcn can be adopted then; the tokens already
  map onto its semantic names.
