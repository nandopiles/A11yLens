import { SiteHeader } from './components/SiteHeader';
import { Hero } from './components/Hero';
import { SimulatorPreview } from './components/SimulatorPreview';
import { UseCases } from './components/UseCases';
import { Profiles } from './components/Profiles';

export function LandingPage() {
  return (
    <div id="top" className="min-h-screen bg-canvas text-ink">
      <a
        href="#main-content"
        className="sr-only-focusable absolute left-4 top-4 z-[100] rounded-md border border-primary bg-canvas px-3 py-2 text-body-sm font-medium text-primary"
      >
        Skip to main content
      </a>

      <SiteHeader />

      <main id="main-content">
        <Hero />
        <SimulatorPreview />
        <UseCases />
        <Profiles />
      </main>

      <footer className="border-t border-hairline bg-panel">
        <div className="mx-auto flex max-w-content flex-col items-center justify-between gap-2 px-4 py-6 text-body-sm text-ink-soft sm:flex-row sm:px-6 lg:px-8">
          <p>A11yLens — built to show what accessibility really feels like.</p>
          <p className="font-mono text-caption">
            Simulation is for empathy. Real conformance requires manual testing.
          </p>
        </div>
      </footer>
    </div>
  );
}
