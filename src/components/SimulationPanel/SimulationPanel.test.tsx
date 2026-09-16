import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';
import type { ProfileId, ProfileOptions } from '@/core/engine/types';

/**
 * We mock the store so tests assert the panel's wiring (which action it calls with which
 * args), not the engine. A mutable state object lets us simulate active/inactive profiles.
 */
const state: {
  activeProfiles: { id: ProfileId; options?: ProfileOptions }[];
} = { activeProfiles: [] };

const toggleProfile = vi.fn();
const setProfileOptions = vi.fn();
const reset = vi.fn();

vi.mock('@/store/simulationStore', () => {
  const registry = {
    list: () => [
      {
        metadata: {
          id: 'color-blindness',
          name: 'Color blindness',
          description: 'cb',
          category: 'visual',
        },
      },
      {
        metadata: { id: 'screen-reader', name: 'Screen reader', description: 'sr', category: 'visual' },
      },
      { metadata: { id: 'tremor', name: 'Motor tremor', description: 'tr', category: 'motor' } },
      { metadata: { id: 'dyslexia', name: 'Dyslexia', description: 'dy', category: 'cognitive' } },
    ],
  };
  const useSimulationStore = (selector: (s: unknown) => unknown) =>
    selector({
      activeProfiles: state.activeProfiles,
      isActive: (id: ProfileId) => state.activeProfiles.some((a) => a.id === id),
      toggleProfile,
      setProfileOptions,
      reset,
    });
  return { useSimulationStore, profileRegistry: registry };
});

// Import after the mock is registered.
const { SimulationPanel } = await import('./SimulationPanel');

beforeEach(() => {
  state.activeProfiles = [];
  toggleProfile.mockClear();
  setProfileOptions.mockClear();
  reset.mockClear();
});

describe('SimulationPanel', () => {
  it('renders one switch per registered profile', () => {
    render(<SimulationPanel />);
    expect(screen.getAllByRole('switch')).toHaveLength(4);
    expect(screen.getByText('Color blindness')).toBeInTheDocument();
    expect(screen.getByText('Motor tremor')).toBeInTheDocument();
  });

  it('toggling a profile calls toggleProfile with its draft options', () => {
    render(<SimulationPanel />);
    const cbSwitch = screen.getByRole('switch', { name: /color blindness/i });
    fireEvent.click(cbSwitch);
    expect(toggleProfile).toHaveBeenCalledTimes(1);
    expect(toggleProfile).toHaveBeenCalledWith('color-blindness', { variant: 'deuteranopia' });
  });

  it('clicking the switch once fires exactly one toggle (no label double-fire)', () => {
    // Regression guard: the profile name must NOT be an htmlFor <label> pointing at the
    // switch button, which would relay a second synthetic click and toggle twice.
    render(<SimulationPanel />);
    fireEvent.click(screen.getByRole('switch', { name: /motor tremor/i }));
    expect(toggleProfile).toHaveBeenCalledTimes(1);
    expect(toggleProfile).toHaveBeenCalledWith('tremor', { intensity: 'moderate' });
  });

  it('clicking the profile name does not toggle it (name is not a control)', () => {
    render(<SimulationPanel />);
    fireEvent.click(screen.getByText('Motor tremor'));
    expect(toggleProfile).not.toHaveBeenCalled();
  });

  it('switch exposes role and aria-checked reflecting active state', () => {
    state.activeProfiles = [{ id: 'tremor' }];
    render(<SimulationPanel />);
    const tremor = screen.getByRole('switch', { name: /motor tremor/i });
    expect(tremor).toHaveAttribute('aria-checked', 'true');
    const cb = screen.getByRole('switch', { name: /color blindness/i });
    expect(cb).toHaveAttribute('aria-checked', 'false');
  });

  it('changing a variant while inactive does NOT call the store, then toggle carries it', () => {
    render(<SimulationPanel />);
    fireEvent.click(screen.getByLabelText('protanopia'));
    expect(setProfileOptions).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('switch', { name: /color blindness/i }));
    expect(toggleProfile).toHaveBeenCalledWith('color-blindness', { variant: 'protanopia' });
  });

  it('changing intensity while active calls setProfileOptions live', () => {
    state.activeProfiles = [{ id: 'tremor', options: { intensity: 'moderate' } }];
    render(<SimulationPanel />);
    // Find the tremor row via its switch, then walk up to the row container that also
    // holds its intensity control, and click "Severa" within it.
    const tremorSwitch = screen.getByRole('switch', { name: /motor tremor/i });
    const tremorRow = tremorSwitch.closest('div.border-l-2') as HTMLElement;
    fireEvent.click(within(tremorRow).getByLabelText(/severa/i));
    expect(setProfileOptions).toHaveBeenCalledWith('tremor', { intensity: 'severe' });
  });

  it('shows the active count and Reset calls reset()', () => {
    state.activeProfiles = [{ id: 'tremor' }, { id: 'screen-reader' }];
    render(<SimulationPanel />);
    expect(screen.getByText('2 activos')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /restablecer/i }));
    expect(reset).toHaveBeenCalledTimes(1);
  });
});
