import React, { useRef, useState, useEffect, useCallback } from 'react';
import type { ViewportGridProps } from '../types/index.js';
import { ViewportFrame } from './ViewportFrame.js';
import { ScrollIndicator } from './ScrollIndicator.js';

export function ViewportGrid({
  activePresets,
  src,
  iframeRefs,
  focusedId,
  onToggleFocus,
  zoomMultiplier = 1.0,
  isAutoFit = true,
}: ViewportGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 1440,
    height: typeof window !== 'undefined' ? window.innerHeight : 900,
  }));
  const [isPanning, setIsPanning] = useState(false);
  const panStateRef = useRef({
    startX: 0,
    startY: 0,
    startScrollLeft: 0,
    startScrollTop: 0,
    hasMoved: false,
  });

  // Track window and container dimensions
  useEffect(() => {
    const updateSize = () => {
      const el = gridRef.current;
      setDimensions({
        width: (el && el.clientWidth > 0 ? el.clientWidth : window.innerWidth) || 1440,
        height: (el && el.clientHeight > 0 ? el.clientHeight : window.innerHeight) || 900,
      });
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    const el = gridRef.current;
    let observer: ResizeObserver | null = null;
    if (el) {
      observer = new ResizeObserver(updateSize);
      observer.observe(el);
    }

    return () => {
      window.removeEventListener('resize', updateSize);
      if (observer) observer.disconnect();
    };
  }, []);

  // Handle Ctrl/Meta + Mouse Wheel for smooth Canvas Zoom
  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    if (e.ctrlKey || e.metaKey) {
      return;
    }
  }, []);

  // Canvas Pan Interaction (drag background to pan)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const isBackground =
      target === gridRef.current ||
      target.classList.contains('rdx-workbench') ||
      target.classList.contains('rdx-stage') ||
      target.classList.contains('rdx-frame-slot');

    if (!isBackground) return;
    if (e.button !== 0 && e.button !== 1) return; // Left or Middle click

    const container = gridRef.current;
    if (!container) return;

    panStateRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startScrollLeft: container.scrollLeft,
      startScrollTop: container.scrollTop,
      hasMoved: false,
    };

    setIsPanning(true);

    const onPointerMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - panStateRef.current.startX;
      const dy = moveEvent.clientY - panStateRef.current.startY;

      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        panStateRef.current.hasMoved = true;
      }

      container.scrollLeft = panStateRef.current.startScrollLeft - dx;
      container.scrollTop = panStateRef.current.startScrollTop - dy;
    };

    const onPointerUp = () => {
      setIsPanning(false);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  if (activePresets.length === 0) {
    return (
      <div className="rdx-workbench" ref={gridRef}>
        <div className="rdx-empty">
          <div className="rdx-empty__card">
            <span className="rdx-empty__icon">⊞</span>
            <span className="rdx-empty__text">No active viewports</span>
            <span className="rdx-empty__sub">Select a device from the command dock above</span>
          </div>
        </div>
      </div>
    );
  }

  // Available space inside workbench canvas (deducting top dock, bottom bar, and side margins)
  const availableWidth = Math.max(240, dimensions.width - 60);
  const availableHeight = Math.max(240, dimensions.height - 110);

  // 1. Calculate unscaled combined width (including bezels and inter-device gaps) and max height
  const GAP = 24;
  const bezelPaddingPerPreset = 16;
  const totalUnscaledWidth =
    activePresets.reduce(
      (sum, p) => sum + p.width + (p.device === 'desktop' ? 2 : bezelPaddingPerPreset),
      0
    ) + Math.max(0, activePresets.length - 1) * GAP;

  const maxUnscaledHeight = activePresets.reduce((max, p) => {
    const extraH = p.device === 'desktop' ? 36 : bezelPaddingPerPreset;
    return Math.max(max, p.height + extraH + 32); // 32 for header strip
  }, 0);

  // 2. Intelligent Auto-Fit Scale: Fits all active presets completely on screen simultaneously with safety margin
  const fitScaleX = availableWidth / Math.max(1, totalUnscaledWidth);
  const fitScaleY = availableHeight / Math.max(1, maxUnscaledHeight);
  const autoFitScale = Math.min(1.0, Math.max(0.15, Math.min(fitScaleX, fitScaleY) * 0.96));

  // 3. Multi-view scale (auto-fit by default, or adjusted by zoomMultiplier)
  const multiScale = isAutoFit
    ? autoFitScale
    : Math.min(1.5, Math.max(0.15, autoFitScale * zoomMultiplier));

  // 4. Focus Scale (when a single device is focused)
  const focusedPreset = focusedId ? activePresets.find((p) => p.id === focusedId) : null;
  let focusScale = 1.0;
  if (focusedPreset) {
    const extraHeader = focusedPreset.device === 'desktop' ? 36 : bezelPaddingPerPreset;
    const totalHeight = focusedPreset.height + extraHeader + 32;
    const focusFitScale = Math.min(
      1.0,
      Math.min(availableWidth / (focusedPreset.width + (focusedPreset.device === 'desktop' ? 2 : bezelPaddingPerPreset)), availableHeight / totalHeight) * 0.96
    );
    focusScale = isAutoFit
      ? focusFitScale
      : Math.min(1.5, Math.max(0.15, focusFitScale * zoomMultiplier));
  }

  return (
    <div
      className={`rdx-workbench${focusedId ? ' rdx-workbench--focused' : ''}${
        isPanning ? ' rdx-workbench--panning' : ''
      }`}
      ref={gridRef}
      onPointerDown={handlePointerDown}
      onWheel={handleWheel}
      onClick={(e) => {
        // If clicking canvas background without dragging during focus mode, reset to multi-view
        if (
          !panStateRef.current.hasMoved &&
          (e.target === gridRef.current || (e.target as HTMLElement).classList.contains('rdx-stage')) &&
          focusedId &&
          onToggleFocus
        ) {
          onToggleFocus(focusedId);
        }
      }}
    >
      <div className={`rdx-stage${focusedId ? ' rdx-stage--focused' : ''}`}>
        {activePresets.map((preset, index) => {
          const isFocused = focusedId === preset.id;
          const isBlurred = focusedId !== null && !isFocused;
          const currentScale = isFocused ? focusScale : multiScale;

          return (
            <div
              key={preset.id}
              className={`rdx-frame-slot${
                isFocused ? ' rdx-frame-slot--focused' : ''
              }${isBlurred ? ' rdx-frame-slot--blurred' : ''}`}
            >
              <ViewportFrame
                preset={preset}
                src={src}
                scale={currentScale}
                iframeRef={iframeRefs[index] ?? { current: null }}
                isFocused={isFocused}
                isBlurred={isBlurred}
                onToggleFocus={onToggleFocus}
              />
            </div>
          );
        })}
      </div>

      {/* Theme-designed Custom Scroll Indicator (Persistent & Constant) */}
      <ScrollIndicator containerRef={gridRef} />
    </div>
  );
}
