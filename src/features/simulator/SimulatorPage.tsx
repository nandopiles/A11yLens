import { useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSimulationStore } from '@/store/simulationStore';
import { SimulationPanel } from '@/components/SimulationPanel';
import { Icon } from '@/components/primitives/Icon';

/**
 * Simulator shell: mounts a demo inside a preview container and wires that container to the
 * engine via `setRoot`, then renders the floating SimulationPanel over it. The actual demo
 * content comes from the demo-usecases block; for now a placeholder proves the wiring so
 * profiles can be toggled against real DOM.
 */
export function SimulatorPage() {
  const { demo } = useParams();
  const previewRef = useRef<HTMLDivElement>(null);
  const setRoot = useSimulationStore((s) => s.setRoot);
  const reset = useSimulationStore((s) => s.reset);

  useEffect(() => {
    setRoot(previewRef.current);
    return () => {
      reset();
      setRoot(null);
    };
  }, [setRoot, reset]);

  return (
    <div className="min-h-screen bg-panel">
      <header className="flex h-14 items-center justify-between border-b border-hairline bg-canvas px-4 sm:px-6">
        <Link to="/" className="inline-flex items-center gap-2 text-body-sm font-medium text-ink">
          <Icon name="arrow-right" />
          <span className="rotate-180">
            <Icon name="arrow-right" />
          </span>
          Back to A11yLens
        </Link>
        <span className="font-mono text-label-badge uppercase tracking-wider text-ink-soft">
          {demo ? `Demo: ${demo}` : 'Simulator'}
        </span>
      </header>

      <main className="mx-auto max-w-content p-4 sm:p-6">
        <div
          ref={previewRef}
          data-preview-root
          className="rounded-md border border-hairline bg-canvas p-6"
        >
          <h1 className="text-headline-md text-ink">Preview container</h1>
          <p className="mt-2 max-w-prose text-body-md text-ink-soft">
            This is the container the simulation engine mutates. Open the panel and toggle a
            profile to see it applied here. Real demo use cases mount into this container in
            the next block.
          </p>
          <img src="/vite.svg" width={48} height={48} className="mt-4" alt="" />
        </div>
      </main>

      <SimulationPanel />
    </div>
  );
}
