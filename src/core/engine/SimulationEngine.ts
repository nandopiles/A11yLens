import { ProfileRegistry } from './ProfileRegistry';
import { CATEGORY_ORDER, type ProfileId, type ProfileOptions } from './types';

export interface ActiveProfile {
  id: ProfileId;
  options?: ProfileOptions;
}

export type SimulationChangeListener = (active: ActiveProfile[]) => void;

/**
 * Facade over the profiles. The UI/store toggles profiles by id without knowing their
 * internals. Whenever the active set changes, the engine reverts everything and re-applies
 * in category order so stacked profiles compose deterministically regardless of toggle
 * sequence. Notifies observers via `onChange`. See design.md §7.
 */
export class SimulationEngine {
  private readonly registry: ProfileRegistry;
  private readonly getRoot: () => HTMLElement | null;
  private readonly onChange?: SimulationChangeListener;
  private active: ActiveProfile[] = [];

  constructor(
    registry: ProfileRegistry,
    getRoot: () => HTMLElement | null,
    onChange?: SimulationChangeListener,
  ) {
    this.registry = registry;
    this.getRoot = getRoot;
    this.onChange = onChange;
  }

  getActiveProfiles(): ActiveProfile[] {
    return this.active.map((a) => ({ id: a.id, options: a.options }));
  }

  /** Apply if inactive, revert if active. Throws on unknown id. */
  toggleProfile(id: ProfileId, options?: ProfileOptions): void {
    if (!this.registry.has(id)) {
      throw new Error(`SimulationEngine: unknown profile id "${id}".`);
    }
    const index = this.active.findIndex((a) => a.id === id);
    if (index >= 0) {
      this.active.splice(index, 1);
    } else {
      this.active.push({ id, options });
    }
    this.reapply();
    this.notify();
  }

  /** Update options for an active profile (no-op if not active). */
  setProfileOptions(id: ProfileId, options: ProfileOptions): void {
    const entry = this.active.find((a) => a.id === id);
    if (!entry) return;
    entry.options = options;
    this.reapply();
    this.notify();
  }

  /** Revert everything and clear. Safe to call multiple times. */
  dispose(): void {
    this.revertAll();
    this.active = [];
    this.notify();
  }

  private notify(): void {
    this.onChange?.(this.getActiveProfiles());
  }

  private revertAll(): void {
    const root = this.getRoot();
    if (!root) return;
    // Revert in reverse category order (mirror of application).
    [...this.registry.list()].reverse().forEach((profile) => {
      if (profile.isActive()) profile.revert(root);
    });
  }

  /** Revert all, then re-apply the active set in deterministic category order. */
  private reapply(): void {
    const root = this.getRoot();
    // No root yet: intent is recorded in `active`, applied once a root exists.
    if (!root) return;

    this.revertAll();

    const ordered = [...this.active].sort(
      (a, b) => this.categoryRank(a.id) - this.categoryRank(b.id),
    );
    ordered.forEach(({ id, options }) => {
      this.registry.get(id).apply(root, options);
    });
  }

  private categoryRank(id: ProfileId): number {
    const category = this.registry.get(id).metadata.category;
    return CATEGORY_ORDER.indexOf(category);
  }
}
