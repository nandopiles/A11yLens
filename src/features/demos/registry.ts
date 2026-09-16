import type { DemoDefinition, DemoId } from './types';
import { CheckoutDemo } from '../checkout-demo/CheckoutDemo';
import { SocialFeedDemo } from '../social-feed-demo/SocialFeedDemo';
import { ReportsDemo } from '../reports-demo/ReportsDemo';
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
  reports: {
    meta: {
      id: 'reports',
      title: 'Reportes del equipo',
      summary: 'Una tabla de tickets, una galería de capturas y un formulario de reporte — plagado de fallos.',
      goalLabel: 'Enviar un reporte',
      defects: [
        { what: 'La "tabla" son <div>s: sin <table> ni encabezados, no hay relación fila/columna', revealedBy: 'Lector de pantalla', wcag: '1.3.1' },
        { what: 'Prioridad indicada solo por el color de un punto', revealedBy: 'Daltonismo', wcag: '1.4.1' },
        { what: 'Campos del formulario etiquetados solo por el placeholder', revealedBy: 'Lector de pantalla', wcag: '1.3.1 / 4.1.2' },
        { what: 'Capturas (img) sin texto alternativo', revealedBy: 'Lector de pantalla', wcag: '1.1.1' },
        { what: 'El botón "Enviar" es un <div> sin rol ni nombre y sin foco por teclado', revealedBy: 'Teclado', wcag: '4.1.2 / 2.1.1' },
        { what: 'Enlace "ver más" sin texto perceptible', revealedBy: 'Lector de pantalla', wcag: '2.4.4 / 4.1.2' },
        { what: 'Texto de estados, chips y metadatos con contraste muy bajo', revealedBy: 'Visión reducida', wcag: '1.4.3' },
      ],
      remediation: [
        { fix: 'Usa una <table> real con <th scope> para filas y columnas', wcag: '1.3.1' },
        { fix: 'Muestra prioridad y estado como texto, no solo con color', wcag: '1.4.1' },
        { fix: 'Asocia un <label> visible a cada campo del formulario', wcag: '1.3.1 / 4.1.2' },
        { fix: 'Añade texto alternativo descriptivo a cada captura', wcag: '1.1.1' },
        { fix: 'Convierte "Enviar" en un <button> real, con nombre y foco', wcag: '4.1.2 / 2.1.1' },
        { fix: 'Da texto perceptible al enlace "Ver todos los tickets"', wcag: '2.4.4' },
        { fix: 'Sube el contraste de todos los textos a ≥ 4.5:1', wcag: '1.4.3' },
      ],
    },
    Component: ReportsDemo,
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
