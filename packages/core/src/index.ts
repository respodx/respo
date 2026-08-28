'use client';

import React from 'react';
import type { DevWidgetProps } from './types/index.js';

// Internal component — do not export directly
import { DevWidget } from './components/DevWidget.js';

declare const process: { env: { NODE_ENV?: string } } | undefined;

/**
 * ResponsiveDX — zero-config responsive testing widget.
 *
 * Drop this into your root layout. It renders nothing in production.
 *
 * @example
 * // Next.js App Router (app/layout.tsx)
 * import { ResponsiveDX } from 'responsive-dx';
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         {children}
 *         <ResponsiveDX />
 *       </body>
 *     </html>
 *   );
 * }
 */
export function ResponsiveDX(props: DevWidgetProps): React.ReactElement | null {
  if (
    typeof process !== 'undefined' &&
    process.env &&
    process.env.NODE_ENV !== 'development' &&
    !props?.enabled
  ) {
    return null;
  }
  return React.createElement(DevWidget, props);
}

// Export types for consumers who want to type their own wrappers
export type { DevWidgetProps, ViewportPreset } from './types/index.js';
export { VIEWPORT_PRESETS } from './constants/viewports.js';
