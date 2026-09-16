import { ProfileRegistry } from './ProfileRegistry';
import { ColorBlindnessProfile } from '../profiles/ColorBlindnessProfile';
import { DyslexiaProfile } from '../profiles/DyslexiaProfile';
import { TremorProfile } from '../profiles/TremorProfile';
import { ScreenReaderProfile } from '../profiles/ScreenReaderProfile';

/**
 * Build a registry with the four built-in accessibility profiles registered in the order
 * they should surface in the UI.
 */
export function createDefaultRegistry(): ProfileRegistry {
  const registry = new ProfileRegistry();
  registry.register(new ColorBlindnessProfile());
  registry.register(new DyslexiaProfile());
  registry.register(new TremorProfile());
  registry.register(new ScreenReaderProfile());
  return registry;
}
