import React from 'react';
import type { ControlBarProps } from '../types/index.js';
import { VIEWPORT_PRESETS } from '../constants/viewports.js';
import { DeviceIcon, CloseIcon, ZoomOutIcon, RespoLogoIcon, HelpIcon } from './Icons.js';

export function ControlBar({
  activeViewportIds,
  onToggleViewport,
  onClose,
  focusedId,
  onResetFocus,
  onStartTour,
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
