const LEVELS = ['mild', 'moderate', 'severe'] as const;
export type Intensity = (typeof LEVELS)[number];

interface IntensitySegmentedProps {
  value: Intensity;
  onChange: (value: Intensity) => void;
  /** Unique name for the underlying radio group. */
  name: string;
  disabled?: boolean;
}

/**
 * Accessible segmented control over the 3-value intensity enum. Rendered as a native
 * radiogroup (discrete, named steps are clearer for assistive tech than a range slider),
 * styled slider-like per the design system. See simulation-panel/design.md §5.
 */
export function IntensitySegmented({
  value,
  onChange,
  name,
  disabled = false,
}: IntensitySegmentedProps) {
  return (
    <fieldset className="mt-2" disabled={disabled}>
      <legend className="mb-1 font-mono text-label-badge uppercase tracking-wider text-ink-soft">
        Intensity
      </legend>
      <div
        role="radiogroup"
        aria-label="Intensity"
        className="flex overflow-hidden rounded border border-hairline"
      >
        {LEVELS.map((level) => {
          const checked = value === level;
          return (
            <label
              key={level}
              className={[
                'flex-1 cursor-pointer px-2 py-1 text-center text-body-sm capitalize transition-colors',
                'border-l border-hairline first:border-l-0',
                checked ? 'bg-ink text-white font-medium' : 'bg-canvas text-ink-soft hover:bg-hover',
                disabled ? 'cursor-not-allowed opacity-50' : '',
              ].join(' ')}
            >
              <input
                type="radio"
                name={name}
                value={level}
                checked={checked}
                onChange={() => onChange(level)}
                disabled={disabled}
                className="sr-only-focusable"
              />
              {level}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
