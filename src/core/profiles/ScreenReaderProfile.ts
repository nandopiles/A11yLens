import { EffectScope } from '../engine/EffectScope';
import type { AccessibilityProfile, ProfileMetadata, ProfileOptions } from '../engine/types';
import { createSpeechSynthesizer, type SpeechSynthesizer } from './speech';

/**
 * Remaining vision, from most to least. This is the real-world answer to "the user can't
 * see well": we don't blur harder — we read the page aloud, section by section, and the
 * less the user can see, the more we lean on that reading.
 * - mild: a subtle dim; sections are read but the page stays visible.
 * - moderate: the page is dimmed and each apartado (section) is read in order.
 * - severe: the page is fully masked; only the section-by-section reading remains.
 */
export type ScreenReaderIntensity = 'mild' | 'moderate' | 'severe';

export interface ScreenReaderOptions extends ProfileOptions {
  intensity?: ScreenReaderIntensity;
  rate?: number;
}

/**
 * How opaque the masking overlay is for each remaining-vision level. `moderate` is
 * deliberately near-total: at moderate vision loss the page is practically unreadable, so
 * the user must rely on the section-by-section reading.
 */
const MASK_OPACITY: Record<ScreenReaderIntensity, number> = {
  mild: 0.35,
  moderate: 0.92,
  severe: 1,
};

/** Elements that begin a new "apartado" (section) we announce as a heading. */
const SECTION_TAGS = new Set(['SECTION', 'ARTICLE', 'NAV', 'ASIDE', 'HEADER', 'FOOTER', 'FORM', 'MAIN']);
const HEADING_TAGS = new Set(['H1', 'H2', 'H3', 'H4', 'H5', 'H6']);

export interface ReadingSection {
  /** Short title for the apartado (from a heading, aria-label, or a generated name). */
  title: string;
  /** The linear announcements inside this apartado, in reading order. */
  items: string[];
}

/**
 * Simulates consuming the page through a screen reader. Instead of one flat dump of the
 * DOM, it groups the content into apartados (landmarks / sections / heading-led blocks)
 * and reads each one as a titled block in reading order — which is how a sighted-support
 * flow actually helps someone with little or no usable vision. It deliberately does NOT
 * invent names for elements missing alt/aria-label; it announces the gap so it is audible.
 */
export class ScreenReaderProfile implements AccessibilityProfile {
  readonly metadata: ProfileMetadata = {
    id: 'screen-reader',
    name: 'Lector de pantalla',
    description: 'Lee la página apartado por apartado en voz alta y expone las etiquetas ausentes.',
    category: 'visual',
  };

  private scope: EffectScope | null = null;
  private readonly synth: SpeechSynthesizer;

  constructor(synth?: SpeechSynthesizer) {
    this.synth = synth ?? createSpeechSynthesizer();
  }

  isActive(): boolean {
    return this.scope !== null;
  }

  /** Announcement for a single element node, or null if it produces no speech itself. */
  private describeElement(el: HTMLElement): string | null {
    const tag = el.tagName;
    if (tag === 'IMG') {
      const alt = el.getAttribute('alt');
      return alt && alt.trim() ? `imagen, ${alt}` : 'imagen, sin descripción';
    }
    if (tag === 'INPUT') {
      const label = el.getAttribute('aria-label');
      if (label && label.trim()) return `campo, ${label}`;
      return 'campo, sin etiqueta';
    }
    if (tag === 'BUTTON') {
      // A button's name is its aria-label or its visible text; only truly nameless
      // buttons are announced as a defect.
      const name = (el.getAttribute('aria-label') || el.textContent || '').trim();
      return name ? `botón, ${name}` : 'botón, sin nombre';
    }
    return null;
  }

  /** Best available short title for an apartado container. */
  private sectionTitle(el: HTMLElement, index: number): string {
    const label = el.getAttribute('aria-label');
    if (label && label.trim()) return label.trim();
    const heading = el.querySelector('h1, h2, h3, h4, h5, h6');
    const headingText = heading?.textContent?.trim();
    if (headingText) return headingText;
    return `Apartado ${index}`;
  }

