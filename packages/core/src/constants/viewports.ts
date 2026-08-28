import type { ViewportPreset } from '../types/index.js';

export const VIEWPORT_PRESETS: ViewportPreset[] = [
  {
    id: 'mobile-375',
    label: 'Mobile — 375px',
    device: 'mobile',
    width: 375,
    height: 812,
  },
  {
    id: 'tablet-768',
    label: 'Tablet — 768px',
    device: 'tablet',
    width: 768,
    height: 1024,
  },
  {
    id: 'desktop-1440',
    label: 'Desktop — 1440px',
    device: 'desktop',
    width: 1440,
    height: 900,
  },
];

export const DEFAULT_ACTIVE_VIEWPORTS: string[] = [
  'mobile-375',
  'tablet-768',
  'desktop-1440',
];

/** Z-index for the shadow host element */
export const WIDGET_Z_INDEX = 999999;

/** ID of the host div injected into document.body */
export const SHADOW_HOST_ID = 'responsive-dx-root';
