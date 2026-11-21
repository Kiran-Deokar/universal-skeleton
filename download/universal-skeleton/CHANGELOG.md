# Changelog

All notable changes to this project are documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [1.0.0] - 2026-11-21

### Added
- `SkeletonLoader.scan(target, options)` — auto-generates a skeleton that mirrors the real UI geometry (text becomes per-line pill bars, images become blocks or circles, buttons and inputs become rounded rects).
- `SkeletonLoader.while(source, target, options)` — shows a skeleton while a promise (or function) runs, then restores the UI automatically, with optional `minDuration`.
- `SkeletonLoader.restore(target)` / `SkeletonLoader.isActive(target)`.
- Manual mode via `data-skeleton="circle|rect|text|image|none|ignore"` plus `data-skeleton-radius`, `data-skeleton-color` and `data-skeleton-highlight` attributes.
- `<skeleton-screen>` Web Component with `loading`, `effect`, `color`, `highlight-color` and `radius` attributes — works in plain HTML, React, Vue, Angular and Svelte.
- Three effects: `shimmer` (default), `pulse` and `none`; honors `prefers-reduced-motion`.
- Theming via CSS variables (`--usk-color`, `--usk-highlight`, `--usk-radius`, `--usk-duration`).
- Zero runtime dependencies; CSS is injected automatically (also shipped as `dist/universal-skeleton.css`).
- Builds: ESM, CJS, and a CDN bundle (`dist/index.iife.min.js`, global `UniversalSkeleton`, the default for unpkg / jsDelivr).
- TypeScript declarations (`index.d.ts`) — no extra `@types` package needed.
- Vitest unit-test suite and a demo playground (`demo/index.html`).
