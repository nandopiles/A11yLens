import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup, within } from '@testing-library/react';
import { CheckoutDemo } from '../checkout-demo/CheckoutDemo';
import { NavigationDemo } from '../navigation-demo/NavigationDemo';
import { DashboardDemo } from '../dashboard-demo/DashboardDemo';
import { SocialFeedDemo } from '../social-feed-demo/SocialFeedDemo';

/**
 * Two-sided guards. The `broken` blocks assert the intentional teaching defects are PRESENT
 * (so they don't get "fixed" by accident, which would break the simulation story). The
 * `accessible` blocks assert the "Hazlo accesible" version actually FIXES each defect.
 */

afterEach(cleanup);

describe('checkout demo — broken', () => {
  it('has inputs with no accessible name (placeholder-only labels)', () => {
    render(<CheckoutDemo accessible={false} />);
    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBeGreaterThan(0);
    inputs.forEach((input) => {
      expect(input).not.toHaveAccessibleName();
    });
  });

  it('has a submit button (goal action) inside a goal-tagged form', () => {
    const { container } = render(<CheckoutDemo accessible={false} />);
    expect(container.querySelector('[data-demo-goal="submit-payment"]')).not.toBeNull();
    expect(screen.getByRole('button', { name: /confirmar y pagar/i })).toBeInTheDocument();
  });
});

describe('checkout demo — accessible', () => {
  it('gives every input a real accessible name', () => {
    render(<CheckoutDemo accessible />);
    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBeGreaterThan(0);
    inputs.forEach((input) => {
      expect(input).toHaveAccessibleName();
    });
  });
});

describe('navigation demo — broken', () => {
  it('uses positive tabindex (scrambled order)', () => {
    const { container } = render(<NavigationDemo accessible={false} />);
    const positiveTabindex = container.querySelectorAll('[tabindex="1"], [tabindex="2"], [tabindex="3"]');
    expect(positiveTabindex.length).toBeGreaterThan(0);
  });
});

describe('navigation demo — accessible', () => {
  it('removes positive tabindex (natural focus order)', () => {
    const { container } = render(<NavigationDemo accessible />);
    const positiveTabindex = container.querySelectorAll('[tabindex="1"], [tabindex="2"], [tabindex="3"]');
    expect(positiveTabindex.length).toBe(0);
  });
});

describe('dashboard demo — broken', () => {
  it('conveys service status only by color (no per-row status text)', () => {
    const { container } = render(<DashboardDemo accessible={false} />);
    expect(container.querySelector('table')).toBeNull();
    expect(container.querySelector('img')).toBeNull();
    // The only per-row status signal is the color of an aria-hidden dot.
    const rows = container.querySelectorAll('li');
    expect(rows.length).toBeGreaterThan(0);
    rows.forEach((row) => {
      expect(row.textContent ?? '').not.toMatch(/caído|operativo|down|offline/i);
    });
  });
});

describe('dashboard demo — accessible', () => {
  it('labels each service status in text and gives the dot an accessible name', () => {
    const { container } = render(<DashboardDemo accessible />);
    const rows = container.querySelectorAll('li');
    const labelled = Array.from(rows).filter((row) => /caído|operativo/i.test(row.textContent ?? ''));
    expect(labelled.length).toBe(rows.length);
    // The status marks are now exposed as images with a name (shape + label, not color-only).
    expect(within(container).getAllByRole('img').length).toBeGreaterThan(0);
  });
});

describe('social feed demo — broken', () => {
  it('has audio with no captions/transcript (audio-only content)', () => {
    const { container } = render(<SocialFeedDemo accessible={false} />);
    expect(container.querySelector('audio')).not.toBeNull();
    expect(container.querySelector('track')).toBeNull();
    // No transcript disclosure in the broken version.
    expect(container.querySelector('details')).toBeNull();
  });

  it('renders images with no alt text (screen-reader defect)', () => {
    const { container } = render(<SocialFeedDemo accessible={false} />);
    const imgs = container.querySelectorAll('img');
    expect(imgs.length).toBeGreaterThan(0);
    imgs.forEach((img) => expect(img.getAttribute('alt')).toBe(''));
  });

  it('has icon-only engagement buttons with no accessible name', () => {
    render(<SocialFeedDemo accessible={false} />);
    // Buttons exist but none expose an accessible name in the broken version.
    const named = screen.queryAllByRole('button').filter((b) => b.getAttribute('aria-label'));
    expect(named.length).toBe(0);
  });
});

describe('social feed demo — accessible', () => {
  it('ships a visible transcript for the voice note', () => {
    const { container } = render(<SocialFeedDemo accessible />);
    expect(container.querySelector('details')).not.toBeNull();
  });

  it('gives every image descriptive alt text', () => {
    const { container } = render(<SocialFeedDemo accessible />);
    const imgs = container.querySelectorAll('img');
    expect(imgs.length).toBeGreaterThan(0);
    imgs.forEach((img) => expect(img.getAttribute('alt')).toBeTruthy());
  });

  it('gives engagement buttons an accessible name and the poll a text result', () => {
    render(<SocialFeedDemo accessible />);
    expect(screen.getAllByRole('button').every((b) => b.getAttribute('aria-label'))).toBe(true);
    // The poll winner is now exposed as text, not just color.
    expect(screen.getByText(/ganadora/i)).toBeInTheDocument();
  });
});
