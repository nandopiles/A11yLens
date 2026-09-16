import { describe, it, expect, afterEach, vi } from 'vitest';
import { DyslexiaProfile } from './DyslexiaProfile';

function makeRoot(html: string): HTMLElement {
  const root = document.createElement('div');
  root.innerHTML = html;
  document.body.appendChild(root);
  return root;
}

afterEach(() => {
  document.body.innerHTML = '';
  vi.useRealTimers();
});

describe('DyslexiaProfile', () => {
  it('applies altered spacing and line-height', () => {
    const root = makeRoot('<p>Reading is difficult</p>');
    const profile = new DyslexiaProfile();
    profile.apply(root, { shuffle: false });
    expect(root.style.letterSpacing).toBe('0.12em');
    expect(root.style.wordSpacing).toBe('0.16em');
    expect(root.style.lineHeight).toBe('2.1');
  });

  it('shuffles interior letters while keeping first and last', () => {
    const root = makeRoot('<p>accessibility</p>');
    const profile = new DyslexiaProfile();
    profile.apply(root, { shuffle: true });
    const word = root.querySelector('p')!.textContent!;
    expect(word.length).toBe('accessibility'.length);
    // First letter is kept as a reading anchor; case may jitter elsewhere.
    expect(word[0]).toBe('a');
    expect(word[word.length - 1].toLowerCase()).toBe('y');
    // Sorted letters are preserved (a permutation), ignoring case jitter.
    expect(word.toLowerCase().split('').sort().join('')).toBe(
      'accessibility'.split('').sort().join(''),
    );
  });

  it('shuffles button label text', () => {
    const root = makeRoot('<button>Continue shopping</button>');
    const profile = new DyslexiaProfile();
    profile.apply(root, { shuffle: true });
    const label = root.querySelector('button')!.textContent!;
    // Same multiset of letters — a shuffled permutation, ignoring case jitter.
    expect(label.toLowerCase().split('').sort().join('')).toBe(
      'Continue shopping'.toLowerCase().split('').sort().join(''),
    );
  });

  it('shuffles input value and placeholder text', () => {
    const root = makeRoot(
      '<input type="text" value="California" placeholder="Delivery address" />',
    );
    const profile = new DyslexiaProfile();
    profile.apply(root, { shuffle: true });
    const input = root.querySelector('input')!;
    expect(input.value.toLowerCase().split('').sort().join('')).toBe(
      'California'.toLowerCase().split('').sort().join(''),
    );
    expect(input.placeholder.toLowerCase().split('').sort().join('')).toBe(
      'Delivery address'.toLowerCase().split('').sort().join(''),
    );
  });

  it('destabilises short labels like CVC and MM / YY via case jitter', () => {
    // These placeholders were below the old 4-letter shuffle threshold and never
    // changed. Force jitter to fire deterministically.
    vi.spyOn(Math, 'random').mockReturnValue(0.1);
    const root = makeRoot(
      '<input placeholder="CVC" /><input placeholder="MM / YY" />',
    );
    const profile = new DyslexiaProfile();
    profile.apply(root, { shuffle: true });
    const [cvc, exp] = Array.from(root.querySelectorAll('input'));
    // Same letters (case-insensitively) but the rendered form changed.
    expect(cvc.placeholder).not.toBe('CVC');
    expect(cvc.placeholder.toLowerCase()).toBe('cvc');
    expect(exp.placeholder).not.toBe('MM / YY');
    expect(exp.placeholder.toLowerCase()).toBe('mm / yy');
  });

  it('restores input value and placeholder on revert', () => {
    const root = makeRoot(
      '<input type="text" value="California" placeholder="Delivery address" />',
    );
    const profile = new DyslexiaProfile();
    profile.apply(root, { shuffle: true });
    profile.revert(root);
    const input = root.querySelector('input')!;
    expect(input.value).toBe('California');
    expect(input.placeholder).toBe('Delivery address');
  });

  it('leaves non-text input values untouched (checkbox)', () => {
    const root = makeRoot('<input type="checkbox" value="accepted" />');
    const profile = new DyslexiaProfile();
    profile.apply(root, { shuffle: true });
    // A checkbox value is not user-visible prose, so it must not be shuffled.
    expect(root.querySelector('input')!.value).toBe('accepted');
  });

  it('revert restores original text and styles exactly', () => {
    const root = makeRoot('<p>The quick brown fox jumps</p>');
    const before = root.outerHTML;
    const profile = new DyslexiaProfile();
    profile.apply(root, { shuffle: true });
    profile.revert(root);
    expect(root.outerHTML).toBe(before);
  });

  it('stops the shuffle interval on revert (no leak)', () => {
    vi.useFakeTimers();
    const root = makeRoot('<p>continuous shuffling here</p>');
    const original = root.querySelector('p')!.textContent;
    const profile = new DyslexiaProfile();
    profile.apply(root, { shuffle: true, shuffleIntervalMs: 100 });
    profile.revert(root);
    const afterRevert = root.querySelector('p')!.textContent;
    expect(afterRevert).toBe(original);
    // Advancing time must not mutate text anymore.
    vi.advanceTimersByTime(1000);
    expect(root.querySelector('p')!.textContent).toBe(original);
  });

  it('revert is a no-op when not applied', () => {
    const root = makeRoot('<p>text</p>');
    const before = root.outerHTML;
    const profile = new DyslexiaProfile();
    expect(() => profile.revert(root)).not.toThrow();
    expect(root.outerHTML).toBe(before);
  });
});
