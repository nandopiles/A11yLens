/**
 * SpeechSynthesizer abstraction so ScreenReaderProfile is testable and degrades
 * gracefully where the Web Speech API is unavailable (e.g. jsdom). See design.md §5f.
 */
export interface SpeechSynthesizer {
  /** Queue an utterance to be spoken. */
  speak(text: string, options?: { rate?: number }): void;
  /** Immediately stop and clear the queue. */
  cancel(): void;
  /** Whether real speech output is available in this environment. */
  readonly available: boolean;
}

/** Adapter over window.speechSynthesis. */
export class WebSpeechSynthesizer implements SpeechSynthesizer {
  readonly available: boolean;

  constructor() {
    this.available =
      typeof window !== 'undefined' &&
      'speechSynthesis' in window &&
      typeof window.SpeechSynthesisUtterance === 'function';
  }

  speak(text: string, options?: { rate?: number }): void {
    if (!this.available || !text.trim()) return;
    const utterance = new window.SpeechSynthesisUtterance(text);
    if (options?.rate) utterance.rate = options.rate;
    window.speechSynthesis.speak(utterance);
  }

  cancel(): void {
    if (!this.available) return;
    window.speechSynthesis.cancel();
  }
}

/** No-op fallback used when speech is unavailable. */
export class NoopSpeechSynthesizer implements SpeechSynthesizer {
  readonly available = false;
  speak(): void {
    /* no-op */
  }
  cancel(): void {
    /* no-op */
  }
}

/** Pick the best available synthesizer for the current environment. */
export function createSpeechSynthesizer(): SpeechSynthesizer {
  const web = new WebSpeechSynthesizer();
  return web.available ? web : new NoopSpeechSynthesizer();
}
