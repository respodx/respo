'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '../components/navbar';

export default function ShowcasePage() {
  const router = useRouter();
  const [selectedDevice, setSelectedDevice] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [formData, setFormData] = useState({
    username: 'alex_developer',
    framework: 'Next.js App Router',
    syncScroll: true,
    syncClicks: true,
    syncInputs: true,
  });
  const [frameworkDropdownOpen, setFrameworkDropdownOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [submitted, setSubmitted] = useState(false);

  const frameworks = [
    { id: 'nextjs', name: 'Next.js App Router', tag: 'V15 FULLSTACK' },
    { id: 'vite', name: 'Vite + React 19', tag: 'CSR / SPA' },
    { id: 'remix', name: 'Remix Run', tag: 'SSR / EDGE' },
    { id: 'astro', name: 'Astro Web', tag: 'ISLANDS' },
  ];

  return (
    <div className="min-h-screen bg-white text-zinc-900 dark:bg-black dark:text-zinc-100 flex flex-col selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-black transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12 space-y-12">
        {/* Header Banner */}
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-8 bg-zinc-50/50 dark:bg-zinc-950/50 backdrop-blur">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-mono">
                PAGE 03 / 03 — INTERACTIVE SHOWCASE
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Showcase & Multi-Frame Test Bench</h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-xl">
                You navigated to <code className="text-purple-500 font-mono">/showcase</code>. Test toggling switches, custom dropdowns, radio buttons, and navigation links across all devices.
              </p>
            </div>

            {/* Quick Route Switchers */}
            <div className="flex flex-wrap gap-3">
              <Link
                href="/docs"
                className="px-4 py-2 text-xs font-mono rounded bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-black dark:text-white transition-colors flex items-center gap-2"
              >
                ← Back to Docs (/docs)
              </Link>
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 text-xs font-mono rounded bg-purple-600 hover:bg-purple-500 text-white font-medium transition-colors flex items-center gap-2"
              >
                Back to Home (/) →
              </button>
            </div>
          </div>
        </div>

        {/* Live Multi-Input Synchronization Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Section 1: Form & Controls Mirroring */}
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 bg-white dark:bg-zinc-900/50 space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <span className="text-purple-500 font-mono">#1</span> Custom Dropdown & Toggles Sync
              </h2>
              <p className="text-xs text-zinc-500">
                Click the custom framework dropdown — observe the list open simultaneously in all frames!
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSubmitted(true);
                setTimeout(() => setSubmitted(false), 3000);
              }}
              className="space-y-4 text-xs font-mono"
            >
              <div>
                <label className="block text-zinc-500 mb-1">Developer Name</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Custom Framework Dropdown */}
              <div>
                <label className="block text-zinc-500 mb-1">Framework Selection (Custom DOM Dropdown)</label>
                <div className="relative">
                  <button
                    type="button"
                    id="framework-dropdown-btn"
                    data-testid="framework-dropdown-btn"
                    onClick={() => setFrameworkDropdownOpen(!frameworkDropdownOpen)}
                    className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded flex items-center justify-between text-left focus:outline-none focus:border-purple-500 transition-colors"
                    aria-expanded={frameworkDropdownOpen}
                  >
                    <span className="font-semibold">{formData.framework}</span>
                    <svg
                      className={`w-4 h-4 text-zinc-400 transition-transform ${frameworkDropdownOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {frameworkDropdownOpen && (
                    <div
                      id="framework-dropdown-menu"
                      data-testid="framework-dropdown-menu"
                      className="absolute left-0 top-full mt-1 w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-md shadow-xl z-50 py-1 overflow-hidden"
                    >
                      {frameworks.map((fw) => (
                        <button
                          type="button"
                          key={fw.id}
                          id={`fw-opt-${fw.id}`}
                          data-testid={`fw-opt-${fw.id}`}
                          onClick={() => {
                            setFormData({ ...formData, framework: fw.name });
                            setFrameworkDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors ${
                            formData.framework === fw.name
                              ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 font-bold'
                              : 'text-zinc-700 dark:text-zinc-300'
                          }`}
                        >
                          <span>{fw.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                            {fw.tag}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Checkboxes */}
              <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.syncScroll}
                    onChange={(e) => setFormData({ ...formData, syncScroll: e.target.checked })}
                    className="rounded border-zinc-400 dark:border-zinc-600 text-purple-600 focus:ring-purple-500"
                  />
                  <span>Mirror Scroll Coordinates</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.syncClicks}
                    onChange={(e) => setFormData({ ...formData, syncClicks: e.target.checked })}
                    className="rounded border-zinc-400 dark:border-zinc-600 text-purple-600 focus:ring-purple-500"
                  />
                  <span>Mirror Pointer & Click Events</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.syncInputs}
                    onChange={(e) => setFormData({ ...formData, syncInputs: e.target.checked })}
                    className="rounded border-zinc-400 dark:border-zinc-600 text-purple-600 focus:ring-purple-500"
                  />
                  <span>Mirror Controlled Inputs & Radio State</span>
                </label>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded bg-purple-600 hover:bg-purple-500 text-white font-bold transition-colors"
                >
                  {submitted ? '✓ Mirrored Successfully!' : 'Submit Form Test'}
                </button>
              </div>
            </form>
          </div>

          {/* Section 2: Interactive Rating & Device Switcher */}
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 bg-white dark:bg-zinc-900/50 space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <span className="text-purple-500 font-mono">#2</span> Multi-Tab & Rating Test
              </h2>
              <p className="text-xs text-zinc-500">
                Click any device tab or star rating to test component state reflection.
              </p>
            </div>

            {/* Device Selector Buttons */}
            <div className="space-y-2">
              <span className="text-xs font-mono text-zinc-500">Active Test Target:</span>
              <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                {(['mobile', 'tablet', 'desktop'] as const).map((device) => (
                  <button
                    key={device}
                    onClick={() => setSelectedDevice(device)}
                    className={`py-2 px-3 rounded border text-center transition-colors uppercase ${
                      selectedDevice === device
                        ? 'bg-purple-600 text-white border-purple-500 font-bold'
                        : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    {device}
                  </button>
                ))}
              </div>
            </div>

            {/* Star Rating Component */}
            <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50/50 dark:bg-zinc-950/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-500">Experience Rating:</span>
                <span className="text-xs font-mono font-bold text-purple-500">{rating} / 5 Stars</span>
              </div>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`text-2xl transition-transform hover:scale-110 ${
                      star <= rating ? 'text-amber-400' : 'text-zinc-300 dark:text-zinc-700'
                    }`}
                    title={`Rate ${star} Stars`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 border border-purple-500/20 rounded-lg bg-purple-500/5 text-xs font-mono space-y-1">
              <span className="text-purple-400 font-bold">● Active Summary State:</span>
              <div className="text-zinc-600 dark:text-zinc-400">
                User: <strong>{formData.username}</strong> | Framework: <strong>{formData.framework}</strong> | Device:{' '}
                <strong className="uppercase">{selectedDevice}</strong>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
