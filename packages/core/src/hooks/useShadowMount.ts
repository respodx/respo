import { useEffect, useRef, useState } from 'react';
import { SHADOW_HOST_ID, WIDGET_Z_INDEX } from '../constants/viewports.js';

/**
 * Creates and manages a shadow DOM host element in document.body.
 * Returns the shadow root once initialized, or null during SSR / before mount.
 *
 * The host element is removed from the DOM when the component unmounts.
 */
export function useShadowMount(cssText: string): ShadowRoot | null {
  const [shadowRoot, setShadowRoot] = useState<ShadowRoot | null>(null);
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    let host = document.getElementById(SHADOW_HOST_ID) as HTMLDivElement | null;
    let root: ShadowRoot;

    if (!host) {
      host = document.createElement('div');
      host.id = SHADOW_HOST_ID;
      host.style.cssText = [
        'position: fixed',
        'top: 0',
        'left: 0',
        'width: 0',
        'height: 0',
        `z-index: ${WIDGET_Z_INDEX}`,
        'pointer-events: none',
      ].join('; ');
      document.body.appendChild(host);
      root = host.attachShadow({ mode: 'open' });
    } else {
      if (!host.isConnected) {
        document.body.appendChild(host);
      }
      root = host.shadowRoot || host.attachShadow({ mode: 'open' });
    }

    hostRef.current = host;

    // Inject scoped CSS into the shadow root (adoptedStyleSheets with <style> fallback)
    try {
      if ('adoptedStyleSheets' in root && typeof CSSStyleSheet !== 'undefined') {
        const styleSheet = new CSSStyleSheet();
        styleSheet.replaceSync(cssText);
        root.adoptedStyleSheets = [styleSheet];
      } else {
        throw new Error('adoptedStyleSheets unsupported');
      }
    } catch {
      let styleTag = root.querySelector('style#rdx-styles') as HTMLStyleElement | null;
      if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = 'rdx-styles';
        styleTag.textContent = cssText;
        root.appendChild(styleTag);
      } else {
        styleTag.textContent = cssText;
      }
    }

    setShadowRoot(root);

    return () => {
      // Retain host to prevent StrictMode flicker and detached portal root errors
    };
  }, [cssText]);
  // cssText is static — it never changes at runtime, safe to omit from deps

  return shadowRoot;
}
