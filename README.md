# A11yLens

**Un simulador web de accesibilidad que te deja *sentir* cómo experimentan la web las personas con distintas capacidades — y te *demuestra* qué está realmente roto con una auditoría real.**

La mayoría de las herramientas de accesibilidad te dan una lista de errores. A11yLens hace las dos cosas: aplica en vivo, sobre una página de verdad, la simulación de una discapacidad (para generar empatía) y, en paralelo, corre una auditoría estándar con [axe-core](https://github.com/dequelabs/axe-core) (para aportar evidencia). La simulación muestra *cómo se siente*; la auditoría muestra *qué está mal*.

> La simulación busca empatía. La conformidad real exige pruebas manuales con tecnología de apoyo y revisión experta.

---

## Qué hace

- **Simula 6 barreras de accesibilidad** aplicando transformaciones reales al DOM de una página de ejemplo (no capturas, no mockups): daltonismo, visión reducida, dislexia, temblor motor, sordera y lector de pantalla.
- **Perfiles apilables**: puedes activar varios a la vez y sus efectos se combinan de forma determinista.
- **Auditoría real con axe-core** sobre la página previsualizada, con un contador de violaciones que **cae hacia 0** cuando conviertes la página a su versión accesible.
- **Comparación roto ↔ accesible**: cada caso de uso se renderiza en su versión rota (con defectos deliberados) y en su versión corregida, para ver el antes y el después de la misma pantalla.

## Perfiles de simulación

Cada perfil implementa la misma interfaz `AccessibilityProfile` (patrón *Strategy*) y es intercambiable y apilable.

| Perfil | Qué simula | Cómo | WCAG relacionado |
|---|---|---|---|
| **Daltonismo** | Discriminación de color reducida (protanopia, deuteranopia, tritanopia) | Filtros SVG nativos `feColorMatrix` (simulación real, no aproximación CSS) | 1.4.1, 1.4.3 |
| **Visión reducida** | Menor agudeza y sensibilidad al contraste | Desenfoque, contraste reducido y atenuación | 1.4.3, 1.4.4, 1.4.10 |
| **Dislexia** | Dificultad lectora por letras inestables y espaciado apretado | Reordena/tiembla las letras interiores y varía el espaciado | 1.4.8, 3.1.5 |
| **Temblor motor** | Temblor involuntario del puntero | Añade oscilación al cursor y reduce la precisión efectiva | 2.5.5 / 2.5.8, 2.5.1 |
| **Sordera** | Usuario que no puede oír el audio | Silencia el audio y oculta subtítulos/transcripciones | 1.2.2, 1.2.1 |
| **Lector de pantalla** | Consumir la página con un lector de pantalla | Lectura linealizada por síntesis de voz (encabezados, landmarks, etiquetas, orden de foco) | 1.1.1, 1.3.1, 4.1.2 |

> Los perfiles registrados por defecto en el código son cuatro (daltonismo, dislexia, temblor y lector de pantalla). El perfil de lector de pantalla absorbe además parte del concepto de visión reducida mediante su capa de atenuación.

## Casos de uso (demos)

Cada demo es una mini-app realista con defectos de accesibilidad reales, y un botón **"Hazlo accesible"** que la convierte a su versión corregida:

- **Pago exprés** — formulario de checkout que parece acabado pero está roto en silencio.
- **Feed social** — feed con encuesta y "me gusta" por color, fotos sin `alt`, nota de voz sin transcripción, parpadeo y texto denso.
- **Estado de servicios** — panel donde un servicio está caído, pero solo se indica con un punto de color.
- **Reportes del equipo** — herramienta interna con una "tabla" hecha de `<div>`s, campos sin etiqueta, capturas sin `alt` y un "botón" que en realidad es un `<div>`.

## Cómo funciona

El flujo es: eliges un caso de uso → activas perfiles de discapacidad que mutan el DOM en vivo → opcionalmente pulsas **"Hazlo accesible"** para ver la misma pantalla corregida, mientras la **auditoría axe-core** te muestra el número real de violaciones bajando.

- **Simulación en vivo**: el `SimulationEngine` (patrón *Facade*) es el único punto de entrada. Aplica cada perfil mutando un subárbol del DOM y revierte de forma limpia gracias a `EffectScope`, que registra el "deshacer" de cada efecto (estilos, atributos, nodos, listeners, timers, frames de animación).
- **Apilado determinista**: al combinar varios perfiles, cada uno decora el resultado del anterior en un orden fijo por categoría (`visual → cognitive → motor`), así el resultado es reproducible.
- **Auditoría**: `auditRunner` envuelve axe-core con el conjunto de reglas WCAG 2.0/2.1 A y AA, y devuelve un informe tipado (violaciones, severidad, criterios WCAG, elementos afectados).

## Arquitectura

Código en capas con una dirección de dependencia estricta:

```
app  →  features  →  components  →  core
              ↘          ↘           ↑
               store (Zustand) ──────┘
```

- **`core/`** — Lógica pura, sin React ni DOM de framework. 100% testeable. Contiene el motor de simulación, los perfiles de accesibilidad y el runner de auditoría.
- **`features/`** — Slices por pantalla (landing, demos). Componen `components/` y leen/escriben el `store/`.
- **`components/`** — UI reutilizable (`SimulationPanel`, `AuditOverlay`, primitivos).
- **`store/`** — Store de Zustand: fuente única de verdad de la UI (perfiles activos, resultados de auditoría).
- **`app/`** — Arranque, enrutado y composición de alto nivel.

```
src/
  core/
    engine/      # SimulationEngine (Facade), ProfileRegistry, EffectScope
    profiles/    # ColorBlindness, Dyslexia, Tremor, ScreenReader
    audit/       # auditRunner (envoltorio de axe-core)
  features/
    landing/         # página de inicio (hero, casos de uso, perfiles)
    simulator/       # la página del simulador (/simulate/:demo)
    checkout-demo/ · social-feed-demo/ · dashboard-demo/ · reports-demo/
    demos/           # registry de demos (patrón Repository)
  components/
    SimulationPanel/ · AuditOverlay/ · primitives/
  store/             # simulationStore.ts (Zustand)
  app/               # App.tsx, router.tsx
  styles/            # index.css (Tailwind)
```

### Patrones de diseño

- **Strategy** — cada perfil es una estrategia intercambiable con la misma interfaz; añadir un perfil no requiere tocar el motor.
- **Facade** — `SimulationEngine` es la única puerta de entrada; la UI nunca toca filtros SVG ni internos de los perfiles.
- **Decorator / Composite** — los perfiles se apilan; cada uno decora el resultado del anterior.
- **Observer / Pub-Sub** — vía Zustand; el panel de auditoría y las métricas reaccionan a los cambios de estado.
- **Repository** — los casos de uso se cargan como datos, desacoplados de la lógica de simulación.

## Stack

| Capa | Elección |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Estilos | Tailwind CSS |
| Estado global | Zustand |
| Animación | Framer Motion |
| Auditoría real | axe-core |
| Simulación de daltonismo | Filtros SVG nativos (`feColorMatrix`) |
| Testing | Vitest + Testing Library |

## Puesta en marcha

Requisitos: Node.js 18+ y npm.

```bash
npm install      # instalar dependencias
npm run dev      # servidor de desarrollo (Vite)
```

Abre la URL que imprime Vite (por defecto `http://localhost:5173`).

### Scripts

| Script | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con HMR. |
| `npm run build` | Comprobación de tipos + build de producción. |
| `npm run preview` | Sirve el build de producción. |
| `npm test` | Ejecuta la suite de Vitest una vez. |
| `npm run lint` | ESLint. |

## Nota sobre la auditoría en distintos entornos

axe-core necesita el motor de layout de un **navegador real** para evaluar reglas como el contraste de color, la relación de tablas o la visibilidad de los elementos. En un entorno de test sin layout (jsdom) esas reglas quedan como "incompletas" en lugar de "violaciones". Por eso, el contador de violaciones que ves en el navegador es notablemente más alto (y más fiel) que el que se puede medir en los tests unitarios.

## Accesibilidad del propio proyecto

La accesibilidad es un requisito de primera clase también en A11yLens: semántica correcta, `aria-label` donde hace falta, foco visible, orden de tabulación lógico y respeto por `prefers-reduced-motion` desde el primer commit.

---

Hecho para mostrar cómo se siente realmente la accesibilidad.
