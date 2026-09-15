import type { AccessibilityProfile, ProfileId } from './types';

/**
 * Registry of available profiles. Profiles register once and resolve by id. Duplicate
 * ids are rejected rather than silently overwritten; missing ids throw. See design.md §6.
 */
export class ProfileRegistry {
  private readonly profiles = new Map<ProfileId, AccessibilityProfile>();

  register(profile: AccessibilityProfile): void {
    const { id } = profile.metadata;
    if (this.profiles.has(id)) {
      throw new Error(`ProfileRegistry: a profile with id "${id}" is already registered.`);
    }
    this.profiles.set(id, profile);
  }

  has(id: ProfileId): boolean {
    return this.profiles.has(id);
  }

  get(id: ProfileId): AccessibilityProfile {
    const profile = this.profiles.get(id);
    if (!profile) {
      throw new Error(`ProfileRegistry: no profile registered with id "${id}".`);
    }
    return profile;
  }

  /** All registered profiles in insertion order. */
  list(): AccessibilityProfile[] {
    return [...this.profiles.values()];
  }
}
