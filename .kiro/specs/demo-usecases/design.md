# Design — Demo Use Cases

Architect-owned. Four decoupled demos that render realistic UI with intentional, teachable
a11y defects. Demos are pure content: they never import the store, engine, or panel. The
simulator mounts the selected demo into the preview container that is wired to `setRoot`.

## 1. Why this shape (storytelling first)

The whole product lands or dies on these demos. Two principles drive the design:

1. **Every defect must be *revealable* by a specific profile.** A defect nobody can "feel"
   through a simulation is noise. So each defect is chosen to light up under a named
   profile, and annotated with which one + the WCAG criterion. This also gives the audit
   block (B5) a ground-truth list to validate axe-core against.
2. **The demo must look plausibly finished.** The gap between "looks done" and "is broken"
   is the emotional payload. Defects are subtle (placeholder-as-label, red-only errors),
   not cartoonish.

## 2. Architecture — Repository Pattern + registry

```
src/features/
  checkout-demo/
    CheckoutDemo.tsx        # render only, consumes data
    checkout.data.ts        # repository: typed mock data
  social-feed-demo/
    SocialFeedDemo.tsx
    feed.data.ts
  navigation-demo/
    NavigationDemo.tsx
    navigation.data.ts
  dashboard-demo/
    DashboardDemo.tsx
    dashboard.data.ts
  demos/
    types.ts                # DemoDefinition, DemoMeta
    registry.ts             # id -> { meta, Component } ; getDemo(id), listDemos()
```

### Contracts (`demos/types.ts`)

```ts
export type DemoId = 'checkout' | 'feed' | 'navigation' | 'dashboard';

export interface DemoMeta {
  id: DemoId;
  title: string;
  /** One-line pitch shown in the switcher. */
  summary: string;
  /** The action the metrics block (B4) will time, e.g. "Submit payment". */
  goalLabel: string;
  /** Known defects for teaching + audit cross-check. */
  defects: Array<{ what: string; revealedBy: string; wcag: string }>;
}

export interface DemoDefinition {
  meta: DemoMeta;
  Component: React.ComponentType;
}
```

`registry.ts` holds the four `DemoDefinition`s. `getDemo(id)` returns the definition or a
fallback (checkout). This is the same Strategy/registry idea used for profiles, applied to
content — the simulator never hard-codes a demo.

### Isolation guarantee

Demos import only React, their own `*.data.ts`, and shared **presentational** primitives
(`components/primitives/*`). A lint-time convention (and code review) forbids
`@/store`, `@/core`, `@/components/SimulationPanel` imports in `features/*-demo/`. The
engine reaches the demo purely through the DOM once `setRoot(previewEl)` points at the
container — no code path connects them.

## 3. Defect matrix (the teaching core)

Each defect is annotated in code as:
`// A11Y-DEFECT: <what> — revealed by <Profile> — WCAG <criterion>`

| Demo | Defect | Revealed by | WCAG |
|---|---|---|---|
| checkout | Inputs labeled by placeholder only (no `<label for>`) | ScreenReader | 1.3.1 / 4.1.2 |
| checkout | Validation error signalled by red text only | ColorBlindness | 1.4.1 |
| checkout | "Pay" button contrast ~2.5:1 | LowVision / ColorBlindness | 1.4.3 |
| checkout | No `:focus-visible` styles + 24px cramped targets | Tremor / keyboard | 2.4.7 / 2.5.8 |
| feed | Auto-advancing + fast blink, no pause | Tremor / vestibular | 2.2.2 / 2.3.1 |
| feed | Wall of text, no headings, tight leading | Dyslexia | 1.3.1 / 1.4.8 |
| feed | Caption text over photo at low contrast | LowVision / ColorBlindness | 1.4.3 |
| navigation | Modal focus trap escapes | keyboard / ScreenReader | 2.4.3 / 2.1.2 |
| navigation | Positive `tabindex` scrambling order | keyboard | 2.4.3 |
| navigation | `<div onClick>` menu items, no role/name | ScreenReader | 4.1.2 |
| dashboard | Series distinguished by color only | ColorBlindness | 1.4.1 |
| dashboard | Data viz with no text alternative | ScreenReader | 1.1.1 |

## 4. Per-demo render notes

- **checkout**: two-column review + payment form (mirrors the landing's SimulatorPreview
  card). Local React state only for its own validation (so the "red-only error" is real and
  can be triggered by an invalid submit). No global state.
- **feed**: a column of posts from `feed.data.ts`. Auto-advance via a local `setInterval`
  highlighting the "active" post + a CSS blink animation on a "LIVE" badge. Cleans up its
  own interval on unmount (demos must not leak either). The *content* ignores reduced-motion
  on purpose (that's the defect); the app chrome respects it.
- **navigation**: a top nav with a dropdown (built from `<div onClick>` on purpose) and a
  "Sign in" modal whose focus handling is intentionally broken (no focus containment). The
  modal is dismissible by Escape/overlay so it is not a usability dead-end in the demo.
- **dashboard**: a small bar/scatter rendered with divs/SVG where categories are only
  color-coded, plus a color-only legend and an untitled chart region.

## 5. Simulator integration (US-7)

`SimulatorPage` changes:
- Read `:demo`, resolve via `getDemo(id)`, render `<Definition.Component />` inside the
  preview container (replaces the placeholder).
- Keep the existing `setRoot`/`reset` lifecycle. Add: when `:demo` changes, `reset()` runs
  (revert all profiles) before the new demo mounts, so no effect leaks across demos.
- Add a compact **demo switcher** (segmented links to the four routes) in the simulator
  header, using `listDemos()` metadata. It is app chrome, not part of the mutated preview.
- Show the demo's `goalLabel` somewhere unobtrusive (feeds B4 later).

## 6. Trade-offs / decisions

- **Real local state for validation vs. faked error state.** Checkout uses real local
  state so the red-only error is genuinely triggered by interacting — more honest and lets
  B4 time a real "submit". Cost: a little more code than a static mock.
- **Defects in content, not in shared primitives.** Our shared `Button`/`Badge` are
  accessible. Demos introduce defects *locally* (raw elements, inline styles) so the
  reusable design system stays correct and the defects are contained + annotated.
- **Auto-motion in feed ignores reduced-motion by design.** This is the one place we
  intentionally violate a preference, because the violation is the lesson. It is documented
  and scoped to the demo content only; the app shell always respects the preference.
- **Registry fallback** to checkout for unknown `:demo` keeps the route robust without a
  separate 404.

## 7. Testing

- `registry.test.ts`: `getDemo` resolves each id and falls back for unknown.
- Per demo, a light render test (Testing Library) asserting the key defect markers exist
  in the DOM (e.g. checkout has an input whose accessible name is empty; dashboard legend
  has no text labels). These double as regression guards that the teaching defects stay
  present. We assert presence of defects, not their absence.
- Isolation: a test (or documented lint rule) that demo modules don't import store/core.

## 8. Skill (US-8)

After coder finishes, `/skill-creator` writes `.kiro/skills/add-demo-usecase` documenting:
data file → render component (defects annotated) → register in `demos/registry.ts` → route
already generic → render test. Minimal example included.

## 9. Non-goals

Comparison slider, interaction tracking/metrics, and audit overlays are later blocks. Demos
only expose stable DOM + `goalLabel` metadata those blocks will consume.
