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
        metadata: { id: 'low-vision', name: 'Low vision', description: 'lv', category: 'visual' },
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
    const tremorRow = screen.getByText('Motor tremor').closest('div')!.parentElement!
      .parentElement!;
    fireEvent.click(within(tremorRow).getByLabelText(/severa/i));
    expect(setProfileOptions).toHaveBeenCalledWith('tremor', { intensity: 'severe' });
  });

  it('shows the active count and Reset calls reset()', () => {
    state.activeProfiles = [{ id: 'tremor' }, { id: 'low-vision' }];
    render(<SimulationPanel />);
    expect(screen.getByText('2 activos')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /restablecer/i }));
    expect(reset).toHaveBeenCalledTimes(1);
  });
});
