import { useState } from 'react';
import { Icon } from '@/components/primitives/Icon';

/**
 * Compact before/after comparator for the landing. Both views are stacked in one small
 * box: the original underneath and the "reduced vision" simulation clipped on top. A
 * draggable handle sweeps across the image (before/after style) to reveal the simulated
 * view. An invisible range input sits on top so the whole thing stays keyboard-accessible.
 * A short line of empathetic copy reacts to how much you have revealed.
 */
export function SimulatorPreview() {
  const [reveal, setReveal] = useState(35);

  const empathyLine =
    reveal < 20
      ? 'Esto es lo que ves tú.'
      : reveal < 70
        ? 'Arrastra para ver lo que ve otra persona…'
        : 'Esto es lo que ve alguien con visión reducida.';

  return (
    <section
      id="simulator"
      aria-labelledby="simulator-heading"
      className="mx-auto max-w-content px-4 py-10 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-md text-center">
        <span className="font-mono text-label-badge uppercase tracking-wider text-primary">
          Ponte en su lugar
        </span>
        <h2 id="simulator-heading" className="mt-1 text-headline-md text-ink">
          Desliza y siente la diferencia
        </h2>
      </div>

      <div className="mx-auto mt-6 max-w-md">
        {/* Before/after comparator. */}
        <div className="group relative select-none overflow-hidden rounded-xl border border-hairline bg-canvas shadow-overlay">
          {/* Base layer — the original view. */}
          <PaymentCard />

          {/* Overlay layer — the reduced-vision simulation, revealed from the left. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-canvas"
            style={{ clipPath: `inset(0 ${100 - reveal}% 0 0)` }}
          >
            <div className="blur-[1.6px] contrast-[0.58] brightness-95">
              <PaymentCard muted />
            </div>
          </div>

          {/* Draggable handle line + grip. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 z-10 w-0.5 -translate-x-1/2 bg-white/90 shadow-[0_0_0_1px_rgba(15,23,42,0.25)]"
            style={{ left: `${reveal}%` }}
          >
            <span className="absolute top-1/2 left-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-hairline bg-white text-ink shadow-overlay">
              <span className="flex items-center text-primary">
                <span className="-mr-1 rotate-180">
                  <Icon name="arrow-right" />
                </span>
                <Icon name="arrow-right" />
              </span>
            </span>
          </div>

          {/* Corner labels. */}
          <span className="absolute left-2 top-2 z-10 rounded bg-canvas/85 px-1.5 py-0.5 font-mono text-caption text-emerald-700">
            Tú
          </span>
          {reveal > 8 && (
            <span className="absolute right-2 top-2 z-10 rounded bg-canvas/85 px-1.5 py-0.5 font-mono text-caption text-rose-700">
              Visión reducida
            </span>
          )}

          {/* Invisible, full-cover range input keeps drag + keyboard accessible. */}
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={reveal}
            onChange={(e) => setReveal(Number(e.target.value))}
            aria-label="Desliza para revelar la vista con visión reducida"
            aria-valuetext={`${reveal}% de vista simulada`}
            className="absolute inset-0 z-20 h-full w-full cursor-ew-resize opacity-0"
          />
        </div>

        {/* Empathetic, reactive caption. */}
        <p
          aria-live="polite"
          className="mt-3 text-center text-body-sm text-ink-soft"
        >
          {empathyLine}
        </p>
      </div>
    </section>
  );
}

function PaymentCard({ muted = false }: { muted?: boolean }) {
  const text = muted ? 'text-ink-soft' : 'text-ink';
  return (
    <div className="bg-canvas p-5">
      <div className="mb-2 flex items-center gap-2">
        <span aria-hidden="true" className="text-ink">
          <Icon name="shopping-bag" />
        </span>
        <span className={`text-headline-sm ${text}`}>Lumina Store</span>
      </div>
      <p className="font-mono text-label-code uppercase text-ink-soft">Número de tarjeta</p>
      <p className={`font-mono text-body-md tracking-wider ${text}`}>•••• •••• •••• 9842</p>
      <div className="mt-3 flex items-center justify-between border-t border-hairline pt-3 text-body-sm">
        <span className="text-ink-soft">Total</span>
        <span className={muted ? 'font-semibold text-ink-soft' : 'font-semibold text-primary'}>
          129,00 € EUR
        </span>
      </div>
    </div>
  );
}
