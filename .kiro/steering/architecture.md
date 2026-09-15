# A11yLens — Architecture

This document is shared context for every agent working on A11yLens. It is always
loaded. Follow it unless a spec's `design.md` explicitly overrides a detail.

## Layered architecture

The codebase is split into clean layers with a strict dependency direction:

```
app        →  features  →  components  →  core
                    ↘         ↘            ↑
                     store (Zustand) ──────┘
```

- `core/` — Pure logic. No React, no DOM-framework code. 100% unit-testable. Contains
  the simulation engine, accessibility profiles, and the audit runner.
- `features/` — Screen-level feature slices (landing, use-case demos, etc.). Compose
  `components/` and read/write the `store/`.
- `components/` — Reusable presentational + interactive UI (SimulationPanel,
  ComparisonSlider, MetricsSummary, AuditOverlay, and primitives).
- `store/` — Zustand stores. The single source of truth for UI-facing state
  (active profiles, current use case, audit results).
- `app/` — App bootstrap, routing, top-level composition.

### Dependency rules

- `core/` must never import from `features/`, `components/`, `store/`, or `app/`.
- `components/` may import from `core/` types and the `store/`, never from `features/`.
- `features/` may import anything below it.
- Anything that touches SVG filters, axe-core, or profile internals belongs in `core/`.

## Folder structure

```
src/
  core/
    engine/
      SimulationEngine.ts      # Facade over profile application
      ProfileRegistry.ts       # Registers/looks up available profiles
    profiles/
      types.ts                 # AccessibilityProfile interface
      ColorBlindnessProfile.ts
      LowVisionProfile.ts
      DyslexiaProfile.ts
      TremorProfile.ts
      DeafnessProfile.ts
      ScreenReaderProfile.ts
    audit/
      auditRunner.ts           # Wrapper over axe-core
  features/
    landing/
    checkout-demo/
    social-feed-demo/
    navigation-demo/
    dashboard-demo/
  components/
    SimulationPanel/
    ComparisonSlider/
    MetricsSummary/
    AuditOverlay/
  store/
    simulationStore.ts
  app/
    App.tsx
    router.tsx
  styles/
    index.css
  test/
    setup.ts
```

## Design patterns

- **Strategy** — Each accessibility profile (color blindness, low vision, dyslexia,
  tremor, deafness, screen reader) is an interchangeable strategy implementing the
  same `AccessibilityProfile` interface. Adding a profile must not require changing
  the engine.
- **Facade** — `SimulationEngine` is the single entry point the UI talks to. UI code
  never touches SVG filters or profile internals directly.
- **Decorator / Composite** — Profiles are stackable. Multiple active profiles each
  decorate the result of the previous one, composing their transforms.
- **Observer / Pub-Sub** — Via Zustand. The audit panel and metrics react to state
  changes without coupling to the engine.
- **Repository** — Demo use cases (checkout, feed, nav, dashboard) are loaded as data
  decoupled from simulation logic.

## Conventions

- Path alias: import from `@/` (maps to `src/`).
- Accessibility is a first-class requirement in this project itself: every UI must
  have correct semantics, aria-labels where needed, visible focus, and logical tab
  order — from the first commit.
- Keep `core/` framework-agnostic so it stays trivially testable with Vitest.
