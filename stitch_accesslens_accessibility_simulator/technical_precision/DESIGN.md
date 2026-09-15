---
name: Technical Precision
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#434655'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#747686'
  outline-variant: '#c4c5d7'
  surface-tint: '#2151da'
  primary: '#0037b0'
  on-primary: '#ffffff'
  primary-container: '#1d4ed8'
  on-primary-container: '#cad3ff'
  inverse-primary: '#b7c4ff'
  secondary: '#4e45d5'
  on-secondary: '#ffffff'
  secondary-container: '#6860ef'
  on-secondary-container: '#fffbff'
  tertiary: '#7f2500'
  on-tertiary: '#ffffff'
  tertiary-container: '#a73400'
  on-tertiary-container: '#ffc9b7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b7c4ff'
  on-primary-fixed: '#001551'
  on-primary-fixed-variant: '#0039b5'
  secondary-fixed: '#e3dfff'
  secondary-fixed-dim: '#c3c0ff'
  on-secondary-fixed: '#100069'
  on-secondary-fixed-variant: '#372abf'
  tertiary-fixed: '#ffdbcf'
  tertiary-fixed-dim: '#ffb59c'
  on-tertiary-fixed: '#390c00'
  on-tertiary-fixed-variant: '#832700'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-hero:
    fontFamily: Geist
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Geist
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Geist
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  caption:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-code:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: -0.01em
  label-badge:
    fontFamily: Geist
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.02em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.25rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-tablet: 1.5rem
  margin-desktop: 2.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style

The design system projects deliberate craftsmanship, quiet competence, and relentless utility. Inspired by the rigor of modern developer tools, high-density documentation systems, and classical typography, it prioritizes information architecture, contrast discipline, and legible density over decorative flair. 

The aesthetic is functionalist minimalism:
- **Tone:** Objective, articulate, composed, and highly structured.
- **Visual Stance:** Zero superficial ornamentation. No saturated neon glows, no synthetic gradients, and no gratuitous roundedness. 
- **Core Philosophy:** Content is interface. Structural lines, precise spacing, and razor-sharp type hierarchy frame the data without demanding attention for themselves.

## Colors

The palette is rooted in balanced monochromatic grays, deep slate neutrals, and measured cool blue accents. 

- **Primary (`#1d4ed8`)**: A technical cobalt used strictly for primary interactive states, selected navigation paths, and focused focus-rings. Never used across large display surfaces.
- **Secondary (`#4338ca`)**: A restrained deep indigo reserved for metadata links, contextual code tags, and subtle active indicators.
- **Neutral (`#0f172a`)**: A dense slate black providing maximum readability for text, key icons, and structural divider emphasis.
- **Surfaces**: A pure, neutral spectrum spanning `#ffffff` (canvas default), `#f8fafc` (subtle panel fills), and `#f1f5f9` (hover fills).
- **Dividers & Outlines**: Soft structural borders render at `#e2e8f0` (1px hairline) in light mode, preventing stark wireframe sensations while preserving crisp boundaries.

## Typography

The type system is strictly dual-engine: **Geist** handles display, structural titles, and prose body text, while **JetBrains Mono** is applied for identifiers, metadata, keyboard shortcuts, and code blocks.

- **Weight Discipline:** Avoid heavy black or extra-bold weights. The system caps at `600` (SemiBold) for major titles and `500` (Medium) for interactive buttons/labels.
- **Proportional Tracking:** Headlines apply subtle negative letter-spacing (`-0.02em` to `-0.01em`) to maintain optical density at larger sizes.
- **Reading Rhythm:** Paragraph body text is kept at `14px` and `15px` with a balanced `1.55` to `1.6` line-height ratio, preventing vertical fatigue across documentation and data-dense dashboards.

## Layout & Spacing

Layouts follow a modular 12-column grid constrained to a maximum content width of `1280px` for standard applications and `1440px` for data workspaces. 

