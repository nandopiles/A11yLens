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
        { what: 'Botón principal con bajo contraste', revealedBy: 'Baja visión', wcag: '1.4.3' },
        { what: 'Sin foco visible, objetivos apretados', revealedBy: 'Temblor motor', wcag: '2.4.7 / 2.5.8' },
      ],
    },
    Component: CheckoutDemo,
  },
  feed: {
    meta: {
      id: 'feed',
      title: 'Feed social',
      summary: 'Feed con desplazamiento automático, insignias parpadeantes y texto denso.',
      goalLabel: 'Leer el feed',
      defects: [
        { what: 'Avance automático + parpadeo rápido, sin pausa', revealedBy: 'Temblor motor', wcag: '2.2.2 / 2.3.1' },
        { what: 'Texto denso, sin jerarquía de encabezados', revealedBy: 'Dislexia', wcag: '1.3.1 / 1.4.8' },
        { what: 'Subtítulo de bajo contraste sobre la foto', revealedBy: 'Baja visión', wcag: '1.4.3' },
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
    },
    Component: NavigationDemo,
  },
  dashboard: {
    meta: {
      id: 'dashboard',
      title: 'Panel de analítica',
      summary: 'Un gráfico donde el significado se codifica solo con el color.',
      goalLabel: 'Leer el gráfico',
      defects: [
        { what: 'Series diferenciadas solo por el color', revealedBy: 'Daltonismo', wcag: '1.4.1' },
        { what: 'El gráfico no tiene alternativa textual', revealedBy: 'Lector de pantalla', wcag: '1.1.1' },
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
