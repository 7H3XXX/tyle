---
name: react-components
description: Use this skill whenever writing, refactoring, reviewing, or debugging React components, hooks, or JSX/TSX UI code — including requests like "build a component," "make this reusable," "create a form/modal/dropdown/table," "why does this re-render so much," "turn this into a design system piece," or any task that touches component structure, props, state, or composition. Covers componentization, composition patterns (compound components, variant APIs, slots), custom hooks, prop design, the re-render lifecycle (useState/useEffect/useReducer/useMemo/useCallback/useLayoutEffect), performance, and accessibility, grounded in the official React docs. Trigger this even for small component requests — the tier system below scales the response to fit.
---

# React Component Architecture

React renders as a **waterfall**: data flows down from parent to child as props, and state lives as high in the tree as it needs to and no higher. Children never reach up to mutate a parent directly — they call a **callback prop** the parent handed them, and the parent decides what happens next. Almost every structural bug in a React codebase — prop drilling nightmares, components that re-render for no reason, state that's out of sync — comes from forgetting this shape. Every recommendation in this skill is in service of keeping that waterfall clean.

This skill is not a style preference. It's the difference between a component that's easy to delete and replace in six months, and one that's load-bearing for a codebase in ways nobody documented.

## Step 1 — Classify the tier before you write anything

Don't default to one style out of habit. Look at what's actually being asked and pick the lightest tool that will still be right in a month. Over-engineering a one-off is as much of a mistake as under-engineering a shared primitive.

