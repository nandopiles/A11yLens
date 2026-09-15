# Design — Core Simulation Engine

Architect-owned. This is the contract the coder implements. It defines the
`AccessibilityProfile` interface, the technical approach and trade-offs for each of the
six profiles, and the `ProfileRegistry` + `SimulationEngine` facade with Zustand wiring.
No final implementation here — interfaces, approach, and decisions only.

## 1. Guiding principles

- **Strategy** — every profile implements the same interface; the engine never
  special-cases a profile.
- **Facade** — `SimulationEngine` is the only surface the UI/store touches.
- **Decorator / Composite** — profiles stack on the same root. Each profile owns *only*
  its own effects and must not read or clobber another's.
- **Reversal is sacred** — because profiles mutate a live DOM, every effect a profile
  creates is tracked and released on `revert()`. This is the single most important
  invariant in the whole codebase.

## 2. Module map

```
src/core/
  engine/
    types.ts              # AccessibilityProfile, metadata, categories, options
    ProfileRegistry.ts    # register + resolve by id (rejects duplicates)
    SimulationEngine.ts   # facade: toggle/apply/revert/dispose + store notify
    EffectScope.ts        # per-application teardown tracker (leak guard helper)
  profiles/
    ColorBlindnessProfile.ts
    LowVisionProfile.ts
    DyslexiaProfile.ts
    TremorProfile.ts
    DeafnessProfile.ts
    ScreenReaderProfile.ts
    speech.ts             # SpeechSynthesizer abstraction (injectable for tests)
```

`store/simulationStore.ts` (Zustand) already lives outside `core/`. The engine receives a
notify callback via constructor injection so `core/` stays framework-agnostic (it must
not import Zustand directly — see §6).

## 3. The `AccessibilityProfile` contract (`engine/types.ts`)

```ts
export type ProfileCategory = 'visual' | 'motor' | 'cognitive' | 'auditory';

export type ProfileId =
  | 'color-blindness'
  | 'low-vision'
  | 'dyslexia'
  | 'tremor'
  | 'deafness'
  | 'screen-reader';

export interface ProfileMetadata {
  id: ProfileId;
  name: string;
  description: string;          // short, one line
  category: ProfileCategory;
}

/**
 * Per-profile runtime options (variant, intensity, ...). Kept as a loose bag keyed by
 * profile so toggleProfile(id, options) can pass typed options through. Each profile
 * narrows this to its own shape internally.
 */
export interface ProfileOptions {
  [key: string]: unknown;
}

export interface AccessibilityProfile {
  readonly metadata: ProfileMetadata;

  /**
   * Apply this profile's effect to `root`. MUST track everything it creates so revert()
   * can release it. MUST NOT throw if called on a valid element. SHOULD guard against
   * double-apply (either no-op or re-apply cleanly).
   */
  apply(root: HTMLElement, options?: ProfileOptions): void;

  /**
   * Fully undo apply(): remove injected nodes, inline styles, attributes, listeners,
   * timers, RAFs, and stop any speech. MUST be a safe no-op if not currently applied.
   */
  revert(root: HTMLElement): void;

  /** True while applied to a root. Lets the engine and tests assert state. */
  isActive(): boolean;
}
```

### Why `apply(root)`/`revert(root)` instead of returning a data descriptor

An earlier draft modeled profiles as pure functions returning a `SimulationResult`
descriptor that the UI applied. We reject that here because three of the six profiles
(tremor cursor, screen-reader speech, media muting) are **imperative and stateful** —
they attach listeners, drive `requestAnimationFrame`, and call browser APIs. Forcing
them through a declarative descriptor would push that state into the UI layer and make
teardown ambiguous. Owning apply/revert inside the profile keeps each effect's lifecycle
co-located with the code that created it, which is exactly what makes leak-free reversal
tractable.

## 4. `EffectScope` — the leak guard (`engine/EffectScope.ts`)

To make US-2 mechanical rather than error-prone, profiles do not hand-roll teardown.
They allocate through a small scope that records the inverse of every side effect.

