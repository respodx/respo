import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { buildSelector } from '../lib/mirror-input.js';

describe('mirror-input buildSelector', () => {
  const originalCSS = globalThis.CSS;

  beforeEach(() => {
    // Provide CSS.escape if not defined in node environment
    if (!globalThis.CSS) {
      globalThis.CSS = {
        escape: (str: string) => str.replace(/([^\w-])/g, '\\$1'),
      } as unknown as typeof CSS;
    }
  });

  afterEach(() => {
    globalThis.CSS = originalCSS;
  });

  it('builds id-based selector when id exists', () => {
    const el = { id: 'my-test-input' } as unknown as Element;
    expect(buildSelector(el)).toBe('#my-test-input');
  });

  it('builds path-based selector when no id exists', () => {
    const rootBody = { children: [] as Element[] } as unknown as Element;

    const form = {
      tagName: 'FORM',
      parentElement: rootBody,
      children: [] as Element[],
    } as unknown as Element;

    (rootBody as unknown as { children: Element[] }).children = [form];

    const div1 = {
      tagName: 'DIV',
      parentElement: form,
      children: [] as Element[],
    } as unknown as Element;

    const div2 = {
      tagName: 'DIV',
      parentElement: form,
      children: [] as Element[],
    } as unknown as Element;

    (form as unknown as { children: Element[] }).children = [div1, div2];

    const input = {
      tagName: 'INPUT',
      parentElement: div2,
      children: [] as Element[],
    } as unknown as Element;

    (div2 as unknown as { children: Element[] }).children = [input];

    const selector = buildSelector(input);
    expect(selector).toBe('form > div:nth-of-type(2) > input');
  });
});
