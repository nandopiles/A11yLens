import { describe, it, expect, afterEach } from 'vitest';
import { ColorBlindnessProfile } from './ColorBlindnessProfile';

function makeRoot(html = '<p>Hello</p>'): HTMLElement {
  const root = document.createElement('div');
  root.innerHTML = html;
  document.body.appendChild(root);
  return root;
}

afterEach(() => {
  document.body.innerHTML = '';
});

describe('ColorBlindnessProfile', () => {
  it('injects a hidden svg with the three filters and sets the root filter', () => {
    const root = makeRoot();
    const profile = new ColorBlindnessProfile();
    profile.apply(root, { variant: 'protanopia' });

    const svg = document.body.querySelector('svg[data-a11ylens="color-blindness"]');
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
    expect(svg?.querySelectorAll('filter').length).toBe(3);
    expect(svg?.querySelector('#a11ylens-cb-protanopia feColorMatrix')).not.toBeNull();
    // CSSOM normalizes url(#id) to url("#id").
    expect(root.style.filter).toBe('url("#a11ylens-cb-protanopia")');
  });

  it('defaults to deuteranopia', () => {
    const root = makeRoot();
    const profile = new ColorBlindnessProfile();
    profile.apply(root);
    expect(root.style.filter).toBe('url("#a11ylens-cb-deuteranopia")');
  });

  it('revert restores the root exactly', () => {
    const root = makeRoot();
    const before = root.outerHTML;
    const bodyChildrenBefore = document.body.children.length;
    const profile = new ColorBlindnessProfile();

    profile.apply(root, { variant: 'tritanopia' });
    expect(profile.isActive()).toBe(true);

    profile.revert(root);
    expect(profile.isActive()).toBe(false);
    expect(root.outerHTML).toBe(before);
    expect(document.body.querySelector('svg[data-a11ylens]')).toBeNull();
    expect(document.body.children.length).toBe(bodyChildrenBefore);
  });

  it('revert is a no-op when not applied', () => {
    const root = makeRoot();
    const before = root.outerHTML;
    const profile = new ColorBlindnessProfile();
    expect(() => profile.revert(root)).not.toThrow();
    expect(root.outerHTML).toBe(before);
  });

  it('double apply does not stack duplicate svgs', () => {
    const root = makeRoot();
    const profile = new ColorBlindnessProfile();
    profile.apply(root, { variant: 'protanopia' });
    profile.apply(root, { variant: 'tritanopia' });
    expect(document.body.querySelectorAll('svg[data-a11ylens]').length).toBe(1);
    expect(root.style.filter).toBe('url("#a11ylens-cb-tritanopia")');
    profile.revert(root);
    expect(document.body.querySelector('svg[data-a11ylens]')).toBeNull();
  });
});
