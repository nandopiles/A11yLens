import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useSimulationStore, profileRegistry } from '@/store/simulationStore';
import { Icon } from '@/components/primitives/Icon';
import { ProfileToggleRow } from './ProfileToggleRow';
import { useProfileControls } from './useProfileControls';

/**
 * Floating devtools-style control panel. A pure controller over `useSimulationStore` —
 * holds no simulation logic and is agnostic to whatever demo is mounted in the preview.
 * See simulation-panel/design.md.
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

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed right-4 top-24 z-50 inline-flex items-center gap-2 rounded-md border border-hairline bg-canvas px-3 py-2 text-body-sm font-medium text-ink shadow-overlay"
        aria-label="Abrir los controles de simulación de accesibilidad"
      >
        <Icon name="eye-off" />
        Simulación
        {activeCount > 0 && (
          <span className="rounded-full bg-primary px-1.5 font-mono text-label-badge text-white">
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
      className="fixed right-4 top-24 z-50 flex max-h-[calc(100vh-8rem)] w-80 flex-col overflow-hidden rounded-md border border-hairline bg-canvas shadow-overlay"
    >
      <header className="flex items-center justify-between gap-2 border-b border-hairline px-3 py-2.5">
        <div className="flex items-center gap-2">
          <h2 className="text-headline-sm text-ink">Simulación</h2>
          <span
            aria-live="polite"
            className="rounded-full border border-hairline bg-panel px-2 font-mono text-label-badge text-ink-muted"
          >
            {activeCount} activos
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={reset}
            disabled={activeCount === 0}
            className="rounded px-2 py-1 text-body-sm font-medium text-ink-soft hover:bg-hover disabled:opacity-40"
          >
            Restablecer
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Contraer panel"
            className="rounded p-1 text-ink-soft hover:bg-hover"
          >
            <Icon name="arrow-right" />
          </button>
        </div>
      </header>

      <div className="divide-y divide-hairline overflow-y-auto">
        <AnimatePresence initial={false}>
          {profiles.map((profile) => (
            <ProfileToggleRow
              key={profile.metadata.id}
              metadata={profile.metadata}
              active={isActive(profile.metadata.id)}
              options={options[profile.metadata.id]}
              onToggle={() => toggle(profile.metadata.id)}
              onOptionChange={(patch) => setOption(profile.metadata.id, patch)}
            />
          ))}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
}
