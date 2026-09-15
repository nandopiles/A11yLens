import { EffectScope } from '../engine/EffectScope';
import type { AccessibilityProfile, ProfileMetadata } from '../engine/types';

/**
 * Simulates the experience of a user who cannot hear audio. Does not filter the page
 * visually — the *absence* of captions is the message. Force-mutes `<video>`/`<audio>`
 * within the root and hides sound-only alerts (`[data-sound-only]`). See design.md §5e.
 */
export class DeafnessProfile implements AccessibilityProfile {
  readonly metadata: ProfileMetadata = {
    id: 'deafness',
    name: 'Deafness / no captions',
    description: 'Mutes media and hides sound-only alerts to expose missing captions.',
    category: 'auditory',
  };

  private scope: EffectScope | null = null;

  isActive(): boolean {
    return this.scope !== null;
  }

  apply(root: HTMLElement): void {
    if (this.isActive()) this.revert(root);

    const scope = new EffectScope();

    const media = root.querySelectorAll<HTMLMediaElement>('video, audio');
    media.forEach((el) => {
      const previousMuted = el.muted;
      el.muted = true;
      scope.add(() => {
        el.muted = previousMuted;
      });
    });

    const alerts = root.querySelectorAll<HTMLElement>('[data-sound-only]');
    alerts.forEach((el) => {
      scope.setAttribute(el, 'hidden', '');
    });

    this.scope = scope;
  }

  revert(_root: HTMLElement): void {
    if (!this.scope) return;
    this.scope.dispose();
    this.scope = null;
  }
}
