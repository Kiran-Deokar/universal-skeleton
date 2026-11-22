# Changelog

All notable changes to this project are documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [1.2.1] - 2026-11-22

> Note: 1.2.0 was briefly published and then unpublished — npm never allows the same
> name@version to be reused, so this release supersedes it as 1.2.1.

### Fixed
- **Shaped elements now skeletonise as one solid block.** An element that paints its own visible background (badges, chips, pills, coloured labels — e.g. `<span class="bg-emerald-100 rounded-full">+18% this week</span>`) used to keep its colour while only the text inside was replaced with a bar. The whole shape now becomes the skeleton block: the element's background, border colour, box shadow and text are hidden while loading, and the block inherits the shape's own border-radius (so `rounded-full` pills stay pills).

### Added
- `paintedSurface` detection inside the scanner — solid backgrounds (alpha ≥ 0.35, so decorative glows and overlays at 10–20% opacity are ignored) and background-image gradients both count as a shape.
- Empty coloured leaves (dots, pills, spacers with a background and no content) are skeletonised as one block as well.
- Elements taller than 64 px (code blocks, callouts, cards) keep the classic per-line text bars, so big coloured surfaces don't collapse into a single blob.
- The `.usk-s` helper class is removed again on `destroy()` — the shape's colour comes back exactly as before.
- Escape hatch unchanged: `data-skeleton="text"` on a badge still forces per-line bars.
- **Tailwind v4 color formats are fully understood.** Shape detection now parses `oklch()` / `oklab()` / `lab()` / `lch()` (opaque by definition), percentage slash alpha (`rgb(0 0 0 / 40%)`) and Tailwind's `color-mix()` opacity modifiers (`bg-emerald-600/50` → 50% alpha), so detection no longer depends on the browser serializing colors as `rgb()`.

## [1.1.0] - 2026-11-21

### Added
- **5 new effects** — the library now ships 8 animation styles: `shimmer`, `wave` (diagonal light sweep), `pulse`, `fade` (staggered breathing cascade), `blink` (hard terminal-cursor blink), `sheen` (one glossy band sweeping the whole skeleton), `bounce` (gentle vertical bob) and `none`.
- **Theme support** — new `theme` option / `<skeleton-screen theme>` attribute with `light`, `dark` and `auto` palettes (default `auto`, follows `prefers-color-scheme` with zero JavaScript). Includes `handle.setTheme()` for runtime switching; explicit `color` options always win.
- **`duration` option** on `SkeletonLoader.scan()` / `.while()` — one animation cycle as a CSS time (`'2s'`) or milliseconds (`900`).
- **`duration` attribute** on `<skeleton-screen>`.
- `EFFECTS` export — the list of every supported effect name (for building pickers).
- New public documentation site with landing page, per-framework guides, API reference and a live playground.

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
