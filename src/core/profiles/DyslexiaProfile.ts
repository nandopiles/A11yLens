import { EffectScope } from '../engine/EffectScope';
import type { AccessibilityProfile, ProfileMetadata, ProfileOptions } from '../engine/types';

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
    name: 'Dyslexia',
    description: 'Alters spacing and periodically shuffles interior letters of words.',
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

      const runPass = () => {
        originals.forEach((original, node) => {
          node.nodeValue = this.shuffleWords(original);
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
    return text.replace(/[A-Za-zÀ-ÿ]{4,}/g, (word) => this.shuffleInterior(word));
  }

  private shuffleInterior(word: string): string {
    const chars = word.split('');
    const inner = chars.slice(1, -1);
    for (let i = inner.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [inner[i], inner[j]] = [inner[j], inner[i]];
    }
    return chars[0] + inner.join('') + chars[chars.length - 1];
  }
}
