import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { SimulatorPage } from './SimulatorPage';

function renderAt(path: string) {
  const router = createMemoryRouter(
    [{ path: '/simulate/:demo', element: <SimulatorPage /> }],
    { initialEntries: [path] },
  );
  return render(<RouterProvider router={router} />);
}

afterEach(cleanup);

describe('SimulatorPage', () => {
  it('renders the selected demo inside the preview container', () => {
    const { container } = renderAt('/simulate/checkout');
    const preview = container.querySelector('[data-preview-root]');
    expect(preview).not.toBeNull();
    // The checkout demo's goal-tagged form is inside the preview root.
    expect(preview?.querySelector('[data-demo-goal="submit-payment"]')).not.toBeNull();
  });

  it('swaps demos by route and shows the goal label', () => {
    renderAt('/simulate/dashboard');
    expect(screen.getByRole('heading', { name: /Estado de servicios/i })).toBeInTheDocument();
    expect(screen.getByText(/Objetivo: Encontrar el servicio caído/i)).toBeInTheDocument();
  });

  it('falls back to checkout for an unknown demo id', () => {
    renderAt('/simulate/nope');
    expect(screen.getByRole('heading', { name: /Pago exprés/i })).toBeInTheDocument();
  });

  it('toggles the accessible version and reveals the remediation panel', () => {
    const { container } = renderAt('/simulate/checkout');
    const preview = container.querySelector('[data-preview-root]');

    // Starts on the broken version: placeholder-only inputs, no remediation panel.
    expect(preview?.getAttribute('data-accessible')).toBe('false');
    expect(screen.queryByRole('region', { name: /qué se ha arreglado/i })).not.toBeInTheDocument();

    const toggle = screen.getByRole('button', { name: /hazlo accesible/i });
    fireEvent.click(toggle);

    // Now on the accessible version: panel visible, button reflects pressed state.
    expect(preview?.getAttribute('data-accessible')).toBe('true');
    expect(screen.getByRole('region', { name: /qué se ha arreglado/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /versión accesible activa/i })).toHaveAttribute('aria-pressed', 'true');
  });
});
