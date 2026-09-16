import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
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
    expect(screen.getByRole('heading', { name: /Panel de analítica/i })).toBeInTheDocument();
    expect(screen.getByText(/Objetivo: Leer el gráfico/i)).toBeInTheDocument();
  });

  it('falls back to checkout for an unknown demo id', () => {
    renderAt('/simulate/nope');
    expect(screen.getByRole('heading', { name: /Pago exprés/i })).toBeInTheDocument();
  });
});
