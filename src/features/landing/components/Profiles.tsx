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
    title: 'Color blindness',
    description:
      'Photoreceptor simulation of protanopia (red), deuteranopia (green), and tritanopia (blue) using native SVG feColorMatrix filters.',
  },
  {
    id: 'low-vision',
    icon: 'eye-off',
    title: 'Low vision & tunnel vision',
    description:
      'Emulates reduced acuity and contrast sensitivity with blur, reduced contrast, and optional magnification of the preview.',
  },
  {
    id: 'dyslexia',
    icon: 'spellcheck',
    title: 'Dyslexia',
    description:
      'Periodically jitters and reorders interior letters in long paragraphs to evaluate real typographic legibility.',
  },
  {
    id: 'tremor',
    icon: 'touch',
    title: 'Motor tremor',
    description:
      'Injects pointer oscillation and reduces effective target precision, exposing hit targets that are too small or too close.',
  },
  {
    id: 'deafness',
    icon: 'signal',
    title: 'Deafness / no captions',
    description:
      'Mutes audio cues and disables captions so audio-only information becomes inaccessible, highlighting the need for text alternatives.',
  },
  {
    id: 'screen-reader',
    icon: 'people',
    title: 'Screen reader',
    description:
      'Presents a linearized, semantics-only reading of the DOM, exposing missing labels, bad heading order, and non-semantic structure.',
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
          Synthetic impairment matrix
        </span>
        <h2 id="profiles-heading" className="mt-1 text-headline-md text-ink">
          Accessibility simulation profiles
        </h2>
        <p className="mt-1 text-body-md text-ink-soft">
          Each profile is an interchangeable strategy that transforms the preview in
          real time. Profiles stack, so you can combine several at once.
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
