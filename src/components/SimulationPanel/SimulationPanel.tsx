import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useSimulationStore, profileRegistry } from '@/store/simulationStore';
import { Icon, type IconName } from '@/components/primitives/Icon';
import type { ProfileCategory, ProfileId } from '@/core/engine/types';
import { CATEGORY_ORDER } from '@/core/engine/types';
import { ProfileToggleRow } from './ProfileToggleRow';
import { useProfileControls } from './useProfileControls';

/** Human labels (in Spanish) for each profile category section header. */
const CATEGORY_LABELS: Record<ProfileCategory, string> = {
  visual: 'Visual',
  cognitive: 'Cognitivo',
  motor: 'Motor',
};

/** Icon per profile, so each row is scannable at a glance. */
export const PROFILE_ICONS: Record<ProfileId, IconName> = {
  'color-blindness': 'palette',
  dyslexia: 'spellcheck',
  tremor: 'touch',
  'screen-reader': 'people',
};

/**
 * Floating devtools-style control panel. A pure controller over `useSimulationStore` —
 * holds no simulation logic and is agnostic to whatever demo is mounted in the preview.
 * Profiles are grouped by category and each row carries an icon so the panel is easy to
 * scan. See simulation-panel/design.md.
 */
export function SimulationPanel() {
  const activeProfiles = useSimulationStore((s) => s.activeProfiles);
  const isActive = useSimulationStore((s) => s.isActive);
  const reset = useSimulationStore((s) => s.reset);
  const { options, setOption, toggle } = useProfileControls();
  const [open, setOpen] = useState(true);
  const reduceMotion = useReducedMotion();

  const activeCount = activeProfiles.length;
  const profiles = profileRegistry.list();

  // Group profiles by category, following the deterministic CATEGORY_ORDER.
  const groups = CATEGORY_ORDER.map((category) => ({
    category,
    items: profiles.filter((p) => p.metadata.category === category),
  })).filter((g) => g.items.length > 0);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed right-4 top-24 z-50 inline-flex items-center gap-2 rounded-full border border-hairline bg-canvas px-4 py-2.5 text-body-sm font-medium text-ink shadow-overlay transition-transform hover:scale-[1.03]"
        aria-label="Abrir los controles de simulación de accesibilidad"
      >
        <span className="text-primary">
          <Icon name="eye-off" />
        </span>
        Simulación
        {activeCount > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 font-mono text-label-badge text-white">
            {activeCount}
          </span>
        )}
      </button>
    );
  }

  return (
    <motion.aside
      aria-label="Controles de simulación de accesibilidad"
      initial={reduceMotion ? false : { opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.2 }}
      className="fixed right-4 top-24 z-50 flex max-h-[calc(100vh-8rem)] w-[21rem] flex-col overflow-hidden rounded-xl border border-hairline bg-canvas shadow-overlay"
    >
      <header className="border-b border-hairline px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-ink text-white">
              <Icon name="eye-off" />
            </span>
            <h2 className="text-headline-sm text-ink">Simulación</h2>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Contraer panel"
            className="rounded-md p-1.5 text-ink-soft transition-colors hover:bg-hover"
          >
            <Icon name="arrow-right" />
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <span
            aria-live="polite"
            className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-panel px-2.5 py-0.5 font-mono text-label-badge text-ink-soft"
          >
            <span
              aria-hidden="true"
              className={[
                'h-1.5 w-1.5 rounded-full',
                activeCount > 0 ? 'bg-primary' : 'bg-hairline-strong',
              ].join(' ')}
            />
            {activeCount} activos
          </span>
          <button
            type="button"
            onClick={reset}
            disabled={activeCount === 0}
            className="rounded-md px-2.5 py-1 text-body-sm font-medium text-ink-soft transition-colors hover:bg-hover hover:text-ink disabled:pointer-events-none disabled:opacity-40"
          >
            Restablecer
          </button>
        </div>
      </header>

      <div className="overflow-y-auto">
        {groups.map((group) => (
          <section key={group.category} aria-label={CATEGORY_LABELS[group.category]}>
            <h3 className="sticky top-0 z-10 bg-panel/95 px-4 py-1.5 font-mono text-label-badge uppercase tracking-wider text-ink-muted backdrop-blur-sm">
              {CATEGORY_LABELS[group.category]}
            </h3>
            <div className="divide-y divide-hairline">
              <AnimatePresence initial={false}>
                {group.items.map((profile) => (
                  <ProfileToggleRow
                    key={profile.metadata.id}
                    metadata={profile.metadata}
                    icon={PROFILE_ICONS[profile.metadata.id]}
                    active={isActive(profile.metadata.id)}
                    options={options[profile.metadata.id]}
                    onToggle={() => toggle(profile.metadata.id)}
                    onOptionChange={(patch) => setOption(profile.metadata.id, patch)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </section>
        ))}
      </div>
    </motion.aside>
  );
}
