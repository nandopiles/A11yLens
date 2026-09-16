const VARIANTS = ['protanopia', 'deuteranopia', 'tritanopia'] as const;
export type ColorBlindnessVariant = (typeof VARIANTS)[number];

/** Short display labels so the three variants fit the segmented control. */
const VARIANT_LABELS: Record<ColorBlindnessVariant, string> = {
  protanopia: 'Protan',
  deuteranopia: 'Deuteran',
  tritanopia: 'Tritan',
};

interface VariantRadioGroupProps {
  value: ColorBlindnessVariant;
  onChange: (value: ColorBlindnessVariant) => void;
  name: string;
  disabled?: boolean;
}

/**
 * Color-blindness variant picker. Rendered exactly like IntensitySegmented: an accessible
 * radiogroup styled as a segmented control where the selected option is a solid black
 * segment (no native radio dot). Focus shows on the label via focus-within.
 */
export function VariantRadioGroup({
  value,
  onChange,
  name,
  disabled = false,
}: VariantRadioGroupProps) {
  return (
    <fieldset className="mt-2" disabled={disabled}>
      <legend className="mb-1 font-mono text-label-badge uppercase tracking-wider text-ink-soft">
        Variante
      </legend>
      <div
        role="radiogroup"
        aria-label="Variante de daltonismo"
        className="flex overflow-hidden rounded border border-hairline"
      >
        {VARIANTS.map((variant) => {
          const checked = value === variant;
          return (
            <label
              key={variant}
              title={variant}
              className={[
                'flex-1 cursor-pointer px-2 py-1 text-center text-body-sm transition-colors',
                'border-l border-hairline first:border-l-0',
                // Focus ring lives on the label so the native radio dot never shows.
                'focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-inset',
                checked ? 'bg-ink text-white font-medium' : 'bg-canvas text-ink-soft hover:bg-hover',
                disabled ? 'cursor-not-allowed opacity-50' : '',
              ].join(' ')}
            >
              {/*
                Radio kept fully hidden so the native dot never appears — the black filled
                segment IS the selected state. The input stays operable + accessible.
              */}
              <input
                type="radio"
                name={name}
                value={variant}
                checked={checked}
                onChange={() => onChange(variant)}
                disabled={disabled}
                aria-label={variant}
                className="sr-only"
              />
              {VARIANT_LABELS[variant]}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
