/**
 * Core contracts for the A11yLens simulation engine.
 *
 * Profiles mutate a live DOM subtree, so clean reversal is safety-critical: every
 * profile must fully undo its effects on `revert()`. See
 * `.kiro/specs/core-simulation-engine/design.md`.
 */

export type ProfileCategory = 'visual' | 'motor' | 'cognitive';

export type ProfileId =
  | 'color-blindness'
  | 'dyslexia'
  | 'tremor'
  | 'screen-reader';

export interface ProfileMetadata {
  id: ProfileId;
  name: string;
  /** Short, one-line description. */
  description: string;
  category: ProfileCategory;
}

/**
 * Loose per-profile options bag (variant, intensity, ...). Each profile narrows this
 * to its own shape internally.
 */
export interface ProfileOptions {
  [key: string]: unknown;
}

export interface AccessibilityProfile {
  readonly metadata: ProfileMetadata;

  /**
   * Apply this profile's effect to `root`. Must track everything it creates so that
   * `revert()` can release it. Must not throw for a valid element. Guards against
   * double-apply (re-applies cleanly rather than stacking duplicates).
   */
  apply(root: HTMLElement, options?: ProfileOptions): void;

  /**
   * Fully undo `apply()`: remove injected nodes, inline styles, attributes, listeners,
   * timers, animation frames, and stop any speech. Safe no-op if not applied.
   */
  revert(root: HTMLElement): void;

  /** True while applied to a root. */
  isActive(): boolean;
}

/** Deterministic application order so stacked profiles compose consistently. */
export const CATEGORY_ORDER: readonly ProfileCategory[] = [
  'visual',
  'cognitive',
  'motor',
];
