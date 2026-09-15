# Design — Simulation Panel

Architect-owned. The panel is a **pure controller** over `useSimulationStore`. It contains
no simulation logic and never imports a demo or the engine. See steering/architecture.md
(components → store only).

## 1. Component tree

```
components/SimulationPanel/
  SimulationPanel.tsx        # shell: floating dock, header (count + reset), collapse
  ProfileToggleRow.tsx       # one row per profile: switch + description + inline controls
  VariantRadioGroup.tsx      # color-blindness variant picker (radiogroup)
  IntensitySegmented.tsx     # mild|moderate|severe segmented control (range-equivalent)
  useProfileControls.ts      # local hook holding per-profile draft options + handlers
  SimulationPanel.test.tsx   # interaction tests
```

Only `SimulationPanel.tsx` is exported from an `index.ts` barrel.

## 2. Data flow (no new global state)

The panel reads from the store and calls its actions. It keeps **local UI-only draft
options** (selected variant, chosen intensity) in `useProfileControls`, because the store
today only persists options for *active* profiles (`setProfileOptions` no-ops when
inactive). This lets the user pre-pick a variant/intensity before enabling a profile.

```
store:  activeProfiles[], isActive(id), toggleProfile(id, options?),
        setProfileOptions(id, options), reset()
        profileRegistry.list() -> ProfileMetadata[]  (labels/categories)

panel local (useProfileControls):
  options: Record<ProfileId, ProfileOptions>   // drafts, seeded with defaults
  setOption(id, patch)  ->
     merge into local options
     if isActive(id): store.setProfileOptions(id, merged)   // live update
  toggle(id) -> store.toggleProfile(id, options[id])
```

Contract touchpoints (all already exist — no store changes needed):
- `useSimulationStore((s) => s.activeProfiles)` for reactive active list + count.
- `isActive`, `toggleProfile`, `setProfileOptions`, `reset` actions.
- `profileRegistry.list()` for metadata (id, name, description, category).

### Option shapes (from the profiles)
- color-blindness: `{ variant: 'protanopia' | 'deuteranopia' | 'tritanopia' }` (default
  `deuteranopia`).
- low-vision: `{ intensity: 'mild' | 'moderate' | 'severe' }` (default `moderate`).
- tremor: `{ intensity: 'mild' | 'moderate' | 'severe' }` (default `moderate`).
- dyslexia / deafness / screen-reader: no options in this panel version.

A small static map `PROFILE_CONTROL_CONFIG` (in `useProfileControls.ts`) declares, per id,
which inline control to render (`'variant' | 'intensity' | none`) and its default. Adding a
future profile's controls is a one-entry change — it does not touch the components.

## 3. Layout & visual (Technical Precision)

- Fixed panel, anchored right, `top`/`bottom` inset, width ~320px, `bg-canvas`, 1px
  `hairline` border, no drop shadow (design system uses borders for depth). Mono labels,
  compact rows separated by hairline dividers.
- Header: title "Simulation" + a count badge (`N active`) + a "Reset" ghost button + a
  collapse button. Collapsed state = a compact launcher button (also fixed) that reopens.
- Each `ProfileToggleRow`: switch on the left, name + one-line description, and — when the
  profile has inline controls — the variant radios / intensity segmented control beneath,
  shown always (they only take effect when active; documented in US-2/US-3).
- Active rows get a left accent bar + an "on" text label (not color-only) to satisfy the
  "not by color alone" rule (the tool must model good practice).

## 4. Accessibility of the panel itself

- Root `<aside aria-label="Accessibility simulation controls">` with an `<h2>` heading.
- Toggle = `<button role="switch" aria-checked>` with a text label; space/enter toggles.
- Variant picker = `role="radiogroup"` with `aria-label`, arrow-key roving handled by
  native radio inputs (simplest correct option).
- Intensity = a segmented group of radios (`role="radiogroup"`) labeled "Intensity",
  OR a native `<input type="range" min=0 max=2 step=1>` with `aria-valuetext` mapping to
  mild/moderate/severe. Decision: **segmented radios** — discrete named steps are clearer
  and avoid range↔label ambiguity for screen readers.
- Visible focus everywhere (global ring). Collapse animation guarded by
  `prefers-reduced-motion` (Framer Motion `useReducedMotion`).
- Count badge announced via `aria-live="polite"` when it changes.

## 5. Trade-offs / decisions

- **Local draft options vs. extending the store.** We keep drafts local to the panel
  rather than adding inactive-profile option storage to the store. Rationale: the store's
  job is *active simulation state*; pre-selection is a pure UI affordance. If a future
  block needs persisted pre-selection (e.g. URL sharing), we revisit the store then.
- **Segmented radios over a range slider.** The requirement says "sliders", but intensity
  is a 3-value enum. A native range with `aria-valuetext` works, yet named radio segments
  are less ambiguous for AT and match the design system's segmented pills. We implement the
  segmented control and style it slider-like; it remains keyboard/AT friendly. (Flagged so
  you can veto: if you specifically want a dragging range affordance, say so.)
- **Always-visible inline controls.** Simpler and discoverable; they are inert until the
  profile is active (and update live once it is). Alternative (collapse controls until
  active) hides discoverability; rejected.
- **No engine import.** Guarantees the panel is content-agnostic and testable by mocking
  only the store.

## 6. Testing (Testing Library)

Mock `useSimulationStore` (and `profileRegistry`) so tests assert wiring, not engine
behavior:
- Renders one switch per registered profile with its name.
- Clicking a switch calls `toggleProfile(id, draftOptionsForId)` exactly once.
- Selecting a color-blindness variant while active calls
  `setProfileOptions('color-blindness', { variant })`; while inactive it does NOT call the
  store (only updates local draft) and the next `toggle` passes that variant.
- Changing intensity while active calls `setProfileOptions(id, { intensity })`.
- Count badge reflects `activeProfiles.length`; Reset calls `reset()`.
- Switch exposes correct `role="switch"` + `aria-checked`.

## 7. Integration note (not this block)

`setRoot(previewEl)` is called by whoever mounts the preview container (demo-usecases
block). The panel does not manage the root. Until a root exists, toggles still update
store state (engine records intent and applies once a root is set) — consistent with the
engine's documented no-root behavior.
