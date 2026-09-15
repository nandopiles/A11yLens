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
    expect(word[0]).toBe('a');
    expect(word[word.length - 1]).toBe('y');
    // Sorted letters are preserved (a permutation).
    expect(word.split('').sort().join('')).toBe('accessibility'.split('').sort().join(''));
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
