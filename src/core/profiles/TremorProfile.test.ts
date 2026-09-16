import { describe, it, expect, afterEach, vi } from 'vitest';
import { TremorProfile } from './TremorProfile';

function makeRoot(): HTMLElement {
  const root = document.createElement('div');
  root.innerHTML = '<button>Pay</button>';
  document.body.appendChild(root);
  return root;
}

afterEach(() => {
  document.body.innerHTML = '';
  document.head.querySelectorAll('[data-a11ylens]').forEach((el) => el.remove());
  vi.restoreAllMocks();
});

describe('TremorProfile', () => {
  it('injects a custom cursor and hides the native cursor', () => {
    const root = makeRoot();
    const profile = new TremorProfile();
    profile.apply(root, { intensity: 'moderate' });
    expect(root.style.cursor).toBe('none');
    const cursor = root.querySelector('[data-a11ylens="tremor-cursor"]');
    expect(cursor).not.toBeNull();
    expect(cursor?.getAttribute('aria-hidden')).toBe('true');
  });

  it('moves the custom cursor on mousemove via the RAF loop', () => {
    const root = makeRoot();
    // Capture the RAF callback and drive exactly one frame (avoid re-entrant recursion).
    const frames: FrameRequestCallback[] = [];
    const rafSpy = vi
      .spyOn(globalThis, 'requestAnimationFrame')
      .mockImplementation((cb: FrameRequestCallback) => {
        frames.push(cb);
        return 1;
      });
    vi.spyOn(Math, 'random').mockReturnValue(0.5);

    const profile = new TremorProfile();
    profile.apply(root, { intensity: 'mild' });

    const move = new MouseEvent('mousemove', { clientX: 100, clientY: 80 });
    root.dispatchEvent(move);
    frames[0]?.(0); // run a single animation frame

    const cursor = root.querySelector<HTMLElement>('[data-a11ylens="tremor-cursor"]')!;
    // With random()=0.5 the noise term is 0, so the cursor tracks the true point.
    expect(cursor.style.display).toBe('block');
    expect(cursor.style.transform).toContain('translate(100px, 80px)');
    rafSpy.mockRestore();
  });

  it('hides the cursor on interactive descendants, not just the root', () => {
    const root = makeRoot();
    const profile = new TremorProfile();
    profile.apply(root);

    const style = document.head.querySelector(
      'style[data-a11ylens="tremor-cursor-style"]',
    );
    expect(style).not.toBeNull();
    // The rule must target descendants (e.g. the button) so their pointer/text
    // cursor cannot override the hidden root cursor on hover.
    expect(style?.textContent).toContain('* { cursor: none !important; }');
    expect(root.hasAttribute('data-a11ylens-tremor')).toBe(true);
  });

  it('removes the injected descendant-cursor style on revert', () => {
    const root = makeRoot();
    const profile = new TremorProfile();
    profile.apply(root);
    profile.revert(root);
    expect(
      document.head.querySelector('style[data-a11ylens="tremor-cursor-style"]'),
    ).toBeNull();
    expect(root.hasAttribute('data-a11ylens-tremor')).toBe(false);
  });

  it('revert restores the root exactly', () => {
    const root = makeRoot();
    const before = root.outerHTML;
    const profile = new TremorProfile();
    profile.apply(root);
    profile.revert(root);
    expect(profile.isActive()).toBe(false);
    expect(root.outerHTML).toBe(before);
    expect(root.querySelector('[data-a11ylens]')).toBeNull();
  });

  it('stops the RAF loop and detaches the listener on revert', () => {
    const root = makeRoot();
    const cancelSpy = vi.spyOn(globalThis, 'cancelAnimationFrame');
    const profile = new TremorProfile();
    profile.apply(root);
    profile.revert(root);
    expect(cancelSpy).toHaveBeenCalled();
    // Listener detached: dispatching after revert must not recreate the cursor.
    root.dispatchEvent(new MouseEvent('mousemove', { clientX: 10, clientY: 10 }));
    expect(root.querySelector('[data-a11ylens="tremor-cursor"]')).toBeNull();
  });

  it('revert is a no-op when not applied', () => {
    const root = makeRoot();
    const before = root.outerHTML;
    const profile = new TremorProfile();
    expect(() => profile.revert(root)).not.toThrow();
    expect(root.outerHTML).toBe(before);
  });
});
