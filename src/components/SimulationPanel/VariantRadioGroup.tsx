const VARIANTS = ['protanopia', 'deuteranopia', 'tritanopia'] as const;
export type ColorBlindnessVariant = (typeof VARIANTS)[number];

interface VariantRadioGroupProps {
  value: ColorBlindnessVariant;
  onChange: (value: ColorBlindnessVariant) => void;
  name: string;
  disabled?: boolean;
}

/** Color-blindness variant picker as an accessible radiogroup. */
export function VariantRadioGroup({
  value,
  onChange,
  name,
  disabled = false,
}: VariantRadioGroupProps) {
  return (
    <fieldset className="mt-2" disabled={disabled}>
      <legend className="mb-1 font-mono text-label-badge uppercase tracking-wider text-ink-soft">
        Variant
      </legend>
      <div role="radiogroup" aria-label="Color blindness variant" className="flex flex-col gap-1">
        {VARIANTS.map((variant) => (
          <label
            key={variant}
            className={[
              'flex items-center gap-2 rounded px-2 py-1 text-body-sm capitalize',
              disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-hover',
            ].join(' ')}
          >
            <input
              type="radio"
              name={name}
              value={variant}
              checked={value === variant}
              onChange={() => onChange(variant)}
              disabled={disabled}
              className="h-3.5 w-3.5 accent-primary"
            />
            {variant}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
