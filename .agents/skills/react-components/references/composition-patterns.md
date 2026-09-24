# Composition patterns

These are the tools for Tier 3 components — ones meant to be reused, restyled, and rearranged by consumers you won't be pairing with. Each pattern trades a bit of upfront complexity for an API that scales without ever needing to be redesigned.

## Composition over prop drilling

Before reaching for Context or a config-object prop, check whether the problem is really "a value needs to reach a deep descendant" or actually "a component needs to render *some JSX* that only its consumer knows about." The second case doesn't need the value threaded through every layer at all — pass the already-built JSX down as `children` (or a named slot prop) instead:

```jsx
// 🔴 Every layer has to know about `theme` just to forward it
function Page({ theme }) {
  return <Layout theme={theme} />;
}
function Layout({ theme }) {
  return <Sidebar theme={theme} />;
}
function Sidebar({ theme }) {
  return <div className={theme}>...</div>;
}

// 🟢 Sidebar's consumer builds the piece that needs `theme`; nothing in between touches it
function Page({ theme }) {
  return <Layout sidebar={<Sidebar className={theme} />} />;
}
function Layout({ sidebar }) {
  return <div className="layout">{sidebar}</div>;
}
```

Reach for Context when a genuinely large, distant part of the tree needs the same value (theming, current user, localization) and passing it explicitly would mean threading it through many components that have no other reason to know about it. Context is for "many distant consumers," not a substitute for a couple of props.

## Custom hooks: the reuse boundary

Covered in the main skill file for Tier 2, but it's also the backbone of Tier 3 components — a compound component's shared behavior is usually one hook (`useTabsState`, `useDisclosure`) that each sub-part reads from context, keeping the *behavior* in one testable place while the *rendering* is split across small components.

## Compound components (shared implicit state via Context)

Use this when a component has structurally distinct parts that the consumer needs to arrange, omit, or restyle independently — a `Card` with a header/content/footer, a `Tabs` with a list and panels. A single component with a dozen configuration props (`headerTitle`, `headerAction`, `footerContent`...) gets unmaintainable fast; compound components let the consumer write JSX instead of filling out a form.

```jsx
const TabsContext = createContext(null);

function Tabs({ defaultValue, children }) {
  const [active, setActive] = useState(defaultValue);
  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}

function TabsList({ children }) {
  return <div role="tablist" className="tabs-list">{children}</div>;
}

function TabsTrigger({ value, children }) {
  const { active, setActive } = useContext(TabsContext);
  return (
    <button
      role="tab"
      aria-selected={active === value}
      onClick={() => setActive(value)}
    >
      {children}
    </button>
  );
}

function TabsPanel({ value, children }) {
  const { active } = useContext(TabsContext);
  if (active !== value) return null;
  return <div role="tabpanel">{children}</div>;
}

// Usage — the consumer controls arrangement, spacing, and which parts to include
<Tabs defaultValue="account">
  <TabsList>
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="billing">Billing</TabsTrigger>
  </TabsList>
  <TabsPanel value="account">...</TabsPanel>
  <TabsPanel value="billing">...</TabsPanel>
</Tabs>
```

Each sub-part stays a small, single-purpose component; the Context call hides the "how do the parts talk to each other" plumbing from the consumer, who only ever sees plain JSX. Guard against misuse by throwing from the context hook if it's `null` (i.e. a sub-part was used outside its parent) rather than failing silently later.

## Variant API (the `cva` pattern)

For components with visual variants (`variant`, `size`, `tone`...), define the full set of class combinations in one place instead of accumulating boolean props. `class-variance-authority` (`cva`) is the common tool for this, but the underlying idea holds even without the library: one function mapping `{ variant, size }` to a class string, with explicit defaults.

```jsx
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        outline: "border border-border text-foreground",
        destructive: "bg-destructive/10 text-destructive",
      },
      size: {
        sm: "text-xs px-2 py-0.5",
        default: "text-sm px-2.5 py-1",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

function Badge({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant, size, className }))}
      {...props}
    />
  );
}
```

A few details worth deliberately keeping when you build one of these:
- **`{...props}` spread last** (after your own attributes) so a consumer's `className`/`onClick`/`aria-*` can override or extend the defaults rather than being silently dropped.
- **`data-slot`/`data-variant`/`data-size` attributes** are cheap to add and pay off for consumer-side CSS overrides (`[data-slot=badge][data-variant=outline]`) and for tests/e2e selectors, without polluting the class string.
- **`defaultVariants`** so the component has a sane default when a consumer doesn't specify one — a component that requires every variant prop to be set explicitly is more fragile than one with an opinionated default.

## Polymorphism: the `asChild`/Slot pattern

Sometimes a styled component (a `Button`) needs to render as a *different* element — a `Button` that's actually a `<Link>` for routing, say — without losing its variant styles or losing the semantics of the element it's replacing (a link should still be an `<a>` for right-click/open-in-new-tab/crawler behavior, not a styled `<div>` with an `onClick`). The `asChild` pattern (Radix's `Slot`) merges the wrapper's props/styles onto its single child element instead of rendering its own wrapper:

```jsx
import { Slot } from "radix-ui";

function Button({ asChild = false, variant, className, ...props }) {
  const Comp = asChild ? Slot.Root : "button";
  return <Comp className={cn(buttonVariants({ variant }), className)} {...props} />;
}

// Renders an <a>, not a <button>, but keeps all of Button's variant styling
<Button asChild variant="outline">
  <Link href="/settings">Settings</Link>
</Button>
```

Reach for this only when a component genuinely needs to change its rendered element while keeping its styling API — it's not a default, since it adds a dependency and a layer of indirection that plain composition (just rendering `<Link className={buttonVariants({variant})}>`) can often solve just as well without a library.

## Controlled vs. uncontrolled components

This is the callback-up principle applied to inputs. A **controlled** component receives its value as a prop and reports changes via a callback — the parent owns the state and the source of truth lives outside the component:

```jsx
<input value={query} onChange={e => setQuery(e.target.value)} />
```

An **uncontrolled** component owns its value internally (via `defaultValue` and, if needed, a `ref`) and only reports out at meaningful moments (on submit, on blur) rather than every keystroke. Build reusable form primitives to support both — accept `value`/`onChange` when provided, fall back to internal state via `defaultValue` when not — the same way native `<input>` does. Don't build a component that's controlled-only if consumers might reasonably want to just read a ref on submit instead of wiring up state for a field nobody needs to watch live.

## Refs as props (React 19+)

`forwardRef` is no longer necessary for function components to accept a `ref` — as of React 19, `ref` can be declared as a normal prop:

```jsx
function Input({ ref, className, ...props }: React.ComponentProps<"input"> & { ref?: React.Ref<HTMLInputElement> }) {
  return <input ref={ref} className={cn(inputStyles, className)} {...props} />;
}
```

Only use `forwardRef` when targeting an older React version or a codebase that hasn't migrated. If you see `forwardRef` in a React 19+ codebase, it's not wrong, but plain ref-as-prop is the current idiomatic form and worth pointing out as a simplification if you're already touching that component.