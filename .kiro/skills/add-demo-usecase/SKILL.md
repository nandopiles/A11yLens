---
name: add-demo-usecase
description: Step-by-step pattern for adding a new demo use case to A11yLens, following the Repository Pattern + demo registry established by the four built-in demos (checkout, feed, navigation, dashboard). Activate when the user asks to add, create, or design a new demo/scenario/mini-app for the simulator.
---

# Add a demo use case

Captures the exact pattern used to build the four demos so a fifth is mechanical.

## When to activate

- The user wants a new scenario in the simulator (e.g. "a date-picker demo", "a video
  player demo", "a data table demo").

## Golden rules (non-negotiable)

1. **Total isolation.** A demo NEVER imports `@/store`, `@/core`, or
   `@/components/SimulationPanel`. The engine reaches it only through the DOM once the
   simulator points `setRoot` at the preview container. A demo is pure content.
2. **Repository Pattern.** All copy/data lives in a `*.data.ts` file. The render component
   holds no hard-coded content.
3. **Intentional defects are the point.** Each defect must be *revealable by a specific
   profile* and annotated in code:
   `// A11Y-DEFECT: <what> — revealed by <Profile> — WCAG <criterion>`
4. **Defects stay local.** Introduce them with raw elements/inline styles inside the demo.
   Never degrade the shared `components/primitives/*` — those must remain accessible.
5. **Clean up your own effects.** If the demo uses timers/intervals, clear them on unmount
   (the engine's leak rules apply to demos too).

## Steps

### 1. Add the id
Add the new demo id to `DemoId` in `src/features/demos/types.ts`.

### 2. Create the folder
`src/features/<name>-demo/`:
- `<name>.data.ts` — typed mock data (the repository).
- `<Name>Demo.tsx` — render only, consumes the data, defects annotated.

```tsx
export function <Name>Demo() {
  return (
    <div data-demo-goal="<goal-id>">
      {/* A11Y-DEFECT: ... — revealed by <Profile> — WCAG <criterion> */}
      {/* render from *.data.ts */}
    </div>
  );
}
```

### 3. Register it
Add a `DemoDefinition` entry in `src/features/demos/registry.ts` with `meta`
(`id`, `title`, `summary`, `goalLabel`, `defects[]`) and `Component`. The route
`/simulate/:demo` and the demo switcher pick it up automatically via `listDemos()`.

### 4. Test
- The registry test already asserts `getDemo`/`listDemos`; extend counts if needed.
- Add a light render test asserting the intentional defects are PRESENT (regression guard),
  e.g. inputs with no accessible name, positive tabindex, color-only legend, etc.

### 5. Verify
```
npm run lint && npm run build && npx vitest run
```

## Defect → profile cheat sheet

| Want to demonstrate | Introduce | Revealed by |
|---|---|---|
| Missing labels/roles | placeholder-only inputs, `<div onClick>` | Screen reader |
| Color-only meaning | red-only errors, color-only legend | Color blindness |
| Low contrast | pale text/buttons | Low vision |
| Small/cramped targets, motion | 24px hit areas, auto-advance, blink | Motor tremor |
| Dense unreadable text | no headings, tight line-height | Dyslexia |
| Audio-only info | media without captions, `[data-sound-only]` | Deafness |

## References
- Contracts + registry: `src/features/demos/{types,registry}.ts`
- Example demos: `src/features/{checkout,social-feed,navigation,dashboard}-demo/`
- Simulator integration: `src/features/simulator/SimulatorPage.tsx`
- Spec: `.kiro/specs/demo-usecases/design.md`
