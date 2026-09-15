import { describe, it, expect, vi } from 'vitest';
import { EffectScope } from './EffectScope';

describe('EffectScope', () => {
  it('runs teardowns in LIFO order', () => {
    const scope = new EffectScope();
    const order: number[] = [];
    scope.add(() => order.push(1));
    scope.add(() => order.push(2));
    scope.add(() => order.push(3));
    scope.dispose();
    expect(order).toEqual([3, 2, 1]);
  });

  it('appendChild removes the node on dispose', () => {
    const scope = new EffectScope();
    const parent = document.createElement('div');
    const child = document.createElement('span');
    scope.appendChild(parent, child);
    expect(parent.contains(child)).toBe(true);
    scope.dispose();
    expect(parent.contains(child)).toBe(false);
  });

  it('setInlineStyle restores a previously-unset property to unset', () => {
    const scope = new EffectScope();
    const el = document.createElement('div');
    scope.setInlineStyle(el, 'filter', 'blur(2px)');
    expect(el.style.filter).toBe('blur(2px)');
    scope.dispose();
    expect(el.getAttribute('style')).toBeFalsy();
  });

  it('setInlineStyle restores a previous value', () => {
    const scope = new EffectScope();
    const el = document.createElement('div');
    el.style.filter = 'contrast(0.5)';
    scope.setInlineStyle(el, 'filter', 'blur(2px)');
    scope.dispose();
    expect(el.style.filter).toBe('contrast(0.5)');
  });

  it('setAttribute restores absence and prior values', () => {
    const scope = new EffectScope();
    const el = document.createElement('input');
    scope.setAttribute(el, 'hidden', '');
    expect(el.hasAttribute('hidden')).toBe(true);
    scope.dispose();
    expect(el.hasAttribute('hidden')).toBe(false);
  });

  it('removes event listeners on dispose', () => {
    const scope = new EffectScope();
    const el = document.createElement('div');
    const handler = vi.fn();
    scope.addEventListener(el, 'click', handler);
    el.dispatchEvent(new Event('click'));
    expect(handler).toHaveBeenCalledTimes(1);
    scope.dispose();
    el.dispatchEvent(new Event('click'));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('clears intervals on dispose', () => {
    vi.useFakeTimers();
    const scope = new EffectScope();
    const fn = vi.fn();
    scope.setInterval(fn, 100);
    vi.advanceTimersByTime(250);
    expect(fn).toHaveBeenCalledTimes(2);
    scope.dispose();
    vi.advanceTimersByTime(500);
    expect(fn).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });

  it('dispose is idempotent', () => {
    const scope = new EffectScope();
    const fn = vi.fn();
    scope.add(fn);
    scope.dispose();
    scope.dispose();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('continues teardown even if one throws', () => {
    const scope = new EffectScope();
    const after = vi.fn();
    scope.add(after);
    scope.add(() => {
      throw new Error('boom');
    });
    expect(() => scope.dispose()).not.toThrow();
    expect(after).toHaveBeenCalled();
  });
});