```ts
export class EffectScope {
  /** Register an arbitrary teardown fn; run in LIFO order on dispose(). */
  add(teardown: () => void): void;

  /** Convenience wrappers that auto-register teardown: */
  appendChild(parent: Node, child: Node): void;             // -> removeChild
  setInlineStyle(el: HTMLElement, prop: string, value: string): void; // -> restore prev
  setAttribute(el: HTMLElement, name: string, value: string): void;   // -> restore/remove
  addEventListener<K extends keyof DocumentEventMap>(
    target: EventTarget, type: K, handler: EventListener, opts?: AddEventListenerOptions,
  ): void;                                                   // -> removeEventListener
  setTimeout(fn: () => void, ms: number): void;             // -> clearTimeout
  requestAnimationFrame(fn: FrameRequestCallback): void;    // -> cancelAnimationFrame loop

  /** Run all teardown in LIFO order, then reset. Idempotent. */
  dispose(): void;
}
```

Each profile holds one `EffectScope` per active root. `apply()` allocates effects through
it; `revert()` calls `scope.dispose()`. This turns "did I remember to undo X?" into a
single call and is the backbone of the safety-critical revert requirement.

Trade-off: a tiny bespoke helper vs. pulling a reactive library's effect scope. We keep
it bespoke to stay dependency-free in `core/` and fully controllable in tests.

## 5. The six profiles

Each is a class implementing `AccessibilityProfile`, in its own file, holding an
`EffectScope`. Below: approach + key trade-offs. Shared rule: all injected nodes carry a
`data-a11ylens` attribute so they are identifiable and never collide with page content.

### 5a. ColorBlindnessProfile (`visual`)

Options: `{ variant: 'protanopia' | 'deuteranopia' | 'tritanopia' }` (default deuteranopia).

Approach:
- On `apply`, inject one hidden `<svg data-a11ylens aria-hidden="true">` containing three
  `<filter>` elements (one per variant), each an `<feColorMatrix type="matrix">` with a
  real color-vision-deficiency matrix (below). SVG is positioned off-screen (width/height
  0, absolute) so it never affects layout.
- Set `root.style.filter` to `url(#a11ylens-<variant>)` via the scope.
- `revert` disposes the scope: removes the `<svg>` and restores the previous `filter`.

Real simulation matrices (Machado/Brettel-style, the widely used values; 4x5 RGBA
`feColorMatrix`, last column 0):

```
Protanopia:
0.567 0.433 0     0 0
0.558 0.442 0     0 0
0     0.242 0.758 0 0
0     0     0     1 0

Deuteranopia:
0.625 0.375 0     0 0
0.700 0.300 0     0 0
0     0.300 0.700 0 0
0     0     0     1 0

Tritanopia:
0.950 0.050 0     0 0
0     0.433 0.567 0 0
0     0.475 0.525 0 0
0     0     0     1 0
```

Trade-off: real `feColorMatrix` matrices vs. CSS `grayscale()/sepia()`. The CSS
approximations do not simulate the actual confusion axes of each deficiency (they just
desaturate), which would be misleading for an empathy/audit tool. `feColorMatrix` is a
native, GPU-composited transform that reproduces the correct hue collapse, so we pay a
one-time `<svg>` injection cost for real fidelity — a core selling point of the project.

### 5b. LowVisionProfile (`visual`)

Options: `{ intensity: 'mild' | 'moderate' | 'severe' }` (default moderate).

Approach:
- Map intensity → `{ blurPx, contrast }` (e.g. mild `1.5px/0.9`, moderate `3px/0.8`,
  severe `5px/0.65`).
- Apply `root.style.filter` composing `blur(<px>) contrast(<n>)` through the scope
  (appending to, not overwriting, any existing filter so it can stack with color
  blindness — see composition note §5-stacking).
- `revert` restores the previous inline `filter`.

