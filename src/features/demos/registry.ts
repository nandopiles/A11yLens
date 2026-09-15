import type { DemoDefinition, DemoId } from './types';
import { CheckoutDemo } from '../checkout-demo/CheckoutDemo';
import { SocialFeedDemo } from '../social-feed-demo/SocialFeedDemo';
import { NavigationDemo } from '../navigation-demo/NavigationDemo';
import { DashboardDemo } from '../dashboard-demo/DashboardDemo';

/**
 * Demo registry — maps a demo id to its metadata + render component. The simulator resolves
 * the `:demo` route param through here and never hard-codes a demo. Same registry idea used
 * for accessibility profiles, applied to content.
 */
const DEMOS: Record<DemoId, DemoDefinition> = {
  checkout: {
    meta: {
      id: 'checkout',
      title: 'Express checkout',
      summary: 'A payment form that looks finished but is quietly broken.',
      goalLabel: 'Submit payment',
      defects: [
        { what: 'Inputs labeled by placeholder only', revealedBy: 'Screen reader', wcag: '1.3.1 / 4.1.2' },
        { what: 'Validation error shown by red color only', revealedBy: 'Color blindness', wcag: '1.4.1' },
        { what: 'Low-contrast primary button', revealedBy: 'Low vision', wcag: '1.4.3' },
        { what: 'No visible focus, cramped targets', revealedBy: 'Motor tremor', wcag: '2.4.7 / 2.5.8' },
      ],
    },
    Component: CheckoutDemo,
  },
  feed: {
    meta: {
      id: 'feed',
      title: 'Social feed',
      summary: 'Auto-scrolling feed with blinking badges and dense text.',
      goalLabel: 'Read the feed',
      defects: [
        { what: 'Auto-advance + fast blink, no pause', revealedBy: 'Motor tremor', wcag: '2.2.2 / 2.3.1' },
        { what: 'Dense text, no heading hierarchy', revealedBy: 'Dyslexia', wcag: '1.3.1 / 1.4.8' },
        { what: 'Low-contrast caption over photo', revealedBy: 'Low vision', wcag: '1.4.3' },
      ],
    },
    Component: SocialFeedDemo,
  },
  navigation: {
    meta: {
      id: 'navigation',
      title: 'Navigation & modal',
      summary: 'A dropdown and modal with broken keyboard behavior.',
      goalLabel: 'Open a menu item',
      defects: [
        { what: 'Modal focus trap escapes', revealedBy: 'Screen reader', wcag: '2.4.3 / 2.1.2' },
        { what: 'Scrambled tab order (positive tabindex)', revealedBy: 'Keyboard', wcag: '2.4.3' },
        { what: 'Non-semantic <div> menu items', revealedBy: 'Screen reader', wcag: '4.1.2' },
      ],
    },
    Component: NavigationDemo,
  },
  dashboard: {
    meta: {
      id: 'dashboard',
      title: 'Analytics dashboard',
      summary: 'A chart where meaning is encoded only by color.',
      goalLabel: 'Read the chart',
      defects: [
        { what: 'Series distinguished by color only', revealedBy: 'Color blindness', wcag: '1.4.1' },
        { what: 'Chart has no text alternative', revealedBy: 'Screen reader', wcag: '1.1.1' },
      ],
    },
    Component: DashboardDemo,
  },
};

const FALLBACK: DemoId = 'checkout';

export function getDemo(id: string | undefined): DemoDefinition {
  if (id && id in DEMOS) return DEMOS[id as DemoId];
  return DEMOS[FALLBACK];
}

export function listDemos(): DemoDefinition[] {
  return Object.values(DEMOS);
}
