import React from 'react';
import type { ViewportFrameProps } from '../types/index.js';
import { DeviceIcon, LockIcon, ZoomInIcon, ZoomOutIcon } from './Icons.js';

export function ViewportFrame({
  preset,
  src,
  scale,
  iframeRef,
  isFocused,
  isBlurred,
  onToggleFocus,
}: ViewportFrameProps) {
  const scaledWidth = Math.round(preset.width * scale);
  const scaledHeight = Math.round(preset.height * scale);

  // Append frame parameter to prevent widget self-mounting
  const frameSrc = src
    ? `${src}${src.includes('?') ? '&' : '?'}rdx_frame=1`
    : '';

  // Use stable initial src so React does not recreate or reload the iframe when parent re-renders
  const initialSrcRef = React.useRef(frameSrc);

  const [currentUrl, setCurrentUrl] = React.useState(src);

  React.useEffect(() => {
    const iframe = (iframeRef as React.RefObject<HTMLIFrameElement>)?.current;
    if (!iframe) return;

    const updateUrl = () => {
      try {
        const win = iframe.contentWindow;
        if (!win) return;
        let href: string | null = null;
        try {
          href = typeof win.location?.href === 'string' ? win.location.href : null;
        } catch {
          href = null;
        }
        if (href) {
          setCurrentUrl((prev) => (prev !== href ? href : prev));
        }
      } catch {}
    };

    iframe.addEventListener('load', updateUrl);
    const interval = setInterval(updateUrl, 250);
    return () => {
      iframe.removeEventListener('load', updateUrl);
      clearInterval(interval);
    };
  }, [iframeRef]);

  // Extract hostname, pathname, and hash for the address bar
  let displayUrl = 'localhost:3000';
  if (currentUrl) {
    try {
      const urlObj = new URL(currentUrl);
      urlObj.searchParams.delete('rdx_frame');
      const searchStr = urlObj.search ? urlObj.search : '';
      const hashStr = urlObj.hash ? urlObj.hash : '';
      displayUrl = `${urlObj.host}${urlObj.pathname === '/' && !searchStr && !hashStr ? '' : urlObj.pathname}${searchStr}${hashStr}`;
    } catch {
      displayUrl = currentUrl;
    }
  }

  const isMobile = preset.device === 'mobile';
  const isTablet = preset.device === 'tablet';
  const isDesktop = preset.device === 'desktop';

  return (
    <div
      className={`rdx-frame-wrapper${isFocused ? ' rdx-frame-wrapper--focused' : ''}${isBlurred ? ' rdx-frame-wrapper--blurred' : ''}`}
    >
      {/* Minimal clean header strip above frame */}
      <div className="rdx-frame-header" style={{ width: scaledWidth }}>
        <div className="rdx-frame-header__left">
          <DeviceIcon device={preset.device} className="rdx-frame-header__icon" />
          <span className="rdx-frame-header__name">{preset.device.toUpperCase()}</span>
          <span className="rdx-frame-header__dim">{preset.width}px</span>
        </div>

        {/* Zoom & Focus Button */}
        <div className="rdx-frame-header__right">
          {onToggleFocus && (
            <button
              className={`rdx-frame-zoom-btn${isFocused ? ' rdx-frame-zoom-btn--active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleFocus(preset.id);
              }}
              title={isFocused ? 'Reset Multi-View (Esc)' : `Zoom & Focus ${preset.label}`}
              aria-label={isFocused ? 'Reset Multi-View' : `Zoom & Focus ${preset.label}`}
            >
              {isFocused ? <ZoomOutIcon /> : <ZoomInIcon />}
              <span className="rdx-frame-zoom-btn__label">
                {isFocused ? 'RESET' : 'FOCUS'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Realistic Hardware Frame */}
      <div
        className={`rdx-device rdx-device--${preset.device}${isFocused ? ' rdx-device--focused' : ''}`}
        style={{
          width: scaledWidth,
          height: isDesktop ? scaledHeight + Math.round(36 * scale) : scaledHeight,
        }}
      >
        {/* Mobile Notch Simulation */}
        {isMobile && (
          <div
            className="rdx-notch"
            style={{
              width: Math.round(110 * scale),
              height: Math.max(10, Math.round(16 * scale)),
            }}
          />
        )}

        {/* Desktop Mac-style Window Header */}
        {isDesktop && (
          <div
            className="rdx-mac-header"
            style={{
              height: Math.round(36 * scale),
              padding: `0 ${Math.round(12 * scale)}px`,
            }}
          >
            <div className="rdx-mac-dots">
              <span className="rdx-mac-dot rdx-mac-dot--close" />
              <span className="rdx-mac-dot rdx-mac-dot--min" />
              <span className="rdx-mac-dot rdx-mac-dot--max" />
            </div>
            <div className="rdx-mac-url">
              <LockIcon className="rdx-mac-url__icon" />
              <span className="rdx-mac-url__text">{displayUrl}</span>
            </div>
          </div>
        )}

        {/* Iframe Viewport Container */}
        <div
          className="rdx-iframe-viewport"
          style={{ width: scaledWidth, height: scaledHeight }}
        >
          <iframe
            ref={iframeRef as React.RefObject<HTMLIFrameElement>}
            src={initialSrcRef.current}
            width={preset.width}
            height={preset.height}
            style={{
              transformOrigin: 'top left',
              transform: `scale(${scale})`,
              width: preset.width,
              height: preset.height,
              pointerEvents: 'auto',
            }}
            title={`${preset.label} preview`}
            loading="eager"
          />
        </div>
      </div>
    </div>
  );
}
