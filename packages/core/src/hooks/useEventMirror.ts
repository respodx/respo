import { useEffect, useRef } from 'react';
import { applyScrollToFrame } from '../lib/mirror-scroll.js';
import { applyInputToFrame, buildSelector } from '../lib/mirror-input.js';
import { applyTouchToFrame, applyPointerToFrame } from '../lib/mirror-touch.js';

/**
 * Finds the corresponding element in a target iframe's document matching
 * the source element across responsive layouts (desktop, tablet, mobile).
 */
function findMatchingElement(
  targetDoc: Document,
  sourceEl: HTMLElement,
  selector: string
): HTMLElement | null {
  // 1. Try exact hierarchical / ID selector
  if (selector) {
    try {
      const match = targetDoc.querySelector(selector) as HTMLElement | null;
      if (match) return match;
    } catch {}
  }

  // 2. Try ID
  if (sourceEl.id) {
    try {
      const match = targetDoc.getElementById(sourceEl.id);
      if (match) return match;
    } catch {}
  }

  // 3. Try name attribute (for select, input, textarea, form elements)
  const name = sourceEl.getAttribute('name');
  if (name) {
    try {
      const match = targetDoc.querySelector(`[name="${CSS.escape(name)}"]`) as HTMLElement | null;
      if (match) return match;
    } catch {}
  }

  // 4. Try data-testid
  const testId = sourceEl.getAttribute('data-testid');
  if (testId) {
    try {
      const match = targetDoc.querySelector(`[data-testid="${CSS.escape(testId)}"]`) as HTMLElement | null;
      if (match) return match;
    } catch {}
  }

  // 5. Try link href attribute
  const link = sourceEl.closest('a');
  if (link) {
    const rawHref = link.getAttribute('href');
    if (rawHref && rawHref !== '#' && !rawHref.startsWith('javascript:')) {
      try {
        const match = targetDoc.querySelector(`a[href="${CSS.escape(rawHref)}"]`) as HTMLElement | null;
        if (match) return match;
      } catch {}
    }
  }

  // 6. Try aria-label
  const ariaLabel = sourceEl.getAttribute('aria-label');
  if (ariaLabel) {
    try {
      const match = targetDoc.querySelector(`[aria-label="${CSS.escape(ariaLabel)}"]`) as HTMLElement | null;
      if (match) return match;
    } catch {}
  }

  // 7. For select elements, try matching by position among select elements
  if (sourceEl.tagName === 'SELECT') {
    try {
      const sourceSelects = Array.from(sourceEl.ownerDocument?.querySelectorAll('select') || []);
      const index = sourceSelects.indexOf(sourceEl as HTMLSelectElement);
      const targetSelects = Array.from(targetDoc.querySelectorAll('select'));
      if (index >= 0 && targetSelects[index]) {
        return targetSelects[index] as HTMLElement;
      }
    } catch {}
  }

  // 8. Try matching by text content for tabs, buttons, links, and nav items
  const sourceText = sourceEl.textContent?.trim();
  if (sourceText && sourceText.length > 0 && sourceText.length < 60) {
    try {
      const candidates = targetDoc.querySelectorAll(
        'a, button, [role="button"], [role="tab"], [role="menuitem"], nav a, nav button, li a, li button, summary'
      );
      for (let i = 0; i < candidates.length; i++) {
        const cand = candidates[i] as HTMLElement;
        if (cand.textContent?.trim() === sourceText) {
          return cand;
        }
      }
    } catch {}
  }

  return null;
}

/**
 * Safely reads window.location.href without throwing SecurityError on cross-origin frames.
 */
function getSafeLocationHref(win: Window | null | undefined): string {
  if (!win) return '';
  try {
    const loc = win.location;
    if (!loc) return '';
    return typeof loc.href === 'string' ? loc.href : '';
  } catch {
    return '';
  }
}

/**
 * Builds a target frame URL ensuring rdx_frame=1 is retained.
 */
function buildFrameUrl(targetWin: Window, newUrl: string): string {
  try {
    const baseHref = getSafeLocationHref(targetWin) || (typeof window !== 'undefined' ? window.location.href : 'http://localhost');
    const parsed = new URL(newUrl, baseHref);
    parsed.searchParams.set('rdx_frame', '1');
    return parsed.href;
  } catch {
    return newUrl;
  }
}

/**
 * Returns normalized pathname + search (excluding rdx_frame) + hash for comparison.
 */
