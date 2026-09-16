import { EffectScope } from '../engine/EffectScope';
import type { AccessibilityProfile, ProfileMetadata, ProfileOptions } from '../engine/types';

export type TremorIntensity = 'mild' | 'moderate' | 'severe';

export interface TremorOptions extends ProfileOptions {
  intensity?: TremorIntensity;
}

const LEVELS: Record<TremorIntensity, { amplitude: number; damping: number }> = {
  mild: { amplitude: 6, damping: 0.35 },
  moderate: { amplitude: 12, damping: 0.25 },
  severe: { amplitude: 22, damping: 0.18 },
};

/**
 * Simulates an involuntary motor tremor. We cannot move the OS cursor from JS, so we
 * hide the native cursor over the root and render our own cursor node, displacing it from
 * the true pointer by low-pass-filtered random noise (a physiological-looking tremor
 * rather than teleporting). The custom cursor is decorative and does not drive real
 * hit-testing. See design.md §5d.
 */
export class TremorProfile implements AccessibilityProfile {
  readonly metadata: ProfileMetadata = {
    id: 'tremor',
    name: 'Motor tremor',
    description: 'Adds smoothed random jitter to a custom rendered cursor.',
    category: 'motor',
  };

  private scope: EffectScope | null = null;

  isActive(): boolean {
    return this.scope !== null;
  }

  apply(root: HTMLElement, options?: TremorOptions): void {
    if (this.isActive()) this.revert(root);

    const { amplitude, damping } = LEVELS[options?.intensity ?? 'moderate'];
    const scope = new EffectScope();

    // Hiding the cursor only on the root is not enough: interactive descendants
    // (buttons, links, inputs) carry their own `cursor` (pointer/text) which wins on
    // hover, so the native cursor reappears over exactly the targets the tremor is
    // meant to make hard to hit. Force `cursor: none` on the root and everything
    // inside it via an injected, scoped stylesheet. See design.md §5d.
    scope.setInlineStyle(root, 'cursor', 'none');

    const styleEl = root.ownerDocument.createElement('style');
    styleEl.setAttribute('data-a11ylens', 'tremor-cursor-style');
    const scopeId = 'a11ylens-tremor';
    scope.setAttribute(root, 'data-a11ylens-tremor', scopeId);
    styleEl.textContent =
      `[data-a11ylens-tremor="${scopeId}"], ` +
      `[data-a11ylens-tremor="${scopeId}"] * { cursor: none !important; }`;
    scope.appendChild(root.ownerDocument.head, styleEl);

    const cursor = root.ownerDocument.createElement('div');
    cursor.setAttribute('data-a11ylens', 'tremor-cursor');
    cursor.setAttribute('aria-hidden', 'true');
    Object.assign(cursor.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '14px',
      height: '14px',
      marginLeft: '-7px',
      marginTop: '-7px',
      borderRadius: '9999px',
      border: '2px solid #0f172a',
      background: 'rgba(15,23,42,0.15)',
      pointerEvents: 'none',
      zIndex: '2147483647',
      willChange: 'transform',
      display: 'none',
    } satisfies Partial<CSSStyleDeclaration>);
    scope.appendChild(root, cursor);

    let trueX = 0;
    let trueY = 0;
    let offsetX = 0;
    let offsetY = 0;
    let seen = false;

    const onMove = (event: Event) => {
      const e = event as MouseEvent;
      trueX = e.clientX;
      trueY = e.clientY;
      if (!seen) {
        seen = true;
        cursor.style.display = 'block';
      }
    };
    scope.addEventListener(root, 'mousemove', onMove);

    scope.requestAnimationFrameLoop(() => {
      // Low-pass filtered noise: pull the offset toward fresh noise while damping it.
      offsetX += (Math.random() - 0.5) * amplitude - offsetX * damping;
      offsetY += (Math.random() - 0.5) * amplitude - offsetY * damping;
      cursor.style.transform = `translate(${trueX + offsetX}px, ${trueY + offsetY}px)`;
    });

    this.scope = scope;
  }

  revert(_root: HTMLElement): void {
    if (!this.scope) return;
    this.scope.dispose();
    this.scope = null;
  }
}
