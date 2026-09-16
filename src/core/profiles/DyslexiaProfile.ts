import { EffectScope } from '../engine/EffectScope';
import type { AccessibilityProfile, ProfileMetadata, ProfileOptions } from '../engine/types';

type FieldElement = HTMLInputElement | HTMLTextAreaElement;
type FieldProp = 'value' | 'placeholder';
interface FieldTarget {
  el: FieldElement;
  prop: FieldProp;
}

export interface DyslexiaOptions extends ProfileOptions {
  /** Enable periodic letter micro-shuffling ("moving letters"). Default true. */
  shuffle?: boolean;
  /** Milliseconds between shuffle passes. Default 1200. */
  shuffleIntervalMs?: number;
}

/**
 * Simulates reading difficulty via altered spacing/line-height and optional periodic
 * shuffling of interior letters (first/last kept). All touched text nodes are snapshotted
 * before mutation and restored verbatim on revert — node structure is never changed, only
 * `nodeValue`. See design.md §5c.
 */
export class DyslexiaProfile implements AccessibilityProfile {
  readonly metadata: ProfileMetadata = {
    id: 'dyslexia',
    name: 'Dislexia',
    description: 'Altera el espaciado y reordena periódicamente las letras interiores de las palabras.',
    category: 'cognitive',
  };

  private scope: EffectScope | null = null;

  isActive(): boolean {
    return this.scope !== null;
  }

  apply(root: HTMLElement, options?: DyslexiaOptions): void {
    if (this.isActive()) this.revert(root);

    const shuffle = options?.shuffle ?? true;
    const intervalMs = options?.shuffleIntervalMs ?? 1200;
    const scope = new EffectScope();

    scope.setInlineStyle(root, 'letter-spacing', '0.12em');
    scope.setInlineStyle(root, 'word-spacing', '0.16em');
    scope.setInlineStyle(root, 'line-height', '2.1');

    if (shuffle) {
      const textNodes = this.collectTextNodes(root);
      // Snapshot originals and ensure they are restored on dispose.
      const originals = new Map<Text, string>();
      textNodes.forEach((node) => originals.set(node, node.nodeValue ?? ''));
      scope.add(() => {
        originals.forEach((value, node) => {
          node.nodeValue = value;
        });
      });

      // Text inside form controls does not live in child text nodes: it sits in the
      // `value`/`placeholder` attributes, which the TreeWalker never visits. Those are
      // exactly the button/input labels the user cares about, so shuffle them too.
      const fieldTargets = this.collectFieldTargets(root);
      const fieldOriginals = new Map<FieldTarget, string>();
      fieldTargets.forEach((target) =>
        fieldOriginals.set(target, target.el[target.prop] ?? ''),
      );
      scope.add(() => {
        fieldOriginals.forEach((value, target) => {
          target.el[target.prop] = value;
        });
      });

      const runPass = () => {
        originals.forEach((original, node) => {
          node.nodeValue = this.shuffleWords(original);
        });
        fieldOriginals.forEach((original, target) => {
          target.el[target.prop] = this.shuffleWords(original);
        });
      };
      // First pass immediately, then on an interval.
      runPass();
      scope.setInterval(runPass, intervalMs);
    }

    this.scope = scope;
  }

  revert(_root: HTMLElement): void {
    if (!this.scope) return;
    this.scope.dispose();
    this.scope = null;
  }

  /**
   * Collect the text-bearing attributes of form controls. For inputs/textarea we shuffle
   * the visible `value` and the `placeholder`; for text-like inputs both may be present.
   * `value` is skipped for inputs whose value is not user-visible text (checkbox, etc.).
   */
  private collectFieldTargets(root: HTMLElement): FieldTarget[] {
    const targets: FieldTarget[] = [];
    const controls = root.querySelectorAll<FieldElement>('input, textarea');
    controls.forEach((el) => {
      const isTextarea = el.tagName === 'TEXTAREA';
      const type = isTextarea ? 'textarea' : (el as HTMLInputElement).type;
      const valueIsVisibleText =
        isTextarea ||
        ['text', 'search', 'email', 'url', 'tel', 'submit', 'button', 'reset'].includes(
          type,
        );
      if (valueIsVisibleText && (el.value ?? '').trim().length > 0) {
        targets.push({ el, prop: 'value' });
      }
      if ((el.placeholder ?? '').trim().length > 0) {
        targets.push({ el, prop: 'placeholder' });
      }
    });
    return targets;
  }

  private collectTextNodes(root: HTMLElement): Text[] {
    const walker = root.ownerDocument.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        const tag = parent.tagName;
        if (tag === 'SCRIPT' || tag === 'STYLE') return NodeFilter.FILTER_REJECT;
        return (node.nodeValue ?? '').trim().length > 0
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT;
      },
    });
    const nodes: Text[] = [];
    let current = walker.nextNode();
    while (current) {
      nodes.push(current as Text);
      current = walker.nextNode();
    }
    return nodes;
  }

  private shuffleWords(text: string): string {
    // Match every run of 2+ letters. The 4+ threshold left short labels like "CVC",
    // "MM", "YY" completely untouched, which are exactly the fields users noticed did
    // not change. Interior shuffling only bites when there are 2+ interior letters, so
    // we additionally apply irregular case jitter, which destabilises even short words
    // and single interior letters — a recognised dyslexia-simulation technique.
    return text.replace(/[A-Za-zÀ-ÿ]{2,}/g, (word) =>
      this.caseJitter(this.shuffleInterior(word)),
    );
  }

  private shuffleInterior(word: string): string {
    if (word.length < 4) return word;
    const chars = word.split('');
    const inner = chars.slice(1, -1);
    for (let i = inner.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [inner[i], inner[j]] = [inner[j], inner[i]];
    }
    return chars[0] + inner.join('') + chars[chars.length - 1];
  }

  /**
   * Randomly flip the case of letters after the first, so even 2-letter words like
   * "MM"/"YY" and 3-letter ones like "CVC" visibly destabilise. The first letter is
   * kept as a reading anchor.
   */
  private caseJitter(word: string): string {
    if (word.length < 2) return word;
    const chars = word.split('');
    for (let i = 1; i < chars.length; i += 1) {
      if (Math.random() < 0.5) {
        const upper = chars[i].toUpperCase();
        chars[i] = chars[i] === upper ? chars[i].toLowerCase() : upper;
      }
    }
    return chars.join('');
  }
}