function getNormalizedPath(urlStr: string): string {
  try {
    if (!urlStr || urlStr === 'about:blank' || urlStr.startsWith('javascript:')) return '';
    const parsed = new URL(urlStr, 'http://localhost');
    parsed.searchParams.delete('rdx_frame');
    return parsed.pathname + (parsed.search ? parsed.search : '') + parsed.hash;
  } catch {
    return urlStr;
  }
}

/**
 * Attaches synchronized event & navigation listeners across all active iframe viewports:
 * 1. Immediate & Dynamic Frame Attachment (polling + load event + WeakSet deduplication)
 * 2. Window & Inner Container Scroll Synchronization (instant 60fps wheel & scroll mirroring)
 * 3. Route & Single-Page-App Navigation Synchronization (SPA pushState, replaceState, popstate, hashchange)
 * 4. Click, Tab, Button, and Dropdown Synchronization (responsive smart element matching)
 * 5. Form Input, Select Dropdown, Radio, Checkbox, Textarea Mirroring (with React _valueTracker support)
 * 6. Touch & Pointer Drag/Swipe Mirroring
 * 7. Theme & Dark/Light Mode Mutation Mirroring
 */
export function useEventMirror(
  iframeRefs: React.RefObject<HTMLIFrameElement | null>[],
  enabled: boolean
): void {
  const isInputMirroring = useRef(false);
  const isSyncingRoute = useRef(false);
  const isSyncingTheme = useRef(false);
  const lastActivePath = useRef<string>('');

  useEffect(() => {
    if (!enabled) return;

    let inputLockTimer: any = null;
    function lockInputMirror(durationMs = 100) {
      isInputMirroring.current = true;
      clearTimeout(inputLockTimer);
      inputLockTimer = setTimeout(() => {
        isInputMirroring.current = false;
      }, durationMs);
    }

    let routeSyncTimer: any = null;
    function lockRouteSync(durationMs = 400) {
      isSyncingRoute.current = true;
      clearTimeout(routeSyncTimer);
      routeSyncTimer = setTimeout(() => {
        isSyncingRoute.current = false;
      }, durationMs);
    }

    const attachedDocs = new WeakSet<Document>();
    const attachedFrames = new WeakSet<HTMLIFrameElement>();
    const patchedWindows = new WeakSet<Window>();
    const lastKnownPaths = new Map<HTMLIFrameElement, string>();
    const cleanupFns: (() => void)[] = [];

    let activeScrollSource: HTMLIFrameElement | null = null;
    let scrollSourceTimer: any = null;

    function getActiveIframes(): HTMLIFrameElement[] {
      return iframeRefs
        .map((r) => r.current)
        .filter((iframe): iframe is HTMLIFrameElement => iframe !== null && iframe.isConnected);
    }

    function getOtherIframes(source: HTMLIFrameElement): HTMLIFrameElement[] {
      return getActiveIframes().filter((f) => f !== source);
    }

    function syncNavigation(sourceWin: Window, sourceFrame: HTMLIFrameElement, newUrl: string) {
      try {
        if (!newUrl || newUrl === 'about:blank' || newUrl.startsWith('javascript:')) return;
        const targetNormalized = getNormalizedPath(newUrl);
        if (!targetNormalized) return;

        if (lastActivePath.current === targetNormalized && isSyncingRoute.current) {
          return;
        }

        lastActivePath.current = targetNormalized;
        lockRouteSync(400);

        // Pre-update tracking for source frame
        lastKnownPaths.set(sourceFrame, targetNormalized);

        for (const targetFrame of getOtherIframes(sourceFrame)) {
          const targetWin = targetFrame.contentWindow;
          let targetDoc: Document | null = null;
          try {
            targetDoc = targetFrame.contentDocument;
          } catch {
            targetDoc = null;
          }
          if (!targetWin) continue;

          try {
            const currentHref = getSafeLocationHref(targetWin);
            const currentTargetNormalized = getNormalizedPath(currentHref);
            if (currentTargetNormalized === targetNormalized) {
              lastKnownPaths.set(targetFrame, targetNormalized);
              continue;
            }

            const fullTargetUrl = buildFrameUrl(targetWin, newUrl);
            lastKnownPaths.set(targetFrame, targetNormalized);

            // 1. First, attempt to trigger Next.js / SPA client routing by clicking matching anchor in targetDoc
            if (targetDoc) {
              try {
                const srcHref = getSafeLocationHref(sourceWin);
                const parsedTarget = new URL(newUrl, srcHref || (typeof window !== 'undefined' ? window.location.href : 'http://localhost'));
                const pathOnly = parsedTarget.pathname;
                const matchLink = targetDoc.querySelector(
                  `a[href="${CSS.escape(newUrl)}"], a[href="${CSS.escape(targetNormalized)}"], a[href="${CSS.escape(pathOnly)}"]`
                ) as HTMLAnchorElement | null;

                if (matchLink) {
                  const mouseEv = new ((targetWin as any).MouseEvent || MouseEvent)('click', {
                    bubbles: true,
                    cancelable: true,
                    view: targetWin,
                  });
                  (mouseEv as any).__rdx_synthetic = true;
                  matchLink.dispatchEvent(mouseEv);
                  if (typeof matchLink.click === 'function') {
                    try {
                      matchLink.click();
                    } catch {}
                  }
                }
              } catch {}
            }

            // 2. Direct browser navigation fallback if client route didn't update after microtask
            setTimeout(() => {
              try {
                const winNow = targetFrame.contentWindow;
                if (winNow) {
                  const nowNormalized = getNormalizedPath(getSafeLocationHref(winNow));
                  if (nowNormalized !== targetNormalized) {
                    winNow.location.assign(fullTargetUrl);
                  }
                }
              } catch {
                try {
                  targetFrame.src = fullTargetUrl;
                } catch {}
              }
            }, 80);
          } catch {}
        }
      } catch {}
    }

    function performScrollSync(source: HTMLIFrameElement, e?: Event) {
      if (activeScrollSource && activeScrollSource !== source) return;

      activeScrollSource = source;
      clearTimeout(scrollSourceTimer);
      scrollSourceTimer = setTimeout(() => {
        activeScrollSource = null;
      }, 60);

      const win = source.contentWindow;
      const doc = source.contentDocument;
      if (!win || !doc) return;

      const target = e?.target;
      const isDocOrWin =
        !target ||
        target === doc ||
        target === doc.documentElement ||
        target === doc.body ||
        target === win;

      if (isDocOrWin) {
        const scrollX = win.scrollX || doc.documentElement?.scrollLeft || doc.body?.scrollLeft || 0;
        const scrollY = win.scrollY || doc.documentElement?.scrollTop || doc.body?.scrollTop || 0;

        for (const targetFrame of getOtherIframes(source)) {
          applyScrollToFrame(targetFrame, scrollX, scrollY);
        }
      } else if (target && (target as HTMLElement).nodeType === 1) {
        const el = target as HTMLElement;
        const selector = buildSelector(el);
        const scrollX = el.scrollLeft;
        const scrollY = el.scrollTop;
        for (const targetFrame of getOtherIframes(source)) {
          applyScrollToFrame(targetFrame, scrollX, scrollY, selector);
        }
      }
    }

    function setupIframe(source: HTMLIFrameElement) {
      try {
        const win = source.contentWindow;
        let doc: Document | null = null;
        try {
          doc = source.contentDocument;
        } catch {
          return;
        }
        if (!win || !doc || attachedDocs.has(doc)) return;

        // Mark this document as attached to prevent duplicate event listeners
        attachedDocs.add(doc);

        // Check if another active iframe is already scrolled, and sync initial position immediately
        const activeIframes = getActiveIframes();
        const masterFrame = activeIframes.find(
          (f) => {
            try {
              return f !== source && (((f.contentWindow as any)?.scrollY || 0) > 0 || (f.contentDocument?.documentElement?.scrollTop || 0) > 0);
            } catch {
              return false;
            }
          }
        );
        if (masterFrame && masterFrame.contentWindow) {
          try {
            const sX = masterFrame.contentWindow.scrollX || masterFrame.contentDocument?.documentElement?.scrollLeft || 0;
            const sY = masterFrame.contentWindow.scrollY || masterFrame.contentDocument?.documentElement?.scrollTop || 0;
            if (sX > 0 || sY > 0) {
              applyScrollToFrame(source, sX, sY);
            }
          } catch {}
        }

        // ─── 1. Scroll & Wheel Synchronization ──────────────────────
        const handleScroll = (e: Event) => {
          if (e && (e as any).__rdx_synthetic) return;
          performScrollSync(source, e);
        };

        const handleWheel = (e: WheelEvent) => {
          if (e && (!e.isTrusted || (e as any).__rdx_synthetic)) return;
          performScrollSync(source);
        };

        win.addEventListener('scroll', handleScroll, { passive: true, capture: true });
        doc.addEventListener('scroll', handleScroll, { passive: true, capture: true });
        win.addEventListener('wheel', handleWheel, { passive: true, capture: true });
        doc.addEventListener('wheel', handleWheel, { passive: true, capture: true });

        cleanupFns.push(() => {
          win.removeEventListener('scroll', handleScroll, { capture: true });
          doc.removeEventListener('scroll', handleScroll, { capture: true });
          win.removeEventListener('wheel', handleWheel, { capture: true });
          doc.removeEventListener('wheel', handleWheel, { capture: true });
        });

        // ─── 2. Click, Tab, Button, and Custom Dropdown Mirroring ────
        const handleClick = (e: MouseEvent) => {
          if (!e.isTrusted || (e as any).__rdx_synthetic) return;
          if (isInputMirroring.current || isSyncingRoute.current) return;
          const targetEl = e.target as HTMLElement | null;
          if (!targetEl || targetEl.nodeType !== 1) return;

          // Ignore clicks on standard text/number inputs and textareas
          const tag = targetEl.tagName?.toLowerCase();
          const inputType = (targetEl as HTMLInputElement).type;
          if (
            (tag === 'input' && inputType !== 'checkbox' && inputType !== 'radio' && inputType !== 'button' && inputType !== 'submit') ||
            tag === 'textarea'
          ) {
            return;
          }

          // Check if clicking an anchor link for SPA / page navigation
          const link = targetEl.closest('a');
          if (link && link.href) {
            try {
              const srcHref = getSafeLocationHref(win);
              const linkUrl = new URL(link.href, srcHref || (typeof window !== 'undefined' ? window.location.href : 'http://localhost'));
              if (linkUrl.origin === (typeof window !== 'undefined' ? window.location.origin : '')) {
                syncNavigation(win, source, link.href);
              }
            } catch {}
          }

          const selector = buildSelector(targetEl);
          lockInputMirror(100);

          for (const targetFrame of getOtherIframes(source)) {
            let targetDoc: Document | null = null;
            try {
              targetDoc = targetFrame.contentDocument;
            } catch {
              continue;
            }
            const targetWin = targetFrame.contentWindow;
            if (!targetDoc || !targetWin) continue;

            const matched = findMatchingElement(targetDoc, targetEl, selector);
            if (matched) {
              try {
                // If it's a select element, focus and invoke showPicker()
                if (matched.tagName === 'SELECT') {
                  try {
                    (matched as HTMLSelectElement).focus({ preventScroll: true });
                  } catch {}
                  if (typeof (matched as HTMLSelectElement).showPicker === 'function') {
                    try {
                      (matched as HTMLSelectElement).showPicker();
                    } catch {}
                  }
                }

                // Handle details / summary disclosure dropdowns
                const sourceDetails = targetEl.closest('details');
                if (sourceDetails) {
                  const targetDetails = matched.closest('details');
                  if (targetDetails) {
                    targetDetails.open = !sourceDetails.open;
                  }
                }

                if (typeof matched.click === 'function') {
                  matched.click();
                } else {
                  const mouseEv = new ((targetWin as any).MouseEvent || MouseEvent)('click', {
                    bubbles: true,
                    cancelable: true,
                    view: targetWin,
                  });
                  (mouseEv as any).__rdx_synthetic = true;
                  matched.dispatchEvent(mouseEv);
                }
              } catch {}
            }
          }
        };

        doc.addEventListener('click', handleClick, true);
        cleanupFns.push(() => doc.removeEventListener('click', handleClick, true));

        // ─── 3. Route & History Interception for SPAs ────────────────
        if (!patchedWindows.has(win)) {
          patchedWindows.add(win);
          const originalPushState = win.history.pushState.bind(win.history);
          const originalReplaceState = win.history.replaceState.bind(win.history);

          win.history.pushState = function (...args) {
            const result = originalPushState(...args);
            try {
              const url = args[2] ? String(args[2]) : getSafeLocationHref(win);
              const normalized = getNormalizedPath(url);
              if (normalized && normalized !== lastActivePath.current) {
                syncNavigation(win, source, url);
              }
            } catch {}
            return result;
          };

          win.history.replaceState = function (...args) {
            const result = originalReplaceState(...args);
            try {
              const url = args[2] ? String(args[2]) : getSafeLocationHref(win);
              const normalized = getNormalizedPath(url);
              if (normalized && normalized !== lastActivePath.current) {
                syncNavigation(win, source, url);
              }
            } catch {}
            return result;
          };

          const handlePopState = () => {
            syncNavigation(win, source, getSafeLocationHref(win));
          };
          const handleHashChange = () => {
            syncNavigation(win, source, getSafeLocationHref(win));
          };

          win.addEventListener('popstate', handlePopState);
          win.addEventListener('hashchange', handleHashChange);

          cleanupFns.push(() => {
            win.history.pushState = originalPushState;
            win.history.replaceState = originalReplaceState;
            win.removeEventListener('popstate', handlePopState);
            win.removeEventListener('hashchange', handleHashChange);
          });
        }

        // ─── 4. Input & Form State Mirroring ─────────────────────────
        const handleInput = (e: Event) => {
          if ((e as any).__rdx_synthetic) return;
          if (isInputMirroring.current) return;
          const target = e.target as HTMLElement | null;
          if (!target || target.nodeType !== 1) return;

          const currentTag = target.tagName?.toLowerCase();
          if (currentTag !== 'input' && currentTag !== 'textarea' && currentTag !== 'select') {
            return;
          }

          lockInputMirror(60);
          const selector = buildSelector(target);
          if (!selector) return;

          const value = (target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value;
          const checked = (target as HTMLInputElement).checked;
          const selectedIndex = (target as HTMLSelectElement).selectedIndex;
          const currentType = (target as HTMLInputElement).type;

          for (const other of getOtherIframes(source)) {
            applyInputToFrame(other, { selector, value, checked, selectedIndex, type: currentType });
          }
        };

        doc.addEventListener('input', handleInput, true);
        doc.addEventListener('change', handleInput, true);
        cleanupFns.push(() => {
          doc.removeEventListener('input', handleInput, true);
          doc.removeEventListener('change', handleInput, true);
        });

        // ─── 5. Theme & HTML Class Mirroring ─────────────────────────
        if (doc.documentElement) {
          const observer = new MutationObserver(() => {
            if (isSyncingTheme.current) return;
            isSyncingTheme.current = true;
            try {
              const currentClass = doc.documentElement.className;
              const currentTheme = doc.documentElement.getAttribute('data-theme');
              for (const target of getOtherIframes(source)) {
                const targetDoc = target.contentDocument;
                if (!targetDoc || !targetDoc.documentElement) continue;
                if (targetDoc.documentElement.className !== currentClass) {
                  targetDoc.documentElement.className = currentClass;
                }
                if (
                  currentTheme !== null &&
                  targetDoc.documentElement.getAttribute('data-theme') !== currentTheme
                ) {
                  targetDoc.documentElement.setAttribute('data-theme', currentTheme);
                }
              }
            } finally {
              setTimeout(() => {
                isSyncingTheme.current = false;
              }, 50);
            }
          });

          observer.observe(doc.documentElement, {
            attributes: true,
            attributeFilter: ['class', 'data-theme'],
          });

          cleanupFns.push(() => observer.disconnect());
        }

        // ─── 6. Touch & Pointer Synchronization ──────────────────────
        let activeTouchSelector: string | null = null;

        const handleTouch = (e: TouchEvent) => {
          if (!e.isTrusted || (e as any).__rdx_synthetic) return;
          const target = e.target as HTMLElement;
          if (!target || target.nodeType !== 1) return;

          if (e.type === 'touchstart') {
            activeTouchSelector = buildSelector(target);
          }

          if (!activeTouchSelector) return;

          const rect = target.getBoundingClientRect();
          const touches = Array.from(e.changedTouches).map((t) => ({
            identifier: t.identifier,
            relX: rect.width > 0 ? (t.clientX - rect.left) / rect.width : 0,
            relY: rect.height > 0 ? (t.clientY - rect.top) / rect.height : 0,
          }));

          for (const other of getOtherIframes(source)) {
            applyTouchToFrame(other, e.type, activeTouchSelector, touches);
          }

          if (e.type === 'touchend' || e.type === 'touchcancel') {
            activeTouchSelector = null;
          }
        };

        doc.addEventListener('touchstart', handleTouch, { passive: true });
        doc.addEventListener('touchmove', handleTouch, { passive: true });
        doc.addEventListener('touchend', handleTouch, { passive: true });
        doc.addEventListener('touchcancel', handleTouch, { passive: true });

        cleanupFns.push(() => {
          doc.removeEventListener('touchstart', handleTouch);
          doc.removeEventListener('touchmove', handleTouch);
          doc.removeEventListener('touchend', handleTouch);
          doc.removeEventListener('touchcancel', handleTouch);
        });

        let activePointerSelector: string | null = null;

        const handlePointer = (e: PointerEvent) => {
          if (!e.isTrusted || (e as any).__rdx_synthetic) return;
          if (e.pointerType === 'mouse' && e.button !== 0) return;
          const target = e.target as HTMLElement;
          if (!target || target.nodeType !== 1) return;

          if (e.type === 'pointerdown') {
            activePointerSelector = buildSelector(target);
          }

          if (!activePointerSelector) return;

          const rect = target.getBoundingClientRect();
          const eventData = {
            pointerId: e.pointerId,
            pointerType: e.pointerType,
            relX: rect.width > 0 ? (e.clientX - rect.left) / rect.width : 0,
            relY: rect.height > 0 ? (e.clientY - rect.top) / rect.height : 0,
            button: e.button,
            buttons: e.buttons,
            isPrimary: e.isPrimary,
          };

          for (const other of getOtherIframes(source)) {
            applyPointerToFrame(other, e.type, activePointerSelector, eventData);
          }

          if (e.type === 'pointerup' || e.type === 'pointercancel') {
            activePointerSelector = null;
          }
        };

        doc.addEventListener('pointerdown', handlePointer, { passive: true });
        doc.addEventListener('pointermove', handlePointer, { passive: true });
        doc.addEventListener('pointerup', handlePointer, { passive: true });
        doc.addEventListener('pointercancel', handlePointer, { passive: true });

        cleanupFns.push(() => {
          doc.removeEventListener('pointerdown', handlePointer);
          doc.removeEventListener('pointermove', handlePointer);
          doc.removeEventListener('pointerup', handlePointer);
          doc.removeEventListener('pointercancel', handlePointer);
        });
      } catch {}
    }

    function checkAndAttachIframes() {
      const activeIframes = getActiveIframes();
      for (const iframe of activeIframes) {
        setupIframe(iframe);

        if (!attachedFrames.has(iframe)) {
          attachedFrames.add(iframe);
          const handleIframeLoad = () => {
            setupIframe(iframe);
            const win = iframe.contentWindow;
            if (win) {
              const currentPath = getNormalizedPath(getSafeLocationHref(win));
              if (currentPath && currentPath !== 'about:blank') {
                lastKnownPaths.set(iframe, currentPath);
              }
            }
          };
          iframe.addEventListener('load', handleIframeLoad);
          cleanupFns.push(() => iframe.removeEventListener('load', handleIframeLoad));
        }

        const win = iframe.contentWindow;
        if (win && !lastKnownPaths.has(iframe)) {
          try {
            lastKnownPaths.set(iframe, getNormalizedPath(getSafeLocationHref(win)));
          } catch {}
        }
      }

      // Continuous path sync: detect if any iframe navigated organically and synchronize the others
      if (!isSyncingRoute.current && activeIframes.length > 1) {
        for (const iframe of activeIframes) {
          const win = iframe.contentWindow;
          if (!win) continue;

          try {
            const currentHref = getSafeLocationHref(win);
            const currentPath = getNormalizedPath(currentHref);
            if (!currentPath || currentPath === 'about:blank') continue;

            const prevPath = lastKnownPaths.get(iframe);

            if (prevPath && currentPath !== prevPath) {
              lastKnownPaths.set(iframe, currentPath);
              lastActivePath.current = currentPath;
              syncNavigation(win, iframe, currentHref);
              break;
            } else {
              lastKnownPaths.set(iframe, currentPath);
            }
          } catch {}
        }
      }
    }

    // Initial check
    checkAndAttachIframes();

    // Fast polling interval (150ms) to immediately catch dynamically loaded/hydrated iframes
    const interval = setInterval(checkAndAttachIframes, 150);

    return () => {
      clearInterval(interval);
      clearTimeout(scrollSourceTimer);
      clearTimeout(inputLockTimer);
      clearTimeout(routeSyncTimer);
      for (const cleanup of cleanupFns) {
        cleanup();
      }
    };
  }, [iframeRefs, enabled]);
}
