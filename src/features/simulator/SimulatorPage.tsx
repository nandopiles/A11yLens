import { useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSimulationStore } from '@/store/simulationStore';
import { SimulationPanel } from '@/components/SimulationPanel';
import { Icon } from '@/components/primitives/Icon';
import { getDemo, listDemos } from '@/features/demos/registry';

/**
 * Simulator shell: mounts the selected demo inside a preview container wired to the engine
 * via `setRoot`, then renders the floating SimulationPanel over it. Changing the demo
 * resets all active profiles so no effect leaks across demos.
 */
export function SimulatorPage() {
  const { demo } = useParams();
  const previewRef = useRef<HTMLDivElement>(null);
  const setRoot = useSimulationStore((s) => s.setRoot);
  const reset = useSimulationStore((s) => s.reset);

  const definition = getDemo(demo);
  const { Component, meta } = definition;
  const demos = listDemos();

  useEffect(() => {
    // Reset any active profiles before (re)binding the root to the new demo's container.
    reset();
    setRoot(previewRef.current);
    return () => {
      reset();
      setRoot(null);
    };
    // Re-run when the demo changes so profiles never leak across demos.
  }, [setRoot, reset, meta.id]);

  return (
    <div className="min-h-screen bg-panel">
      <header className="flex h-14 items-center justify-between gap-4 border-b border-hairline bg-canvas px-4 sm:px-6">
        <Link to="/" className="inline-flex items-center gap-2 text-body-sm font-medium text-ink">
          <span className="rotate-180">
            <Icon name="arrow-right" />
          </span>
          Volver a A11yLens
        </Link>

        <nav aria-label="Demostración" className="hidden sm:block">
          <ul className="flex items-center gap-1">
            {demos.map((d) => {
              const current = d.meta.id === meta.id;
              return (
                <li key={d.meta.id}>
                  <Link
                    to={`/simulate/${d.meta.id}`}
                    aria-current={current ? 'page' : undefined}
                    className={[
                      'rounded px-2.5 py-1.5 text-body-sm font-medium transition-colors',
                      current ? 'bg-hover text-ink' : 'text-ink-soft hover:bg-panel hover:text-ink',
                    ].join(' ')}
                  >
                    {d.meta.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <span className="font-mono text-label-badge uppercase tracking-wider text-ink-soft">
          Objetivo: {meta.goalLabel}
        </span>
      </header>

      <main className="mx-auto max-w-content p-4 sm:p-6">
        <div className="mb-4">
          <h1 className="text-headline-md text-ink">{meta.title}</h1>
          <p className="mt-1 max-w-prose text-body-md text-ink-soft">{meta.summary}</p>
        </div>

        {/* The container the engine mutates. The demo renders its own DOM inside it. */}
        <div
          ref={previewRef}
          data-preview-root
          className="rounded-md border border-hairline bg-canvas p-6"
        >
          <Component />
        </div>
      </main>

      <SimulationPanel />
    </div>
  );
}
