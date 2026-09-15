import type { SVGProps } from 'react';

/**
 * Minimal inline icon set (stroke-based) so the app has no external icon-font
 * dependency. Icons are decorative by default (aria-hidden); pass a title for
 * meaningful ones. Sizing is controlled via the surrounding font-size (1em).
 */
export type IconName =
  | 'bolt'
  | 'play'
  | 'compass'
  | 'check'
  | 'signal'
  | 'people'
  | 'bug'
  | 'lock'
  | 'arrow-right'
  | 'palette'
  | 'eye-off'
  | 'spellcheck'
  | 'touch'
  | 'shopping-bag';

const paths: Record<IconName, JSX.Element> = {
  bolt: <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />,
  play: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M10 9v6l5-3-5-3Z" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m15 9-2 4-4 2 2-4 4-2Z" />
    </>
  ),
  check: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12 2.5 2.5 4.5-5" />
    </>
  ),
  signal: <path d="M4 20h2v-6H4v6Zm5 0h2V9H9v11Zm5 0h2V4h-2v16Zm5 0h2v-9h-2v9Z" />,
  people: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20a6 6 0 0 1 12 0" />
      <path d="M16 6a3 3 0 0 1 0 6" />
      <path d="M18 20a6 6 0 0 0-3-5.2" />
    </>
  ),
  bug: (
    <>
      <path d="M9 6a3 3 0 0 1 6 0" />
      <rect x="7" y="7" width="10" height="10" rx="5" />
      <path d="M4 11h3M17 11h3M4 15h3M17 15h3M12 17v3" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  ),
  'arrow-right': <path d="M5 12h14m-6-6 6 6-6 6" />,
  palette: (
    <>
      <path d="M12 3a9 9 0 1 0 0 18c1.5 0 2-1 2-2s-1-1.5-1-2.5S14 14 15.5 14H18a3 3 0 0 0 3-3 8 8 0 0 0-9-8Z" />
      <circle cx="7.5" cy="10.5" r="1" />
      <circle cx="12" cy="7.5" r="1" />
      <circle cx="16.5" cy="10.5" r="1" />
    </>
  ),
  'eye-off': (
    <>
      <path d="M3 3l18 18" />
      <path d="M10.6 5.1A9 9 0 0 1 21 12a12 12 0 0 1-2.2 3M6.6 6.6A12 12 0 0 0 3 12a9 9 0 0 0 12.5 4.2" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </>
  ),
  spellcheck: <path d="M4 17 8 7l4 10M5.5 13h5M14 12l3 3 5-6" />,
  touch: (
    <>
      <path d="M9 11V6a2 2 0 1 1 4 0v5" />
      <path d="M13 11V9a2 2 0 1 1 4 0v5a6 6 0 0 1-6 6h-1a5 5 0 0 1-4-2l-3-4a1.5 1.5 0 0 1 2.4-1.8L7 14V6a2 2 0 1 1 4 0" />
    </>
  ),
  'shopping-bag': (
    <>
      <path d="M6 8h12l-1 12H7L6 8Z" />
      <path d="M9 8a3 3 0 0 1 6 0" />
    </>
  ),
};

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName;
  /** Accessible label. If omitted, the icon is hidden from assistive tech. */
  title?: string;
}

export function Icon({ name, title, ...props }: IconProps) {
  const decorative = !title;
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative ? true : undefined}
      aria-label={title}
      focusable="false"
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {paths[name]}
    </svg>
  );
}
