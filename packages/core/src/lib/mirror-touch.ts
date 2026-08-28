/**
 * Mirrors touch events and pointer events to target iframes.
 * Computes the relative position of the touch inside the target element,
 * and maps it to the equivalent element in the destination iframe.
 */

export function applyTouchToFrame(
  iframe: HTMLIFrameElement,
  type: string,
  selector: string,
  touches: { identifier: number; relX: number; relY: number }[]
) {
  const doc = iframe.contentDocument ?? iframe.contentWindow?.document;
  const win = iframe.contentWindow;
  if (!doc || !win) return;

  const targetEl = doc.querySelector(selector);
  if (!targetEl) return;

  if (typeof (win as any).Touch === 'undefined' || typeof (win as any).TouchEvent === 'undefined') return;

  const rect = targetEl.getBoundingClientRect();

  const touchObjects = touches.map(t => {
    const clientX = rect.left + t.relX * rect.width;
    const clientY = rect.top + t.relY * rect.height;
    return new (win as any).Touch({
      identifier: t.identifier,
      target: targetEl,
      clientX,
      clientY,
      pageX: clientX + win.scrollX,
      pageY: clientY + win.scrollY,
      screenX: clientX,
      screenY: clientY,
    });
  });

  const touchEvent = new (win as any).TouchEvent(type, {
    bubbles: true,
    cancelable: true,
    view: win,
    touches: touchObjects,
    targetTouches: touchObjects,
    changedTouches: touchObjects,
  });

  (touchEvent as any).__rdx_synthetic = true;
  targetEl.dispatchEvent(touchEvent);
}

export function applyPointerToFrame(
  iframe: HTMLIFrameElement,
  type: string,
  selector: string,
  eventData: { pointerId: number; pointerType: string; relX: number; relY: number; button: number; buttons: number; isPrimary: boolean }
) {
  const doc = iframe.contentDocument ?? iframe.contentWindow?.document;
  const win = iframe.contentWindow;
  if (!doc || !win) return;

  const targetEl = doc.querySelector(selector);
  if (!targetEl) return;

  if (typeof (win as any).PointerEvent === 'undefined') return;

  const rect = targetEl.getBoundingClientRect();
  const clientX = rect.left + eventData.relX * rect.width;
  const clientY = rect.top + eventData.relY * rect.height;

  const pointerEvent = new (win as any).PointerEvent(type, {
    bubbles: true,
    cancelable: true,
    view: win,
    pointerId: eventData.pointerId,
    pointerType: eventData.pointerType,
    clientX,
    clientY,
    screenX: clientX,
    screenY: clientY,
    button: eventData.button,
    buttons: eventData.buttons,
    isPrimary: eventData.isPrimary,
  });

  (pointerEvent as any).__rdx_synthetic = true;
  targetEl.dispatchEvent(pointerEvent);
}
