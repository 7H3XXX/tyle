# Accessibility and semantics

This applies at every tier, not just Tier 3 design-system work — a Tier 1 throwaway button is just as capable of trapping a keyboard user as a Tier 3 one.

## Reach for native HTML before ARIA

Native elements come with behavior built in: `<button>` is focusable, operable with Enter/Space, and announced as a button by every screen reader without a single ARIA attribute. A `<div onClick={...}>` styled to look like a button has none of that for free — you'd have to hand-roll `tabIndex`, a `keydown` handler for Enter/Space, and `role="button"` just to match what `<button>` gives you natively, and it's easy to miss one.

The rule of thumb: **use ARIA to patch a gap native HTML doesn't cover, not as the default.** Concretely:
- Interactive → `<button>`, `<a href>` (for navigation specifically — don't use a link for an action that doesn't change the URL), native form controls (`<input>`, `<select>`, `<textarea>`).
- Structure → `<nav>`, `<main>`, `<header>`, `<footer>`, `<ul>`/`<ol>`/`<li>` for actual lists, `<table>` for actual tabular data — these give assistive tech landmarks and structure for free.
- Every `<img>` needs `alt` (empty `alt=""` specifically for decorative images, so screen readers skip them instead of reading a filename).
- Every form input needs a programmatically associated `<label>` (wrapping it, or `htmlFor`/`id` pair) — a placeholder is not a label; it disappears on focus and isn't reliably announced.

Only build a custom widget with ARIA roles (`role="tablist"`, `role="dialog"`, `role="combobox"`...) when there's no native element for what you're building — and when you do, the corresponding keyboard/focus behavior below isn't optional, it's part of what makes the role correct.

## Keyboard operability

Everything a mouse user can do, a keyboard-only user needs to be able to do too:
- Every interactive element must be reachable via Tab and operable via Enter/Space (native elements give you this; custom ones need explicit handlers).
- Tab order should follow visual/reading order — avoid positive `tabIndex` values, which reorder focus in a way that's easy to get wrong; `tabIndex={0}` (include in natural order) and `tabIndex={-1}` (programmatically focusable only) are the two values you actually need.
- Composite widgets (tabs, menus, toolbars) use **roving tabindex**: only the active item is in the Tab sequence (`tabIndex={0}`), the rest are `tabIndex={-1}` and reachable via arrow keys within the widget — otherwise a widget with 10 tabs costs a keyboard user 10 Tab presses just to get past it.
- Dialogs/modals need focus **trapped** inside them while open (Tab shouldn't escape to the page behind), focus **moved** to the dialog on open, and focus **restored** to the triggering element on close. Escape should close a dismissible dialog/menu/popover.

## Visible focus and state

- Never remove the focus outline (`outline: none`) without replacing it with an equally visible custom focus style — invisible focus is invisible for everyone, not just screen reader users.
- Custom toggles/selections need both a visual state change and a programmatic one: `aria-pressed` for toggle buttons, `aria-selected` for tab/option-like selection, `aria-expanded` for disclosure triggers (accordions, dropdowns, menus) — the visual and the announced state should never disagree.
- Don't communicate state (error, required, selected) through color alone — pair it with text, an icon, or an ARIA attribute so it isn't lost on someone who can't perceive the color difference.

## Forms specifically

- Associate every error message with its field via `aria-describedby`, and mark the field `aria-invalid` when it's in an error state, so assistive tech announces the error when the field receives focus, not just visually next to it.
- Mark required fields with the native `required` attribute (or `aria-required` if native validation is intentionally disabled) rather than only a visual asterisk.
- Announce dynamically-appearing validation/status messages with `aria-live="polite"` (or `role="status"`/`role="alert"` for more urgent messages) so a screen reader user hears them without needing to re-focus the field.

## Quick self-check before shipping an interactive component

- Can I do everything with just a keyboard — reach it, operate it, escape it?
- Does every non-decorative image/icon-only button have accessible text (`alt`, `aria-label`, or visually-hidden text)?
- If I built a custom role, did I also build the keyboard/focus behavior that role implies — or would a native element have given me this for free?
- Is focus visible, and does it land somewhere sensible after an action (a dialog closes, an item is deleted from a list)?