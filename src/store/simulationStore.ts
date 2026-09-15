import { create } from 'zustand';
import { createDefaultRegistry } from '@/core/engine/createRegistry';
import { SimulationEngine, type ActiveProfile } from '@/core/engine/SimulationEngine';
import type { ProfileId, ProfileOptions } from '@/core/engine/types';

/**
 * Zustand store that owns the simulation state and wires the engine's Observer hook.
 * `core/` never imports Zustand; the coupling lives here (see design.md §7). Components
 * read `activeProfiles` reactively and call the exposed actions — never profiles directly.
 */
interface SimulationState {
  activeProfiles: ActiveProfile[];
  /** Set the preview container the engine mutates. */
  setRoot: (root: HTMLElement | null) => void;
  toggleProfile: (id: ProfileId, options?: ProfileOptions) => void;
  setProfileOptions: (id: ProfileId, options: ProfileOptions) => void;
  isActive: (id: ProfileId) => boolean;
  reset: () => void;
}

const registry = createDefaultRegistry();
let root: HTMLElement | null = null;

export const useSimulationStore = create<SimulationState>((set, get) => {
  const engine = new SimulationEngine(
    registry,
    () => root,
    (active) => set({ activeProfiles: active }),
  );

  return {
    activeProfiles: [],
    setRoot: (next) => {
      root = next;
    },
    toggleProfile: (id, options) => engine.toggleProfile(id, options),
    setProfileOptions: (id, options) => engine.setProfileOptions(id, options),
    isActive: (id) => get().activeProfiles.some((a) => a.id === id),
    reset: () => engine.dispose(),
  };
});

/** The shared registry, exposed so the UI can list available profiles' metadata. */
export const profileRegistry = registry;