Trade-off: `filter: blur()` on the root vs. `backdrop-filter`. `backdrop-filter` blurs
what is *behind* an element, which is wrong for simulating the user's own vision of the
content; `filter: blur()` blurs the content itself, matching cataract/macular blur.
We use `filter`.

### 5c. DyslexiaProfile (`cognitive`)

Options: `{ shuffle: boolean }` (default true), `intensity` reserved.

Approach:
- Static layer: apply altered `letter-spacing`, `word-spacing`, and `line-height` to the
  root via the scope to degrade reading rhythm (no external font dependency required; an
  optional swap to a hard-to-read face can be layered later without contract change).
- Dynamic layer (optional, `shuffle`): on a throttled interval, pick visible text nodes
  and transiently permute interior letters of some words (keep first/last letter),
  restoring them a moment later, to evoke "moving letters". All original text is captured
  before mutation and restored verbatim on revert.
- `revert` disposes the scope (clears the interval and restores every touched text node
  and style). Original strings are stored per text node so restoration is exact.

Trade-off: mutating live text nodes is risky for revert. We mitigate by (1) only touching
`Text` nodes we snapshot first, (2) never changing node structure (only `nodeValue`),
and (3) storing the snapshot in the scope so dispose restores it. Alternative — a
canvas/CSS overlay faking jitter — was rejected because it would not stress real text
legibility, which is the point.

### 5d. TremorProfile (`motor`) — most technical

Options: `{ intensity: 'mild' | 'moderate' | 'severe' }` (default moderate) → amplitude
(px) + frequency of jitter.

Approach:
- Inject a custom cursor node (`<div data-a11ylens>` absolutely positioned, `pointer-
  events:none`, high z-index) into the root; hide the native cursor over the root with
  `cursor: none` via the scope.
- Attach a `mousemove` listener (through the scope) that records the true pointer
  position. A `requestAnimationFrame` loop (through the scope) moves the custom cursor to
  the true position plus a **smoothed random offset**: offset is low-pass filtered noise
  (e.g. `offset += (rand()-0.5)*amp - offset*damping`) so it looks like a physiological
  tremor rather than teleporting.
- `revert` disposes the scope: cancels the RAF loop, removes the listener, removes the
  cursor node, restores `cursor`.

Trade-off: **custom rendered cursor vs. `cursor: none` + relying on the OS cursor.** We
cannot move the real OS cursor from JS (no API), so to *show* tremor we must render our
own cursor and hide the native one. A pure-CSS approach can only change the cursor image,
not add motion. Rendering our own node is the only way to visibly displace the pointer.
Cost: the custom cursor is decorative and does not drive real hit-testing, so we document
that clicks still land where the true pointer is (the simulation conveys the *felt*
difficulty, and stacking with small targets in demos makes the point).

### 5e. DeafnessProfile (`auditory`)

Options: none.

Approach:
- On `apply`, query `root` for `<video>`/`<audio>`, record each element's prior `muted`
  value, set `muted = true` (registering restore in the scope). Also hide elements marked
  as sound-only alerts (convention: `[data-sound-only]`) by toggling a hidden attribute
  through the scope.
- No visual filter on the page itself — the *absence* of captions is the message.
- `revert` disposes the scope: restores each element's `muted` and un-hides alerts.

Trade-off: we intentionally do not fabricate captions. The profile's value is exposing
the gap, so it only removes/mutes and relies on demo content lacking captions.

### 5f. ScreenReaderProfile (`visual`+narrative; category `visual`)

Options: `{ rate?: number }`.

Approach:
- On `apply`, overlay the root with an opaque mask (`<div data-a11ylens>` covering it, or
  set content `opacity:0` plus a visible "screen reader mode" banner) via the scope, so
  the user cannot rely on sight.
- Walk the DOM in reading order building an utterance list from accessible names
  (textContent, `alt`, `aria-label`, roles). Deliberately **do not invent** names for
  elements missing `alt`/`aria-label` — announce them as "image, no description" so the
  defect is audible.
