import { describe, it, expect, afterEach, vi } from 'vitest';
import { SimulationEngine, type ActiveProfile } from './SimulationEngine';
import { ProfileRegistry } from './ProfileRegistry';
import type { AccessibilityProfile, ProfileCategory, ProfileId } from './types';

function recordingProfile(
  id: ProfileId,
  category: ProfileCategory,
  log: string[],
): AccessibilityProfile {
  let active = false;
  return {
    metadata: { id, name: id, description: '', category },
    apply() {
      active = true;
      log.push(`apply:${id}`);
    },
    revert() {
      active = false;
      log.push(`revert:${id}`);
    },
    isActive: () => active,
  };
}

afterEach(() => {
  document.body.innerHTML = '';
});

function setup(log: string[]) {
  const registry = new ProfileRegistry();
  // Register out of category order to prove the engine sorts on apply.
  registry.register(recordingProfile('tremor', 'motor', log));
  registry.register(recordingProfile('color-blindness', 'visual', log));
  registry.register(recordingProfile('dyslexia', 'cognitive', log));
  const root = document.createElement('div');
  document.body.appendChild(root);
  return { registry, root };
}

describe('SimulationEngine', () => {
  it('toggles a profile on and off', () => {
    const log: string[] = [];
    const { registry, root } = setup(log);
    const engine = new SimulationEngine(registry, () => root);

    engine.toggleProfile('color-blindness');
    expect(engine.getActiveProfiles().map((a) => a.id)).toEqual(['color-blindness']);

    engine.toggleProfile('color-blindness');
    expect(engine.getActiveProfiles()).toEqual([]);
  });

  it('throws on unknown id', () => {
    const log: string[] = [];
    const { registry, root } = setup(log);
    const engine = new SimulationEngine(registry, () => root);
    expect(() => engine.toggleProfile('nonexistent' as ProfileId)).toThrow(/unknown profile/);
  });

  it('applies active profiles in category order (visual → cognitive → motor)', () => {
    const log: string[] = [];
    const { registry, root } = setup(log);
    const engine = new SimulationEngine(registry, () => root);

    // Toggle in a non-category order.
    engine.toggleProfile('tremor');
    engine.toggleProfile('color-blindness');
    engine.toggleProfile('dyslexia');

    const applies = log.filter((l) => l.startsWith('apply:'));
    const lastThree = applies.slice(-3);
    expect(lastThree).toEqual([
      'apply:color-blindness',
      'apply:dyslexia',
      'apply:tremor',
    ]);
  });

  it('notifies the onChange observer with the active set', () => {
    const log: string[] = [];
    const { registry, root } = setup(log);
    const changes: ActiveProfile[][] = [];
    const engine = new SimulationEngine(registry, () => root, (a) => changes.push(a));

    engine.toggleProfile('color-blindness');
    const last = changes[changes.length - 1];
    expect(last?.map((a) => a.id)).toEqual(['color-blindness']);
  });

  it('dispose reverts all active profiles', () => {
    const log: string[] = [];
    const { registry, root } = setup(log);
    const engine = new SimulationEngine(registry, () => root);
    engine.toggleProfile('color-blindness');
    engine.toggleProfile('tremor');
    engine.dispose();
    expect(engine.getActiveProfiles()).toEqual([]);
    expect(registry.list().every((p) => !p.isActive())).toBe(true);
  });

  it('records intent but applies nothing when no root is available', () => {
    const log: string[] = [];
    const { registry } = setup(log);
    const engine = new SimulationEngine(registry, () => null);
    engine.toggleProfile('color-blindness');
    expect(engine.getActiveProfiles().map((a) => a.id)).toEqual(['color-blindness']);
    expect(log.filter((l) => l.startsWith('apply:'))).toEqual([]);
  });

  it('setProfileOptions re-applies for an active profile', () => {
    const log: string[] = [];
    const { registry, root } = setup(log);
    const spy = vi.spyOn(registry.get('color-blindness'), 'apply');
    const engine = new SimulationEngine(registry, () => root);
    engine.toggleProfile('color-blindness');
    engine.setProfileOptions('color-blindness', { variant: 'protanopia' });
    expect(spy).toHaveBeenCalledTimes(2);
    expect(engine.getActiveProfiles()[0].options).toEqual({ variant: 'protanopia' });
  });
});
