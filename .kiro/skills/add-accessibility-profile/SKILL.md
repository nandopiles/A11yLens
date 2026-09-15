---
name: add-accessibility-profile
description: Step-by-step pattern for adding a new accessibility simulation profile to A11yLens core, following the AccessibilityProfile + EffectScope + ProfileRegistry pattern established by the six built-in profiles. Activate when the user asks to add, create, or simulate a new accessibility profile/impairment.
---

# Add an accessibility profile

This skill captures the exact pattern used to build the six built-in profiles
(color blindness, low vision, dyslexia, tremor, deafness, screen reader) so adding
another is mechanical and consistent.

## When to activate

- The user wants to simulate a new condition/impairment (e.g. photophobia, reduced
  motion sensitivity, cognitive load, hearing tinnitus overlay).
- Any request phrased as "add a profile", "simulate X", "new AccessibilityProfile".

## Golden rules (non-negotiable)

1. **Revert must be exact.** `apply()` then `revert()` must leave the root
   byte-for-byte equivalent. Never hand-roll teardown — allocate every side effect
   through an `EffectScope` and let `dispose()` undo it in LIFO order.
2. **Own only your effects.** A profile must not read or overwrite another profile's
   state. Filter-based profiles *append* to `root.style.filter`, never replace it.
3. **Mark injected nodes** with `data-a11ylens="<id>"` so they're identifiable and
   never collide with page content.
4. **No React/Zustand in `core/`.** Profiles are pure DOM logic. Browser-only APIs
   (speech, media) go behind an injectable abstraction so tests can fake them.
5. **Guard double-apply**: if `isActive()`, call `revert(root)` first, then re-apply.

## Steps

### 1. Pick id + category
Add the new id to `ProfileId` and confirm the `ProfileCategory`
(`visual | motor | cognitive | auditory`) in `src/core/engine/types.ts`. Category
drives application order (`visual → cognitive → motor → auditory`).

### 2. Create the profile file
`src/core/profiles/<Name>Profile.ts`, implementing `AccessibilityProfile`:

```ts
import { EffectScope } from '../engine/EffectScope';
import type { AccessibilityProfile, ProfileMetadata, ProfileOptions } from '../engine/types';

export interface <Name>Options extends ProfileOptions {
  // variant / intensity / ...
}

export class <Name>Profile implements AccessibilityProfile {
  readonly metadata: ProfileMetadata = {
    id: '<id>',
    name: '<Human name>',
    description: '<one line>',
    category: '<category>',
  };

  private scope: EffectScope | null = null;

  isActive(): boolean {
    return this.scope !== null;
  }

  apply(root: HTMLElement, options?: <Name>Options): void {
    if (this.isActive()) this.revert(root); // guard double-apply
    const scope = new EffectScope();

    // Allocate EVERY effect through the scope:
    //   scope.setInlineStyle(root, 'filter', '...')   // snapshots + restores
    //   scope.appendChild(parent, node)               // auto-removes
    //   scope.setAttribute(el, 'hidden', '')          // restores prior/absence
    //   scope.addEventListener(root, 'mousemove', fn) // auto-detaches
    //   scope.setInterval(fn, ms) / requestAnimationFrameLoop(fn) // auto-cancels
    // For text mutation: snapshot original nodeValue and restore via scope.add(...).

    this.scope = scope;
  }

  revert(_root: HTMLElement): void {
    if (!this.scope) return; // safe no-op when inactive
    this.scope.dispose();
    this.scope = null;
  }
}
```

### 3. Register it
Add one line in `src/core/engine/createRegistry.ts`:
```ts
registry.register(new <Name>Profile());
```
No engine change is needed — that's the Strategy pattern working.

### 4. Write the test (this is the important part)
`src/core/profiles/<Name>Profile.test.ts` must cover:
- **apply mutation**: assert the expected DOM change (injected node / style / attr).
- **exact revert**: snapshot `root.outerHTML` before apply; after revert assert it
  equals the snapshot exactly (catches leftover `style=""`, orphan nodes, etc.).
- **revert-when-inactive**: is a no-op and does not throw.
- **double-apply**: does not stack duplicate effects.
- For timers/RAF use `vi.useFakeTimers()` or capture the callback; for browser APIs
  inject a fake (see `ScreenReaderProfile` + `FakeSynth`).

### 5. Verify
```
npm run lint && npm run build && npx vitest run
```
All green, no `core/` import from `features/`, `components/`, or `app/`.

## Minimal example — a "reduced-contrast" visual profile

```ts
export class ReducedContrastProfile implements AccessibilityProfile {
  readonly metadata = { id: 'reduced-contrast', name: 'Reduced contrast',
    description: 'Lowers overall contrast.', category: 'visual' } as const;
  private scope: EffectScope | null = null;
  isActive() { return this.scope !== null; }
  apply(root: HTMLElement) {
    if (this.isActive()) this.revert(root);
    const scope = new EffectScope();
    const existing = root.style.getPropertyValue('filter').trim();
    const own = 'contrast(0.6)';
    scope.setInlineStyle(root, 'filter', existing ? `${existing} ${own}` : own);
    this.scope = scope;
  }
  revert(_root: HTMLElement) { if (!this.scope) return; this.scope.dispose(); this.scope = null; }
}
```

Registering + testing it follows steps 3–5 verbatim.

## References
- Contract: `src/core/engine/types.ts`
- Leak guard: `src/core/engine/EffectScope.ts`
- Facade + ordering: `src/core/engine/SimulationEngine.ts`
- Spec: `.kiro/specs/core-simulation-engine/design.md`
- Domain notes: `.kiro/steering/accessibility-domain.md`
