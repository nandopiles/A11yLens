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

    expect(synth.spoken).toContain('Apartado: Checkout');
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

  it('reads a button by its visible text without duplicating that text', () => {
    const root = makeRoot('<button>Pagar ahora</button>');
    const synth = new FakeSynth();
    const profile = new ScreenReaderProfile(synth);
    profile.apply(root);
    expect(synth.spoken).toContain('botón, Pagar ahora');
    // The label text must not also appear as a separate bare item.
    expect(synth.spoken.filter((s) => s === 'Pagar ahora')).toHaveLength(0);
  });

  it('groups the DOM into apartados (sections) titled by landmark/heading', () => {
    const root = makeRoot(
      '<section aria-label="Pago"><h3>Tarjeta</h3><input aria-label="Número"></section>' +
        '<section aria-label="Resumen"><p>Total 129</p></section>',
    );
    const synth = new FakeSynth();
    const profile = new ScreenReaderProfile(synth);

    const sections = profile.buildSections(root);
    const titles = sections.map((s) => s.title);
    // Heading starts a nested apartado; landmarks provide their aria-label as title.
    expect(titles).toContain('Pago');
    expect(titles).toContain('Tarjeta');
    expect(titles).toContain('Resumen');

    // Each apartado is announced with its title before its contents, in order.
    profile.apply(root);
    expect(synth.spoken[0]).toMatch(/^Apartado: /);
    expect(synth.spoken).toContain('Apartado: Resumen');
    expect(synth.spoken).toContain('Total 129');
  });

  it('masks the content with an overlay', () => {
    const root = makeRoot('<p>secret</p>');
    const profile = new ScreenReaderProfile(new FakeSynth());
    profile.apply(root);
    expect(root.querySelector('[data-a11ylens="screen-reader-overlay"]')).not.toBeNull();
  });

  it('severe intensity fully masks; mild keeps the page mostly visible', () => {
    const rootSevere = makeRoot('<p>x</p>');
    new ScreenReaderProfile(new FakeSynth()).apply(rootSevere, { intensity: 'severe' });
    const severe = rootSevere.querySelector<HTMLElement>('[data-a11ylens="screen-reader-overlay"]');
    // jsdom normalizes fully-opaque rgba() to rgb().
    expect(severe?.style.background).toBe('rgb(15, 23, 42)');
    expect(severe?.style.pointerEvents).toBe('auto');

    const rootMild = makeRoot('<p>x</p>');
    new ScreenReaderProfile(new FakeSynth()).apply(rootMild, { intensity: 'mild' });
    const mild = rootMild.querySelector<HTMLElement>('[data-a11ylens="screen-reader-overlay"]');
    expect(mild?.style.background).toContain('0.35');

    const rootModerate = makeRoot('<p>x</p>');
    new ScreenReaderProfile(new FakeSynth()).apply(rootModerate, { intensity: 'moderate' });
    const moderate = rootModerate.querySelector<HTMLElement>('[data-a11ylens="screen-reader-overlay"]');
    // Moderate is near-total so the page is practically unreadable.
    expect(moderate?.style.background).toContain('0.92');
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
