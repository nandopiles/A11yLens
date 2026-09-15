import { Badge } from '@/components/primitives/Badge';
import { Icon } from '@/components/primitives/Icon';

/**
 * Static preview of the live comparator. The interactive comparison slider and
 * real simulation engine arrive in a later spec; this frames the section on the
 * landing so the layout is complete and accessible.
 */
export function SimulatorPreview() {
  return (
    <section
      id="simulator"
      aria-labelledby="simulator-heading"
      className="mx-auto max-w-content px-4 py-14 sm:px-6 lg:px-8"
    >
      <div className="mb-6 flex flex-col justify-between gap-3 border-b border-hairline pb-4 sm:flex-row sm:items-end">
        <div>
          <span className="font-mono text-label-badge uppercase tracking-wider text-primary">
            A11y inspection lab
          </span>
          <h2 id="simulator-heading" className="mt-1 text-headline-md text-ink">
            Real-time comparison: payment flow
          </h2>
        </div>
        <Badge tone="warning">
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-amber-500" />
          Applied filter: tritanopia + motor tremor
        </Badge>
      </div>

      <div className="overflow-hidden rounded-md border border-hairline bg-canvas">
        <div className="flex items-center justify-between border-b border-hairline bg-panel px-3 py-2 font-mono text-caption text-ink-soft">
          <div className="flex items-center gap-2">
            <span aria-hidden="true" className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-hairline-strong" />
              <span className="h-2.5 w-2.5 rounded-full bg-hairline-strong" />
              <span className="h-2.5 w-2.5 rounded-full bg-hairline-strong" />
            </span>
            <span aria-hidden="true" className="text-hairline-strong">
              |
            </span>
            <span>https://checkout.retail-demo.dev/order/review</span>
          </div>
          <span className="hidden sm:inline">Interactive slider coming soon</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="border-b border-hairline p-6 md:border-b-0 md:border-r">
            <p className="mb-3 flex items-center gap-1.5 font-mono text-caption text-emerald-700">
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-emerald-500" />
              Original view
            </p>
            <PaymentCard />
          </div>
          <div className="bg-panel p-6">
            <p className="mb-3 flex items-center gap-1.5 font-mono text-caption text-rose-700">
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-rose-500" />
              Simulated view
            </p>
            <div className="opacity-90 blur-[0.4px] contrast-75 saturate-50">
              <PaymentCard muted />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PaymentCard({ muted = false }: { muted?: boolean }) {
  const text = muted ? 'text-ink-soft' : 'text-ink';
  return (
    <div className="rounded border border-hairline bg-canvas p-4">
      <div className="mb-2 flex items-center gap-2">
        <span aria-hidden="true" className="text-ink">
          <Icon name="shopping-bag" />
        </span>
        <span className={`text-headline-sm ${text}`}>Lumina Store</span>
      </div>
      <p className="font-mono text-label-code uppercase text-ink-soft">Card number</p>
      <p className={`font-mono text-body-md tracking-wider ${text}`}>•••• •••• •••• 9842</p>
      <div className="mt-3 flex items-center justify-between border-t border-hairline pt-3 text-body-sm">
        <span className="text-ink-soft">Total</span>
        <span className={muted ? 'font-semibold text-ink-soft' : 'font-semibold text-primary'}>
          $129.00 USD
        </span>
      </div>
    </div>
  );
}
