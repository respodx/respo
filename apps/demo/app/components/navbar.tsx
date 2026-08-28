'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Navbar() {
  const pathname = usePathname();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const isDark =
      document.documentElement.classList.contains('dark') ||
      (!document.documentElement.classList.contains('light') &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.documentElement.setAttribute('data-theme', 'dark');
      try { localStorage.setItem('theme', 'dark'); } catch {}
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      document.documentElement.setAttribute('data-theme', 'light');
      try { localStorage.setItem('theme', 'light'); } catch {}
    }
  };

  const navLinks = [
    { href: '/', label: 'HOME', code: '01' },
    { href: '/docs', label: 'DOCS', code: '02' },
    { href: '/showcase', label: 'SHOWCASE', code: '03' },
  ];

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800/80 dark:bg-zinc-950/60 py-2 text-center text-[11px] font-mono tracking-wider text-zinc-600 dark:text-zinc-400 transition-colors">
        <span className="inline-flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          MULTI-VIEWPORT ROUTING TEST BENCH <span className="text-zinc-400 dark:text-zinc-600">/</span> CURRENT PAGE:{' '}
          <strong className="text-black dark:text-white uppercase font-bold">{pathname === '/' ? 'HOME (/)' : pathname}</strong>
        </span>
      </div>

      {/* Main Navbar */}
      <nav className="border-b border-zinc-200 bg-white/90 dark:border-zinc-800 dark:bg-black/90 sticky top-0 z-30 backdrop-blur-md transition-colors">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 h-14">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div className="p-1.5 border border-zinc-300 dark:border-zinc-700 rounded-[2px] bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2.5 16V5.5a2 2 0 0 1 2-2h15a2 2 0 0 1 2 2V16" />
                <path d="M2.5 16h4.5" />
                <path d="M17 16h4.5" />
                <rect x="8" y="7.5" width="8" height="13" rx="1.8" />
                <path d="M11 17.5h2" strokeWidth="1.6" />
              </svg>
            </div>
            <span className="font-mono text-sm font-bold tracking-wider text-black dark:text-white">
              RESPO <span className="text-zinc-500">. DX</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6 text-xs font-mono">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all ${
                    isActive
                      ? 'text-black dark:text-white font-bold bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900'
                  }`}
                >
                  <span className="text-zinc-400 dark:text-zinc-600">{link.code} /</span> {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right Action Icons & Mobile Menu Button */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white border border-zinc-200 dark:border-zinc-800 rounded bg-zinc-50 dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white border border-zinc-200 dark:border-zinc-800 rounded bg-zinc-50 dark:bg-zinc-900 transition-colors"
              aria-label="Toggle Menu"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black px-6 py-4 space-y-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded text-xs font-mono transition-colors ${
                    isActive
                      ? 'bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white font-bold border border-zinc-300 dark:border-zinc-700'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                  }`}
                >
                  <span className="text-zinc-400 dark:text-zinc-600">{link.code} /</span> {link.label}
                </Link>
              );
            })}
          </div>
        )}
      </nav>
    </>
  );
}
