import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSimulationStore } from '@/store/simulationStore';
import { SimulationPanel } from '@/components/SimulationPanel';
import { AuditOverlay } from '@/components/AuditOverlay';
import { Icon } from '@/components/primitives/Icon';
import { getDemo, listDemos } from '@/features/demos/registry';
import type { DemoDefinition } from '@/features/demos/types';

/**
 * Route entry. Keying the inner shell by the resolved demo id remounts it on every demo
 * switch, so per-demo view state (broken/accessible toggle, audit delta) resets naturally
 * without synchronous setState inside an effect.
 */
export function SimulatorPage() {
  const { demo } = useParams();
  const definition = getDemo(demo);
  return <SimulatorShell key={definition.meta.id} definition={definition} />;
}

/**
 * Simulator shell: mounts the selected demo inside a preview container wired to the engine
 * via `setRoot`, then renders the floating SimulationPanel over it. Changing the demo
 * resets all active profiles so no effect leaks across demos.
 *
 * A local `accessible` toggle re-renders the same demo in its corrected, fully accessible
 * form and reveals a short "what was fixed" panel — so users can compare the broken and
 * accessible versions of the exact same page.
 */
function SimulatorShell({ definition }: { definition: DemoDefinition }) {
  const previewRef = useRef<HTMLDivElement>(null);
  const setRoot = useSimulationStore((s) => s.setRoot);
  const reset = useSimulationStore((s) => s.reset);
  const audit = useSimulationStore((s) => s.audit);
  const auditRunning = useSimulationStore((s) => s.auditRunning);
  const runAudit = useSimulationStore((s) => s.runAudit);
  const clearAudit = useSimulationStore((s) => s.clearAudit);
  const [accessible, setAccessible] = useState(false);
  // The violation count captured just before the last state change, so the AuditOverlay
  // can show the before→after delta (e.g. 8 → 0 when the page is made accessible).
  const [previousCount, setPreviousCount] = useState<number | null>(null);

  const { Component, meta } = definition;
  const demos = listDemos();

  // Bind/unbind the engine to this demo's preview container. Because the shell is keyed by
  // demo id, this runs once per demo mount — no cross-demo effect leakage.
  useEffect(() => {
    window.scrollTo(0, 0);
    reset();
    setRoot(previewRef.current);
    clearAudit();
    return () => {
      reset();
      setRoot(null);
    };
  }, [setRoot, reset, clearAudit]);

  // Audit the preview after each render of the demo DOM (initial mount and the
  // broken↔accessible toggle). A deferred rAF ensures React has committed the new DOM and
  // the accessible-toggle's reset() has run before axe reads the tree.
  useEffect(() => {
    let cancelled = false;
    const id = requestAnimationFrame(() => {
      if (!cancelled) void runAudit();
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(id);
    };
  }, [runAudit, accessible]);

  const toggleAccessible = () => {
    // Remember the current violation count so the overlay can animate the drop.
    setPreviousCount(audit?.violationCount ?? null);
    // Reverting simulation effects avoids stale inline filters/attributes leaking onto the
    // freshly re-rendered accessible DOM.
    reset();
    setAccessible((prev) => !prev);
  };

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

      {/* Reserve room on the right at xl+ so the floating panel never overlaps the preview. */}
      <main className="mx-auto max-w-content p-4 sm:p-6 xl:pr-[24rem]">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-headline-md text-ink">{meta.title}</h1>
            <p className="mt-1 max-w-prose text-body-md text-ink-soft">{meta.summary}</p>
          </div>

          {/* The core action: convert the current page to its fully accessible version. */}
          <button
            type="button"
            onClick={toggleAccessible}
            aria-pressed={accessible}
            className={[
              'inline-flex shrink-0 items-center gap-2 rounded-lg border px-3.5 py-2 text-body-sm font-semibold transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
              accessible
                ? 'border-primary bg-primary text-white hover:opacity-90'
                : 'border-hairline-strong bg-canvas text-ink hover:bg-hover',
            ].join(' ')}
          >
            <Icon name={accessible ? 'check' : 'sparkle'} />
            {accessible ? 'Versión accesible activa' : 'Hazlo accesible'}
          </button>
        </div>

        {/* What the fix does — only shown once the accessible version is on. */}
        {accessible && (
          <div
            role="region"
            aria-label="Qué se ha arreglado"
            className="mb-4 rounded-xl border border-primary/40 bg-primary/5 p-4"
          >
            <p className="text-body-sm font-semibold text-ink">
              Esta es la misma página, ahora accesible. Qué se ha arreglado:
            </p>
            <ul className="mt-2 space-y-1.5">
              {meta.remediation.map((item) => (
                <li key={item.fix} className="flex items-start gap-2 text-body-sm text-ink-soft">
                  <span className="mt-0.5 text-primary">
                    <Icon name="check" />
                  </span>
                  <span>
                    {item.fix}{' '}
                    <span className="font-mono text-label-badge text-ink-soft/70">WCAG {item.wcag}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Real axe-core audit of the live preview. The count drops toward 0 as the page
            is made accessible — the evidence behind the empathy simulation. */}
        <AuditOverlay report={audit} running={auditRunning} previousCount={previousCount} />

        {/* The container the engine mutates. The demo renders its own DOM inside it. */}
        <div
          ref={previewRef}
          data-preview-root
          data-accessible={accessible ? 'true' : 'false'}
          className="rounded-xl border border-hairline bg-canvas p-6 shadow-overlay"
        >
          <Component accessible={accessible} />
        </div>
      </main>

      <SimulationPanel />
    </div>
  );
}
