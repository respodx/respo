/**
 * Applies a scroll position to an iframe's window or an inner scrollable element.
 * Ensures instant, reliable synchronization across different browsers and layouts.
 */
export function applyScrollToFrame(
  iframe: HTMLIFrameElement,
  scrollX: number,
  scrollY: number,
  selector?: string
): void {
  try {
    const doc = iframe.contentDocument ?? iframe.contentWindow?.document;
    const win = iframe.contentWindow;
    if (!doc || !win) return;

    if (selector) {
      const el = (doc.querySelector(selector) ?? (selector.startsWith('#') ? doc.getElementById(selector.slice(1)) : null)) as HTMLElement | null;
      if (el) {
        try {
          el.scrollTo({ left: scrollX, top: scrollY, behavior: 'auto' });
        } catch {
          try {
            el.scrollTo(scrollX, scrollY);
          } catch {}
        }
        el.scrollLeft = scrollX;
        el.scrollTop = scrollY;
        return;
      }
    }

    // Window & root document scroll
    try {
      win.scrollTo({ left: scrollX, top: scrollY, behavior: 'auto' });
    } catch {
      try {
        win.scrollTo(scrollX, scrollY);
      } catch {}
    }

    if (doc.documentElement) {
      doc.documentElement.scrollLeft = scrollX;
      doc.documentElement.scrollTop = scrollY;
    }
    if (doc.body) {
      doc.body.scrollLeft = scrollX;
      doc.body.scrollTop = scrollY;
    }
  } catch {
    // Gracefully handle cross-origin or detached frames
  }
}
