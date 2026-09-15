# Tasks — Core Simulation Engine

- [ ] 1. Define contracts in `src/core/profiles/types.ts`
  - `ProfileCategory`, `ProfileId`, `SimulationResult`, `AccessibilityProfile`, `identityResult()`.
  - _Requirements: US-1, US-4_

- [ ] 2. Implement `ProfileRegistry` in `src/core/engine/ProfileRegistry.ts`
  - `register` (reject duplicate ids), `has`, `get` (throw on missing), `list` (insertion order).
  - _Requirements: US-2_

- [ ] 3. Implement `SimulationEngine` in `src/core/engine/SimulationEngine.ts`
  - `simulate(activeIds)` facade: de-dup, deterministic category+registry ordering,
    left fold via Decorator, identity on empty, throw on unknown id, pure.
  - _Requirements: US-3, US-4_

- [ ] 4. Unit tests (Vitest)
  - `ProfileRegistry.test.ts`: register/get/has/list, duplicate + missing-id errors.
  - `SimulationEngine.test.ts`: identity, deterministic order, cumulative decoration,
    unknown-id throw, input immutability.
  - _Requirements: US-1..US-4_

- [ ] 5. Verify
  - `npm test` green, `npm run build` type-checks, no `core/` imports from upper layers.
  - _Requirements: US-4_

> Note: no concrete accessibility profile is implemented here. Profiles are separate
> specs that depend on this contract.
