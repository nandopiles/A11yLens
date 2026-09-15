import { Link } from 'react-router-dom';
import { Badge } from '@/components/primitives/Badge';
import { Button } from '@/components/primitives/Button';
import { Icon, type IconName } from '@/components/primitives/Icon';

interface Metric {
  icon: IconName;
  label: string;
  value: string;
  hint: string;
}

const metrics: Metric[] = [
  { icon: 'check', label: 'WCAG engine', value: '2.2 AAA', hint: 'Target coverage' },
  { icon: 'signal', label: 'Avg. latency', value: '1.8 ms', hint: 'No page reload' },
  { icon: 'people', label: 'Active profiles', value: '6', hint: 'Visual, motor & cognitive' },
  { icon: 'bug', label: 'Real audit', value: 'axe-core', hint: 'Standards-based checks' },
];

export function Hero() {
  return (
    <section className="border-b border-hairline bg-canvas">
      <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <Badge className="mb-6">
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-emerald-500" />
          Interactive digital-empathy tool for WCAG 2.2
        </Badge>

        <h1 className="mx-auto max-w-3xl text-headline-lg leading-tight tracking-tight text-ink sm:text-display-hero">
          Experience what others live when they{' '}
          <span className="text-primary">browse the web</span>
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-body-lg text-ink-soft">
          Feel firsthand how people with different visual, motor, and cognitive
          abilities interact with digital products, before you ship to production.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/simulate/checkout"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-primary bg-primary px-4 py-2 text-body-md font-medium text-primary-on transition-colors hover:bg-primary-strong"
          >
            <Icon name="play" />
            Try an interactive simulation
          </Link>
          <Button variant="secondary" onClick={() => scrollToId('use-cases')}>
            <Icon name="compass" />
            Explore case studies
          </Button>
        </div>

        <dl className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded border border-hairline bg-hairline text-left sm:grid-cols-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="bg-canvas p-4">
              <dt className="flex items-center gap-1 font-mono text-label-badge uppercase text-ink-soft">
                <span className="text-primary">
                  <Icon name={metric.icon} />
                </span>
                {metric.label}
              </dt>
              <dd className="mt-1 text-headline-md text-ink">{metric.value}</dd>
              <dd className="mt-0.5 text-caption text-ink-soft">{metric.hint}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
