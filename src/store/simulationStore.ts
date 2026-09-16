import { create } from 'zustand';
import { createDefaultRegistry } from '@/core/engine/createRegistry';
import { SimulationEngine, type ActiveProfile } from '@/core/engine/SimulationEngine';
import type { ProfileId, ProfileOptions } from '@/core/engine/types';
import { runAudit, type AuditReport } from '@/core/audit/auditRunner';

/**
 * Zustand store that owns the simulation state and wires the engine's Observer hook.
 * `core/` never imports Zustand; the coupling lives here (see design.md §7). Components
 * read `activeProfiles` reactively and call the exposed actions — never profiles directly.
 */
interface SimulationState {
  activeProfiles: ActiveProfile[];
  /** Latest real axe-core audit of the preview, or null before the first run. */
  audit: AuditReport | null;
  /** True while an audit is in flight. */
  auditRunning: boolean;
  /** Set the preview container the engine mutates. */
  setRoot: (root: HTMLElement | null) => void;
  toggleProfile: (id: ProfileId, options?: ProfileOptions) => void;
  setProfileOptions: (id: ProfileId, options: ProfileOptions) => void;
  isActive: (id: ProfileId) => boolean;
  reset: () => void;
  /**
   * Run a real accessibility audit against the current preview root. Active simulation
   * effects are reverted first so axe sees the demo's true DOM, then re-applied. Safe
   * no-op when no root is bound.
   */
  runAudit: () => Promise<void>;
  /** Clear the stored audit report (e.g. when switching demos). */
  clearAudit: () => void;
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
    audit: null,
    auditRunning: false,
    setRoot: (next) => {
      root = next;
    },
    toggleProfile: (id, options) => engine.toggleProfile(id, options),
    setProfileOptions: (id, options) => engine.setProfileOptions(id, options),
    isActive: (id) => get().activeProfiles.some((a) => a.id === id),
    reset: () => engine.dispose(),
    runAudit: async () => {
      if (!root) return;
      // Snapshot the active set, strip all effects so axe audits the real DOM, then
      // restore exactly what was active.
      const previouslyActive = engine.getActiveProfiles();
      engine.dispose();
      set({ auditRunning: true });
      try {
        const report = await runAudit(root);
        set({ audit: report });
      } finally {
        for (const { id, options } of previouslyActive) {
          engine.toggleProfile(id, options);
        }
        set({ auditRunning: false });
      }
    },
    clearAudit: () => set({ audit: null }),
  };
});

/** The shared registry, exposed so the UI can list available profiles' metadata. */
export const profileRegistry = registry;
