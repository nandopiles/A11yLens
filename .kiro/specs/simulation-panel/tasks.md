# Tasks — Simulation Panel

- [ ] 1. `useProfileControls.ts` — local draft options hook
  - `PROFILE_CONTROL_CONFIG` map (per id: control kind + default), draft options state,
    `setOption(id, patch)` (live `setProfileOptions` when active), `toggle(id)`.
  - _Requirements: US-1, US-2, US-3_

- [ ] 2. `IntensitySegmented.tsx` — accessible segmented radiogroup (mild|moderate|severe).
  - _Requirements: US-3, US-6_

- [ ] 3. `VariantRadioGroup.tsx` — color-blindness variant radiogroup.
  - _Requirements: US-2, US-6_

- [ ] 4. `ProfileToggleRow.tsx` — switch + name/description + inline control slot; active
  styling not by color alone.
  - _Requirements: US-1, US-4, US-6_

- [ ] 5. `SimulationPanel.tsx` — floating dock, header (count badge + reset + collapse),
  rows from `profileRegistry.list()`; `aria-label` region; reduced-motion collapse.
  - _Requirements: US-1, US-4, US-5, US-6_

- [ ] 6. `index.ts` barrel exporting `SimulationPanel`.

- [ ] 7. `SimulationPanel.test.tsx` (Testing Library) — mock store; assert toggle/variant/
  intensity wiring, count badge, reset, switch semantics.
  - _Requirements: US-1, US-2, US-3, US-4_

- [ ] 8. Verify: `npm run lint`, `npm run build`, `npx vitest run` all green.

> Not in this block: demo content/preview root lifecycle, comparison slider, metrics, audit.
