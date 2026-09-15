/** Repository: mock content for the navigation demo. */

export interface NavItem {
  id: string;
  label: string;
  /** Deliberately scrambled tab order via positive tabindex. */
  tabIndex: number;
}

export const primaryNav: NavItem[] = [
  { id: 'products', label: 'Products', tabIndex: 3 },
  { id: 'solutions', label: 'Solutions', tabIndex: 1 },
  { id: 'pricing', label: 'Pricing', tabIndex: 4 },
  { id: 'docs', label: 'Docs', tabIndex: 2 },
];

export const dropdownItems: string[] = [
  'Overview',
  'Analytics',
  'Integrations',
  'Changelog',
];

export const modalCopy = {
  title: 'Sign in',
  body: 'Enter your credentials to access the dashboard.',
  submit: 'Sign in',
};
