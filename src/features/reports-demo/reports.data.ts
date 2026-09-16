/** Repository: mock content for the reports demo (a data table + bug-report form). */

export const boardTitle = 'Reportes del equipo';
export const boardHint = 'Encuentra el ticket crítico sin resolver y envía un nuevo reporte.';

export interface TicketRow {
  id: string;
  title: string;
  owner: string;
  priority: 'Crítica' | 'Alta' | 'Media';
  status: 'Abierto' | 'En curso' | 'Resuelto';
  updated: string;
}

export const tickets: TicketRow[] = [
  { id: 'OPS-482', title: 'Checkout falla en Safari', owner: 'María', priority: 'Crítica', status: 'Abierto', updated: 'hace 2 h' },
  { id: 'OPS-471', title: 'Latencia alta en la API de pagos', owner: 'Iván', priority: 'Alta', status: 'En curso', updated: 'hace 5 h' },
  { id: 'OPS-465', title: 'Textos cortados en móvil', owner: 'Lucía', priority: 'Media', status: 'Resuelto', updated: 'ayer' },
  { id: 'OPS-460', title: 'Fallo intermitente al exportar CSV', owner: 'Diego', priority: 'Alta', status: 'Abierto', updated: 'ayer' },
];

export interface ReportField {
  id: string;
  label: string;
  placeholder: string;
  type: 'text' | 'email';
  autoComplete?: string;
}

export const reportFields: ReportField[] = [
  { id: 'title', label: 'Título del reporte', placeholder: 'Título del reporte', type: 'text' },
  { id: 'email', label: 'Tu correo', placeholder: 'Tu correo', type: 'email', autoComplete: 'email' },
  { id: 'steps', label: 'Pasos para reproducir', placeholder: 'Pasos para reproducir', type: 'text' },
];

export interface GalleryShot {
  id: string;
  emoji: string;
  bg: string;
  /** Descriptive alt used only in the accessible version. */
  alt: string;
}

/** Inline SVG data-URI screenshots so real <img> elements exist for the alt-text defect. */
export function shotSrc(shot: GalleryShot): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="110"><rect width="160" height="110" fill="${shot.bg}"/><text x="80" y="70" font-size="44" text-anchor="middle">${shot.emoji}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const gallery: GalleryShot[] = [
  { id: 'g1', emoji: '📉', bg: '#fee2e2', alt: 'Captura: gráfica de errores subiendo tras el despliegue' },
  { id: 'g2', emoji: '🧾', bg: '#e0e7ff', alt: 'Captura: recibo de pago con importe incorrecto' },
  { id: 'g3', emoji: '📱', bg: '#dcfce7', alt: 'Captura: pantalla móvil con el texto del botón cortado' },
];
