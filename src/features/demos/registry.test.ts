import { describe, it, expect } from 'vitest';
import { getDemo, listDemos } from './registry';

describe('demo registry', () => {
  it('resolves each known demo id', () => {
    expect(getDemo('checkout').meta.id).toBe('checkout');
    expect(getDemo('feed').meta.id).toBe('feed');
    expect(getDemo('navigation').meta.id).toBe('navigation');
    expect(getDemo('dashboard').meta.id).toBe('dashboard');
  });

  it('falls back to checkout for unknown or missing ids', () => {
    expect(getDemo('nope').meta.id).toBe('checkout');
    expect(getDemo(undefined).meta.id).toBe('checkout');
  });

  it('lists all four demos with metadata and defects', () => {
    const demos = listDemos();
    expect(demos).toHaveLength(4);
    demos.forEach((d) => {
      expect(d.meta.title).toBeTruthy();
      expect(d.meta.goalLabel).toBeTruthy();
      expect(d.meta.defects.length).toBeGreaterThan(0);
    });
  });
});
