# Requirements — Core Simulation Engine

## Overview

The core simulation engine is the foundational piece of A11yLens. It owns the
`AccessibilityProfile` contract, a registry of available profiles, and a `SimulationEngine`
facade that composes active profiles and produces the state the UI applies to a preview.
No concrete accessibility profile is implemented in this spec — only the contracts and
the engine that consumes them.

## User stories

### US-1 — Define a profile contract
As a developer, I want a single `AccessibilityProfile` interface so that every profile
is interchangeable and adding one never requires changing the engine.

Acceptance criteria:
- WHEN a new profile type is introduced THEN it SHALL implement `AccessibilityProfile`
  without modifying `SimulationEngine`.
- The interface SHALL expose stable identity (`id`, `name`, `category`) and a way to
  contribute its effect to a composed simulation result.

### US-2 — Register and look up profiles
As a developer, I want a `ProfileRegistry` so that profiles can be registered once and
resolved by id.

Acceptance criteria:
- WHEN a profile is registered THEN it SHALL be retrievable by its `id`.
- WHEN two profiles register with the same `id` THEN the registry SHALL reject the
  duplicate rather than silently overwrite.
- The registry SHALL expose the full list of registered profiles for the UI.

### US-3 — Compose active profiles (Facade + Decorator)
As a UI developer, I want a `SimulationEngine` facade so that I can pass a set of active
profile ids and get back a single composed `SimulationResult` without knowing profile
internals.

Acceptance criteria:
- WHEN no profiles are active THEN the engine SHALL return an identity (no-op) result.
- WHEN multiple profiles are active THEN each SHALL decorate the previous profile's
  result in a deterministic order.
- WHEN an unknown profile id is requested THEN the engine SHALL fail explicitly, not
  silently ignore it.
- The composition SHALL be a pure function of (registered profiles, active ids).

### US-4 — Testable in isolation
As a developer, I want the engine and contracts to be pure TypeScript so that they are
100% unit-testable with Vitest and free of React/DOM dependencies.

Acceptance criteria:
- `core/` SHALL NOT import from `features/`, `components/`, `store/`, or `app/`.
- All engine behavior SHALL be covered by Vitest unit tests.

## Out of scope

- Concrete profile implementations (color blindness, low vision, etc.).
- axe-core audit runner wiring.
- Zustand store and UI components.
