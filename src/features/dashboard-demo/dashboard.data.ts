/** Repository: mock content for the dashboard demo (service status board). */

export type ServiceStatus = 'up' | 'down';

export interface ServiceRow {
  id: string;
  name: string;
  region: string;
  /**
   * Health is conveyed ONLY by `statusColor` (intentional defect): green = healthy,
   * red = down. There is no icon, text label, or shape difference — so under
   * protanopia/deuteranopia the down service becomes indistinguishable.
   */
  status: ServiceStatus;
  statusColor: string;
  /** Latency, shown as a number only (not color-coded). */
  latencyMs: number;
}

/** Green healthy dot vs red down dot — the only signal of which service is failing. */
const HEALTHY = '#16a34a';
const DOWN = '#dc2626';

export const services: ServiceRow[] = [
  { id: 'auth', name: 'Autenticación', region: 'eu-west-1', status: 'up', statusColor: HEALTHY, latencyMs: 42 },
  { id: 'payments', name: 'Pagos', region: 'eu-west-1', status: 'up', statusColor: HEALTHY, latencyMs: 55 },
  { id: 'search', name: 'Búsqueda', region: 'us-east-1', status: 'down', statusColor: DOWN, latencyMs: 0 },
  { id: 'media', name: 'Media / CDN', region: 'us-east-1', status: 'up', statusColor: HEALTHY, latencyMs: 38 },
  { id: 'notifications', name: 'Notificaciones', region: 'ap-south-1', status: 'up', statusColor: HEALTHY, latencyMs: 61 },
];

/** The one service the user is asked to spot. Used by tests as the source of truth. */
export const downServiceId = 'search';

export const boardTitle = 'Estado de los servicios';
export const boardHint = 'Un servicio está caído. ¿Cuál?';
