# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.2] - 2026-08-28

### Added
- **CLI Security Headers Auto-Patching**: `npx responsive-dx init` automatically detects `X-Frame-Options: DENY` in `middleware.ts` and `next.config.js` and patches it to `SAMEORIGIN` for local testing.
- **Interactive In-App Diagnostic Overlay**: Renders a dedicated troubleshooting card when iframe embedding is blocked by server headers, with 1-click "📋 Copy Fix" and "Retry Connection" buttons.

## [0.3.1] - 2026-08-28

### Fixed
- **Page Navigation & Route Synchronization**: Fixed SPA route sync across all active frames with synthetic mouse event dispatch and microtask fallback navigation.
- **CLI Resilience**: Added automatic `--ignore-scripts` fallback when npm restricts lifecycle scripts (`EALLOWSCRIPTS`), and guarded layout injection on installation failure.

## [0.3.0] - 2026-08-28

### Added
- **1-Command Automated Setup CLI**: Added `npx responsive-dx init` (and alias `npx respo init`) to automatically detect project frameworks (Next.js App Router, Pages Router, Vite, Remix, Astro), install `responsive-dx`, and inject `<ResponsiveDX />` directly into root layout files.
- **CLI Executable Binary**: Added `./bin/cli.js` with shebang for seamless cross-platform execution.
- **Package Manager Auto-Detection**: Supports zero-friction installation across `pnpm`, `npm`, `yarn`, and `bun`.

## [0.2.0] - 2026-08-28

### Fixed
- **Page Navigation Feedback Loops**: Added route synchronization lock (`isSyncingRoute`) and debounced re-entrancy prevention to eliminate infinite page-change recursion and browser freezes ("Page Unresponsive").
- **Pointer & Touch Recursion Protection**: Tagged all synthetic events (`__rdx_synthetic = true`) and added trusted event verification (`e.isTrusted`) across all listeners to prevent call stack overflow errors (`applyPointerToFrame`).
- **History Monkey-Patch Stacking**: Added `WeakSet<Window>` protection so `history.pushState` and `history.replaceState` are patched exactly once per window instance.
- **Stable Iframe Mounts**: Ensured iframes preserve initial source URLs across in-memory SPA transitions to avoid destructive iframe re-mounting.
- **Dropdown & Disclosure Mirroring**: Enhanced responsive element matching for `<select>`, custom UI dropdowns, and `<details>`/`<summary>` disclosure tags.

## [0.1.9] - 2026-08-27

### Fixed
- **Multi-Frame Route Navigation Sync**: Resolved route synchronization desync when navigating via Next.js App Router `<Link>` or SPA client routing across multiple frames.
- **React Strict Mode Shadow Host Persistence**: Fixed portal detachment issue where the bottom-right FAB button failed to mount during React 18/19 StrictMode double-mount cycles.
- **Explicit Theme Fallbacks**: Added robust fallback values for `--rdx-surface` and `--rdx-text` tokens across all Shadow DOM theme states.
- **Manual Enable Option**: Added `enabled?: boolean` prop to allow explicit widget rendering in preview/staging environments.

## [0.1.0] - 2026-08-25

### Added
- **Multi-Viewport Studio**: Simultaneous side-by-side previewing for Mobile (375px), Tablet (768px), and Desktop (1440px).
- **DOM Event Mirroring**: Bidirectional scroll, click, and form input synchronization across active iframes with zero lag.
- **Dynamic Theme Sync**: Automatic reactivity for system preferences (`prefers-color-scheme`) and in-app themes (Tailwind `class="dark"` / `data-theme`).
- **Single-View Zoom & Focus Mode**: Instant 1-click zoom (`[ ⛶ FOCUS ]`) to center any viewport with ambient depth blur on background frames.
- **Shadow DOM Isolation**: Zero style conflicts or CSS leaking with host applications.
- **Hardware Bezels**: Realistic iPhone notch chassis and macOS window frame header.
- **Production Tree-Shaking**: Statically evaluates to `null` in non-development environments.
