# Changelog

All notable changes to this project are documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased] — enterprise hardening

> Folded into the next published version. The package.json stays at 1.2.1 until
> release time; if 1.2.1 was already published, run `npm version minor` first.

### Added
- **Universal `data-us-*` attribute contract** — declarative loading for plain
  HTML, PHP/Blade/WordPress templates, HTMX and Turbo Frames:
  `data-us-loading` (attribute-driven on/off via one shared, rAF-batched
  MutationObserver), `data-us-ignore`, `data-us-shape="circle|pill|square|rect"`,
  `data-us-lines="1..6"`, `data-us-width="65%"`, `data-us-color`,
  `data-us-highlight`. Classic `data-skeleton-*` attributes keep priority and
  everything still works unchanged.
- **Anti-flicker `delay`** (`data-us-delay`, `scan()`/`while()` option,
  `<skeleton-screen delay>`) — the skeleton is laid out but invisible and is
  cancelled entirely when loading finishes first; fast cached responses never
  flash.
- **Failsafe `timeout` watchdog** (`data-us-timeout`, `scan()`/`while()` option,
  `<skeleton-screen timeout>`) — a hanging API can no longer freeze the UI in a
  permanent skeleton; the handle auto-destroys and `onTimeout(root)` fires.
- **`data-us-repeat="N"`** — empty loop containers (`@foreach []`, `v-for []`,
  `.map()` over null) paint N evenly stacked placeholder rows instead of one
  grey void.
- **Interactive lockdown** — while a skeleton is visible, all interactive
  descendants (`a[href]`, `button`, `input`, `select`, `textarea`, `iframe`,
  `details`, `[tabindex]`, `[contenteditable]`) get the native `inert`
  attribute (fallback: `tabindex="-1"` + `pointer-events:none` class);
  originals are restored exactly on destroy. Disable with
  `blockInteraction: false`.
- **Zero-CLS container pin** — the scanned root's height is pinned as inline
  `min-height` during loading (restored on destroy), so emptying the container
  for the fetch can never collapse the layout.
- **Shared accessibility live region** — one debounced `role="status"` element
  per document announces *Loading content…* / *Content loaded* as skeletons
  come and go.
- **Strict-CSP mode** — `setAutoInject(false)` disables lazy style injection;
  ship `dist/universal-skeleton.css` as a static asset for
  `style-src 'self'` policies. Style injection is now lazy in general (first
  skeleton, not import time).
- **Save-Data compliance** — on `Save-Data: on` connections the animation is
  switched off automatically (static blocks).
- **`maxDepth` option** — traversal depth cap (default 20).
- Documentation: new "data-us-* contract" docs page + README contract and
  security sections.

### Changed
- **The DOM walk is now iterative** (queue-based instead of recursion) with a
  visited-set cycle guard and the `maxDepth` cap — pathologically deep or
  malformed trees can never raise `RangeError`. Document-order traversal and
  therefore deterministic bar widths are preserved.
- Scan handles now expose a `pending` getter (`true` while the anti-flicker
  delay has not elapsed).
- The timeout watchdog destroys the full public handle, so `isActive()` is
  correct after an expiry.

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
