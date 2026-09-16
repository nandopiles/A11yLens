import { describe, it, expect, afterEach } from 'vitest';
import { ScreenReaderProfile } from './ScreenReaderProfile';
import type { SpeechSynthesizer } from './speech';

function makeRoot(html: string): HTMLElement {
  const root = document.createElement('div');
  root.innerHTML = html;
  document.body.appendChild(root);
  return root;
}

class FakeSynth implements SpeechSynthesizer {
  readonly available = true;
  spoken: string[] = [];
  cancelled = 0;
  speak(text: string): void {
    this.spoken.push(text);
  }
  cancel(): void {
    this.cancelled += 1;
  }
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe('ScreenReaderProfile', () => {
  it('reads text and announces missing image descriptions as defects', () => {
    const root = makeRoot(
      '<h2>Checkout</h2><img src="a.png"><img src="b.png" alt="Company logo">',
    );
    const synth = new FakeSynth();
    const profile = new ScreenReaderProfile(synth);
    profile.apply(root);

    expect(synth.spoken).toContain('Checkout');
    expect(synth.spoken).toContain('imagen, sin descripción');
    expect(synth.spoken).toContain('imagen, Company logo');
  });

  it('flags unlabeled inputs', () => {
    const root = makeRoot('<input><input aria-label="Card number">');
    const synth = new FakeSynth();
    const profile = new ScreenReaderProfile(synth);
    profile.apply(root);
    expect(synth.spoken).toContain('campo, sin etiqueta');
    expect(synth.spoken).toContain('campo, Card number');
  });

  it('masks the content with an overlay', () => {
    const root = makeRoot('<p>secret</p>');
    const profile = new ScreenReaderProfile(new FakeSynth());
    profile.apply(root);
    expect(root.querySelector('[data-a11ylens="screen-reader-overlay"]')).not.toBeNull();
  });

  it('revert restores the root exactly and cancels speech', () => {
    const root = makeRoot('<p>content</p><img src="x.png">');
    const before = root.outerHTML;
    const synth = new FakeSynth();
    const profile = new ScreenReaderProfile(synth);
    profile.apply(root);
    profile.revert(root);
    expect(root.outerHTML).toBe(before);
    expect(synth.cancelled).toBeGreaterThan(0);
    expect(root.querySelector('[data-a11ylens]')).toBeNull();
  });

  it('revert is a no-op when not applied', () => {
    const root = makeRoot('<p>x</p>');
    const before = root.outerHTML;
    const profile = new ScreenReaderProfile(new FakeSynth());
    expect(() => profile.revert(root)).not.toThrow();
    expect(root.outerHTML).toBe(before);
  });
});
