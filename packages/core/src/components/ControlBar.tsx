import React from 'react';
import type { ControlBarProps } from '../types/index.js';
import { VIEWPORT_PRESETS } from '../constants/viewports.js';
import { DeviceIcon, CloseIcon, ZoomOutIcon, RespoLogoIcon, HelpIcon, MinusIcon, PlusIcon, FitScreenIcon } from './Icons.js';

export function ControlBar({
  activeViewportIds,
  onToggleViewport,
  onClose,
  focusedId,
  onResetFocus,
  onStartTour,
  zoomLevel,
  isAutoFit,
  onZoomIn,
  onZoomOut,
  onZoomFit,
}: ControlBarProps) {

  return (
    <div className="rdx-dock" role="toolbar" aria-label="Respo DX Command Dock">
      {/* Animated container edge beam */}
      <div className="rdx-dock__edge-beam" aria-hidden="true" />

      {/* Brand logo */}
      <div className="rdx-dock__brand">
        <RespoLogoIcon className="rdx-dock__logo-icon" size={16} />
        <span className="rdx-dock__logo">
          RESPO<span className="rdx-dock__badge">.DX</span>
        </span>
      </div>

      {/* Segmented Switcher Presets */}
      <div className="rdx-dock__presets" role="group" aria-label="Viewport toggles">
        {VIEWPORT_PRESETS.map((preset) => {
          const isActive = activeViewportIds.includes(preset.id);
          const isFocused = focusedId === preset.id;
          const label = preset.device.toUpperCase();

          return (
            <button
              key={preset.id}
              className={`rdx-dock-btn${isActive ? ' rdx-dock-btn--active' : ''}${isFocused ? ' rdx-dock-btn--focused' : ''}`}
              onClick={() => onToggleViewport(preset.id)}
              aria-pressed={isActive}
              title={isFocused ? `${preset.label} (Focused)` : `Toggle ${preset.label}`}
            >
              <DeviceIcon device={preset.device} className="rdx-dock-btn__icon" />
              <span className="rdx-dock-btn__label">{label}</span>
            </button>
          );
        })}
      </div>

      {/* Reset Focus Indicator Button */}
      {focusedId && onResetFocus && (
        <button
          className="rdx-dock-reset-btn"
          onClick={onResetFocus}
          title="Reset to Multi-View (Esc)"
          aria-label="Reset to Multi-View"
        >
          <ZoomOutIcon />
          <span>MULTI-VIEW</span>
        </button>
      )}

      {/* Canvas Zoom & Fit Controller */}
      {onZoomIn && onZoomOut && onZoomFit && (
        <div className="rdx-dock__zoom" role="group" aria-label="Canvas Zoom Controls">
          <button
            className="rdx-dock-zoom-btn"
            onClick={onZoomOut}
            title="Zoom Out (Ctrl + Scroll Down)"
            aria-label="Zoom Out"
          >
            <MinusIcon />
          </button>
          <button
            className={`rdx-dock-zoom-val${isAutoFit ? ' rdx-dock-zoom-val--fit' : ''}`}
            onClick={onZoomFit}
            title={isAutoFit ? 'Auto-Fit Active (Click for 100%)' : 'Fit All to Screen (Click for Auto-Fit)'}
            aria-label={isAutoFit ? 'Auto-Fit Active' : 'Fit All to Screen'}
          >
            {isAutoFit ? (
              <>
                <FitScreenIcon />
                <span>FIT</span>
              </>
            ) : (
              <span>{Math.round((zoomLevel ?? 1) * 100)}%</span>
            )}
          </button>
          <button
            className="rdx-dock-zoom-btn"
            onClick={onZoomIn}
            title="Zoom In (Ctrl + Scroll Up)"
            aria-label="Zoom In"
          >
            <PlusIcon />
          </button>
        </div>
      )}

      {/* Actions: Tour & Close */}

      <div className="rdx-dock__actions">
        {onStartTour && (
          <button
            className="rdx-dock-help-btn"
            onClick={onStartTour}
            aria-label="Open quick tour"
            title="Quick Tour"
          >
            <HelpIcon />
          </button>
        )}
        <button
          className="rdx-dock-close-btn"
          onClick={onClose}
          aria-label="Close preview"
          title="Close (Esc)"
        >
          <CloseIcon />
        </button>
      </div>
    </div>
  );
}
