# A11yLens — Stack, Arquitectura y Setup de Agentes en Kiro

## 1. Stack tecnológico recomendado

| Capa | Elección | Por qué |
|---|---|---|
| Framework | **React 18 + TypeScript** | Estándar de la industria, tipado fuerte para modelar "perfiles" y "estrategias" con interfaces claras |
| Build tool | **Vite** | Arranque instantáneo, HMR rápido, ideal para iterar mucho en algo visual |
| Estilos | **Tailwind CSS** | Rapidez para maquetar el diseño que ya tienes en el zip, fácil de tokenizar (dark mode, contraste) |
| Estado global | **Zustand** | Más ligero que Redux, perfecto para el estado de "perfiles activos" sin boilerplate |
| Animaciones/transiciones | **Framer Motion** | Transiciones suaves al activar/desactivar perfiles (esto es clave para el "wow" visual) |
| Auditoría real | **axe-core** | Motor de accesibilidad real de verdad debajo del storytelling — le da credibilidad técnica |
| Filtros visuales | **SVG filters nativos (`feColorMatrix`)** | Simulación real de daltonismo, no un filtro CSS aproximado |
| Testing | **Vitest + Testing Library** | Coherente con Vite, rápido |

No metas Next.js aquí: no necesitas SSR ni rutas server, y añade complejidad que no aporta nada a un proyecto de portfolio pensado para brillar en frontend puro.

## 2. Patrones de diseño

- **Strategy Pattern** → cada perfil de accesibilidad (daltonismo, baja visión, dislexia, temblor, sordera, screen reader) es una estrategia intercambiable que transforma el DOM/CSS. Todas implementan la misma interfaz `AccessibilityProfile`.
- **Decorator / Composite** → los perfiles se pueden **apilar** (varios activos a la vez), cada uno decora el resultado del anterior.
- **Facade** → un `SimulationEngine` único que la UI consulta, sin que los componentes sepan nada de SVG filters ni de la lógica interna.
- **Observer / Pub-Sub** (vía Zustand) → el panel de auditoría y las métricas reaccionan a cambios de perfil sin acoplarse directamente al motor.
- **Repository Pattern** → los "casos de uso" (checkout, feed, nav, dashboard) se cargan como datos desacoplados de la lógica de simulación.

## 3. Arquitectura de carpetas (Feature-Sliced / Clean-ish)

```
src/
  core/                     # Lógica pura, sin React, 100% testeable
    engine/
      SimulationEngine.ts
      ProfileRegistry.ts
    profiles/
      ColorBlindnessProfile.ts
      LowVisionProfile.ts
      DyslexiaProfile.ts
      TremorProfile.ts
      DeafnessProfile.ts
      ScreenReaderProfile.ts
      types.ts             # interfaz AccessibilityProfile
    audit/
      auditRunner.ts        # wrapper sobre axe-core
  features/
    checkout-demo/
    social-feed-demo/
    navigation-demo/
    dashboard-demo/
  components/
    SimulationPanel/        # el panel flotante tipo devtools
    ComparisonSlider/
    MetricsSummary/
    AuditOverlay/
  store/
    simulationStore.ts       # Zustand
  app/
    App.tsx
    router.tsx
```

## 4. Arquitectura de agentes en Kiro (real, no inventada)

Kiro tiene tres mecanismos que encajan perfecto con lo que pides, y los vamos a usar tal cual existen:

- **Steering docs** (`.kiro/steering/*.md`) → contexto persistente que Kiro lee siempre, en todas las conversaciones. Aquí va todo lo que **todos** los agentes deben saber siempre (arquitectura, convenciones, stack).
- **Specs** (`.kiro/specs/`) → cada feature grande se descompone en `requirements.md`, `design.md` y `tasks.md`. Esto es tu "control de avance" del proyecto.
- **Custom Subagents** (`.kiro/agents/*.md`) → agentes especializados invocables por nombre o por descripción automática. Cada uno tiene su propio system prompt, herramientas permitidas y modelo.

### 4.1 Steering docs a crear

`.kiro/steering/architecture.md` — arquitectura, patrones (Strategy/Facade/Decorator), estructura de carpetas de la sección 3.

`.kiro/steering/tech-stack.md` — el stack de la sección 1, versiones, convenciones de naming.

`.kiro/steering/accessibility-domain.md` — contexto del dominio: qué es cada perfil de accesibilidad, cómo debe comportarse visualmente, referencias WCAG relevantes.

Estos tres documentos son la "memoria compartida" — todos los subagentes que definamos abajo los heredan automáticamente porque Kiro los inyecta siempre.

### 4.2 Subagentes a crear

**`.kiro/agents/architect.md`**
```yaml
---
name: architect
description: Diseña y valida decisiones de arquitectura, estructura de carpetas y contratos entre módulos. Úsalo antes de implementar cualquier feature nueva.
tools: ["read", "write"]
model: claude-opus-5
---
Eres el arquitecto de A11yLens. Tu trabajo es, antes de que se escriba código:
- Definir o validar la interfaz/contrato de cualquier nuevo módulo (especialmente nuevos AccessibilityProfile)
- Asegurar que se respeta Strategy/Facade/Decorator tal como está descrito en steering/architecture.md
- Señalar acoplamientos indebidos entre core/ y features/
- Producir un design.md dentro de .kiro/specs/<feature>/ antes de que el agente "coder" implemente nada
No escribas implementación final, solo contratos, interfaces TypeScript y diagramas en texto.
```

