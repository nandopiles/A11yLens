import { Badge } from '@/components/primitives/Badge';
import { Icon } from '@/components/primitives/Icon';

const navItems = [
  { label: 'Inicio', href: '#top', current: true },
  { label: 'Casos de uso', href: '#use-cases' },
  { label: 'Perfiles', href: '#profiles' },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-hairline bg-canvas/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-content items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <a href="#top" className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="flex h-7 w-7 items-center justify-center rounded bg-ink text-white"
            >
              <span className="text-base">
                <Icon name="eye-off" />
              </span>
            </span>
            <span className="flex items-baseline gap-2">
              <span className="text-headline-sm tracking-tight text-ink">A11yLens</span>
              <span className="font-mono text-label-badge text-ink-soft">v0.1</span>
            </span>
          </a>
          <div aria-hidden="true" className="hidden h-4 w-px bg-hairline sm:block" />
          <nav aria-label="Principal" className="hidden md:block">
            <ul className="flex items-center gap-1 text-body-sm font-medium text-ink-soft">
              {navItems.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    aria-current={item.current ? 'page' : undefined}
                    className={[
                      'rounded px-2.5 py-1.5 transition-colors',
                      item.current
                        ? 'bg-hover text-ink'
                        : 'hover:bg-panel hover:text-ink',
                    ].join(' ')}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Badge tone="success" className="hidden lg:inline-flex">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-emerald-600"
            />
            Objetivo WCAG 2.2
          </Badge>
        </div>
      </div>
    </header>
  );
}
