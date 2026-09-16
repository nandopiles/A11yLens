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
      title: 'Pago exprés',
      summary: 'Un formulario de pago que parece acabado pero está roto en silencio.',
      goalLabel: 'Confirmar el pago',
      defects: [
        { what: 'Campos etiquetados solo por el placeholder', revealedBy: 'Lector de pantalla', wcag: '1.3.1 / 4.1.2' },
        { what: 'Error de validación mostrado solo con color rojo', revealedBy: 'Daltonismo', wcag: '1.4.1' },
        { what: 'Botón principal con bajo contraste (texto casi ilegible)', revealedBy: 'Lector de pantalla', wcag: '1.4.3' },
        { what: 'Sin foco visible, objetivos apretados', revealedBy: 'Temblor motor', wcag: '2.4.7 / 2.5.8' },
      ],
      remediation: [
        { fix: 'Asocia un <label> visible a cada campo (no solo placeholder)', wcag: '1.3.1 / 4.1.2' },
        { fix: 'Muestra los errores con texto e icono, no solo con color rojo', wcag: '1.4.1 / 3.3.1' },
        { fix: 'Sube el contraste del botón principal a ≥ 4.5:1', wcag: '1.4.3' },
        { fix: 'Agranda los objetivos a ≥ 44px y añade un foco visible', wcag: '2.4.7 / 2.5.8' },
      ],
    },
    Component: CheckoutDemo,
  },
  feed: {
    meta: {
      id: 'feed',
      title: 'Feed social',
      summary: 'Feed con encuesta y "me gusta" por color, fotos sin alt, nota de voz sin transcripción, parpadeo y texto denso.',
      goalLabel: 'Leer el feed',
      defects: [
        { what: 'Nota de voz sin transcripción (contenido solo en audio)', revealedBy: 'Lector de pantalla', wcag: '1.2.1 / 1.2.2' },
        { what: 'Resultado de la encuesta indicado solo por color (verde/rojo)', revealedBy: 'Daltonismo', wcag: '1.4.1' },
        { what: 'Estado de "me gusta" mostrado solo por el color del corazón', revealedBy: 'Daltonismo', wcag: '1.4.1' },
        { what: 'Fotos sin texto alternativo (alt)', revealedBy: 'Lector de pantalla', wcag: '1.1.1' },
        { what: 'Botones de interacción solo con icono, sin nombre accesible', revealedBy: 'Lector de pantalla', wcag: '4.1.2' },
        { what: 'Avance automático + parpadeo rápido, sin pausa', revealedBy: 'Temblor motor', wcag: '2.2.2 / 2.3.1' },
        { what: 'Texto denso, sin jerarquía de encabezados', revealedBy: 'Dislexia', wcag: '1.3.1 / 1.4.8' },
        { what: 'Subtítulo de bajo contraste sobre la foto', revealedBy: 'Daltonismo', wcag: '1.4.3' },
      ],
      remediation: [
        { fix: 'Añade una transcripción visible a la nota de voz', wcag: '1.2.1 / 1.2.2' },
        { fix: 'Muestra el resultado de la encuesta con texto (✓ Ganadora + %)', wcag: '1.4.1' },
        { fix: 'Indica el estado de "me gusta" con texto y aria-pressed', wcag: '1.4.1 / 4.1.2' },
        { fix: 'Añade texto alternativo (alt) descriptivo a cada foto', wcag: '1.1.1' },
        { fix: 'Da a los botones de interacción un nombre accesible (aria-label)', wcag: '4.1.2' },
        { fix: 'Detén el avance automático y respeta prefers-reduced-motion', wcag: '2.2.2 / 2.3.1' },
        { fix: 'Usa encabezados y un interlineado legible en el texto', wcag: '1.3.1 / 1.4.8' },
        { fix: 'Sube el contraste del subtítulo sobre la foto a ≥ 4.5:1', wcag: '1.4.3' },
      ],
    },
    Component: SocialFeedDemo,
  },
  navigation: {
    meta: {
      id: 'navigation',
      title: 'Navegación y modal',
      summary: 'Un desplegable y un modal con comportamiento de teclado roto.',
      goalLabel: 'Abrir un elemento del menú',
      defects: [
        { what: 'El foco del modal se escapa de la trampa', revealedBy: 'Lector de pantalla', wcag: '2.4.3 / 2.1.2' },
        { what: 'Orden de tabulación desordenado (tabindex positivo)', revealedBy: 'Teclado', wcag: '2.4.3' },
        { what: 'Elementos de menú <div> no semánticos', revealedBy: 'Lector de pantalla', wcag: '4.1.2' },
      ],
      remediation: [
        { fix: 'Usa <button>/<a> reales para el menú y el desplegable', wcag: '4.1.2' },
        { fix: 'Deja el orden de tabulación natural (sin tabindex positivo)', wcag: '2.4.3' },
        { fix: 'Da al modal role="dialog", aria-modal y atrapa el foco', wcag: '2.4.3 / 2.1.2' },
      ],
    },
    Component: NavigationDemo,
  },
  dashboard: {
    meta: {
      id: 'dashboard',
      title: 'Estado de servicios',
      summary: 'Un servicio está caído, pero el estado se indica solo con un punto de color.',
      goalLabel: 'Encontrar el servicio caído',
      defects: [
        { what: 'Estado (operativo/caído) indicado solo por color, sin icono ni texto', revealedBy: 'Daltonismo', wcag: '1.4.1' },
        { what: 'Leyenda de estado diferenciada solo por color', revealedBy: 'Daltonismo', wcag: '1.4.1' },
        { what: 'La lista no expone el estado como texto para tecnología asistiva', revealedBy: 'Lector de pantalla', wcag: '1.1.1 / 1.3.1' },
      ],
      remediation: [
        { fix: 'Acompaña el color con una etiqueta de texto ("Caído"/"Operativo")', wcag: '1.4.1' },
        { fix: 'Añade una forma o icono distinto además del color del punto', wcag: '1.4.1 / 1.4.11' },
        { fix: 'Expón el estado como texto para tecnología asistiva', wcag: '1.1.1 / 1.3.1' },
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
