# Tasks — Demo Use Cases

- [x] 1. Contracts + registry — `features/demos/types.ts`, `features/demos/registry.ts`
  - `DemoId`, `DemoMeta`, `DemoDefinition`; `getDemo(id)` (fallback checkout), `listDemos()`.
  - _Requirements: US-1, US-2, US-7_

- [x] 2. checkout-demo — `checkout.data.ts` + `CheckoutDemo.tsx`
  - Placeholder-only labels, red-only error (real local validation), low-contrast Pay
    button, no focus + cramped targets. Annotate each defect.
  - _Requirements: US-2, US-3_

- [x] 3. social-feed-demo — `feed.data.ts` + `SocialFeedDemo.tsx`
  - Auto-advance + blink (self-cleaning interval), dense no-heading text, low-contrast
    caption over image. Annotate defects.
  - _Requirements: US-2, US-4_

- [x] 4. navigation-demo — `navigation.data.ts` + `NavigationDemo.tsx`
  - `<div onClick>` dropdown, broken focus-trap modal (Esc/overlay dismiss), scrambled
    tabindex. Annotate defects.
  - _Requirements: US-2, US-5_

- [x] 5. dashboard-demo — `dashboard.data.ts` + `DashboardDemo.tsx`
  - Color-only series + legend, no text alternative for the chart. Annotate defects.
  - _Requirements: US-2, US-6_

- [x] 6. Simulator integration — update `SimulatorPage.tsx`
  - Render `getDemo(:demo).Component` in the preview container; `reset()` on demo change;
    add demo switcher from `listDemos()`; surface `goalLabel`.
  - _Requirements: US-7_

- [x] 7. Tests — `registry.test.ts` + light per-demo defect-presence render tests +
  isolation check.
  - _Requirements: US-1, US-2_

- [x] 8. Verify: `npm run lint`, `npm run build`, `npx vitest run` green.

- [x] 9. /skill-creator: `.kiro/skills/add-demo-usecase` documenting the pattern.
  - _Requirements: US-8_

> Not in this block: comparison slider, metrics tracking, audit overlays.
