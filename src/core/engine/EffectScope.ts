/**
 * EffectScope — the leak guard behind the safety-critical revert requirement.
 *
 * Profiles allocate their side effects through a scope which records the inverse of
 * each one. `dispose()` runs every teardown in LIFO order, turning "did I remember to
 * undo X?" into a single call. See design.md §4.
 */
export class EffectScope {
  private teardowns: Array<() => void> = [];
  private disposed = false;

  /** Register an arbitrary teardown. Runs in LIFO order on dispose(). */
  add(teardown: () => void): void {
    this.teardowns.push(teardown);
  }

  /** Append a child and register its removal. */
  appendChild(parent: Node, child: Node): void {
    parent.appendChild(child);
    this.add(() => {
      if (child.parentNode === parent) {
        parent.removeChild(child);
      }
    });
  }

  /**
   * Set an inline style property, snapshotting the previous inline value so dispose
   * restores it exactly (including "was not set").
   */
  setInlineStyle(el: HTMLElement, prop: string, value: string): void {
    const previous = el.style.getPropertyValue(prop);
    const previousPriority = el.style.getPropertyPriority(prop);
    const hadStyleAttr = el.hasAttribute('style');
    el.style.setProperty(prop, value);
    this.add(() => {
      if (previous) {
        el.style.setProperty(prop, previous, previousPriority);
      } else {
        el.style.removeProperty(prop);
      }
      // jsdom/browsers can leave an empty style="" attribute behind; if there was no
      // style attribute before and nothing remains, remove it to restore exactly.
      if (!hadStyleAttr && el.getAttribute('style') === '') {
        el.removeAttribute('style');
      }
    });
  }

  /** Set an attribute, snapshotting the previous value (or its absence). */
  setAttribute(el: Element, name: string, value: string): void {
    const had = el.hasAttribute(name);
    const previous = had ? el.getAttribute(name) : null;
    el.setAttribute(name, value);
    this.add(() => {
      if (had && previous !== null) {
        el.setAttribute(name, previous);
      } else {
        el.removeAttribute(name);
      }
    });
  }

  /** Add an event listener and register its removal. */
  addEventListener(
    target: EventTarget,
    type: string,
    handler: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ): void {
    target.addEventListener(type, handler, options);
    this.add(() => target.removeEventListener(type, handler, options));
  }

  /** Schedule a timeout and register its cancellation. */
  setTimeout(fn: () => void, ms: number): void {
    const id = globalThis.setTimeout(fn, ms);
    this.add(() => globalThis.clearTimeout(id));
  }

  /** Schedule a repeating interval and register its cancellation. */
  setInterval(fn: () => void, ms: number): void {
    const id = globalThis.setInterval(fn, ms);
    this.add(() => globalThis.clearInterval(id));
  }

  /**
   * Run a self-rescheduling animation-frame loop. `fn` is invoked each frame; the loop
   * stops and the pending frame is cancelled on dispose.
   */
  requestAnimationFrameLoop(fn: FrameRequestCallback): void {
    let frameId = 0;
    let stopped = false;
    const tick: FrameRequestCallback = (time) => {
      if (stopped) return;
      fn(time);
      if (!stopped) {
        frameId = globalThis.requestAnimationFrame(tick);
      }
    };
    frameId = globalThis.requestAnimationFrame(tick);
    this.add(() => {
      stopped = true;
      globalThis.cancelAnimationFrame(frameId);
    });
  }

  /** True once dispose() has run and before any new effect is registered. */
  get isDisposed(): boolean {
    return this.disposed && this.teardowns.length === 0;
  }

  /** Run all teardown in LIFO order, then reset. Idempotent. */
  dispose(): void {
    for (let i = this.teardowns.length - 1; i >= 0; i -= 1) {
      try {
        this.teardowns[i]();
      } catch {
        // A single failing teardown must not block the rest.
      }
    }
    this.teardowns = [];
    this.disposed = true;
  }
}
