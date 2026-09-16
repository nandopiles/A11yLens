/** Repository: mock content for the navigation demo. */

export interface NavItem {
  id: string;
  label: string;
  /** Deliberately scrambled tab order via positive tabindex. */
  tabIndex: number;
}

export const primaryNav: NavItem[] = [
  { id: 'products', label: 'Productos', tabIndex: 3 },
  { id: 'solutions', label: 'Soluciones', tabIndex: 1 },
  { id: 'pricing', label: 'Precios', tabIndex: 4 },
  { id: 'docs', label: 'Documentación', tabIndex: 2 },
];

export const dropdownItems: string[] = [
  'Resumen',
  'Analítica',
  'Integraciones',
  'Registro de cambios',
];

export const modalCopy = {
  title: 'Iniciar sesión',
  body: 'Introduce tus credenciales para acceder al panel.',
  submit: 'Iniciar sesión',
};
