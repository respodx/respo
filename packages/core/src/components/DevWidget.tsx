'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { isTopFrame } from '../lib/is-top-frame.js';
import { useShadowMount } from '../hooks/useShadowMount.js';
import { useEventMirror } from '../hooks/useEventMirror.js';
import { ControlBar } from './ControlBar.js';
import { ViewportGrid } from './ViewportGrid.js';
import { OnboardingTour } from './OnboardingTour.js';
import { GridIcon } from './Icons.js';
import { VIEWPORT_PRESETS, DEFAULT_ACTIVE_VIEWPORTS } from '../constants/viewports.js';
import type { DevWidgetProps } from '../types/index.js';
import widgetCss from '../styles/widget.css?raw';

export function DevWidget(props: DevWidgetProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isTopFrame()) return null;
  return <DevWidgetInner {...props} />;
}

function DevWidgetInner({ src: srcProp, defaultViewports = DEFAULT_ACTIVE_VIEWPORTS }: DevWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [activeIds, setActiveIds] = useState<string[]>(defaultViewports);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [zoomMultiplier, setZoomMultiplier] = useState(1.0);
  const [isAutoFit, setIsAutoFit] = useState(true);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const shadowRoot = useShadowMount(widgetCss);


  // Auto theme detection (system preference + document class/attribute)
  useEffect(() => {
    function detectTheme() {
      const isExplicitDark =
        document.documentElement.classList.contains('dark') ||
        document.documentElement.getAttribute('data-theme') === 'dark';
      const isExplicitLight =
        document.documentElement.classList.contains('light') ||
        document.documentElement.getAttribute('data-theme') === 'light';

      if (isExplicitDark) {
        setTheme('dark');
      } else if (isExplicitLight) {
        setTheme('light');
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(prefersDark ? 'dark' : 'light');
      }
    }

    detectTheme();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = () => detectTheme();
    mediaQuery.addEventListener('change', handleMediaChange);

    const observer = new MutationObserver(detectTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme'],
    });

    return () => {
      mediaQuery.removeEventListener('change', handleMediaChange);
      observer.disconnect();
    };
  }, []);

  const handleOpenStudio = () => {
    setIsOpen(true);
  };

  const handleCloseTour = () => {
    setShowTour(false);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('rdx_tour_seen', 'true');
      }
    } catch {
      // Ignore localStorage errors
    }
  };

  const handleStartTour = () => {
    setShowTour(true);
  };

  const handleZoomIn = () => {
    setIsAutoFit(false);
    setZoomMultiplier((prev) => Math.min(2.0, Math.round((prev + 0.15) * 100) / 100));
  };

  const handleZoomOut = () => {
    setIsAutoFit(false);
    setZoomMultiplier((prev) => Math.max(0.3, Math.round((prev - 0.15) * 100) / 100));
  };

  const handleZoomFit = () => {
    if (isAutoFit) {
      setIsAutoFit(false);
      setZoomMultiplier(1.0);
    } else {
      setIsAutoFit(true);
      setZoomMultiplier(1.0);
    }
  };

  // Handle Escape, ?, and Zoom Hotkeys
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!isOpen) return;

      const targetTag = (e.target as HTMLElement)?.tagName;
      const isTyping = targetTag === 'INPUT' || targetTag === 'TEXTAREA' || targetTag === 'SELECT';

      if (e.key === 'Escape') {
        if (showTour) {
          handleCloseTour();
        } else if (focusedId) {
          setFocusedId(null);
        } else {
          setIsOpen(false);
        }
      } else if (e.key === '?' && !isTyping) {
        setShowTour((prev) => !prev);
      } else if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        handleZoomIn();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === '-' || e.key === '_')) {
        e.preventDefault();
        handleZoomOut();
      } else if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        handleZoomFit();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, focusedId, showTour, isAutoFit]);

  // Create stable refs matching the number of presets
  const ref0 = useRef<HTMLIFrameElement | null>(null);
  const ref1 = useRef<HTMLIFrameElement | null>(null);
  const ref2 = useRef<HTMLIFrameElement | null>(null);
  const iframeRefs = React.useMemo(() => [ref0, ref1, ref2], []);

  useEventMirror(iframeRefs, isOpen);

  if (!shadowRoot) return null;

  const src =
    srcProp ??
    (typeof window !== 'undefined' ? window.location.href : '');

  const activePresets = VIEWPORT_PRESETS.filter((p) => activeIds.includes(p.id));

  function handleToggleViewport(id: string) {
    if (focusedId && focusedId !== id) {
      setFocusedId(id);
      if (!activeIds.includes(id)) {
        setActiveIds((prev) => [...prev, id]);
      }
      return;
    }

    setActiveIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );

    if (focusedId === id) {
      setFocusedId(null);
    }
  }

  function handleToggleFocus(id: string) {
    setFocusedId((prev) => (prev === id ? null : id));
  }

  return createPortal(
    <div data-theme={theme} style={{ pointerEvents: 'auto' }}>
      {/* Floating Action Button (Icon only) */}
      {!isOpen && (
        <button
          className="rdx-fab"
          onClick={handleOpenStudio}
          aria-label="Open responsive preview"
          title="Open Respo DX (Responsive Workbench)"
        >
          <GridIcon />
        </button>
      )}

      {/* Full Workbench Panel */}
      {isOpen && (
        <div ref={panelRef} className="rdx-panel" role="dialog" aria-label="Responsive preview workbench">
          <ControlBar
            activeViewportIds={activeIds}
            onToggleViewport={handleToggleViewport}
            onClose={() => setIsOpen(false)}
            focusedId={focusedId}
            onResetFocus={() => setFocusedId(null)}
            onStartTour={handleStartTour}
            zoomLevel={zoomMultiplier}
            isAutoFit={isAutoFit}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onZoomFit={handleZoomFit}
          />
          <ViewportGrid
            activePresets={activePresets}
            src={src}
            iframeRefs={iframeRefs}
            focusedId={focusedId}
            onToggleFocus={handleToggleFocus}
            zoomMultiplier={zoomMultiplier}
            isAutoFit={isAutoFit}
          />
          {showTour && (
            <OnboardingTour
              rootElement={panelRef.current}
              onClose={handleCloseTour}
            />
          )}
        </div>
      )}
    </div>,
    shadowRoot
  );
}