- Feed the list to a `SpeechSynthesizer` abstraction (`profiles/speech.ts`) wrapping
  `window.speechSynthesis`. The abstraction is injectable so tests use a fake.
- `revert` disposes the scope (removes overlay/banner, restores opacity) and calls
  `synth.cancel()` to stop speech immediately.

Trade-off: Web Speech API is browser-only and unavailable in jsdom. We inject a
`SpeechSynthesizer` interface so the profile is testable and degrades gracefully
(no-op speak) where the API is absent.

### Stacking / composition note

Multiple visual filter profiles (color blindness + low vision) must not overwrite each
other's `root.style.filter`. Rule: filter-based profiles **append** their filter function
to the existing `filter` string and, on revert, remove exactly their own function (the
`EffectScope.setInlineStyle` snapshots the prior value, so LIFO dispose restores
correctly regardless of activation order). The engine applies profiles in category order
`visual → cognitive → motor → auditory` so composition is deterministic.

## 6. ProfileRegistry (`engine/ProfileRegistry.ts`)

```ts
export class ProfileRegistry {
  register(profile: AccessibilityProfile): void; // throws on duplicate id
  has(id: ProfileId): boolean;
  get(id: ProfileId): AccessibilityProfile;       // throws if missing
  list(): AccessibilityProfile[];                 // insertion order
}
```

## 7. SimulationEngine facade (`engine/SimulationEngine.ts`)

```ts
export interface ActiveProfile {
  id: ProfileId;
  options?: ProfileOptions;
}

export type SimulationChangeListener = (active: ActiveProfile[]) => void;

export class SimulationEngine {
  constructor(
    registry: ProfileRegistry,
    getRoot: () => HTMLElement | null,   // the preview container to mutate
    onChange?: SimulationChangeListener, // Observer hook (store subscribes here)
  );

  getActiveProfiles(): ActiveProfile[];

  /** Apply if inactive, revert if active. Reorders application by category. */
  toggleProfile(id: ProfileId, options?: ProfileOptions): void;

  /** Explicit setters used by the future UI. */
  setProfileOptions(id: ProfileId, options: ProfileOptions): void;

  /** Revert everything and detach; safe to call multiple times. */
  dispose(): void;
}
```

Behavior:
- `toggleProfile` throws on unknown id (US-4). If no root is available it records intent
  but applies nothing until a root exists (documented).
- After any state change it calls `onChange(getActiveProfiles())` (Observer).
- Re-application ordering: whenever the active set changes, the engine reverts all then
  re-applies in category order, guaranteeing deterministic composition regardless of
  toggle sequence. (Simple and correct; profiles are cheap to re-apply.)

### Zustand wiring (Observer, kept out of core)

`store/simulationStore.ts` owns `activeProfiles` state and creates the engine, passing
`onChange` = a store setter. Components read active profiles reactively from the store;
they never call profiles directly. This keeps `core/` free of any Zustand import and
satisfies the dependency rules in steering/architecture.md.

## 8. Testing strategy (Vitest + jsdom)

- `ProfileRegistry`: register/get/has/list, duplicate + missing-id throw.
- `EffectScope`: LIFO teardown, style/attr restore, listener/timer/RAF cleanup.
- Each profile — the critical suite:
  - snapshot `root.outerHTML` (and relevant listener/timer state) before `apply`,
  - assert `apply` produced the expected mutation (injected svg/filter/cursor/mute/etc.),
  - call `revert`, assert `root.outerHTML` equals the pre-apply snapshot exactly,
  - assert `revert` when not applied is a no-op,
  - assert double-`apply` does not stack duplicates.
- ScreenReaderProfile uses a fake `SpeechSynthesizer`; TremorProfile drives fake
  `mousemove` + a controllable RAF; DeafnessProfile uses stub media elements.
- `SimulationEngine`: toggle on/off, unknown-id throw, category ordering, `onChange`
  fires with the active set, `dispose` reverts all.

## 9. Non-goals

UI panel/controls, demo use-case content, and axe-core audit wiring are separate specs.
