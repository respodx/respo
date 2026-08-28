import { describe, it, expect } from 'vitest';
import { injectCode, detectFrameworkAndLayout, detectPackageManager, checkAndFixSecurityHeaders } from '../cli.js';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

describe('CLI Code Injection', () => {
  it('injects into Next.js App Router layout before </body>', () => {
    const nextLayout = `import type { Metadata } from 'next';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}`;

    const result = injectCode(nextLayout, 'next-app');
    expect(result.injected).toBe(true);
    expect(result.updatedContent).toContain("import { ResponsiveDX } from 'responsive-dx';");
    expect(result.updatedContent).toContain('<ResponsiveDX />\n      </body>');
  });

  it('injects into Next.js Pages Router _app.tsx', () => {
    const nextPages = `import type { AppProps } from 'next/app';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}`;

    const result = injectCode(nextPages, 'next-pages');
    expect(result.injected).toBe(true);
    expect(result.updatedContent).toContain("import { ResponsiveDX } from 'responsive-dx';");
    expect(result.updatedContent).toContain('<ResponsiveDX />');
  });

  it('injects into Vite React main.tsx next to <App />', () => {
    const viteMain = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`;

    const result = injectCode(viteMain, 'vite-react');
    expect(result.injected).toBe(true);
    expect(result.updatedContent).toContain("import { ResponsiveDX } from 'responsive-dx';");
    expect(result.updatedContent).toContain('<App />\n    <ResponsiveDX />');
  });

  it('injects into Astro Layout', () => {
    const astroLayout = `---
interface Props {
  title: string;
}
const { title } = Astro.props;
---
<!doctype html>
<html lang="en">
  <body>
    <slot />
  </body>
</html>`;

    const result = injectCode(astroLayout, 'astro');
    expect(result.injected).toBe(true);
    expect(result.updatedContent).toContain("import { ResponsiveDX } from 'responsive-dx';");
    expect(result.updatedContent).toContain('<ResponsiveDX client:only="react" />');
  });

  it('injects into Remix root.tsx before </body> or </Document>', () => {
    const remixRoot = `import { Outlet } from '@remix-run/react';

export default function Root() {
  return (
    <Document>
      <Outlet />
    </Document>
  );
}`;

    const result = injectCode(remixRoot, 'remix');
    expect(result.injected).toBe(true);
    expect(result.updatedContent).toContain("import { ResponsiveDX } from 'responsive-dx';");
    expect(result.updatedContent).toContain('<ResponsiveDX />');
  });

  it('is idempotent and does not inject twice', () => {
    const alreadyInjected = `import { ResponsiveDX } from 'responsive-dx';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
        <ResponsiveDX />
      </body>
    </html>
  );
}`;

    const result = injectCode(alreadyInjected, 'next-app');
    expect(result.injected).toBe(false);
    expect(result.message).toContain('already present');
    expect(result.updatedContent).toBe(alreadyInjected);
  });
});

describe('Environment and Framework Detection', () => {
  it('detects pnpm when pnpm-lock.yaml exists', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'respo-test-'));
    try {
      fs.writeFileSync(path.join(tmpDir, 'pnpm-lock.yaml'), '');
      expect(detectPackageManager(tmpDir)).toBe('pnpm');
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('detects Next.js App Router structure', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'respo-test-next-'));
    try {
      fs.writeFileSync(path.join(tmpDir, 'package.json'), JSON.stringify({ dependencies: { next: '^15.0.0' } }));
      fs.mkdirSync(path.join(tmpDir, 'app'), { recursive: true });
      fs.writeFileSync(path.join(tmpDir, 'app/layout.tsx'), 'export default function RootLayout() {}');

      const detection = detectFrameworkAndLayout(tmpDir);
      expect(detection.framework).toBe('next-app');
      expect(detection.targetFile).toBe('app/layout.tsx');
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('detects and fixes X-Frame-Options: DENY in middleware.ts', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'respo-test-sec-'));
    try {
      fs.mkdirSync(path.join(tmpDir, 'src'), { recursive: true });
      const mwPath = path.join(tmpDir, 'src/middleware.ts');
      fs.writeFileSync(
        mwPath,
        `import { NextResponse } from 'next/server';\nexport function middleware() {\n  const res = NextResponse.next();\n  res.headers.set('X-Frame-Options', 'DENY');\n  return res;\n}`
      );

      const check = checkAndFixSecurityHeaders(tmpDir, false);
      expect(check.fixed).toBe(true);

      const fixedContent = fs.readFileSync(mwPath, 'utf8');
      expect(fixedContent).toContain("res.headers.set('X-Frame-Options', 'SAMEORIGIN')");
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
