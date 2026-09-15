import { describe, it, expect, afterEach } from 'vitest';
import { DeafnessProfile } from './DeafnessProfile';

function makeRoot(html: string): HTMLElement {
  const root = document.createElement('div');
  root.innerHTML = html;
  document.body.appendChild(root);
  return root;
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe('DeafnessProfile', () => {
  it('mutes video and audio elements', () => {
    const root = makeRoot('<video></video><audio></audio>');
    const profile = new DeafnessProfile();
    profile.apply(root);
    root.querySelectorAll<HTMLMediaElement>('video, audio').forEach((el) => {
      expect(el.muted).toBe(true);
    });
  });

  it('hides sound-only alerts', () => {
    const root = makeRoot('<div data-sound-only>ping</div>');
    const profile = new DeafnessProfile();
    profile.apply(root);
    expect(root.querySelector('[data-sound-only]')?.hasAttribute('hidden')).toBe(true);
  });

  it('revert restores prior muted state', () => {
    const root = makeRoot('<video></video>');
    const video = root.querySelector('video')!;
    video.muted = false;
    const profile = new DeafnessProfile();
    profile.apply(root);
    expect(video.muted).toBe(true);
    profile.revert(root);
    expect(video.muted).toBe(false);
  });

  it('revert restores the alert markup exactly', () => {
    const root = makeRoot('<div data-sound-only>ping</div>');
    const before = root.outerHTML;
    const profile = new DeafnessProfile();
    profile.apply(root);
    profile.revert(root);
    expect(root.outerHTML).toBe(before);
  });

  it('does not apply any visual filter to the root', () => {
    const root = makeRoot('<video></video>');
    const profile = new DeafnessProfile();
    profile.apply(root);
    expect(root.style.filter).toBe('');
  });

  it('revert is a no-op when not applied', () => {
    const root = makeRoot('<video></video>');
    const profile = new DeafnessProfile();
    expect(() => profile.revert(root)).not.toThrow();
  });
});
