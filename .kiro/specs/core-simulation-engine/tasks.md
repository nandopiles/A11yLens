# Tasks — Core Simulation Engine

## Phase 2 — /coder implementation

- [ ] 1. Contracts — `src/core/engine/types.ts`
  - `ProfileCategory`, `ProfileId`, `ProfileMetadata`, `ProfileOptions`,
    `AccessibilityProfile` (apply/revert/isActive/metadata).
  - _Requirements: US-1, US-6_

- [ ] 2. Leak guard — `src/core/engine/EffectScope.ts` (+ test)
  - `add`, `appendChild`, `setInlineStyle`, `setAttribute`, `addEventListener`,
    `setTimeout`, `requestAnimationFrame`, `dispose` (LIFO, idempotent).
  - Test: every helper's teardown restores prior state.
  - _Requirements: US-2_

- [ ] 3. Registry — `src/core/engine/ProfileRegistry.ts` (+ test)
  - register (reject dup), has, get (throw missing), list (insertion order).
  - _Requirements: US-3_

- [ ] 4. Speech abstraction — `src/core/profiles/speech.ts`
  - `SpeechSynthesizer` interface + a real `window.speechSynthesis` adapter +
    a no-op fallback when unavailable.
  - _Requirements: US-5f, US-6_

- [ ] 5. Profiles (one file each, each holds an `EffectScope`) + tests
  - [ ] 5a. `ColorBlindnessProfile.ts` — hidden `<svg>` feColorMatrix, `filter: url(#…)`.
  - [ ] 5b. `LowVisionProfile.ts` — `blur()+contrast()`, intensity param, appends filter.
  - [ ] 5c. `DyslexiaProfile.ts` — spacing/line-height + optional letter shuffle w/ snapshot.
  - [ ] 5d. `TremorProfile.ts` — custom cursor node + mousemove + RAF smoothed jitter.
  - [ ] 5e. `DeafnessProfile.ts` — mute media, hide sound-only alerts, restore on revert.
  - [ ] 5f. `ScreenReaderProfile.ts` — mask + SpeechSynthesizer read in reading order.
  - Each test: pre-apply snapshot → apply asserts mutation → revert restores exactly →
    revert-when-inactive no-op → double-apply no stacking.
  - _Requirements: US-2, US-5, US-6_

- [ ] 6. Facade — `src/core/engine/SimulationEngine.ts` (+ test)
  - `getActiveProfiles`, `toggleProfile(id, options?)`, `setProfileOptions`, `dispose`.
  - Category-ordered revert-all/re-apply; unknown-id throw; `onChange` observer fires.
  - _Requirements: US-4_

- [ ] 7. Store wiring — `src/store/simulationStore.ts`
  - Zustand store holding `activeProfiles`; constructs the engine with `onChange` setter
    and a `getRoot` accessor. No Zustand import inside `core/`.
  - _Requirements: US-4_

- [ ] 8. Register the six profiles + expose a configured engine factory.
  - _Requirements: US-3, US-4_

- [ ] 9. Verify
  - `npm test` green (all profile revert suites pass), `npm run build` type-checks,
    `npm run lint` clean, no `core/` imports from upper layers.
  - _Requirements: US-1..US-6_

## Follow-up

- [ ] 10. /skill-creator: author `.kiro/skills/add-accessibility-profile` documenting the
  file + EffectScope + registry + test pattern used for the six profiles.

> Not in this spec: UI toggle panel, demo use-case content, axe-core audit wiring.
