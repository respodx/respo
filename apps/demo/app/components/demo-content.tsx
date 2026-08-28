'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from './navbar';

export function DemoContent() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'agent' | 'pnpm' | 'npm' | 'yarn' | 'bun'>('agent');
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Designer');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownMode, setDropdownMode] = useState<'custom' | 'native'>('custom');
  const [submitted, setSubmitted] = useState(false);

  const commandMap = {
    agent: 'npx responsive-dx init',
    pnpm: 'pnpm add -D responsive-dx',
    npm: 'npm install -D responsive-dx',
    yarn: 'yarn add -D responsive-dx',
    bun: 'bun add -d responsive-dx',
  };

  const roleOptions = [
    { id: 'developer', label: 'Developer', badge: 'ENGINEERING' },
    { id: 'designer', label: 'Designer', badge: 'PRODUCT DESIGN' },
    { id: 'lead', label: 'Engineering Lead', badge: 'MANAGEMENT' },
    { id: 'architect', label: 'Systems Architect', badge: 'INFRASTRUCTURE' },
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(commandMap[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="min-h-screen bg-white text-zinc-900 dark:bg-black dark:text-zinc-100 flex flex-col selection:bg-zinc-900 selection:text-white dark:selection:bg-white dark:selection:text-black transition-colors duration-200"
      suppressHydrationWarning
    >
      <Navbar />

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center max-w-5xl mx-auto space-y-10">
        {/* Category tag */}
        <div className="inline-flex items-center gap-2 font-mono text-xs text-zinc-500 tracking-wider">
          <span className="text-zinc-400 dark:text-zinc-600">01 /</span> HOME PAGE <span className="text-zinc-400 dark:text-zinc-600">/</span> ROUTE TEST
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-black dark:text-white max-w-4xl leading-[1.08]">
          a testing suite for <br />
          <span className="text-zinc-700 dark:text-zinc-300">product-integrated apps</span>
        </h1>

        {/* Hero Description */}
        <p className="max-w-2xl mx-auto text-zinc-600 dark:text-zinc-400 text-sm sm:text-base leading-relaxed">
          Respo.dx connects your app router, viewport frames, event mirroring, scroll sync, and input states across all devices simultaneously.
        </p>

        {/* Multi-Page Navigation Test Card */}
        <div className="w-full max-w-2xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-950/90 rounded-lg p-6 text-left shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <span className="text-xs font-mono font-bold text-black dark:text-white">
              ⚡ LIVE MULTI-FRAME PAGE NAVIGATION TEST
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold uppercase">
              Page 1 of 3 (Home)
            </span>
          </div>

          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            Click either of the buttons or links below from <strong>any frame</strong> (Mobile, Tablet, or Desktop). All frames will switch to that page in real-time:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <Link
              href="/docs"
              className="p-3 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-900 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-all flex flex-col gap-1 group"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold group-hover:text-blue-500 transition-colors">02 / DOCS PAGE</span>
                <span className="text-xs text-zinc-400">→</span>
              </div>
              <span className="text-[11px] text-zinc-500">Test SDK guides & input state mirroring</span>
            </Link>

            <Link
              href="/showcase"
              className="p-3 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-900 hover:border-purple-500 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 transition-all flex flex-col gap-1 group"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold group-hover:text-purple-500 transition-colors">03 / SHOWCASE PAGE</span>
                <span className="text-xs text-zinc-400">→</span>
              </div>
              <span className="text-[11px] text-zinc-500">Test forms, rating widgets & toggles</span>
            </Link>
          </div>
        </div>

        {/* Terminal / Package Installer Card */}
        <div className="w-full max-w-2xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950/80 rounded-[4px] overflow-hidden text-left font-mono shadow-xl backdrop-blur-md transition-colors">
          {/* Tab Switcher */}
          <div className="flex border-b border-zinc-300 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/50">
            {(['agent', 'pnpm', 'npm', 'yarn', 'bun'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-xs font-medium uppercase tracking-wider transition-colors border-r border-zinc-300 dark:border-zinc-800 ${
                  activeTab === tab
                    ? 'bg-black text-white dark:bg-white dark:text-black font-bold'
                    : 'text-zinc-600 dark:text-zinc-500 hover:text-black dark:hover:text-zinc-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Terminal Command Area */}
          <div className="p-4 flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3 overflow-x-auto text-zinc-700 dark:text-zinc-300">
              <span className="text-zinc-400 dark:text-zinc-600 select-none">&gt;</span>
              <span className="text-zinc-500 select-none">AT</span>
              <code className="text-black dark:text-white font-mono">{commandMap[activeTab]}</code>
            </div>
            <button
              onClick={handleCopy}
              className="px-3 py-1 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-300 hover:text-black dark:hover:text-white rounded-[2px] text-[11px] uppercase tracking-wider transition-colors shrink-0 cursor-pointer shadow-sm"
            >
              {copied ? '✓ COPIED' : 'COPY'}
            </button>
          </div>
        </div>

        {/* Interactive Dropdown & Form Mirror Test Section */}
        <div className="w-full max-w-2xl p-6 border border-zinc-300 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950/80 rounded-lg text-left transition-colors shadow-lg space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-black dark:text-white flex items-center gap-2">
                <span className="text-zinc-400 dark:text-zinc-600">01 /</span> MULTI-VIEWPORT DROPDOWN TEST
              </span>
              <p className="text-[11px] text-zinc-500 font-mono">
                Click the dropdown below — observe the list open simultaneously in Mobile, Tablet, and Desktop!
              </p>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center gap-1 p-1 bg-zinc-200/60 dark:bg-zinc-900 rounded font-mono text-[10px]">
              <button
                type="button"
                onClick={() => setDropdownMode('custom')}
                className={`px-2 py-1 rounded transition-colors ${
                  dropdownMode === 'custom'
                    ? 'bg-white dark:bg-zinc-800 text-black dark:text-white font-bold shadow-sm'
                    : 'text-zinc-500 hover:text-black dark:hover:text-white'
                }`}
              >
                CUSTOM DOM
              </button>
              <button
                type="button"
                onClick={() => setDropdownMode('native')}
                className={`px-2 py-1 rounded transition-colors ${
                  dropdownMode === 'native'
                    ? 'bg-white dark:bg-zinc-800 text-black dark:text-white font-bold shadow-sm'
                    : 'text-zinc-500 hover:text-black dark:hover:text-white'
                }`}
              >
                NATIVE SELECT
              </button>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
              setTimeout(() => setSubmitted(false), 3000);
            }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3"
          >
            {/* Email Field */}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="developer@company.com"
              className="px-3 py-2 bg-white dark:bg-zinc-900/90 border border-zinc-300 dark:border-zinc-800 rounded-[4px] text-xs font-mono text-black dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-black dark:focus:border-zinc-500 shadow-sm"
              required
            />

            {/* Dropdown Field (Custom or Native) */}
            {dropdownMode === 'custom' ? (
              <div className="relative">
                <button
                  type="button"
                  id="role-custom-dropdown-btn"
                  data-testid="role-dropdown-btn"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-full h-full min-h-[38px] px-3 py-2 bg-white dark:bg-zinc-900/90 border border-zinc-300 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 rounded-[4px] text-xs font-mono text-left flex items-center justify-between text-black dark:text-white shadow-sm transition-all focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white"
                  aria-expanded={dropdownOpen}
                  aria-haspopup="listbox"
                >
                  <span className="truncate font-semibold">{role}</span>
                  <svg
                    className={`w-3.5 h-3.5 text-zinc-500 transition-transform duration-150 ${dropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Animated Dropdown Menu List */}
                {dropdownOpen && (
                  <div
                    id="role-custom-dropdown-menu"
                    data-testid="role-dropdown-menu"
                    className="absolute left-0 top-full mt-1.5 w-full min-w-[200px] bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-md shadow-2xl z-50 py-1 font-mono text-xs overflow-hidden animate-in fade-in zoom-in-95 duration-100"
                    role="listbox"
                  >
                    <div className="px-3 py-1.5 text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800/80">
                      Select Role (Live DOM Sync)
                    </div>
                    {roleOptions.map((opt) => (
                      <button
                        type="button"
                        key={opt.id}
                        id={`role-opt-${opt.id}`}
                        data-testid={`role-opt-${opt.id}`}
                        onClick={() => {
                          setRole(opt.label);
                          setDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${
                          role === opt.label
                            ? 'bg-zinc-100 dark:bg-zinc-800/90 text-black dark:text-white font-bold'
                            : 'text-zinc-700 dark:text-zinc-300'
                        }`}
                        role="option"
                        aria-selected={role === opt.label}
                      >
                        <span>{opt.label}</span>
                        {role === opt.label && <span className="text-emerald-500 font-bold">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-zinc-900/90 border border-zinc-300 dark:border-zinc-800 rounded-[4px] text-xs font-mono text-zinc-800 dark:text-zinc-300 focus:outline-none focus:border-black dark:focus:border-zinc-500 shadow-sm"
              >
                <option value="Developer">Developer</option>
                <option value="Designer">Designer</option>
                <option value="Engineering Lead">Engineering Lead</option>
                <option value="Systems Architect">Systems Architect</option>
              </select>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black font-mono text-xs font-bold rounded-[4px] hover:opacity-90 transition-colors border border-transparent dark:border-white cursor-pointer shadow-sm"
            >
              {submitted ? '✓ REGISTERED' : 'TEST SYNC'}
            </button>
          </form>

          {/* Active selection summary */}
          <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-zinc-500 border-t border-zinc-200 dark:border-zinc-800">
            <span>
              Current Role: <strong className="text-black dark:text-white">{role}</strong>
            </span>
            <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {dropdownMode === 'custom' ? 'DOM-Level Open Mirroring' : 'Native OS Select'}
            </span>
          </div>
        </div>
      </main>

      {/* Product Stack Grid Bar */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 mt-auto transition-colors">
        <div className="mx-auto max-w-7xl grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 border-l border-r border-zinc-200 dark:border-zinc-800 text-xs font-mono text-zinc-600 dark:text-zinc-400 divide-x divide-y sm:divide-y-0 divide-zinc-200 dark:divide-zinc-800">
          <div className="p-3.5 flex items-center gap-2 bg-zinc-200/50 dark:bg-zinc-900/50 font-semibold">
            <span className="text-zinc-400 dark:text-zinc-600">01 /</span> STACK
          </div>
          <div className="p-3.5 flex items-center justify-center gap-2 hover:text-black dark:hover:text-white transition-colors">
            ▲ NEXT.JS
          </div>
          <div className="p-3.5 flex items-center justify-center gap-2 hover:text-black dark:hover:text-white transition-colors">
            ⚡ VITE
          </div>
          <div className="p-3.5 flex items-center justify-center gap-2 hover:text-black dark:hover:text-white transition-colors">
            ⬡ TAILWIND
          </div>
          <div className="p-3.5 flex items-center justify-center gap-2 hover:text-black dark:hover:text-white transition-colors">
            ⚛ REACT
          </div>
          <div className="p-3.5 flex items-center justify-center gap-2 hover:text-black dark:hover:text-white transition-colors">
            ❖ REMIX
          </div>
          <div className="p-3.5 flex items-center justify-center gap-2 hover:text-black dark:hover:text-white transition-colors">
            🚀 ASTRO
          </div>
        </div>
      </footer>
    </div>
  );
}