**`.kiro/agents/coder.md`**
```yaml
---
name: coder
description: Implementa código React/TypeScript siguiendo el design.md aprobado por el agente architect. Úsalo para escribir features, componentes y lógica del core.
tools: ["read", "write", "shell"]
model: claude-sonnet-5
---
Eres el implementador de A11yLens. Reglas:
- Nunca implementes sin que exista un design.md correspondiente en .kiro/specs/
- Sigue estrictamente tech-stack.md y architecture.md
- Cada AccessibilityProfile nuevo debe implementar la interfaz definida por el architect
- Escribe tests con Vitest para cualquier lógica en core/
- Si detectas que el design.md no cubre un caso, para y pide al architect que lo actualice — no improvises arquitectura
```

**`.kiro/agents/skill-creator.md`**
```yaml
---
name: skill-creator
description: Crea nuevas Agent Skills reutilizables cuando se detecta un patrón repetido (p.ej. cómo simular un perfil de accesibilidad nuevo, cómo estructurar un caso de uso demo).
tools: ["read", "write"]
model: claude-sonnet-5
---
Detectas trabajo repetible y lo empaquetas como Agent Skill en .kiro/skills/.
Ejemplos de skills a crear a lo largo del proyecto:
- "add-accessibility-profile": pasos para crear un nuevo perfil (archivo, registro en ProfileRegistry, test, entrada en el panel UI)
- "add-demo-usecase": pasos para añadir un nuevo caso de uso (checkout, feed, etc.)
Cada skill debe incluir: cuándo activarla, pasos concretos, y un ejemplo mínimo.
```

**`.kiro/agents/skill-updater.md`**
```yaml
---
name: skill-updater
description: Revisa las skills existentes cuando cambia la arquitectura o se descubre una mejor forma de hacer algo, y las mantiene sincronizadas.
tools: ["read", "write"]
model: claude-haiku-4-5
---
Tu única función es mantenimiento: cuando el architect o el coder cambian un contrato o patrón,
revisas .kiro/skills/ y actualizas cualquier skill que haya quedado desincronizada con la
arquitectura real del proyecto. No creas skills nuevas, esa es tarea de skill-creator.
```

Con `description` bien escrita, Kiro selecciona automáticamente el subagente adecuado según lo que pidas en el chat — o puedes forzarlo con `/architect`, `/coder`, etc.

## 5. Prompt para pegar en Kiro (arranque del proyecto)

Pega esto en el chat principal de Kiro con el proyecto vacío y el zip del diseño ya importado en el workspace:

```
Voy a construir "A11yLens", una app de simulación de accesibilidad web. Antes de escribir 
ninguna línea de código, quiero que dejemos montada la base de trabajo:

1. Analiza el zip de diseño que está en el workspace (contiene las pantallas: Landing, 
   Selector de caso de uso, Simulador principal, Resultado/Métricas, Modo auditoría) 
   y resume la estructura visual y de componentes que detectas.

2. Genera los documentos de steering en .kiro/steering/:
   - architecture.md: documenta esta arquitectura por capas (core/features/components/store), 
     y estos patrones de diseño: Strategy para los perfiles de accesibilidad (interfaz 
     AccessibilityProfile), Facade para el SimulationEngine, Decorator para permitir apilar 
     varios perfiles activos simultáneamente, Observer vía Zustand para que el panel de 
     auditoría reaccione a cambios de estado sin acoplarse al motor.
   - tech-stack.md: React 18 + TypeScript, Vite, Tailwind CSS, Zustand, Framer Motion, 
     axe-core para auditoría real, SVG filters nativos (feColorMatrix) para simulación de 
     daltonismo. Vitest + Testing Library para tests.
   - accessibility-domain.md: describe los perfiles a simular (daltonismo con sus tres 
     variantes protanopia/deuteranopia/tritanopia, baja visión, dislexia, temblor motor 
     simulado con jitter en el cursor, sordera/falta de subtítulos, modo lector de pantalla) 
     y qué debe transformar cada uno visualmente o funcionalmente.

3. Crea los subagentes en .kiro/agents/:
   - architect.md: diseña contratos e interfaces antes de implementar, produce design.md 
     en .kiro/specs/ para cada feature, vigila que se respeten los patrones definidos en 
     architecture.md.
   - coder.md: implementa siguiendo el design.md aprobado, nunca improvisa arquitectura, 
     escribe tests para el core.
   - skill-creator.md: detecta trabajo repetible (como añadir un nuevo perfil de accesibilidad 
     o un nuevo caso de uso demo) y lo convierte en Agent Skill reutilizable en .kiro/skills/.
   - skill-updater.md: mantiene las skills sincronizadas cuando cambia la arquitectura.

4. Con /architect, crea el primer spec en .kiro/specs/core-simulation-engine/ con 
   requirements.md, design.md y tasks.md para el SimulationEngine y la interfaz 
   AccessibilityProfile — esta es la pieza fundacional de la que depende todo lo demás.

5. Inicializa el proyecto: Vite + React + TypeScript + Tailwind, estructura de carpetas 
   según architecture.md, y deja el layout base de la Landing implementado a partir del 
   diseño del zip, usando componentes desacoplados y accesibles de verdad (aria-labels, 
   focus visible, orden de tabulación correcto) desde el primer commit.

No implementes ningún perfil de accesibilidad todavía — primero quiero ver el design.md 
del core-simulation-engine antes de que se escriba código de simulación real.
```

### Notas de uso

- Empieza siempre invocando `/architect` para cualquier pieza nueva del `core/` antes de pedirle a `coder` que implemente — así el historial de specs queda como evidencia de proceso ordenado, algo que también puedes enseñar en el propio portfolio ("mira cómo diseñé esto con IA de forma estructurada, no vibe-coding").
- Cuando termines el `SimulationEngine`, pide explícitamente a `skill-creator` que genere la skill `add-accessibility-profile` — a partir de ahí, añadir cada nuevo perfil (dislexia, temblor, etc.) será mucho más rápido y consistente.
