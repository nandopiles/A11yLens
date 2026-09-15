# Design — Core Simulation Engine

## Goals

Define the contracts and the composition engine that all accessibility profiles plug
into, following Strategy (interchangeable profiles), Facade (single engine entry point),
and Decorator (stackable, cumulative effects). Pure TypeScript, no React/DOM.

## Module map

```
src/core/
  profiles/
    types.ts              # AccessibilityProfile, SimulationResult, categories
  engine/
    ProfileRegistry.ts    # register + resolve profiles by id
    SimulationEngine.ts   # facade: compose active profiles → SimulationResult
```

## Contracts (`profiles/types.ts`)

```ts
export type ProfileCategory = 'visual' | 'behavioral';

export type ProfileId =
  | 'color-blindness'
  | 'low-vision'
  | 'dyslexia'
  | 'tremor'
  | 'deafness'
  | 'screen-reader';

/**
 * The composable result the engine produces. Each field is optional so a profile
 * only contributes what it affects. The UI reads this and applies it to the preview.
 */
export interface SimulationResult {
  /** CSS filter chain applied to the visual preview (e.g. blur, contrast). */
  cssFilters: string[];
  /** ids of SVG <filter> elements to apply, in order (e.g. feColorMatrix). */
  svgFilterIds: string[];
  /** Freeform, additive flags behavioral profiles can set. */
  flags: Record<string, boolean>;
  /** Ordered list of the profile ids that produced this result. */
  appliedProfileIds: ProfileId[];
}

/**
 * Strategy interface. Every profile is interchangeable and decorates the incoming
 * result (Decorator): it receives the accumulated result so far and returns the next.
 */
export interface AccessibilityProfile {
  readonly id: ProfileId;
  readonly name: string;
  readonly category: ProfileCategory;
  /**
   * Decorate the incoming result with this profile's effect.
   * MUST be pure: no mutation of `incoming`, returns a new SimulationResult.
   */
  apply(incoming: SimulationResult): SimulationResult;
}

export function identityResult(): SimulationResult {
  return { cssFilters: [], svgFilterIds: [], flags: {}, appliedProfileIds: [] };
}
```

## ProfileRegistry (`engine/ProfileRegistry.ts`)

Responsibilities: hold the set of available profiles, resolve by id, reject duplicates.

```ts
export class ProfileRegistry {
  private readonly profiles = new Map<ProfileId, AccessibilityProfile>();

  register(profile: AccessibilityProfile): void; // throws on duplicate id
  has(id: ProfileId): boolean;
  get(id: ProfileId): AccessibilityProfile;       // throws if missing
  list(): AccessibilityProfile[];                 // insertion order
}
```

Errors are explicit (throw) per US-2/US-3 — no silent overwrite or ignore.

## SimulationEngine (`engine/SimulationEngine.ts`)

The Facade. Constructed with a `ProfileRegistry`. Given the active profile ids it
composes their effects via the Decorator chain.

```ts
export class SimulationEngine {
  constructor(private readonly registry: ProfileRegistry) {}

  /**
   * Compose the active profiles into a single result.
   * - empty input → identityResult()
   * - deterministic order: profiles applied in a fixed category order
   *   (visual first, then behavioral), then by registry order within a category
   * - unknown id → throws
   * Pure function of (registry, activeIds).
   */
  simulate(activeIds: ProfileId[]): SimulationResult;
}
```

### Deterministic ordering

To keep composition stable regardless of the order the UI toggles profiles:
1. De-duplicate `activeIds`.
2. Sort by category (`visual` before `behavioral`), then by registry insertion order.
3. Fold left: `result = profile.apply(result)` starting from `identityResult()`.
4. Append each applied id to `appliedProfileIds`.

## Pattern mapping

- **Strategy** → `AccessibilityProfile` implementations are interchangeable.
- **Facade** → `SimulationEngine.simulate()` is the only thing the UI/store calls.
- **Decorator** → each `apply(incoming)` wraps the previous result cumulatively.
- **Observer** (later) → the Zustand store will call `simulate()` on state change; not
  part of this spec.

## Testing (Vitest)

- `ProfileRegistry`: register/get/has/list, duplicate rejection, missing-id throw.
- `SimulationEngine`: identity on empty, deterministic order independent of input order,
  cumulative decoration, unknown-id throw, purity (input not mutated).
- Use lightweight fake profiles in tests; no concrete profiles needed.

## Non-goals

Concrete profiles, SVG filter definitions, axe-core, store, and UI are separate specs.
