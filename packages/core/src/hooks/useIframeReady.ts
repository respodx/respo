import { useEffect, useState } from 'react';

/**
 * Returns true once the iframe's document has loaded and is interactive.
 * Uses both the iframe's `load` event and a fallback polling mechanism
 * for cases where the iframe was already loaded before the hook ran.
 */
export function useIframeReady(iframeRef: React.RefObject<HTMLIFrameElement | null>): boolean {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    function checkReady() {
      const doc = iframe?.contentDocument;
      if (doc && doc.readyState === 'complete') {
        setIsReady(true);
        return true;
      }
      return false;
    }

    if (checkReady()) return;

    function onLoad() {
      checkReady();
    }

    iframe.addEventListener('load', onLoad);

    // Fallback poll — in case the load event was missed
    const interval = setInterval(() => {
      if (checkReady()) clearInterval(interval);
    }, 200);

    return () => {
      iframe.removeEventListener('load', onLoad);
      clearInterval(interval);
    };
  }, [iframeRef]);

  return isReady;
}
