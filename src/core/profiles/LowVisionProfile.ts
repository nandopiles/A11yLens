import { EffectScope } from '../engine/EffectScope';
import type { AccessibilityProfile, ProfileMetadata, ProfileOptions } from '../engine/types';

export type LowVisionIntensity = 'mild' | 'moderate' | 'severe';

export interface LowVisionOptions extends ProfileOptions {
  intensity?: LowVisionIntensity;
}

const LEVELS: Record<LowVisionIntensity, { blurPx: number; contrast: number }> = {
  mild: { blurPx: 1.5, contrast: 0.9 },
  moderate: { blurPx: 3, contrast: 0.8 },
  severe: { blurPx: 5, contrast: 0.65 },
};

/**
 * Simulates reduced acuity/contrast (cataract/macular-style blur) via `filter: blur()
 * + contrast()` on the content itself. Appends to any existing filter so it stacks with
 * ColorBlindnessProfile without clobbering it. See design.md §5b.
 */
export class LowVisionProfile implements AccessibilityProfile {
  readonly metadata: ProfileMetadata = {
    id: 'low-vision',
    name: 'Low vision',
    description: 'Blurs content and reduces contrast at mild, moderate, or severe levels.',
    category: 'visual',
  };

  private scope: EffectScope | null = null;

  isActive(): boolean {
    return this.scope !== null;
  }

  apply(root: HTMLElement, options?: LowVisionOptions): void {
    if (this.isActive()) this.revert(root);

    const { blurPx, contrast } = LEVELS[options?.intensity ?? 'moderate'];
    const scope = new EffectScope();

    const existing = root.style.getPropertyValue('filter').trim();
    const own = `blur(${blurPx}px) contrast(${contrast})`;
    const composed = existing ? `${existing} ${own}` : own;
    scope.setInlineStyle(root, 'filter', composed);

    this.scope = scope;
  }

  revert(_root: HTMLElement): void {
    if (!this.scope) return;
    this.scope.dispose();
    this.scope = null;
  }
}
