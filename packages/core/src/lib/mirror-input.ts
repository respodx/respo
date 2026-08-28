export interface MirrorInputOptions {
  selector: string;
  value: string;
  checked?: boolean | undefined;
  selectedIndex?: number | undefined;
  type?: string | undefined;
}

/**
 * Mirrors form input, textarea, and select (dropdown) changes to the equivalent element in a target iframe.
 * Uses native prototype property descriptors and updates React's internal _valueTracker
 * to ensure React controlled components, Vue, and vanilla DOM listeners detect the updates.
 */
export function applyInputToFrame(
  iframe: HTMLIFrameElement,
  options: MirrorInputOptions
): void {
  const doc = iframe.contentDocument ?? iframe.contentWindow?.document;
  const win = iframe.contentWindow;
  if (!doc || !win) return;

  const el = doc.querySelector(options.selector) as HTMLElement | null;
  if (!el) return;

  const tagName = el.tagName ? el.tagName.toLowerCase() : '';
  const EventConstructor = (win as any).Event || Event;

  // 1. Native Select Dropdown (<select>)
  if (tagName === 'select') {
    const selectEl = el as HTMLSelectElement;
    const proto = (win as any).HTMLSelectElement?.prototype || HTMLSelectElement.prototype;
    const nativeSelectSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;

    if (nativeSelectSetter) {
      nativeSelectSetter.call(selectEl, options.value);
    } else {
      selectEl.value = options.value;
    }

    if (typeof options.selectedIndex === 'number') {
      selectEl.selectedIndex = options.selectedIndex;
    }

    const tracker = (selectEl as any)._valueTracker;
    if (tracker) {
      tracker.setValue(options.value);
    }

    const changeEv = new EventConstructor('change', { bubbles: true });
    (changeEv as any).__rdx_synthetic = true;
    selectEl.dispatchEvent(changeEv);

    const inputEv = new EventConstructor('input', { bubbles: true });
    (inputEv as any).__rdx_synthetic = true;
    selectEl.dispatchEvent(inputEv);
    return;
  }

  // 2. Checkboxes & Radio Buttons (<input type="checkbox|radio">)
  const inputType = (el as HTMLInputElement).type || options.type;
  if (tagName === 'input' && (inputType === 'checkbox' || inputType === 'radio')) {
    const inputEl = el as HTMLInputElement;
    const proto = (win as any).HTMLInputElement?.prototype || HTMLInputElement.prototype;
    const nativeCheckedSetter = Object.getOwnPropertyDescriptor(proto, 'checked')?.set;

    if (nativeCheckedSetter && typeof options.checked === 'boolean') {
      nativeCheckedSetter.call(inputEl, options.checked);
    } else if (typeof options.checked === 'boolean') {
      inputEl.checked = options.checked;
    }

    const tracker = (inputEl as any)._valueTracker;
    if (tracker) {
      tracker.setValue(options.checked ? 'true' : 'false');
    }

    const changeEv = new EventConstructor('change', { bubbles: true });
    (changeEv as any).__rdx_synthetic = true;
    inputEl.dispatchEvent(changeEv);

    const inputEv = new EventConstructor('input', { bubbles: true });
    (inputEv as any).__rdx_synthetic = true;
    inputEl.dispatchEvent(inputEv);
    return;
  }

  // 3. Text, Email, Password, Number Inputs & Textareas
  if (tagName === 'input' || tagName === 'textarea') {
    const inputEl = el as HTMLInputElement | HTMLTextAreaElement;
    const proto = tagName === 'input'
      ? ((win as any).HTMLInputElement?.prototype || HTMLInputElement.prototype)
      : ((win as any).HTMLTextAreaElement?.prototype || HTMLTextAreaElement.prototype);

    const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
    if (nativeSetter) {
      nativeSetter.call(inputEl, options.value);
    } else {
      inputEl.value = options.value;
    }

    const tracker = (inputEl as any)._valueTracker;
    if (tracker) {
      tracker.setValue(options.value);
    }

    const inputEv = new EventConstructor('input', { bubbles: true });
    (inputEv as any).__rdx_synthetic = true;
    inputEl.dispatchEvent(inputEv);

    const changeEv = new EventConstructor('change', { bubbles: true });
    (changeEv as any).__rdx_synthetic = true;
    inputEl.dispatchEvent(changeEv);
  }
}

/**
 * Builds a unique CSS selector for an element within its document.
 * Prioritizes id, name, data-testid, and nth-of-type hierarchy.
 */
export function buildSelector(el: Element): string {
  if (!el || (el.nodeType && el.nodeType !== 1)) return '';
  if (el.id) return `#${CSS.escape(el.id)}`;

  const tag = el.tagName ? el.tagName.toLowerCase() : '';

  // Use name attribute for form inputs if available
  const elWithName = el as { name?: string; closest?: (s: string) => Element | null };
  if (elWithName.name && (tag === 'input' || tag === 'select' || tag === 'textarea')) {
    if (typeof elWithName.closest === 'function') {
      const parentForm = elWithName.closest('form');
      const formSelector = parentForm && parentForm.id ? `#${CSS.escape(parentForm.id)} ` : '';
      return `${formSelector}${tag}[name="${CSS.escape(elWithName.name)}"]`;
    }
    return `${tag}[name="${CSS.escape(elWithName.name)}"]`;
  }

  // Use data-testid if present
  const testId = el.getAttribute?.('data-testid');
  if (testId) {
    return `[data-testid="${CSS.escape(testId)}"]`;
  }

  const parts: string[] = [];
  let current: Element | null = el;
  const ownerDoc = el.ownerDocument;
  const docBody = ownerDoc ? ownerDoc.body : null;
  const docElement = ownerDoc ? ownerDoc.documentElement : null;

  while (current && current !== docBody && current !== docElement) {
    const parent: HTMLElement | null = current.parentElement;
    if (!parent) break;

    const siblings: Element[] = Array.from(parent.children || []).filter(
      (c: Element) => c.tagName === current!.tagName
    );
    const index = siblings.indexOf(current) + 1;
    const currentTag = current.tagName ? current.tagName.toLowerCase() : '';
    parts.unshift(siblings.length > 1 ? `${currentTag}:nth-of-type(${index})` : currentTag);
    current = parent;
  }

  return parts.join(' > ');
}