  /**
   * Group the DOM under `root` into reading sections. A new section starts at a landmark/
   * section element or a heading; content before the first such boundary goes into an
   * intro section. Exposed for tests.
   */
  buildSections(root: HTMLElement): ReadingSection[] {
    const sections: ReadingSection[] = [];
    let current: ReadingSection = { title: 'Inicio', items: [] };
    let sectionCount = 0;

    const pushCurrent = () => {
      if (current.items.length > 0 || current.title !== 'Inicio') sections.push(current);
    };

    const walker = root.ownerDocument.createTreeWalker(
      root,
      NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
    );

    let node = walker.nextNode();
    while (node) {
      if (node instanceof HTMLElement) {
        const tag = node.tagName;
        if (SECTION_TAGS.has(tag)) {
          pushCurrent();
          sectionCount += 1;
          current = { title: this.sectionTitle(node, sectionCount), items: [] };
        } else if (HEADING_TAGS.has(tag)) {
          // A heading starts a new apartado titled by the heading text.
          const text = node.textContent?.trim() ?? '';
          pushCurrent();
          sectionCount += 1;
          current = { title: text || `Apartado ${sectionCount}`, items: [] };
          // Skip the heading's own text node so it isn't repeated as an item.
          node = walker.nextNode();
          continue;
        } else {
          const desc = this.describeElement(node);
          if (desc) {
            current.items.push(desc);
            // For controls we already spoke the name (incl. visible text), so skip their
            // subtree to avoid re-announcing that text as a separate item.
            if (tag === 'BUTTON' || tag === 'INPUT') {
              let next = walker.nextSibling();
              while (!next) {
                if (!walker.parentNode()) break;
                next = walker.nextSibling();
              }
              node = next;
              continue;
            }
          }
        }
      } else if (node.nodeType === Node.TEXT_NODE) {
        const text = (node.nodeValue ?? '').trim();
        if (text) current.items.push(text);
      }
      node = walker.nextNode();
    }
    pushCurrent();

    return sections;
  }

  /** Flatten sections into ordered utterances, announcing each apartado's title first. */
  buildUtterances(root: HTMLElement): string[] {
    const out: string[] = [];
    this.buildSections(root).forEach((section) => {
      out.push(`Apartado: ${section.title}`);
      section.items.forEach((item) => out.push(item));
    });
    return out;
  }

  apply(root: HTMLElement, options?: ScreenReaderOptions): void {
    if (this.isActive()) this.revert(root);

    const intensity = options?.intensity ?? 'moderate';
    const scope = new EffectScope();

    // Mask the content according to remaining vision. Less vision → more opaque mask, so
    // the spoken reading is what the user relies on.
    const overlay = root.ownerDocument.createElement('div');
    overlay.setAttribute('data-a11ylens', 'screen-reader-overlay');
    overlay.setAttribute('role', 'status');
    overlay.textContent =
      intensity === 'severe'
        ? 'Modo lector de pantalla — leyendo la página apartado por apartado'
        : 'Leyendo apartado por apartado';
    Object.assign(overlay.style, {
      position: 'absolute',
      inset: '0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 16px',
      textAlign: 'center',
      background: `rgba(15, 23, 42, ${MASK_OPACITY[intensity]})`,
      color: '#ffffff',
      font: '500 14px "JetBrains Mono", monospace',
      pointerEvents: intensity === 'severe' ? 'auto' : 'none',
      zIndex: '2147483646',
    } satisfies Partial<CSSStyleDeclaration>);

    const priorPosition = root.style.getPropertyValue('position');
    if (!priorPosition) {
      scope.setInlineStyle(root, 'position', 'relative');
    }
    scope.appendChild(root, overlay);

    const utterances = this.buildUtterances(root);
    utterances.forEach((text) => this.synth.speak(text, { rate: options?.rate }));
    scope.add(() => this.synth.cancel());

    this.scope = scope;
  }

  revert(_root: HTMLElement): void {
    if (!this.scope) return;
    this.scope.dispose();
    this.scope = null;
  }
}
