/**
 * Returns true only when executing in the top-level browsing context.
 * Used to prevent the widget from mounting inside its own preview iframes.
 *
 * SSR-safe: returns false on the server (no window).
 */
export function isTopFrame(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    if (window.location && typeof window.location.search === 'string' && window.location.search.includes('rdx_frame=1')) {
      return false;
    }
    return window.self === window.top;
  } catch {
    // Cross-origin access to window.top throws in some environments.
    // If we can't access window.top, we're definitely inside an iframe.
    return false;
  }
}