| Signal | Tier |
|---|---|
| One piece of UI, one place it's used, state is a couple of independent `useState` calls, rendering logic is a conditional or a `.map` | **1 — Simple** |
| Logic or markup is duplicated across two or more places, OR a component's JSX is growing multiple distinct responsibilities, OR there's non-trivial side-effect logic (fetching, subscriptions, timers) that clutters the component | **2 — Medium** |
| The component has visual **variants** (variant/size/state axes), has structurally distinct **sub-parts** that consumers need to arrange or restyle (a card's header vs. footer, a tabs list vs. a tab panel), will be **reused across features** or live in a shared UI/design-system layer, or needs to support **polymorphism** (render as a different underlying element) | **3 — Complex** |

If you're unsure between two tiers, start one tier lower. It's cheap to extract a hook or split a component later once a second use case actually shows up (the "rule of three" — don't abstract for a hypothetical second caller, abstract once you have one). It's expensive to unwind a compound-component API that turned out to only ever have one consumer.

State this classification briefly to the user as part of your answer — "this is a simple presentational piece, so I kept it to one component with prop-driven rendering" — so the choice reads as deliberate, not default.

## Step 2 — Apply the right pattern for that tier

### Tier 1 — Simple: props + rendering techniques

One component, driven entirely by its props. Reach for:
- Conditional rendering (`&&`, ternaries, early returns) for optional UI — prefer early returns when a condition guards a big chunk of JSX, ternaries for small inline swaps.
- `.map()` with a **stable, unique `key`** (an id from the data, never the array index if the list can reorder, filter, or have items inserted/removed).
- The `children` prop instead of a `content`/`render` prop when you're just slotting in JSX — it's the idiomatic React way to let a parent hand a child some markup.

```jsx
function EmptyState({ title, description, icon }) {
  return (
    <div role="status" className="empty-state">
      {icon}
      <h3>{title}</h3>
      {description && <p className="text-muted">{description}</p>}
    </div>
  );
}
```

Don't reach for Context, reducers, or extracted hooks here — they add indirection a simple component doesn't need yet.

### Tier 2 — Medium: small pieces + custom hooks

Split by **responsibility**, not by arbitrary size. A component earns a split when it's doing two genuinely different jobs (e.g., "manages filter state" and "renders a table row") — not just because it's long. Two tools do most of the work:

1. **Extract a custom hook** when stateful logic (especially anything effect-driven — fetching, subscriptions, event listeners, timers) could be described in one sentence independent of any particular JSX. The hook owns the *logic*; the component stays responsible for the *rendering*. Name it `useX` for what it gives you, not what it does internally (`useDebouncedValue`, not `useTimeoutTracker`).

```jsx
function useDebouncedValue(value, delayMs) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id); // cleanup avoids a stale write after unmount/re-trigger
  }, [value, delayMs]);

  return debounced;
}
```

2. **Extract a small component** when a chunk of JSX has its own clear identity and could be named as a noun (`SearchResultRow`, `FilterChip`) — pass it data via props, and let it call back up via a prop (`onSelect`, `onRemove`) rather than reaching into parent state.

This tier still leans on plain prop passing between the pieces — it just isn't all crammed into one function anymore.

### Tier 3 — Complex: componentization + composition

This is the shadcn/Radix model, and it earns its complexity because these components are meant to be **reused and restyled by someone who isn't you**. Two techniques, usually combined:

**Variant API** — one component, a closed set of visual variants driven by a props-to-classes map (`cva` or equivalent), not by ad hoc boolean props (`isPrimary`, `isLarge`, `isDanger` sprawl into an unmaintainable combinatorial mess — a single `variant` and `size` prop with a defined set of values doesn't).

**Compound composition** — instead of one component with a dozen configuration props, expose several small components that share implicit context and get arranged by the consumer:

```jsx
<Card>
  <CardHeader>
    <CardTitle>Plan</CardTitle>
    <CardAction><Button variant="ghost" size="icon-sm"><MoreIcon /></Button></CardAction>
  </CardHeader>
  <CardContent>...</CardContent>
</Card>
```

This is more work to build than one `<Card title="..." action={...}>` mega-prop component, but it scales: new sub-parts don't require touching the parent's prop signature, and the consumer controls layout/order/omission freely. See `references/composition-patterns.md` for the full pattern set — compound components with context, the variant/`cva` pattern, the `asChild`/Slot polymorphism pattern, and controlled-vs-uncontrolled APIs — with worked examples including why the shadcn `Button`/`Card` code you may be extending is shaped the way it is (the `data-slot`/`data-variant` attributes, prop spreading, `cn()` merging).

## Core data-flow principles

These hold at every tier — they're what "the waterfall" means in practice:

- **State lives at the lowest common ancestor that needs it, and no higher.** If two siblings need the same value, lift it to their parent; don't reach for global state as a default.
- **Data flows down as props; events flow up as callbacks.** A child never mutates a parent's state directly — it calls `onX(newValue)` and the parent decides what to do, including whether to update at all. This is also what makes controlled inputs (`value` + `onChange`) work.
- **Prefer composition over configuration to avoid prop drilling.** If a value only needs to pass through a middle component to reach a grandchild, that middle component often doesn't need to know about the prop at all — pass the already-built JSX down through `children` or a slot prop instead of threading the value through every layer.
- **Derive, don't duplicate.** If a value can be calculated from existing props/state during render, calculate it during render. Storing it in `useState` and syncing it with `useEffect` creates a second source of truth that can drift and causes an extra render on top.

## The re-render discipline

A re-render should mean "the UI needs to show something new." If a component re-renders and produces the exact same output, that's a signal — usually an unstable prop reference breaking memoization, state that's storing something derivable, or an effect writing state it didn't need to. Re-renders themselves aren't the enemy (they're how React shows new state); *purposeless* re-renders are.

This is deep enough to need its own reference — **read `references/rerenders-and-hooks.md`** whenever the task involves `useState`, `useEffect`, `useReducer`, `useMemo`, `useCallback`, `useLayoutEffect`, or a "why does this re-render / feel slow / flicker" question. It covers: `useState` vs. `useReducer`, what `useEffect` is and isn't for (and the derived-state anti-pattern), cleanup functions and race conditions (stale fetches, `AbortController`), `useLayoutEffect` vs `useEffect`, and how the React Compiler changes the default advice on `useMemo`/`useCallback` (most modern setups no longer need them hand-written — but you should still recognize when they're the right escape hatch).

## Non-negotiable guardrails

- **No re-renders without a reason.** See above — don't ship a component whose parent re-renders cause a cascade of children re-rendering to show identical output.
- **No components that are slow to use.** Watch for expensive work (sorting, filtering, formatting) running unmemoized on every render of a large list; watch for effects that fetch or subscribe more often than the data actually changes; don't block the initial render on work that could be deferred or streamed in.
- **No gotchas.** Race conditions from out-of-order async responses, stale closures capturing an old value inside an effect or callback, `key` misuse causing state to leak between list items or reset when it shouldn't, effects that fire infinitely because a dependency is recreated every render, components that mutate props or state directly instead of through their setters — all covered with concrete fixes in `references/rerenders-and-hooks.md`.

## Must-always-do

- **Write semantic HTML.** Reach for the native element with the right built-in behavior (`<button>`, not a `<div onClick>`; `<label>` wired to its input; a real `<nav>`/`<ul>`) before reaching for ARIA. ARIA patches gaps native HTML doesn't cover — it isn't the first tool.
- **Accessibility is not optional at any tier**, including Tier 1 throwaway components — see `references/accessibility-and-semantics.md` for the baseline (labeling, keyboard operability, focus handling, not relying on color alone) and the extra requirements for custom interactive widgets (menus, tabs, dialogs, comboboxes).
- **Analyze the component's structural role before writing it.** Is it presentational or does it own state? Is it a leaf or does it need to arrange children? Will it have one consumer or many? The tier classification in Step 1 depends on actually answering this, not guessing.
- **Review your own output before sending it.** Once you have a draft, re-read it specifically for: an unjustified `useEffect` that's really derived state, a `.map()` keyed on index over a reorderable list, a missing cleanup function, a prop drilled through 3+ components that should've been `children`, a custom interactive element missing a role/keyboard handler, a variant prop implemented as five booleans. Fix what you find before responding. This catches more than getting it right the first time does.
- **Briefly justify the shape you chose.** A sentence or two — "extracted the fetch logic into `useProjectList` since the dashboard and the sidebar both need it" — not a full essay. The user should be able to tell the structure was a decision, not a default.

## Reference files

| File | Open it when |
|---|---|
| `references/rerenders-and-hooks.md` | The task touches `useState`/`useEffect`/`useReducer`/`useMemo`/`useCallback`/`useLayoutEffect`, or involves diagnosing/preventing unnecessary re-renders, race conditions, or stale state. |
| `references/composition-patterns.md` | The task is Tier 3 (or borderline 2/3): compound components, variant APIs (`cva`-style), the `asChild`/Slot polymorphism pattern, controlled vs. uncontrolled components, avoiding prop drilling via composition. |
| `references/accessibility-and-semantics.md` | Any component with interactive behavior, custom widgets (menus/tabs/dialogs/combobox), or forms — i.e. almost always. |