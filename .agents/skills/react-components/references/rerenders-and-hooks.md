# Re-renders, state, and effects

## Why components re-render (and why most of it is normal)

A component re-renders when: its own state changes, its parent re-renders (and it isn't memoized), or a context it reads changes. That's the whole list. A re-render is React doing its job — recalculating what the UI should look like for the current state. It's only a problem when the recalculated output is **identical** to what was already on screen, because then you paid the render cost (and possibly a DOM diff) for nothing.

Before "fixing" a re-render, confirm it's actually wasteful. A component that re-renders 40 times while a user drags a slider, updating a number on screen each time, is working correctly. A component that re-renders 40 times because a sibling's unrelated state changed and it happens to re-compute the exact same JSX every time — that's the one to fix.

## useState vs. useReducer

Reach for `useState` when you have independent values that update on their own. Reach for `useReducer` when:
- Multiple sub-values update together in response to the same event (so you'd otherwise call several `setX` calls back to back for one interaction), or
- The next state depends on the previous state in a non-trivial way, or
- The same set of transitions shows up in more than one event handler.

A reducer centralizes "what are all the ways this state can change" into one function you can read top to bottom, instead of scattering that logic across every handler that happens to touch the state.

```jsx
function cartReducer(state, action) {
  switch (action.type) {
    case "added":
      return { ...state, items: [...state.items, action.item] };
    case "removed":
      return { ...state, items: state.items.filter(i => i.id !== action.id) };
    default:
      return state;
  }
}
```

## What useEffect is for (and the derived-state anti-pattern)

An Effect synchronizes a component with something **outside** React — a subscription, a DOM API, a timer, a network request whose result the component doesn't own. The tell: if you can describe what it does without mentioning "when this renders," it's probably a legitimate Effect.

The most common misuse is using an Effect to compute a value from props/state that already exist:

```jsx
// 🔴 Unnecessary Effect — this is derived state
const [fullName, setFullName] = useState("");
useEffect(() => {
  setFullName(firstName + " " + lastName);
}, [firstName, lastName]);
```

This is wrong on two counts: it creates a second render pass (render with stale `fullName`, commit, run Effect, render again with the correct value — a visible flicker on slower devices), and it creates a value that can drift out of sync if something else touches `fullName`. Just compute it during render:

```jsx
// 🟢 No Effect needed
const fullName = firstName + " " + lastName;
```

The same applies to resetting state when a prop changes (pass a `key` to the component instead, so React remounts it with fresh state — don't `useEffect` a manual reset), and to handling something that happened because of a specific user action (put that logic in the event handler, not an Effect watching for the state the handler set — otherwise you can't tell "the user did X" from "X happened for some other reason").

Effects earn their keep for: subscribing to an external store, syncing with a non-React widget, fetching data the component itself needs to own the lifecycle of, or logging analytics on a value actually changing. Always return a cleanup function when the Effect's setup created something that needs undoing (a subscription, a listener, a timer, an in-flight request) — the cleanup runs before every re-run of the Effect and on unmount.

## Cleanup functions and race conditions

The classic race condition: a component fetches based on a prop, the prop changes before the first fetch resolves, and the *first* fetch's response arrives after the second and overwrites it with stale data.

```jsx
// 🔴 No protection against out-of-order responses
useEffect(() => {
  fetchResults(query).then(setResults);
}, [query]);
```

```jsx
// 🟢 Ignore stale responses via a cleanup flag
useEffect(() => {
  let ignore = false;
  fetchResults(query).then(data => {
    if (!ignore) setResults(data);
  });
  return () => { ignore = true; };
}, [query]);
```

```jsx
// 🟢 Or cancel the request outright with AbortController
useEffect(() => {
  const controller = new AbortController();
  fetchResults(query, { signal: controller.signal })
    .then(setResults)
    .catch(err => { if (err.name !== "AbortError") throw err; });
  return () => controller.abort();
}, [query]);
```

Stale closures are the other common gotcha: a function created during one render captures the props/state values from *that* render. If it's called later (a `setTimeout` callback, an event listener added in an Effect with an empty dependency array), it can act on outdated values. The fix is almost always to include the value in the dependency array so the Effect re-runs with a fresh closure, or to use a functional state update (`setCount(c => c + 1)`) when the next state only depends on the previous state — that sidesteps the staleness entirely.

## useLayoutEffect vs useEffect

Both run after the render commits to the DOM. The difference is timing relative to paint: `useEffect` runs after the browser paints, so anything it changes will visibly flash before-then-after. `useLayoutEffect` runs synchronously before the browser paints, blocking paint until it's done. Reach for `useLayoutEffect` only when you need to measure something in the DOM (an element's size/position) and synchronously adjust styles or state before the user sees anything — e.g., positioning a tooltip based on measured content size. Using it by default is a performance mistake since it blocks paint; `useEffect` is the right default for everything else, including data fetching and subscriptions.

## useMemo / useCallback — and the React Compiler

The manual mental model, if you're not on a compiler-enabled project: memoize a computation or function when at least one of these is true — it's passed to a child wrapped in `memo` and you need referential stability to make that memoization actually skip re-renders, it's used as a dependency of another Hook (another `useMemo`/`useCallback`, or an Effect) and an unstable reference would cause that Hook to fire every render, or the computation itself is measurably expensive (sorting/filtering a large list, heavy formatting) and re-running it on every keystroke is the actual bottleneck. Memoizing everything "just in case" adds code and a dependency array to maintain for no benefit — profile before reaching for it.

**If the project has the React Compiler enabled** (stable since October 2025 and the default in current Next.js/Vite/Expo templates), most of this is handled automatically at build time — the compiler statically memoizes values and functions more precisely than hand-written `useMemo`/`useCallback` typically do, so default to writing plain code without them. `useMemo`/`useCallback` remain useful as an *escape hatch* even under the compiler: when a value feeds a Hook's dependency array and you need a specific stability guarantee, or when integrating with a library that relies on reference equality in a way the compiler can't see into (e.g., a form library's `watch()`, drag-and-drop libraries keyed on handler identity). When you don't know whether a codebase has the compiler, ask or check `next.config`/build config rather than assuming either way — writing manual memoization isn't wrong when there's no compiler, and omitting it isn't wrong when there is one; the mistake is only in over- or under-applying it relative to what's actually running.

## Key prop gotchas

`key` tells React which array item is which across renders, so it can match up state correctly instead of reusing a DOM node/component instance for the wrong data. Use a stable, unique id from the data. Using the array index breaks the moment the list can reorder, have items inserted/removed, or be filtered — items after the change point get associated with the wrong key, which can silently transplant local state (an open dropdown, an input's typed value) onto the wrong row. Index keys are fine only for lists that are static and never reorder.

The flip side: `key` is also a tool, not just a requirement — changing a component's `key` intentionally is the idiomatic way to force React to discard its state and remount it fresh (e.g., resetting a form when switching between two records, instead of an Effect that manually resets every field).

## Rules of React (why they matter beyond style)

- **Components and Hooks must be pure during render** — same props/state/context in, same output out, no mutating props/state directly, no side effects during the render itself (do those in an Effect or an event handler). This isn't a style rule: React (and the Compiler) assumes it in order to safely skip/reorder/batch renders. Break it and you get symptoms that look unrelated to the cause — double-firing effects in development (Strict Mode intentionally double-invokes to surface impurities), stale UI, or the Compiler silently skipping optimization for that component.
- **Only call Hooks at the top level**, never inside conditions/loops/nested functions — React matches Hooks to state by call order, and a conditional Hook call desyncs that order between renders.
- **Don't call component functions directly** (`MyComponent()`) — render them as JSX (`<MyComponent />`) so React can track them as part of the tree, not a plain function call.