'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '../components/navbar';

export default function DocsPage() {
  const router = useRouter();
  const [selectedSdk, setSelectedSdk] = useState<'next' | 'vite' | 'remix'>('next');
  const [copied, setCopied] = useState(false);
  const [inputVal, setInputVal] = useState('Testing live inputs in /docs');
  const [count, setCount] = useState(0);

  const sdkCode = {
    next: `// app/layout.tsx
import { ResponsiveDX } from 'responsive-dx';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <ResponsiveDX />
      </body>
    </html>
  );
}`,
    vite: `// src/App.tsx
import { ResponsiveDX } from 'responsive-dx';

export function App() {
  return (
    <div>
      <MainAppContent />
      <ResponsiveDX />
    </div>
  );
}`,
    remix: `// app/root.tsx
import { ResponsiveDX } from 'responsive-dx';

export default function App() {
  return (
    <html>
      <body>
        <Outlet />
        <ResponsiveDX />
      </body>
    </html>
  );
}`,
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(sdkCode[selectedSdk]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 dark:bg-black dark:text-zinc-100 flex flex-col selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-black transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12 space-y-12">
        {/* Header Banner */}
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-8 bg-zinc-50/50 dark:bg-zinc-950/50 backdrop-blur">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-mono">
                PAGE 02 / 03 — DOCUMENTATION
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Documentation & Routing Test</h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-xl">
                You navigated to <code className="text-blue-500 font-mono">/docs</code>. Check the other viewports (Mobile, Tablet, Desktop) to verify they are all displaying this page!
              </p>
            </div>

            {/* Quick Fast Jump Buttons */}
            <div className="flex flex-wrap gap-3">
              <Link
                href="/"
                className="px-4 py-2 text-xs font-mono rounded bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-black dark:text-white transition-colors flex items-center gap-2"
              >
                ← Back to Home (/)
              </Link>
              <button
                onClick={() => router.push('/showcase')}
                className="px-4 py-2 text-xs font-mono rounded bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors flex items-center gap-2"
              >
                Go to Showcase (/showcase) →
              </button>
            </div>
          </div>
        </div>

        {/* Live Synchronized Interactive Test Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: Interactive State Test */}
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 bg-white dark:bg-zinc-900/50 space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <span className="text-blue-500 font-mono">#1</span> Live State & Input Test
              </h2>
              <p className="text-xs text-zinc-500">
                Type here or click the counter — observe real-time DOM mirroring across all screen sizes.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-zinc-500 mb-1.5">Interactive Input Field</label>
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded focus:outline-none focus:border-blue-500 font-mono"
                  placeholder="Type anything..."
                />
              </div>

              <div className="flex items-center justify-between p-3 border border-zinc-200 dark:border-zinc-800 rounded bg-zinc-50/50 dark:bg-zinc-950/50">
                <span className="text-xs font-mono text-zinc-500">Click Counter:</span>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-base font-bold text-blue-500">{count}</span>
                  <button
                    onClick={() => setCount((c) => c + 1)}
                    className="px-3 py-1 text-xs font-mono rounded bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                  >
                    + Increment
                  </button>
                  <button
                    onClick={() => setCount(0)}
                    className="px-2.5 py-1 text-xs font-mono rounded bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Framework Integration Code */}
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 bg-white dark:bg-zinc-900/50 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <span className="text-blue-500 font-mono">#2</span> Setup Snippets
                </h2>
                <p className="text-xs text-zinc-500">Switch tabs to test tab-state synchronization.</p>
              </div>
              <button
                onClick={handleCopy}
                className="text-xs font-mono px-2.5 py-1 rounded border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>

            <div className="flex gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2 text-xs font-mono">
              {(['next', 'vite', 'remix'] as const).map((sdk) => (
                <button
                  key={sdk}
                  onClick={() => setSelectedSdk(sdk)}
                  className={`px-3 py-1 rounded transition-colors uppercase ${
                    selectedSdk === sdk
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-zinc-500 hover:text-black dark:hover:text-white'
                  }`}
                >
                  {sdk}
                </button>
              ))}
            </div>

            <pre className="p-4 rounded bg-zinc-900 text-zinc-100 text-xs font-mono overflow-x-auto border border-zinc-800">
              <code>{sdkCode[selectedSdk]}</code>
            </pre>
          </div>
        </div>

        {/* Bottom Route Navigation Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-xs font-mono">
          <span className="text-zinc-500">Navigation verification links:</span>
          <div className="flex flex-wrap gap-4">
            <Link href="/" className="text-blue-500 hover:underline">
              ← 01 / HOME
            </Link>
            <span className="text-zinc-300 dark:text-zinc-700">|</span>
            <span className="text-black dark:text-white font-bold">02 / DOCS (Current)</span>
            <span className="text-zinc-300 dark:text-zinc-700">|</span>
            <Link href="/showcase" className="text-blue-500 hover:underline">
              03 / SHOWCASE →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
