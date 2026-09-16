import { describe, it, expect } from 'vitest';
import { ProfileRegistry } from './ProfileRegistry';
import type { AccessibilityProfile, ProfileId } from './types';

function fakeProfile(id: ProfileId): AccessibilityProfile {
  return {
    metadata: { id, name: id, description: '', category: 'visual' },
    apply: () => {},
    revert: () => {},
    isActive: () => false,
  };
}

describe('ProfileRegistry', () => {
  it('registers and resolves by id', () => {
    const registry = new ProfileRegistry();
    const profile = fakeProfile('screen-reader');
    registry.register(profile);
    expect(registry.has('screen-reader')).toBe(true);
    expect(registry.get('screen-reader')).toBe(profile);
  });

  it('rejects duplicate ids', () => {
    const registry = new ProfileRegistry();
    registry.register(fakeProfile('tremor'));
    expect(() => registry.register(fakeProfile('tremor'))).toThrow(/already registered/);
  });

  it('throws for a missing id', () => {
    const registry = new ProfileRegistry();
    expect(() => registry.get('dyslexia')).toThrow(/no profile registered/);
  });

  it('lists profiles in insertion order', () => {
    const registry = new ProfileRegistry();
    registry.register(fakeProfile('color-blindness'));
    registry.register(fakeProfile('screen-reader'));
    expect(registry.list().map((p) => p.metadata.id)).toEqual([
      'color-blindness',
      'screen-reader',
    ]);
  });
});
