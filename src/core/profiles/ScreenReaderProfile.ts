import { EffectScope } from '../engine/EffectScope';
import type { AccessibilityProfile, ProfileMetadata, ProfileOptions } from '../engine/types';
import { createSpeechSynthesizer, type SpeechSynthesizer } from './speech';

export interface ScreenReaderOptions extends ProfileOptions {
  rate?: number;
}

/**
 * Simulates consuming the page through a screen reader. Visually masks the content and
 * reads the DOM in reading order via an injectable SpeechSynthesizer. Deliberately does
 * NOT invent names for elements missing alt/aria-label — it announces them as defects so
 * the gap is audible. See design.md §5f.
 */
export class ScreenReaderProfile implements AccessibilityProfile {
  readonly metadata: ProfileMetadata = {
    id: 'screen-reader',
    name: 'Screen reader',
    description: 'Masks the view and reads the DOM aloud, exposing missing labels.',
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

  /** Exposed for tests: the announcement list built from the DOM in reading order. */
  buildUtterances(root: HTMLElement): string[] {
    const out: string[] = [];
    const walker = root.ownerDocument.createTreeWalker(
      root,
      NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
    );
    let node = walker.nextNode();
    while (node) {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = (node.nodeValue ?? '').trim();
        if (text) out.push(text);
      } else if (node instanceof HTMLElement) {
        const tag = node.tagName;
        if (tag === 'IMG') {
          const alt = node.getAttribute('alt');
          out.push(alt && alt.trim() ? `image, ${alt}` : 'image, no description');
        } else if (tag === 'INPUT' || tag === 'BUTTON') {
          const label = node.getAttribute('aria-label');
          if (label && label.trim()) {
            out.push(`${tag.toLowerCase()}, ${label}`);
          } else if (tag === 'INPUT') {
            out.push('input, no label');
          }
        }
      }
      node = walker.nextNode();
    }
    return out;
  }

  apply(root: HTMLElement, options?: ScreenReaderOptions): void {
    if (this.isActive()) this.revert(root);

    const scope = new EffectScope();

    // Mask the content so sight cannot be relied upon.
    const overlay = root.ownerDocument.createElement('div');
    overlay.setAttribute('data-a11ylens', 'screen-reader-overlay');
    overlay.setAttribute('role', 'status');
    overlay.textContent = 'Screen reader mode — content is being read aloud';
    Object.assign(overlay.style, {
      position: 'absolute',
      inset: '0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0f172a',
      color: '#ffffff',
      font: '500 14px "JetBrains Mono", monospace',
      zIndex: '2147483646',
    } satisfies Partial<CSSStyleDeclaration>);

    // Ensure the overlay positions against the root.
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
