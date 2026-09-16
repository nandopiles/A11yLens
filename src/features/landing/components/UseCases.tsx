import { Link } from 'react-router-dom';
import { Badge } from '@/components/primitives/Badge';
import { Icon, type IconName } from '@/components/primitives/Icon';

type Difficulty = 'Alta' | 'Media' | 'Intermedia';

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
  Alta: 'danger',
  Media: 'warning',
  Intermedia: 'info',
};

const useCases: UseCase[] = [
  {
    id: 'checkout',
    icon: 'lock',
    title: 'Formulario de pago exprés',
    description:
      'Pasarela de pago transaccional, campos de autocompletado y validación de tarjeta bajo estrés motor severo, microtemblores y límites de tiempo arbitrarios.',
    difficulty: 'Alta',
    criteria: ['Tamaño del objetivo (2.5.8)', 'Tiempo ajustable (2.2.1)', 'Identificación de errores (3.3.1)'],
    scenario: 'Escenario n.º 01 · Comercio electrónico',
  },
  {
    id: 'feed',
    icon: 'people',
    title: 'Feed social dinámico',
    description:
      'Consumo de contenido con scroll infinito, texto de bajo contraste sobre fotos y análisis de subtítulos sincronizados.',
    difficulty: 'Media',
    criteria: ['Contraste mínimo (1.4.3)', 'Subtítulos en directo (1.2.4)', 'Pausar, detener, ocultar (2.2.2)'],
    scenario: 'Escenario n.º 02 · Social y multimedia',
  },
  {
    id: 'navigation',
    icon: 'compass',
    title: 'Menú de navegación complejo',
    description:
      'Megamenú multinivel con subcategorías anidadas manejado únicamente con teclado, sin trampas de foco y con un orden de foco correcto.',
    difficulty: 'Alta',
    criteria: ['Teclado (2.1.1)', 'Sin trampa de teclado (2.1.2)', 'Orden del foco (2.4.3)'],
    scenario: 'Escenario n.º 03 · Portal empresarial',
  },
  {
    id: 'dashboard',
    icon: 'signal',
    title: 'Panel de analítica y gráficos',
    description:
      'Diagramas de dispersión y series temporales que dependen solo del color, probados para personas con daltonismo y baja visión.',
    difficulty: 'Intermedia',
    criteria: ['Uso del color (1.4.1)', 'Contraste no textual (1.4.11)', 'Información y relaciones (1.3.1)'],
    scenario: 'Escenario n.º 04 · Analítica SaaS',
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
            Entornos de prueba
          </span>
          <h2 id="use-cases-heading" className="mt-1 text-headline-md text-ink">
            Casos de uso preconfigurados
          </h2>
          <p className="mt-1 max-w-xl text-body-md text-ink-soft">
            Aísla la fricción real en componentes críticos antes de que perjudique la
            conversión o acarree sanciones de accesibilidad.
          </p>
        </div>
        <Badge tone="success">
          <Icon name="check" />
          Asignado a los criterios de conformidad WCAG 2.2
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
                    Dificultad: {useCase.difficulty}
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
                <Link
                  to={`/simulate/${useCase.id}`}
                  className="inline-flex items-center gap-1 rounded font-medium text-primary hover:text-primary-strong"
                  aria-label={`Abrir caso: ${useCase.title}`}
                >
                  Abrir caso
                  <Icon name="arrow-right" />
                </Link>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
