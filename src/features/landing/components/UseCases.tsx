import { Badge } from '@/components/primitives/Badge';
import { Icon, type IconName } from '@/components/primitives/Icon';

type Difficulty = 'High' | 'Medium' | 'Intermediate';

interface UseCase {
  id: string;
  icon: IconName;
  title: string;
  description: string;
  difficulty: Difficulty;
  criteria: string[];
  scenario: string;
}

const difficultyTone: Record<Difficulty, 'danger' | 'warning' | 'info'> = {
  High: 'danger',
  Medium: 'warning',
  Intermediate: 'info',
};

const useCases: UseCase[] = [
  {
    id: 'checkout',
    icon: 'lock',
    title: 'Express checkout form',
    description:
      'Transactional payment gateway, autofill fields, and card validation under severe motor stress, micro-tremors, and arbitrary time limits.',
    difficulty: 'High',
    criteria: ['Target Size (2.5.8)', 'Timing Adjustable (2.2.1)', 'Error Identification (3.3.1)'],
    scenario: 'Scenario #01 · E-commerce',
  },
  {
    id: 'feed',
    icon: 'people',
    title: 'Dynamic social feed',
    description:
      'Infinite-scroll media consumption, low-contrast text over photos, and synchronized caption analysis.',
    difficulty: 'Medium',
    criteria: ['Contrast Minimum (1.4.3)', 'Captions Live (1.2.4)', 'Pause, Stop, Hide (2.2.2)'],
    scenario: 'Scenario #02 · Social & media',
  },
  {
    id: 'navigation',
    icon: 'compass',
    title: 'Complex navigation menu',
    description:
      'Multi-level mega-menu with nested subcategories operated purely by keyboard, with no focus traps and correct focus order.',
    difficulty: 'High',
    criteria: ['Keyboard (2.1.1)', 'No Keyboard Trap (2.1.2)', 'Focus Order (2.4.3)'],
    scenario: 'Scenario #03 · Enterprise portal',
  },
  {
    id: 'dashboard',
    icon: 'signal',
    title: 'Analytics dashboard & charts',
    description:
      'Scatter plots and time series that rely on color alone, tested for users with color blindness and low vision.',
    difficulty: 'Intermediate',
    criteria: ['Use of Color (1.4.1)', 'Non-text Contrast (1.4.11)', 'Info & Relationships (1.3.1)'],
    scenario: 'Scenario #04 · SaaS analytics',
  },
];

export function UseCases() {
  return (
    <section
      id="use-cases"
      aria-labelledby="use-cases-heading"
      className="mx-auto max-w-content border-t border-hairline px-4 py-12 sm:px-6 lg:px-8"
    >
      <div className="mb-6 flex flex-col justify-between gap-3 pb-6 sm:flex-row sm:items-end">
        <div>
          <span className="font-mono text-label-badge uppercase tracking-wider text-ink-soft">
            Testing environments
          </span>
          <h2 id="use-cases-heading" className="mt-1 text-headline-md text-ink">
            Preconfigured use cases
          </h2>
          <p className="mt-1 max-w-xl text-body-md text-ink-soft">
            Isolate real friction in critical components before it hurts conversion
            or triggers accessibility penalties.
          </p>
        </div>
        <Badge tone="success">
          <Icon name="check" />
          Mapped to WCAG 2.2 success criteria
        </Badge>
      </div>

      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {useCases.map((useCase) => (
          <li key={useCase.id}>
            <article className="flex h-full flex-col justify-between rounded-md border border-hairline bg-canvas p-5 transition-colors hover:border-hairline-strong">
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <span
                    aria-hidden="true"
                    className="flex h-8 w-8 items-center justify-center rounded border border-hairline bg-panel text-ink-muted"
                  >
                    <span className="text-lg">
                      <Icon name={useCase.icon} />
                    </span>
                  </span>
                  <Badge tone={difficultyTone[useCase.difficulty]}>
                    Difficulty: {useCase.difficulty}
                  </Badge>
                </div>
                <h3 className="text-headline-sm text-ink">{useCase.title}</h3>
                <p className="mt-1.5 text-body-sm text-ink-soft">{useCase.description}</p>
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {useCase.criteria.map((criterion) => (
                    <li key={criterion}>
                      <Badge>{criterion}</Badge>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-hairline pt-4 text-body-sm">
                <span className="font-mono text-ink-soft">{useCase.scenario}</span>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded font-medium text-primary hover:text-primary-strong"
                >
                  Open case
                  <Icon name="arrow-right" />
                </button>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
