import { describe, it, expect, afterEach } from 'vitest';
import { isTopFrame } from '../lib/is-top-frame.js';

describe('isTopFrame', () => {
  const originalWindow = globalThis.window;

  afterEach(() => {
    globalThis.window = originalWindow;
  });

  it('returns false when window is undefined (SSR)', () => {
    delete (globalThis as Record<string, unknown>).window;
    expect(isTopFrame()).toBe(false);
  });

  it('returns true when window.self === window.top', () => {
    const fakeWindow = {} as Window & typeof globalThis;
    (fakeWindow as unknown as { self: Window; top: Window }).self = fakeWindow;
    (fakeWindow as unknown as { self: Window; top: Window }).top = fakeWindow;
    globalThis.window = fakeWindow;

    expect(isTopFrame()).toBe(true);
  });

  it('returns false when inside an iframe (window.self !== window.top)', () => {
    const fakeTop = {} as Window;
    const fakeSelf = {} as Window & typeof globalThis;
    (fakeSelf as unknown as { self: Window; top: Window }).self = fakeSelf;
    (fakeSelf as unknown as { self: Window; top: Window }).top = fakeTop;
    globalThis.window = fakeSelf;

    expect(isTopFrame()).toBe(false);
  });
});
