import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { CheckoutDemo } from '../checkout-demo/CheckoutDemo';
import { NavigationDemo } from '../navigation-demo/NavigationDemo';
import { DashboardDemo } from '../dashboard-demo/DashboardDemo';

/**
 * These assert that the intentional teaching defects are PRESENT (regression guards so the
 * defects don't get "fixed" by accident, which would break the simulation story).
 */

afterEach(cleanup);

describe('checkout demo defects', () => {
  it('has inputs with no accessible name (placeholder-only labels)', () => {
    render(<CheckoutDemo />);
    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBeGreaterThan(0);
    inputs.forEach((input) => {
      expect(input).not.toHaveAccessibleName();
    });
  });

  it('has a submit button (goal action) inside a goal-tagged form', () => {
    const { container } = render(<CheckoutDemo />);
    expect(container.querySelector('[data-demo-goal="submit-payment"]')).not.toBeNull();
    expect(screen.getByRole('button', { name: /confirm and pay/i })).toBeInTheDocument();
  });
});

describe('navigation demo defects', () => {
  it('uses positive tabindex (scrambled order)', () => {
    const { container } = render(<NavigationDemo />);
    const positiveTabindex = container.querySelectorAll('[tabindex="1"], [tabindex="2"], [tabindex="3"]');
    expect(positiveTabindex.length).toBeGreaterThan(0);
  });
});

describe('dashboard demo defects', () => {
  it('renders a chart region with no text alternative for the data', () => {
    const { container } = render(<DashboardDemo />);
    // No table, no img alt — the chart is div-only.
    expect(container.querySelector('table')).toBeNull();
    expect(container.querySelector('img')).toBeNull();
  });
});
