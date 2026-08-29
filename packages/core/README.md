# Respo DX

Zero-config in-browser responsive workbench suite for localhost. Test mobile, tablet, and desktop layouts simultaneously with direct DOM event mirroring, live theme synchronization, and isolated hardware bezels.

[![npm version](https://img.shields.io/npm/v/responsive-dx.svg?style=flat-square)](https://www.npmjs.com/package/responsive-dx)
[![license](https://img.shields.io/badge/license-MIT-black.svg?style=flat-square)](LICENSE)

<br />

<img src="./assets/demo.gif" alt="Respo DX Multi-Viewport Responsive Preview Demo" width="100%" style="border-radius: 6px; box-shadow: 0 12px 32px rgba(0,0,0,0.4);" />

---

## Overview

Respo DX provides an in-browser multi-viewport testing environment directly inside your local development server.

| Feature | Chrome DevTools | Respo DX |
| :--- | :--- | :--- |
| **Multi-Device View** | Single viewport | Mobile, Tablet, and Desktop side-by-side |
| **Scroll Sync** | Not supported | Zero-latency DOM scroll mirroring |
| **Click & Navigation Sync** | Not supported | Synchronized link clicks and navigation |
| **Form Input Mirroring** | Not supported | Real-time input, textarea, and select mirroring |
| **Theme Sync** | Manual toggle per tab | Automatic sync with system and class/data theme changes |
| **Single-View Focus** | Rescales entire window | One-click focus mode (`Esc` to exit) |
| **Runtime Dependencies** | None | 0 external runtime dependencies |
| **Team Standardization** | Manual emulator presets | Configured via project `devDependencies` |
| **Hardware Bezels** | Basic frame | Device frames with notch and macOS header |

---

## Features

- **Zero Runtime Dependencies**: No external sub-dependencies, install scripts, or security bloat.
- **Direct DOM Event Mirroring**: Real-time scroll, click, and form input synchronization without proxy servers or `postMessage` serialization overhead.
- **Dynamic Theme Synchronization**: Observes `prefers-color-scheme`, `data-theme`, and class-based theme switches on `document.documentElement` to mirror styles across frames.
- **Single-View Focus Mode**: Focus any viewport to inspect it at 100% scale. Press `Escape` to return to multi-view.
- **Shadow DOM Isolation**: UI, controls, and frame chassis render inside an isolated Shadow Root to prevent CSS conflicts with host applications.
- **Zero Production Footprint**: Evaluates to `null` outside development environments (`process.env.NODE_ENV !== 'development'`) and is completely removed during production bundling.

---

## Quick Start

### Automated Setup

Run inside any React, Next.js, Vite, Remix, or Astro project:

```bash
npx responsive-dx init
```

The CLI detects your framework, installs `responsive-dx` as a devDependency, and injects `<ResponsiveDX />` into your root layout.

---

### Manual Setup

#### 1. Install Package

```bash
# pnpm
pnpm add -D responsive-dx

# npm
npm install -D responsive-dx

# yarn
yarn add -D responsive-dx

# bun
bun add -d responsive-dx
```

#### 2. Add to Root Layout

**Next.js App Router (`app/layout.tsx`)**
```tsx
import { ResponsiveDX } from 'responsive-dx';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <ResponsiveDX />
      </body>
    </html>
  );
}
```

**Next.js Pages Router (`pages/_app.tsx`)**
```tsx
import type { AppProps } from 'next/app';
import { ResponsiveDX } from 'responsive-dx';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <ResponsiveDX />
    </>
  );
}
```

**Vite + React (`src/main.tsx` / `src/App.tsx`)**
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ResponsiveDX } from 'responsive-dx';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <ResponsiveDX />
  </React.StrictMode>
);
```

**Remix / React Router v7 (`app/root.tsx`)**
```tsx
import { ResponsiveDX } from 'responsive-dx';

export default function Root() {
  return (
    <Document>
      <Outlet />
      <ResponsiveDX />
    </Document>
  );
}
```

**Astro (`src/layouts/Layout.astro`)**
```astro
---
import { ResponsiveDX } from 'responsive-dx';
---
<html lang="en">
  <body>
    <slot />
    <ResponsiveDX client:only="react" />
  </body>
</html>
```

---

## Demo App

An interactive Next.js example is included in the monorepo under [`apps/demo`](../../apps/demo).

To run the demo locally:

```bash
# Clone the repository
git clone https://github.com/respodx/respo.git
cd respo

# Install dependencies
pnpm install

# Start the demo development server
pnpm --filter demo dev
```

Open [http://localhost:3000](http://localhost:3000) to test the responsive multi-viewport suite with live DOM mirroring and theme switching.

---

## Configuration

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `src` | `string` | `window.location.href` | Target URL loaded in the viewport iframes. |
| `defaultViewports` | `string[]` | `['mobile-375', 'tablet-768', 'desktop-1440']` | IDs of initially active viewports. |

```tsx
<ResponsiveDX
  src="http://localhost:3000"
  defaultViewports={['mobile-375', 'desktop-1440']}
/>
```

---

## Built-in Viewports

| Preset ID | Device Type | Logical Resolution | Description |
| :--- | :--- | :--- | :--- |
| `mobile-375` | Mobile | 375 × 812 px | Mobile phone layout |
| `tablet-768` | Tablet | 768 × 1024 px | Tablet layout |
| `desktop-1440` | Desktop | 1440 × 900 px | Desktop layout |

---

## Architecture

```
                     ┌──────────────────────────────────────────────┐
                     │            Host Application (DOM)           │
                     └──────────────────────┬───────────────────────┘
                                            │
                                   <ResponsiveDX />
                                            │
                                ┌────────────▼────────────┐
                                │  Shadow DOM Root       │
                                │  (Complete Isolation)  │
                                └────────────┬────────────┘
                                             │
                ┌────────────────────────────┼────────────────────────────┐
                │                            │                            │
       ┌────────▼────────┐          ┌────────▼────────┐          ┌────────▼────────┐
       │  Mobile Frame   │ ◄──────► │  Tablet Frame   │ ◄──────► │ Desktop Frame   │
       │   (375 × 812)   │  Mutual  │  (768 × 1024)   │  Mutual  │  (1440 × 900)   │
       └─────────────────┘  Excl.   └─────────────────┘  Excl.   └─────────────────┘
                 ▲                    Event Mutex                  ▲
                 └────────────────── Live DOM Mirror ──────────────┘
```

1. **Same-Origin Direct DOM Access**: Because all viewport iframes point to `localhost`, Respo DX accesses `contentWindow.document` directly without `postMessage` serialization overhead.
2. **Mutual Exclusion Event Mutex**: Internal lock management prevents child-to-parent-to-child event feedback loops during interaction sync.
3. **Browsing Context Guard**: SSR and frame detection ensure nested child iframes do not mount duplicate instances.

---

## Security Headers (Next.js)

If your project specifies strict security headers (e.g. `X-Frame-Options: DENY`), browsers will block `<iframe>` rendering.

### Automatic Configuration
Running `npx responsive-dx init` configures compatible headers automatically.

### Manual Configuration
Set `X-Frame-Options` to `SAMEORIGIN` in development middleware or next config:

```ts
// middleware.ts
import { NextResponse } from 'next/server';

export function middleware() {
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  return response;
}
```

---

## Contributing

Contributions and issues are welcome. Check out the [Issues](https://github.com/respodx/respo/issues) page to get started.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/name`)
3. Commit your changes (`git commit -m 'feat: add feature'`)
4. Push to the branch (`git push origin feature/name`)
5. Open a Pull Request

---

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.
