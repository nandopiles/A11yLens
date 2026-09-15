# Requirements — Core Simulation Engine

## Overview

The core simulation engine is the foundational piece of A11yLens. It owns the
`AccessibilityProfile` contract, a `ProfileRegistry` of available profiles, and a
`SimulationEngine` facade that applies and reverts profiles against a live DOM subtree
and notifies the UI through the Zustand store.

Unlike a pure data transform, profiles here **mutate the real DOM** of a preview
container (injecting styles/filters, attaching listeners, speaking text, muting media).
Because of that, **clean reversal is a first-class, safety-critical requirement**: a
profile that leaks on `revert()` will corrupt the demo. Every profile must restore the
container to a byte-for-byte equivalent state.

This spec covers the contract, the six concrete profiles' design, the engine, and the
store wiring. It does **not** cover the UI panel that toggles profiles (next spec).

## User stories

### US-1 — DOM-oriented profile contract
As a developer, I want a single `AccessibilityProfile` interface so every profile is an
interchangeable strategy that applies to and reverts from an `HTMLElement` root.

Acceptance criteria:
- The interface SHALL expose `apply(root: HTMLElement): void` and
  `revert(root: HTMLElement): void`.
- The interface SHALL expose `metadata` with `{ id, name, description, category }` where
  `category` is one of `'visual' | 'motor' | 'cognitive' | 'auditory'`.
- Introducing a new profile SHALL NOT require changing `SimulationEngine`.
- Profiles SHALL be composable: several may be active on the same root at once without
  clobbering each other (Decorator/Composite), and each must own only its own effects.

### US-2 — Clean, idempotent reversal (safety-critical)
As a developer, I want `revert()` to fully undo `apply()` so the preview never degrades.

Acceptance criteria:
- WHEN `apply(root)` then `revert(root)` runs THEN `root` SHALL be structurally and
  attribute-equivalent to its pre-apply state (no leftover nodes, styles, attributes,
  listeners, or timers).
- `apply()` SHALL be idempotent-safe: calling it twice without revert SHALL NOT stack
  duplicate effects, or SHALL be documented as unsupported and guarded.
- `revert()` SHALL be safe to call when not applied (no-op, no throw).
- Any injected node, listener, timer, animation frame, or speech utterance SHALL be
  tracked and released on `revert()`.

### US-3 — Registry of profiles
As a developer, I want a `ProfileRegistry` so profiles register once and resolve by id.

Acceptance criteria:
- WHEN a profile registers THEN it SHALL be retrievable by `id`.
- Duplicate ids SHALL be rejected rather than silently overwritten.
- The registry SHALL list all registered profiles (for the UI) in a stable order.

### US-4 — SimulationEngine facade
As a UI developer, I want a `SimulationEngine` facade so I toggle profiles by id without
knowing their internals.

Acceptance criteria:
- The engine SHALL expose `getActiveProfiles()` and `toggleProfile(id, options?)`.
- `toggleProfile` SHALL apply the profile if inactive and revert it if active.
- Applying/reverting SHALL happen in a deterministic order (visual filters composited
  before behavioral effects) so stacked profiles are consistent.
- Unknown ids SHALL fail explicitly.
- On any change the engine SHALL notify observers via the Zustand store (Observer).
- The engine SHALL support disposing everything (revert all + detach) with no leaks.

### US-5 — The six profiles
As a product owner, I want six concrete profiles, each in its own file, matching the
accessibility-domain steering doc.

Acceptance criteria (per profile, detailed in design.md):
- **ColorBlindnessProfile** — protanopia/deuteranopia/tritanopia via real `feColorMatrix`
  matrices injected as a hidden `<svg>`; applies `filter: url(#id)` to the root.
- **LowVisionProfile** — progressive `blur` + reduced contrast with an intensity param
  (`mild | moderate | severe`).
- **DyslexiaProfile** — altered spacing/line-height and optional periodic letter
  micro-shuffling to simulate unstable text.
- **TremorProfile** — custom rendered cursor driven by `mousemove` with smoothed random
  jitter and an intensity param (native cursor hidden over the root).
- **DeafnessProfile** — force-mute `<video>`/`<audio>` in the root and hide sound-only
  alerts; no visual filter.
- **ScreenReaderProfile** — visually mask content and read the DOM in reading order via
  the Web Speech API, deliberately exposing missing `alt`/`aria-label`.

### US-6 — Testable in isolation
As a developer, I want engine, registry, and profiles to be unit-testable with Vitest in
jsdom, covering apply/revert cleanliness for every profile.

Acceptance criteria:
- `core/` SHALL NOT import from `features/`, `components/`, or `app/`.
- Every profile SHALL have tests asserting `apply()` produces the expected DOM and
  `revert()` restores the original exactly.
- Browser-only APIs (SpeechSynthesis, media playback) SHALL be abstracted so they can be
  faked/mocked in jsdom.

## Out of scope

- The UI panel / controls that call `toggleProfile` (next spec).
- The demo use cases (checkout, feed, etc.) content.
- Real axe-core audit wiring (separate concern).
