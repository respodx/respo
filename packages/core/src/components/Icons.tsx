import React from 'react';

/**
 * Bold 2-Viewport Responsive Brand Mark (Desktop + Mobile)
 * High-contrast, razor-sharp vector geometry that remains boldly visible at tiny sizes.
 */
export function RespoLogoIcon({ className = '', size = 18 }: { className?: string; size?: number }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Bold Desktop Screen */}
      <path d="M2.5 16V5.5a2 2 0 0 1 2-2h15a2 2 0 0 1 2 2V16" />
      <path d="M2.5 16h4.5" />
      <path d="M17 16h4.5" />
      {/* Bold Mobile Phone in Foreground */}
      <rect x="8" y="7.5" width="8" height="13" rx="1.8" />
      <path d="M11 17.5h2" strokeWidth="1.6" />
    </svg>
  );
}

export function SmartphoneIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="12" height="20" x="6" y="2" rx="2" />
      <path d="M12 18h.01" />
    </svg>
  );
}

export function TabletIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="16" x="3" y="4" rx="2" />
      <path d="M12 16h.01" />
    </svg>
  );
}

export function MonitorIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="14" x="2" y="3" rx="2" />
      <line x1="8" x2="16" y1="21" y2="21" />
      <line x1="12" x2="12" y1="17" y2="21" />
    </svg>
  );
}

export function ZoomInIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h6v6" />
      <path d="M9 21H3v-6" />
      <path d="M21 3l-7 7" />
      <path d="M3 21l7-7" />
    </svg>
  );
}

export function ZoomOutIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 14h6v6" />
      <path d="M20 10h-6V4" />
      <path d="M14 10l7-7" />
      <path d="M3 21l7-7" />
    </svg>
  );
}

export function LockIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export function CloseIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

export function HelpIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={className} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </svg>
  );
}

export function GridIcon({ className = '' }: { className?: string }) {
  return <RespoLogoIcon className={className} size={20} />;
}

export function DeviceIcon({ device, className = '' }: { device: 'mobile' | 'tablet' | 'desktop'; className?: string }) {
  if (device === 'mobile') return <SmartphoneIcon className={className} />;
  if (device === 'tablet') return <TabletIcon className={className} />;
  return <MonitorIcon className={className} />;
}
