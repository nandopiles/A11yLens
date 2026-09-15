# A11yLens — Accessibility Domain

Shared, always-loaded context describing the accessibility profiles A11yLens
simulates and how each one should transform the experience. This is domain
knowledge, not implementation. Implementations live in `src/core/profiles/`.

Every profile implements the same `AccessibilityProfile` strategy interface and can
be stacked (decorated) with others.

## Profiles

### 1. Color blindness
Simulate reduced color discrimination using native SVG `feColorMatrix` filters
(real simulation, not a CSS approximation). Three variants:
- **Protanopia** — reduced sensitivity to red.
- **Deuteranopia** — reduced sensitivity to green.
- **Tritanopia** — reduced sensitivity to blue.
Transform: apply the matching color-matrix filter over the previewed content.
WCAG link: 1.4.1 Use of Color, 1.4.3 Contrast (Minimum).

### 2. Low vision
Simulate reduced acuity and contrast sensitivity.
Transform: blur, reduced contrast, and optional magnification of the preview.
Reveals content that relies on small text or thin, low-contrast type.
WCAG link: 1.4.3 Contrast, 1.4.4 Resize Text, 1.4.10 Reflow.

### 3. Dyslexia
Simulate reading difficulty caused by unstable letterforms and tight spacing.
Transform: scramble/jitter interior letters, tighten/vary spacing, so overly dense
copy becomes hard to parse. Highlights the value of clear, well-spaced typography.
WCAG link: 1.4.8 Visual Presentation, 3.1.5 Reading Level.

### 4. Motor tremor
Simulate an involuntary tremor affecting pointer control.
Transform: add jitter/offset to the cursor and reduce effective target precision,
so small or tightly-packed hit targets become hard to activate. Highlights the need
for large targets and generous spacing.
WCAG link: 2.5.5 / 2.5.8 Target Size, 2.5.1 Pointer Gestures.

### 5. Deafness / no captions
Simulate the experience of a user who cannot hear audio.
Transform: mute audio cues and hide/disable captions and transcripts so any
audio-only information becomes inaccessible. Highlights the need for captions and
text alternatives.
WCAG link: 1.2.2 Captions, 1.2.1 Audio-only and Video-only.

### 6. Screen reader
Simulate consuming the page through a screen reader.
Transform: present a linearized, semantics-only reading of the DOM (headings,
landmarks, labels, alt text, focus order) instead of the visual layout. Exposes
missing labels, bad heading order, and non-semantic structure.
WCAG link: 1.1.1 Non-text Content, 1.3.1 Info and Relationships, 4.1.2 Name/Role/Value.

## Stacking behavior

Profiles compose in a deterministic order. Visual filters (color blindness, low
vision) apply to the rendered preview; behavioral profiles (tremor, deafness,
screen reader) alter interaction/semantics. When multiple are active, each decorates
the previous profile's output so the combined effect is cumulative.

## Real audit

Alongside the simulation, `core/audit/auditRunner.ts` runs axe-core against the
current use case to report real, standards-based accessibility violations. The
simulation shows *what it feels like*; the audit shows *what is actually wrong*.
