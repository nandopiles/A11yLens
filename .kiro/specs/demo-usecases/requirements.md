# Requirements — Demo Use Cases

## Overview

Four self-contained mini-apps ("demos") that render realistic UI with **intentional,
teachable accessibility defects**. Each demo mounts inside the simulator's preview
container so the `SimulationPanel` can apply profiles to it — the demo itself knows
**nothing** about the engine, the store, or which profiles exist. Demo data is decoupled
from render via the Repository Pattern (steering/architecture.md).

The four demos: `checkout`, `feed`, `navigation`, `dashboard`. Their ids match the route
`/simulate/:demo` already wired in the simulator.

## User stories

### US-1 — Isolation (no engine coupling)
As an architect, I want demos fully decoupled from simulation.

Acceptance criteria:
- A demo component SHALL NOT import from `@/store`, `@/core`, or `@/components/SimulationPanel`.
- A demo SHALL render only its own DOM inside the preview container; the engine mutates
  that DOM from the outside.
- The simulator SHALL select which demo to render from the `:demo` route param via a demo
  registry, defaulting gracefully for unknown ids.

### US-2 — Repository-decoupled data
As a developer, I want each demo's content in a separate data module.

Acceptance criteria:
- Each demo SHALL have a `<demo>.data.ts` exporting typed mock data (the repository).
- The render component SHALL consume that data and hold no hard-coded content.
- Adding/editing content SHALL not require touching render logic.

### US-3 — checkout-demo (intentional defects)
A payment/review form that looks finished but is quietly broken.

Acceptance criteria (defects, each mapped to what reveals it):
- Inputs with **labels not programmatically associated** (placeholder-only or detached
  text) → exposed by ScreenReaderProfile.
- Validation errors shown **by red color only**, no text/icon → exposed by
  ColorBlindnessProfile.
- A primary button with **insufficient contrast** → exposed by LowVision/ColorBlindness.
- Inputs with **no visible focus** and **small/tightly packed targets** → exposed by
  Tremor + keyboard nav.

### US-4 — feed-demo
An infinite-ish social feed.

Acceptance criteria:
- **Auto-scrolling / rapidly blinking animation** with no pause control (vestibular /
  Tremor-sensitivity story; must respect `prefers-reduced-motion` for the app chrome but
  intentionally NOT for the demo content, since that IS the defect being shown — documented).
- **Dense text with no heading hierarchy** and low line-height → exposed by Dyslexia.
- **Low-contrast text over images** → exposed by LowVision/ColorBlindness.

### US-5 — navigation-demo
A nav with a dropdown and a modal.

Acceptance criteria:
- A modal with a **broken focus trap** (focus escapes) and a **scrambled tab order**
  (`tabindex` misuse) → exposed by keyboard nav + ScreenReaderProfile.
- Dropdown items that are non-semantic (`<div onClick>`) with no roles → exposed by
  ScreenReaderProfile.

### US-6 — dashboard-demo
Charts that encode information by color alone.

Acceptance criteria:
- A chart/legend where series are **distinguished only by color**, no labels/patterns →
  exposed by ColorBlindnessProfile.
- Data points/images with **no text alternative** → exposed by ScreenReaderProfile.

### US-7 — Simulator integration
As a user, I want the demo to actually appear in the simulator.

Acceptance criteria:
- `SimulatorPage` SHALL render the selected demo inside the preview container that is
  wired to `setRoot`, replacing the current placeholder.
- Switching `:demo` SHALL swap demos and reset active profiles cleanly (no leaks).
- A small in-page demo switcher SHALL let the user change demo without going back to the
  landing.

### US-8 — Skill
After completion, generate `.kiro/skills/add-demo-usecase` documenting the pattern so a
fifth demo is mechanical.

## Notes on "intentional defects"

These demos deliberately violate WCAG to make the simulation meaningful. Every defect is
annotated in code (`// A11Y-DEFECT: <what> — revealed by <profile> — WCAG <criterion>`) so
the code doubles as teaching material and the future audit block can be cross-checked
against known issues.

## Out of scope

- Comparison slider, metrics tracking, and audit overlays (later blocks). Demos expose the
  hooks/markers those blocks need but do not implement them.
