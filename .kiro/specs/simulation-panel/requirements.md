# Requirements — Simulation Panel

## Overview

A floating, devtools-style control panel that lets the user toggle the six accessibility
profiles and tune their options in real time. It is a thin controller over the existing
`useSimulationStore` — it holds **no simulation logic** and is **agnostic to whatever demo
content** is mounted in the preview container. It only reads active state and calls store
actions.

## User stories

### US-1 — Per-profile toggles
As a user, I want a toggle for each of the six profiles so I can turn simulations on/off.

Acceptance criteria:
- The panel SHALL render one toggle per profile listed by `profileRegistry.list()`
  (label + short description from each profile's `metadata`).
- Toggling SHALL call `useSimulationStore.toggleProfile(id, currentOptionsForId)`.
- Each toggle SHALL reflect live active state via `isActive(id)` and expose it to
  assistive tech (`role="switch"` + `aria-checked`).

### US-2 — Color-blindness variant submenu
As a user, I want to pick protanopia/deuteranopia/tritanopia for color blindness.

Acceptance criteria:
- WHEN the color-blindness profile is present THEN a variant selector (3 options) SHALL be
  shown, disabled/hidden-collapsed until the profile is active is NOT required — it MAY be
  always visible but only affects the sim when active.
- Selecting a variant SHALL update panel-held options and, if the profile is active, call
  `setProfileOptions('color-blindness', { variant })` so the change applies immediately.
- The selector SHALL be a labeled radio group (`role="radiogroup"`).

### US-3 — Intensity sliders
As a user, I want intensity sliders for low vision and tremor.

Acceptance criteria:
- Low vision and tremor SHALL each expose an intensity control over `mild | moderate |
  severe`.
- Changing intensity SHALL update panel-held options and, if active, call
  `setProfileOptions(id, { intensity })`.
- The control SHALL be an accessible `<input type="range">` (or rad/segmented group) with
  a visible label and text value, keyboard operable.

### US-4 — Active indicator
As a user, I want to see how many / which profiles are active right now.

Acceptance criteria:
- The panel header SHALL show a count badge of active profiles.
- Active toggles SHALL be visually distinct (not by color alone — also state/text/icon).
- A "reset all" action SHALL call `reset()` and clear everything.

### US-5 — Content-agnostic, floating, dockable
As a product owner, I want the panel to work over any demo without coupling.

Acceptance criteria:
- The panel SHALL NOT import any demo/feature module or the engine directly; it talks only
  to `useSimulationStore` + `profileRegistry` metadata.
- The panel SHALL be a fixed floating surface anchored to a side (default right), following
  the Technical Precision design (hairline borders, mono labels, compact density).
- The panel SHALL be collapsible to a compact launcher to stay out of the way.

### US-6 — Accessible & keyboard-first
As any user, I want the panel itself to be fully accessible (it is an a11y tool).

Acceptance criteria:
- All controls SHALL be reachable and operable by keyboard with visible focus.
- The panel SHALL have a labelled region (`aria-label`/heading) and logical tab order.
- Respect `prefers-reduced-motion` for its own expand/collapse animation.

## Out of scope

- The demo content and the preview container lifecycle (owned by demo-usecases spec; the
  panel assumes `setRoot` is called elsewhere).
- Comparison slider, metrics, and audit overlays (later blocks).
