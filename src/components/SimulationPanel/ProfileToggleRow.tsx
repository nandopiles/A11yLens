import type { ProfileMetadata, ProfileOptions } from '@/core/engine/types';
import { Icon, type IconName } from '@/components/primitives/Icon';
import { PROFILE_CONTROL_CONFIG } from './useProfileControls';
import { IntensitySegmented, type Intensity } from './IntensitySegmented';
import { VariantRadioGroup, type ColorBlindnessVariant } from './VariantRadioGroup';

interface ProfileToggleRowProps {
  metadata: ProfileMetadata;
  icon: IconName;
  active: boolean;
  options: ProfileOptions;
  onToggle: () => void;
  onOptionChange: (patch: ProfileOptions) => void;
}

/**
 * A single profile row: an icon + name/description with a switch, and (when the profile
 * has options) an inline variant/intensity control that only appears while the profile is
 * active. Active state is signalled by an accent bar, an accent icon chip, and a "Sí/No"
 * text label — never by color alone (the tool models good practice).
 */
export function ProfileToggleRow({
  metadata,
  icon,
  active,
  options,
  onToggle,
  onOptionChange,
}: ProfileToggleRowProps) {
  const config = PROFILE_CONTROL_CONFIG[metadata.id];
  const switchId = `toggle-${metadata.id}`;
  const labelId = `label-${metadata.id}`;

  return (
    <div
      className={[
        'border-l-2 py-3 pl-3 pr-3 transition-colors',
        active ? 'border-l-primary bg-surface-low' : 'border-l-transparent hover:bg-hover/50',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <span
            aria-hidden="true"
            className={[
              'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border text-base transition-colors',
              active
                ? 'border-primary/30 bg-primary/10 text-primary'
                : 'border-hairline bg-panel text-ink-soft',
            ].join(' ')}
          >
            <Icon name={icon} />
          </span>
          <div className="min-w-0">
            {/*
              The switch is the single toggle affordance. The name is a plain span linked
              to it via aria-labelledby — NOT an htmlFor <label>, which on a <button> can
              relay a second synthetic click and cause the toggle to fire twice.
            */}
            <span id={labelId} className="block text-headline-sm text-ink">
              {metadata.name}
            </span>
            <p className="mt-0.5 text-body-sm text-ink-soft">{metadata.description}</p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <button
            id={switchId}
            type="button"
            role="switch"
            aria-checked={active}
            aria-labelledby={labelId}
            onClick={onToggle}
            className={[
              // Track: 44x24. box-border keeps the 2px border inside the width so the
              // thumb geometry below stays exact and never overflows the track.
              'relative box-border inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
              active ? 'border-primary bg-primary' : 'border-hairline-strong bg-hover',
            ].join(' ')}
          >
            {/*
              Thumb: 20px circle. Inactive sits at left 2px; active shifts by 20px
              (44 track - 2 border L - 2 border R - 20 thumb = 20px of travel), so it
              lands flush against the right edge without spilling over.
            */}
            <span
              aria-hidden="true"
              className={[
                'h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200',
                active ? 'translate-x-[1.25rem]' : 'translate-x-0.5',
              ].join(' ')}
            />
          </button>
          <span
            className={[
              'font-mono text-label-badge uppercase',
              active ? 'text-primary' : 'text-ink-soft',
            ].join(' ')}
          >
            {active ? 'Sí' : 'No'}
          </span>
        </div>
      </div>

      {/*
        Controls stay mounted even when inactive so a variant/intensity can be pre-picked
        before enabling the profile (that draft is carried into toggleProfile). They dim
        while inactive to read as "not yet applied".
      */}
      {config.kind === 'variant' && (
        <div className={['pl-[2.375rem] transition-opacity', active ? '' : 'opacity-60'].join(' ')}>
          <VariantRadioGroup
            name={`variant-${metadata.id}`}
            value={(options.variant as ColorBlindnessVariant) ?? 'deuteranopia'}
            onChange={(variant) => onOptionChange({ variant })}
          />
        </div>
      )}
      {config.kind === 'intensity' && (
        <div className={['pl-[2.375rem] transition-opacity', active ? '' : 'opacity-60'].join(' ')}>
          <IntensitySegmented
            name={`intensity-${metadata.id}`}
            value={(options.intensity as Intensity) ?? 'moderate'}
            onChange={(intensity) => onOptionChange({ intensity })}
          />
        </div>
      )}
    </div>
  );
}
