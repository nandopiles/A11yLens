import { Icon, type IconName } from '@/components/primitives/Icon';

interface ProfileCard {
  id: string;
  icon: IconName;
  title: string;
  description: string;
}

const profiles: ProfileCard[] = [
  {
    id: 'color-blindness',
    icon: 'palette',
    title: 'Daltonismo',
    description:
      'Simulación de fotorreceptores para protanopia (rojo), deuteranopia (verde) y tritanopia (azul) usando filtros nativos SVG feColorMatrix.',
  },
  {
    id: 'low-vision',
    icon: 'eye-off',
    title: 'Baja visión y visión de túnel',
    description:
      'Emula la reducción de agudeza y sensibilidad al contraste con desenfoque, menos contraste y una ampliación opcional de la vista previa.',
  },
  {
    id: 'dyslexia',
    icon: 'spellcheck',
    title: 'Dislexia',
    description:
      'Tiembla y reordena periódicamente las letras interiores de los párrafos largos para evaluar la legibilidad tipográfica real.',
  },
  {
    id: 'tremor',
    icon: 'touch',
    title: 'Temblor motor',
    description:
      'Inyecta oscilación en el puntero y reduce la precisión efectiva sobre los objetivos, revelando dianas demasiado pequeñas o demasiado juntas.',
  },
  {
    id: 'deafness',
    icon: 'signal',
    title: 'Sordera / sin subtítulos',
    description:
      'Silencia las señales de audio y desactiva los subtítulos, de modo que la información solo sonora se vuelve inaccesible y se evidencia la necesidad de alternativas textuales.',
  },
  {
    id: 'screen-reader',
    icon: 'people',
    title: 'Lector de pantalla',
    description:
      'Presenta una lectura linealizada y solo semántica del DOM, exponiendo etiquetas ausentes, orden de encabezados incorrecto y estructura no semántica.',
  },
];

export function Profiles() {
  return (
    <section
      id="profiles"
      aria-labelledby="profiles-heading"
      className="mx-auto max-w-content border-t border-hairline px-4 py-14 sm:px-6 lg:px-8"
    >
      <div className="mb-8 max-w-2xl">
        <span className="font-mono text-label-badge uppercase tracking-wider text-primary">
          Matriz sintética de impedimentos
        </span>
        <h2 id="profiles-heading" className="mt-1 text-headline-md text-ink">
          Perfiles de simulación de accesibilidad
        </h2>
        <p className="mt-1 text-body-md text-ink-soft">
          Cada perfil es una estrategia intercambiable que transforma la vista previa en
          tiempo real. Los perfiles se apilan, así que puedes combinar varios a la vez.
        </p>
      </div>

      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {profiles.map((profile) => (
          <li key={profile.id}>
            <article className="flex h-full flex-col rounded-md border border-hairline bg-canvas p-4">
              <div className="mb-2.5 flex items-center gap-2.5">
                <span aria-hidden="true" className="text-xl text-primary">
                  <Icon name={profile.icon} />
                </span>
                <h3 className="text-headline-sm text-ink">{profile.title}</h3>
              </div>
              <p className="text-body-sm text-ink-soft">{profile.description}</p>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
