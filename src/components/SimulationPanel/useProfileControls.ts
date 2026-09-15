import { useState, useCallback } from 'react';
import { useSimulationStore } from '@/store/simulationStore';
import type { ProfileId, ProfileOptions } from '@/core/engine/types';

/** Kind of inline control a profile row renders. */
export type ControlKind = 'variant' | 'intensity' | 'none';

export interface ProfileControlConfig {
  kind: ControlKind;
  defaults: ProfileOptions;
}

/**
 * Per-profile control configuration. Adding a future profile's controls is a one-entry
 * change here — the components read from this map and never hard-code profile ids.
 */
export const PROFILE_CONTROL_CONFIG: Record<ProfileId, ProfileControlConfig> = {
  'color-blindness': { kind: 'variant', defaults: { variant: 'deuteranopia' } },
  'low-vision': { kind: 'intensity', defaults: { intensity: 'moderate' } },
  dyslexia: { kind: 'none', defaults: {} },
  tremor: { kind: 'intensity', defaults: { intensity: 'moderate' } },
  deafness: { kind: 'none', defaults: {} },
  'screen-reader': { kind: 'none', defaults: {} },
};

function seedDefaults(): Record<ProfileId, ProfileOptions> {
  const out = {} as Record<ProfileId, ProfileOptions>;
  (Object.keys(PROFILE_CONTROL_CONFIG) as ProfileId[]).forEach((id) => {
    out[id] = { ...PROFILE_CONTROL_CONFIG[id].defaults };
  });
  return out;
}

/**
 * Holds UI-only draft options (selected variant/intensity) so the user can pre-pick
 * before enabling a profile. When a profile is active, option changes are pushed live to
 * the store via `setProfileOptions`. See simulation-panel/design.md §2.
 */
export function useProfileControls() {
  const isActive = useSimulationStore((s) => s.isActive);
  const toggleProfile = useSimulationStore((s) => s.toggleProfile);
  const setProfileOptions = useSimulationStore((s) => s.setProfileOptions);

  const [options, setOptions] = useState<Record<ProfileId, ProfileOptions>>(seedDefaults);

  const setOption = useCallback(
    (id: ProfileId, patch: ProfileOptions) => {
      setOptions((prev) => {
        const merged = { ...prev[id], ...patch };
        const next = { ...prev, [id]: merged };
        // Live update only when the profile is currently active.
        if (isActive(id)) {
          setProfileOptions(id, merged);
        }
        return next;
      });
    },
    [isActive, setProfileOptions],
  );

  const toggle = useCallback(
    (id: ProfileId) => {
      toggleProfile(id, options[id]);
    },
    [toggleProfile, options],
  );

  return { options, setOption, toggle };
}