- **Grid Metrics:** Desktop surfaces utilize `1.5rem` gutters with `2.5rem` horizontal outer canvas padding. Tablet collapses to `1.25rem` gutters and `1.5rem` margins. Mobile uses single-column or dual-column stacked blocks with `1rem` edge gutters.
- **Vertical Rhythm:** Rooted in a strict 4px/8px incremental scale (`space-xs` through `space-xl`). 
- **Content Density:** Component inner paddings are compact (e.g., `8px 12px` for fields, `12px 16px` for list rows) to maximize visible data above the fold while honoring breathing room through systematic divider lines rather than empty vertical voids.

## Elevation & Depth

This system avoids floating drop-shadows and blurred colored glows. Hierarchy is defined by physical-like structural containment and flat low-contrast layering:

- **Borders over Shadows:** Depth is produced by a 1px solid border (`#e2e8f0` or dark mode `#1e293b`). Cards, tables, and section panels sit flush within the canvas.
- **Surface Tonal Stacking:**
  - Base canvas: `#ffffff`
  - Grouped panel container: `#f8fafc`
  - Floating overlays (dropdowns, popovers, command menus): `#ffffff` backed by a clean micro-shadow: `0 1px 2px 0 rgba(0, 0, 0, 0.05), 0 4px 6px -1px rgba(0, 0, 0, 0.05)` coupled with a 1px `#cbd5e1` outline.
- **Focus Rings:** Clean, non-diffused `2px` offset stroke using `#1d4ed8` with `2px` white space separation.

## Shapes

Corner radii adhere to an understated `0.25rem` (4px) to `0.375rem` (6px) soft scale. 

- Interactive controls (buttons, text inputs, segmented pills) employ standard soft corners (`4px` to `6px`).
- Structural containment blocks (cards, tables, code frames) use `6px` (`rounded-lg` level token equivalent).
- Circles are avoided unless signifying user avatars or status indicators (e.g., operational pings).
- No pill-shaped inputs or oversized 16px+ borders are permitted.

## Components

- **Buttons:**
  - *Primary:* Solid `#0f172a` (or `#1d4ed8` when actionable focus is needed), white text, 1px transparent border, 6px radius. Height: 32px or 36px.
  - *Secondary / Outline:* `#ffffff` background, 1px `#e2e8f0` border, `#0f172a` text. Hover: `#f8fafc` surface, `#cbd5e1` border.
  - *Ghost / Minimal:* No border, no fill. Hover fills with `#f1f5f9`.
- **Inputs & Textareas:**
  - Pure `#ffffff` background, 1px `#e2e8f0` border, 6px radius.
  - Typography set to `13px` or `14px` Geist with `#0f172a` text and `#94a3b8` placeholder.
  - Active focus transitions the border to `#1d4ed8` with zero outer fuzzy blur.
- **Cards & Data Panels:**
  - Background `#ffffff` framed by a 1px hairline `#e2e8f0` border.
  - Header, content, and footer sections separated by internal 1px horizontal borders instead of whitespace gaps alone.
- **Lists & Data Tables:**
  - High-density layouts with `8px` to `12px` cell padding.
  - Table headers use `11px` uppercase tracking in `JetBrains Mono` or muted `Geist Medium`.
  - Subtle row hover effect (`#f8fafc`) with hairline dividers.
- **Badges & Chips:**
  - Compact height (20px). Background `#f1f5f9`, border 1px `#e2e8f0`, text `#334155` set in `JetBrains Mono` or `label-badge`.
- **Checkboxes & Radios:**
  - Precise 14px boxes with 3px corner radius. Hairline border `#cbd5e1` that fills with `#0f172a` or `#1d4ed8` upon selection.
- **Keyboard Shortcuts (Kbd):**
  - Styled with mono typography, 1px `#e2e8f0` border, `#f8fafc` background, and `2px` corner radius.