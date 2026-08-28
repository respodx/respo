import React, { useEffect } from 'react';
import { CloseIcon, RespoLogoIcon, DeviceIcon, ZoomOutIcon, HelpIcon } from './Icons.js';

interface OnboardingTourProps {
  onClose: () => void;
  rootElement?: HTMLElement | null | undefined;
}

export function OnboardingTour({ onClose }: OnboardingTourProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="rdx-modal-container" role="dialog" aria-label="Respo DX Quick Guide">
      {/* Dimmed backdrop with blur and click-to-close */}
      <div className="rdx-modal-backdrop" onClick={onClose} />

      {/* Centered Glassmorphic Modal Card */}
      <div className="rdx-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="rdx-modal-header">
          <div className="rdx-modal-brand">
            <RespoLogoIcon className="rdx-modal-logo-icon" size={16} />
            <span className="rdx-modal-title">
              RESPO<span className="rdx-modal-badge">.DX</span>
            </span>
            <span className="rdx-modal-version">v0.2.0</span>
          </div>

          <button
            className="rdx-modal-close"
            onClick={onClose}
            aria-label="Close guide"
            title="Close guide (Esc)"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Body Guide Grid */}
        <div className="rdx-modal-body">
          <div className="rdx-guide-grid">
            {/* Feature 1: Multi-Viewport */}
            <div className="rdx-guide-card">
              <div className="rdx-guide-card__header">
                <div className="rdx-guide-card__icon">
                  <DeviceIcon device="mobile" size={14} />
                </div>
                <h4 className="rdx-guide-card__title">Multi-Viewport Matrix</h4>
              </div>
              <p className="rdx-guide-card__desc">
                Simultaneously test <strong>Mobile (375px)</strong>, <strong>Tablet (768px)</strong>, and <strong>Desktop (1440px)</strong> side-by-side in real-time.
              </p>
            </div>

            {/* Feature 2: Event Mirroring */}
            <div className="rdx-guide-card">
              <div className="rdx-guide-card__header">
                <div className="rdx-guide-card__icon">
                  <span>⚡</span>
                </div>
                <h4 className="rdx-guide-card__title">Live Event Mirroring</h4>
              </div>
              <p className="rdx-guide-card__desc">
                Scroll coordinates, link clicks, form inputs, and custom dropdowns mirror instantly across all active viewports without lag.
              </p>
            </div>

            {/* Feature 3: Single-View Focus */}
            <div className="rdx-guide-card">
              <div className="rdx-guide-card__header">
                <div className="rdx-guide-card__icon">
                  <ZoomOutIcon size={14} />
                </div>
                <h4 className="rdx-guide-card__title">Single-View Focus</h4>
              </div>
              <p className="rdx-guide-card__desc">
                Click <code>[ ⛶ FOCUS ]</code> on any device header to zoom that frame to 100% full view. Press <code>Esc</code> to return.
              </p>
            </div>

            {/* Feature 4: Theme Sync */}
            <div className="rdx-guide-card">
              <div className="rdx-guide-card__header">
                <div className="rdx-guide-card__icon">
                  <span>🌓</span>
                </div>
                <h4 className="rdx-guide-card__title">Theme Auto-Sync</h4>
              </div>
              <p className="rdx-guide-card__desc">
                Automatically detects and mirrors dark/light mode via system settings, Tailwind <code>class="dark"</code>, or <code>data-theme</code>.
              </p>
            </div>
          </div>

          {/* Keyboard Shortcuts Bar */}
          <div className="rdx-shortcuts-bar">
            <span className="rdx-shortcuts-bar__label">KEYBOARD SHORTCUTS:</span>
            <div className="rdx-shortcuts-list">
              <div className="rdx-shortcut-item">
                <kbd>Esc</kbd>
                <span>Close / Exit Focus</span>
              </div>
              <div className="rdx-shortcut-item">
                <kbd>?</kbd>
                <span>Toggle Guide</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="rdx-modal-footer">
          <span className="rdx-modal-footer__sub">0 Dependencies &bull; Zero Production Footprint</span>
          <button className="rdx-modal-btn rdx-modal-btn--primary" onClick={onClose}>
            GOT IT
          </button>
        </div>
      </div>
    </div>
  );
}
