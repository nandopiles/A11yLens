import { EffectScope } from '../engine/EffectScope';
import type { AccessibilityProfile, ProfileMetadata, ProfileOptions } from '../engine/types';

export type ColorBlindnessVariant = 'protanopia' | 'deuteranopia' | 'tritanopia';

export interface ColorBlindnessOptions extends ProfileOptions {
  variant?: ColorBlindnessVariant;
}

/**
 * Real color-vision-deficiency simulation matrices (widely used Machado/Brettel-style
 * values). 4x5 RGBA feColorMatrix; the last (alpha) column is 0. These reproduce the
 * actual hue-confusion axes of each deficiency — not a grayscale/sepia approximation.
 */
const MATRICES: Record<ColorBlindnessVariant, string> = {
  protanopia: [
    '0.567 0.433 0 0 0',
    '0.558 0.442 0 0 0',
    '0 0.242 0.758 0 0',
    '0 0 0 1 0',
  ].join(' '),
  deuteranopia: [
    '0.625 0.375 0 0 0',
    '0.700 0.300 0 0 0',
    '0 0.300 0.700 0 0',
    '0 0 0 1 0',
  ].join(' '),
  tritanopia: [
    '0.950 0.050 0 0 0',
    '0 0.433 0.567 0 0',
    '0 0.475 0.525 0 0',
    '0 0 0 1 0',
  ].join(' '),
};

const SVG_NS = 'http://www.w3.org/2000/svg';
const filterId = (variant: ColorBlindnessVariant) => `a11ylens-cb-${variant}`;

export class ColorBlindnessProfile implements AccessibilityProfile {
  readonly metadata: ProfileMetadata = {
    id: 'color-blindness',
    name: 'Color blindness',
    description: 'Simulates protanopia, deuteranopia, or tritanopia with real color matrices.',
    category: 'visual',
  };

  private scope: EffectScope | null = null;

  isActive(): boolean {
    return this.scope !== null;
  }

  apply(root: HTMLElement, options?: ColorBlindnessOptions): void {
    // Re-apply cleanly rather than stacking.
    if (this.isActive()) this.revert(root);

    const variant = options?.variant ?? 'deuteranopia';
    const scope = new EffectScope();

    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('data-a11ylens', 'color-blindness');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    // Off-screen, zero footprint so it never affects layout.
    svg.style.position = 'absolute';
    svg.style.width = '0';
    svg.style.height = '0';
    svg.style.overflow = 'hidden';

    (Object.keys(MATRICES) as ColorBlindnessVariant[]).forEach((key) => {
      const filter = document.createElementNS(SVG_NS, 'filter');
      filter.setAttribute('id', filterId(key));
      filter.setAttribute('color-interpolation-filters', 'sRGB');
      const matrix = document.createElementNS(SVG_NS, 'feColorMatrix');
      matrix.setAttribute('type', 'matrix');
      matrix.setAttribute('values', MATRICES[key]);
      filter.appendChild(matrix);
      svg.appendChild(filter);
    });

    scope.appendChild(root.ownerDocument.body, svg);
    scope.setInlineStyle(root, 'filter', `url(#${filterId(variant)})`);

    this.scope = scope;
  }

  revert(_root: HTMLElement): void {
    if (!this.scope) return;
    this.scope.dispose();
    this.scope = null;
  }
}
