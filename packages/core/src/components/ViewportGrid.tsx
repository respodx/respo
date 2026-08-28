import React, { useRef } from 'react';
import type { ViewportGridProps } from '../types/index.js';
import { ViewportFrame } from './ViewportFrame.js';

export function ViewportGrid({
  activePresets,
  src,
  iframeRefs,
  focusedId,
  onToggleFocus,
}: ViewportGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);

  if (activePresets.length === 0) {
    return (
      <div className="rdx-workbench">
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

  const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1440;
  const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 900;
  const availableWidth = Math.max(320, windowWidth - 100);
  const availableHeight = Math.max(300, windowHeight - 150);
  const tallestPreset = activePresets.reduce((a, b) => (a.height > b.height ? a : b));

  // Multi-view proportional scale
  const multiScale = Math.min(0.85, Math.max(0.35, (windowHeight - 180) / (tallestPreset.height + 40)));

  // If a device is focused, find its preset and calculate maximum full-view scale
  const focusedPreset = focusedId ? activePresets.find((p) => p.id === focusedId) : null;
  let focusScale = 1.0;
  if (focusedPreset) {
    const extraHeader = focusedPreset.device === 'desktop' ? 36 : 0;
    const totalHeight = focusedPreset.height + extraHeader + 32;
    // Scale up to fit full screen width/height with comfortable margins
    focusScale = Math.min(1.0, Math.min(availableWidth / focusedPreset.width, availableHeight / totalHeight));
  }

  return (
    <div
      className={`rdx-workbench${focusedId ? ' rdx-workbench--focused' : ''}`}
      ref={gridRef}
      onClick={(e) => {
        // If clicking the canvas background during focus mode, reset to multi-view
        if (e.target === gridRef.current && focusedId && onToggleFocus) {
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
              className={`rdx-frame-slot${isFocused ? ' rdx-frame-slot--focused' : ''}${isBlurred ? ' rdx-frame-slot--blurred' : ''}`}
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
    </div>
  );
}
