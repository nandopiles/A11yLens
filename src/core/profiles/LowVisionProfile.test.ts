import { describe, it, expect, afterEach } from 'vitest';
import { LowVisionProfile } from './LowVisionProfile';

function makeRoot(): HTMLElement {
  const root = document.createElement('div');
  root.innerHTML = '<p>content</p>';
  document.body.appendChild(root);
  return root;
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe('LowVisionProfile', () => {
  it('applies blur + contrast for the given intensity', () => {
    const root = makeRoot();
    const profile = new LowVisionProfile();
    profile.apply(root, { intensity: 'severe' });
    expect(root.style.filter).toBe('blur(5px) contrast(0.65)');
  });

  it('defaults to moderate', () => {
    const root = makeRoot();
    const profile = new LowVisionProfile();
    profile.apply(root);
    expect(root.style.filter).toBe('blur(3px) contrast(0.8)');
  });

  it('appends to an existing filter (stacks with color blindness)', () => {
    const root = makeRoot();
    root.style.filter = 'url(#a11ylens-cb-deuteranopia)';
    const profile = new LowVisionProfile();
    profile.apply(root, { intensity: 'mild' });
    // CSSOM normalizes the prior url() to url("...") before we append.
    expect(root.style.filter).toBe('url("#a11ylens-cb-deuteranopia") blur(1.5px) contrast(0.9)');
  });

  it('revert restores the prior filter exactly', () => {
    const root = makeRoot();
    root.style.filter = 'url(#a11ylens-cb-deuteranopia)';
    const before = root.outerHTML;
    const profile = new LowVisionProfile();
    profile.apply(root);
    profile.revert(root);
    expect(root.outerHTML).toBe(before);
  });

  it('revert restores no-filter to unset', () => {
    const root = makeRoot();
    const before = root.outerHTML;
    const profile = new LowVisionProfile();
    profile.apply(root);
    profile.revert(root);
    expect(root.outerHTML).toBe(before);
  });

  it('revert is a no-op when not applied', () => {
    const root = makeRoot();
    const profile = new LowVisionProfile();
    expect(() => profile.revert(root)).not.toThrow();
  });
});
