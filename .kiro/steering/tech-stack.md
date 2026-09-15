# A11yLens — Tech Stack

Shared, always-loaded context. Use exactly this stack. Do not introduce Next.js,
Redux, CSS-in-JS runtimes, or component libraries unless a spec explicitly calls for it.

## Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | React 18 + TypeScript | Strong typing for profiles/strategies via interfaces |
| Build tool | Vite | Fast HMR, instant startup |
| Styling | Tailwind CSS | Tokenized from the design system (dark mode, contrast) |
| Global state | Zustand | Lightweight, no boilerplate; holds active profiles |
| Animation | Framer Motion | Smooth profile activate/deactivate transitions |
| Real audit | axe-core | A real accessibility engine under the storytelling |
| Color-blind sim | Native SVG filters (`feColorMatrix`) | Real simulation, not a CSS approximation |
| Testing | Vitest + Testing Library | Coherent with Vite, fast |

## Versions

React ^18.3, Vite ^5.4, TypeScript ^5.5, Tailwind ^3.4, Zustand ^4.5,
Framer Motion ^11.5, axe-core ^4.10, Vitest ^2.0.

## Naming conventions

- Components: `PascalCase` files and exports (`SimulationPanel.tsx`).
- Hooks: `useX` camelCase.
- Core classes/interfaces: `PascalCase` (`SimulationEngine`, `AccessibilityProfile`).
- Store: `simulationStore.ts`, hook exported as `useSimulationStore`.
- Tests: colocated `*.test.ts(x)` next to the unit under test.
- Types-only modules: `types.ts`.

## Scripts

- `npm run dev` — Vite dev server.
- `npm run build` — type-check + production build.
- `npm test` — run the Vitest suite once.
- `npm run lint` — ESLint.

## Design tokens

The Tailwind theme is derived from `stitch_accesslens_accessibility_simulator/technical_precision/DESIGN.md`
("Technical Precision"). Fonts: Geist for UI/prose, JetBrains Mono for code/identifiers.
Elevation comes from 1px hairline borders (`hairline` / `hairline-strong`) rather than
drop shadows. Focus rings are a 2px `primary` stroke with a 2px offset.
