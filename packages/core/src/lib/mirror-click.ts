/**
 * Broadcasts a click event at (x, y) coordinates to an iframe document.
 * Coordinates are viewport-relative within the source frame and must
 * be passed as-is — the target frame is at the same logical resolution.
 */
export function applyClickToFrame(
  iframe: HTMLIFrameElement,
  x: number,
  y: number
): void {
  const doc = iframe.contentDocument ?? iframe.contentWindow?.document;
  if (!doc) return;

  const target = doc.elementFromPoint(x, y);
  if (!target) return;

  const event = new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    view: iframe.contentWindow ?? null,
    clientX: x,
    clientY: y,
  });

  (event as any).__rdx_synthetic = true;
  target.dispatchEvent(event);
}
