import type { ProfileMetadata, ProfileOptions } from '@/core/engine/types';
import { PROFILE_CONTROL_CONFIG } from './useProfileControls';
import { IntensitySegmented, type Intensity } from './IntensitySegmented';
import { VariantRadioGroup, type ColorBlindnessVariant } from './VariantRadioGroup';

interface ProfileToggleRowProps {
  metadata: ProfileMetadata;
  active: boolean;
  options: ProfileOptions;
  onToggle: () => void;
  onOptionChange: (patch: ProfileOptions) => void;
}

/**
 * A single profile row: a switch + name/description, and (when the profile has options) an
 * inline variant/intensity control. Active state is signalled by an accent bar and an "On"
 * text label — never by color alone (the tool models good practice).
 */
export function ProfileToggleRow({
  metadata,
  active,
  options,
  onToggle,
  onOptionChange,
}: ProfileToggleRowProps) {
  const config = PROFILE_CONTROL_CONFIG[metadata.id];
  const switchId = `toggle-${metadata.id}`;

  return (
    <div
      className={[
        'border-l-2 py-3 pl-3 pr-2 transition-colors',
        active ? 'border-l-primary bg-surface-low' : 'border-l-transparent',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <label htmlFor={switchId} className="block text-headline-sm text-ink">
            {metadata.name}
          </label>
          <p className="mt-0.5 text-body-sm text-ink-soft">{metadata.description}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <button
            id={switchId}
            type="button"
            role="switch"
            aria-checked={active}
            onClick={onToggle}
            className={[
              'relative h-5 w-9 rounded-full border transition-colors',
              active ? 'border-primary bg-primary' : 'border-hairline-strong bg-hover',
            ].join(' ')}
          >
            <span
              aria-hidden="true"
              className={[
                'absolute top-0.5 h-3.5 w-3.5 rounded-full bg-white transition-transform',
                active ? 'translate-x-4' : 'translate-x-0.5',
              ].join(' ')}
            />
          </button>
          <span
            className={[
              'font-mono text-label-badge uppercase',
              active ? 'text-primary' : 'text-ink-soft',
            ].join(' ')}
          >
            {active ? 'On' : 'Off'}
          </span>
        </div>
      </div>

      {config.kind === 'variant' && (
        <VariantRadioGroup
          name={`variant-${metadata.id}`}
          value={(options.variant as ColorBlindnessVariant) ?? 'deuteranopia'}
          onChange={(variant) => onOptionChange({ variant })}
        />
      )}
      {config.kind === 'intensity' && (
        <IntensitySegmented
          name={`intensity-${metadata.id}`}
          value={(options.intensity as Intensity) ?? 'moderate'}
          onChange={(intensity) => onOptionChange({ intensity })}
        />
      )}
    </div>
  );
}
