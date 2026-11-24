import type { DocPage } from './doc-types';

/**
 * Content for the Getting Started / Core Concepts / API Reference pages.
 * Framework guides live in guides-data.ts; the interactive effects page
 * is a dedicated component (effects-page.tsx).
 */

export const CORE_PAGES: DocPage[] = [
  /* ---------------------------------------------------------------- */
  /* Introduction                                                      */
  /* ---------------------------------------------------------------- */
  {
    slug: 'introduction',
    title: 'Introduction',
    description:
      'universal-skeleton is a zero-dependency skeleton loader that scans the DOM you already have and paints grey placeholders over it — so the skeleton always mirrors the exact layout of your real UI, in every framework.',
    blocks: [
      {
        t: 'p',
        text: 'Skeleton screens feel faster than spinners because they preview the layout of the page. The problem is that hand-writing them means duplicating your markup: every card, list and dashboard needs a parallel set of placeholder boxes that drift out of sync the moment the real UI changes. **universal-skeleton removes that work entirely** — it measures the live DOM and generates the skeleton from it, automatically.',
      },
      {
        t: 'p',
        text: 'It ships as one small package (zero runtime dependencies, ~4.4 KB gzipped on the CDN build) that talks only to the browser. That is why the same install works in plain HTML, React, Vue, Angular, Svelte, Lit, jQuery — and server-rendered stacks like PHP, Rails or Django, since the scanner runs client-side over whatever HTML arrives.',
      },
      { t: 'h2', text: 'Three ways to show a skeleton' },
      {
        t: 'bullets',
        items: [
          '`SkeletonLoader.scan(target)` — point it at any element; it mirrors the real UI and restores it on `destroy()` or `restore()`.',
          '`SkeletonLoader.while(promise, target)` — show the skeleton while a promise runs, restore automatically, even when the promise rejects.',
          '`<skeleton-screen loading>` — wrap your markup once and toggle one attribute from any framework.',
        ],
      },
      {
        t: 'example',
        title: 'Live — scan a real card, then restore it',
        demo: 'scan-toggle',
        lang: 'javascript',
        code: `import { SkeletonLoader } from 'universal-skeleton';

// mirror the real card as a skeleton
SkeletonLoader.scan('#profile', { effect: 'shimmer' });

// …data arrived — bring the UI back
SkeletonLoader.restore('#profile');`,
      },
      { t: 'h2', text: 'Why auto-scan instead of hand-written placeholders' },
      {
        t: 'bullets',
        items: [
          '**No duplicated markup.** The skeleton is generated from the components you already rendered — there is no second skeleton tree to maintain.',
          '**Always accurate.** Text length, breakpoints, container queries, theme switches — the `ResizeObserver` rebuild keeps every pill aligned with reality.',
          '**One API everywhere.** Custom elements and plain DOM calls are the only component model every framework speaks, so no adapters or peer dependencies.',
          '**Nothing left behind.** `destroy()` removes the overlay and helper classes — the DOM is exactly as it was before the scan.',
        ],
      },
      { t: 'h2', text: 'Feature overview' },
      {
        t: 'bullets',
        items: [
          '**8 animation effects** — shimmer, wave, pulse, fade, blink, sheen, bounce and none, switchable at runtime via `setEffect()`.',
          '**Light, dark and auto palettes** — blocks follow `prefers-color-scheme` automatically, or force a palette with `theme` / `setTheme()`.',
          '**`data-skeleton` attributes** — force circles, rectangles, text bars, or exclude subtrees with plain HTML.',
          '**Themeable with CSS variables** — `--usk-color`, `--usk-highlight`, `--usk-radius`, `--usk-duration`.',
          '**Accessible** — `aria-busy` on the scanned region, `aria-hidden` overlay, phantom-click blocking, `prefers-reduced-motion` support.',
          '**TypeScript-ready** — `.d.ts` declarations and JSX typings are bundled; no `@types` package needed.',
        ],
      },
      { t: 'h2', text: 'Browser support' },
      {
        t: 'p',
        text: 'Every modern browser — Chrome, Edge, Firefox, Safari, desktop and mobile. The engine is built on Custom Elements v1, `ResizeObserver` and CSS custom properties, which are baseline features in all browsers since 2020. No polyfills required.',
      },
      {
        t: 'callout',
        kind: 'tip',
        text: 'New here? The fastest path is the **Quick Start** — a working skeleton in three steps, each with a live preview.',
      },
    ],
  },

  /* ---------------------------------------------------------------- */
  /* Installation                                                      */
  /* ---------------------------------------------------------------- */
  {
    slug: 'installation',
    title: 'Installation',
    description:
      'Install from npm for bundler-based projects, or drop a single <script> tag on the page for everything else. Styles are injected automatically — no stylesheet link required.',
    blocks: [
      { t: 'h2', text: 'Package manager' },
      {
        t: 'code',
        lang: 'bash',
        label: 'npm',
        code: `npm install universal-skeleton`,
      },
      {
        t: 'code',
        lang: 'bash',
        label: 'pnpm',
        code: `pnpm add universal-skeleton`,
      },
      {
        t: 'code',
        lang: 'bash',
        label: 'yarn',
        code: `yarn add universal-skeleton`,
      },
      {
        t: 'code',
        lang: 'bash',
        label: 'bun',
        code: `bun add universal-skeleton`,
      },
      {
        t: 'callout',
        kind: 'info',
        text: 'Then import it once: `import { SkeletonLoader } from \'universal-skeleton\'` (or `import \'universal-skeleton\'` to just register the Web Component). The stylesheet is injected on first scan — nothing else to wire up.',
      },
      { t: 'h2', text: 'CDN — no build step' },
      {
        t: 'p',
        text: 'unpkg and jsDelivr serve the browser build automatically. The global object is `UniversalSkeleton`.',
      },
      {
        t: 'code',
        lang: 'html',
        label: 'index.html',
        code: `<!-- pick one CDN -->
<script src="https://unpkg.com/universal-skeleton/dist/index.iife.min.js"></script>
<!-- <script src="https://cdn.jsdelivr.net/npm/universal-skeleton/dist/index.iife.min.js"></script> -->

<script>
  UniversalSkeleton.SkeletonLoader.scan('#app');
</script>`,
      },
      {
        t: 'code',
        lang: 'javascript',
        label: 'native ESM — no bundler',
        code: `import { SkeletonLoader } from 'https://cdn.jsdelivr.net/npm/universal-skeleton/dist/index.esm.js';`,
      },
      { t: 'h2', text: 'Which build is served' },
      {
        t: 'table',
        head: ['File', 'Format', 'Use it with'],
        rows: [
          ['`dist/index.esm.js`', 'ES module', 'Bundlers — Vite, Next.js, Nuxt, SvelteKit, Astro, webpack'],
          ['`dist/index.cjs`', 'CommonJS', 'Node and SSR tooling, `require()`'],
          ['`dist/index.iife.min.js`', 'IIFE — global `UniversalSkeleton`', 'CDN script tags, ~4.4 KB gzipped'],
          ['`dist/universal-skeleton.css`', 'Stylesheet', 'Optional — CSS is injected automatically otherwise'],
        ],
      },
      { t: 'h2', text: 'TypeScript' },
      {
        t: 'p',
        text: 'Type declarations ship **inside the package** (`index.d.ts`), including JSX typings for `<skeleton-screen>`. TypeScript projects get full IntelliSense with zero extra setup — there is no `@types/universal-skeleton` to install.',
      },
      { t: 'h2', text: 'Optional: ship the stylesheet yourself' },
      {
        t: 'code',
        lang: 'javascript',
        label: 'bundler',
        code: `import 'universal-skeleton/css';
// or a plain <link> to dist/universal-skeleton.css`,
      },
      {
        t: 'callout',
        kind: 'tip',
        text: 'Injecting the stylesheet yourself can avoid a tiny flash on very slow connections — the library detects the existing stylesheet and skips its own injection.',
      },
      { t: 'h2', text: 'Requirements' },
      {
        t: 'bullets',
        items: [
          'Browsers: any evergreen browser (Custom Elements v1, `ResizeObserver`, CSS custom properties).',
          'Node **16+** — only for build tooling and SSR-safe imports; the scanner itself never runs on the server.',
          'Zero peer dependencies — nothing else to install, whatever your stack.',
        ],
      },
    ],
  },

  /* ---------------------------------------------------------------- */
  /* Quick Start                                                       */
  /* ---------------------------------------------------------------- */
  {
    slug: 'quick-start',
    title: 'Quick Start',
    description:
      'A working skeleton in three steps — plain HTML first, then the same flow with the Web Component and with while(). Every step has a live preview on the right.',
    blocks: [
      { t: 'h2', text: '1 — Add the library' },
      {
        t: 'code',
        lang: 'html',
        label: 'index.html',
        code: `<script src="https://unpkg.com/universal-skeleton/dist/index.iife.min.js"></script>`,
      },
      { t: 'h2', text: '2 — Write your real markup' },
      {
        t: 'code',
        lang: 'html',
        label: 'the UI you already have',
        code: `<div id="profile">
  <img class="avatar" src="user.png" alt="" />
  <h3>Ada Lovelace</h3>
  <p>First programmer in history.</p>
  <button>Follow</button>
</div>`,
      },
      { t: 'h2', text: '3 — Scan' },
      {
        t: 'code',
        lang: 'javascript',
        label: 'app.js',
        code: `SkeletonLoader.scan('#profile', { effect: 'shimmer' });

// later, when the data is ready:
SkeletonLoader.restore('#profile');`,
      },
      {
        t: 'p',
        text: 'That is the whole integration. The scanner measured the avatar (a circle), the heading and paragraph (pill bars per text line) and the button (a rounded block), painted them over the card, and hid the real content until `restore()`.',
      },
      {
        t: 'example',
        title: 'Live result of steps 1–3',
        demo: 'scan-toggle',
        lang: 'javascript',
        code: `SkeletonLoader.scan('#profile', { effect: 'shimmer' });
// data ready ↓
SkeletonLoader.restore('#profile');`,
      },
      { t: 'h2', text: 'The declarative shortcut' },
      {
        t: 'p',
        text: 'Prefer markup over JavaScript? Wrap the same content in a `<skeleton-screen>` and toggle the boolean `loading` attribute — from a template, a signal, a store, anything.',
      },
      {
        t: 'code',
        lang: 'html',
        label: 'any framework template',
        code: `<skeleton-screen loading effect="wave">
  <div id="profile">
    <img class="avatar" src="user.png" alt="" />
    <h3>Ada Lovelace</h3>
    <button>Follow</button>
  </div>
</skeleton-screen>`,
      },
      {
        t: 'example',
        title: 'Toggle loading, switch effect — live',
        demo: 'web-component',
        lang: 'html',
        code: `<skeleton-screen loading effect="wave">
  <!-- real markup -->
</skeleton-screen>

<!-- when data arrives, in any framework: -->
el.removeAttribute('loading')`,
      },
      { t: 'h2', text: 'Loading data with while()' },
      {
        t: 'p',
        text: '`while()` is the one-liner for async work: skeleton in, promise runs, skeleton out — **even when the promise rejects**. `minDuration` keeps the skeleton on screen for at least that long so fast responses do not flicker.',
      },
      {
        t: 'code',
        lang: 'javascript',
        label: 'dashboard.js',
        code: `const data = await SkeletonLoader.while(
  fetch('/api/dashboard').then((r) => r.json()),
  '#dashboard',
  { minDuration: 500, effect: 'shimmer' }
);
renderDashboard(data); // promise result passes through unchanged`,
      },
      {
        t: 'example',
        title: 'A tiny dashboard reloading through while()',
        demo: 'quick-start',
        lang: 'javascript',
        code: `await SkeletonLoader.while(fetch('/api/dashboard'), '#dashboard', {
  minDuration: 500,
});`,
      },
      { t: 'h2', text: 'Next steps' },
      {
        t: 'bullets',
        items: [
          '**Effects & animations** — all 8 effects with a live playground of controls.',
          '**Theming** — palettes, CSS variables and per-block color overrides.',
          '**Framework guides** — idiomatic setup for React, Vue, Angular, Svelte, Lit, jQuery and more.',
        ],
      },
    ],
  },

  /* ---------------------------------------------------------------- */
  /* How scanning works                                                */
  /* ---------------------------------------------------------------- */
  {
    slug: 'how-it-works',
    title: 'How scanning works',
    description:
      'The scan engine walks the real DOM, classifies every visible element and paints absolutely-positioned grey blocks that mirror the exact geometry of your UI — then hides the real content underneath until restore.',
    blocks: [
      { t: 'h2', text: 'The scan pipeline' },
      {
        t: 'bullets',
        items: [
          '**1 · Measure** — every meaningful leaf element is measured with `getBoundingClientRect()`.',
          '**2 · Classify** — text, images, buttons, inputs and media each get a matching skeleton representation.',
          '**3 · Paint** — grey blocks are positioned inside a single overlay at the exact coordinates of the real elements.',
          '**4 · Hide** — the real content underneath is visually hidden (kept in the DOM — accessible and SEO-neutral).',
          '**5 · Observe** — a `ResizeObserver` rebuilds the blocks whenever the layout changes, so the skeleton never drifts.',
        ],
      },
      { t: 'h2', text: 'What the scanner detects' },
      {
        t: 'table',
        head: ['Element', 'Skeleton representation'],
        rows: [
          ['Text leaf (headings, paragraphs, spans…)', 'One pill bar per estimated text line — the last line is shorter, like a real paragraph'],
          ['Shaped element with its own background — badges, chips, pills, coloured labels', 'One solid block over the whole shape: the colour, border and shadow are hidden while loading, and the shape’s own border-radius is inherited (so `rounded-full` pills stay pills). Force per-line bars with `data-skeleton="text"`'],
          ['Tall coloured text blocks — code blocks, callouts (higher than 64 px)', 'Per-line text bars, so large coloured surfaces never collapse into one blob'],
          ['Empty coloured leaf (dot, pill, spacer with a background)', 'One solid block over the shape'],
          ['`<img>` with round corners (≥45% radius)', 'A circle block'],
          ['`<img>` / `<picture>` / `<video>` / `<canvas>` / `<svg>`', 'A rectangular block with the media’s corner radius'],
          ['`<button>` / `<input>` / `<select>` / `<textarea>`', 'One solid rounded block'],
          ['Containers (`div`, `section`, lists…)', 'Recursed into — children are scanned individually'],
          ['`hidden`, `display:none`, `visibility:hidden`', 'Skipped entirely'],
        ],
      },
      {
        t: 'example',
        title: 'Text is mirrored line by line',
        demo: 'text-mirror',
        lang: 'javascript',
        code: `SkeletonLoader.scan('#article', { textLines: true }); // default
// textLines: false → one solid bar per text element instead of per-line pills`,
      },
      {
        t: 'example',
        title: 'Round avatars become circle blocks automatically',
        demo: 'circle-detect',
        lang: 'javascript',
        code: `// <img class="avatar"> with border-radius: 50% → circle block
// <img class="thumb"> with border-radius: 12px  → rounded rect block
SkeletonLoader.scan('#header'); // no extra configuration needed`,
      },
      { t: 'h2', text: 'Excluding parts of the UI' },
      {
        t: 'p',
        text: 'Sometimes a region should not be skeletonized — a live badge, a spinner, a sticky toolbar. Skip elements with the `exclude` option or the `data-skeleton-ignore` attribute.',
      },
      {
        t: 'code',
        lang: 'javascript',
        label: 'exclude option',
        code: `SkeletonLoader.scan('#app', {
  exclude: '.no-skeleton',              // CSS selector…
  // exclude: (el) => el.dataset.keep,  // …or a predicate
});`,
      },
      {
        t: 'code',
        lang: 'html',
        label: 'per-element attribute',
        code: `<span class="live-badge" data-skeleton-ignore>LIVE</span>`,
      },
      { t: 'h2', text: 'Accessibility built in' },
      {
        t: 'bullets',
        items: [
          'The scanned region gets `aria-busy="true"` while loading; screen readers announce the state without reading placeholders.',
          'The overlay itself is `aria-hidden` — purely decorative.',
          '`blockInteraction: true` (default) swallows clicks on the hidden UI with a progress cursor — no more clicking a button you cannot see.',
          'Every effect ships with a `prefers-reduced-motion` override: motion-sensitive users get static blocks automatically.',
        ],
      },
      { t: 'h2', text: 'Staying responsive' },
      {
        t: 'p',
        text: 'Skeletons are repaints, not snapshots. Resize the window, change a container width, swap content — the observer re-measures and repaints. Call `handle.update()` after programmatic layout changes if you disable `responsive`.',
      },
      {
        t: 'example',
        title: 'Narrow the card — the skeleton follows',
        demo: 'responsive',
        lang: 'javascript',
        code: `SkeletonLoader.scan('#card', { responsive: true }); // default
handle.update(); // manual re-measure when responsive: false`,
      },
    ],
  },

  /* ---------------------------------------------------------------- */
  /* Theming                                                           */
  /* ---------------------------------------------------------------- */
  {
    slug: 'theming',
    title: 'Theming & CSS variables',
    description:
      'Skeleton blocks pick their color from three palettes (light, dark, auto) and everything else — radius, speed, highlight — is driven by four CSS variables you can override globally or per scan.',
    blocks: [
      { t: 'h2', text: 'Color palettes' },
      {
        t: 'table',
        head: ['theme', 'Block color', 'Highlight', 'Behavior'],
        rows: [
          ['`light`', '`#e5e7eb`', '`#f3f4f6`', 'The classic grey-on-white look'],
          ['`dark`', '`#27272a`', '`#3f3f46`', 'Dark blocks for dark UIs'],
          ['`auto` **(default)**', 'follows OS', 'follows OS', 'Mirrors `prefers-color-scheme` with zero JavaScript'],
        ],
      },
      {
        t: 'code',
        lang: 'javascript',
        label: 'per scan and at runtime',
        code: `SkeletonLoader.scan('#app');                     // auto (default)
SkeletonLoader.scan('#app', { theme: 'dark' });  // force dark blocks
handle.setTheme('light');                        // switch at runtime`,
      },
      {
        t: 'example',
        title: 'All three palettes, live',
        demo: 'theme-palettes',
        lang: 'javascript',
        code: `<skeleton-screen loading theme="dark">…</skeleton-screen>
SkeletonLoader.scan('#app', { theme: 'auto' });`,
      },
      {
        t: 'callout',
        kind: 'info',
        text: '`auto` follows the **operating system** setting via `prefers-color-scheme`. If your site has its own theme toggle, pass the resolved scheme explicitly (`theme: dark ? \'dark\' : \'light\'`) so the skeleton matches your UI, not just the OS. Explicit `color` always wins over any palette.',
      },
      { t: 'h2', text: 'CSS variables' },
      {
        t: 'table',
        head: ['Variable', 'Default', 'Controls'],
        rows: [
          ['`--usk-color`', '`#e5e7eb`', 'Base grey of every skeleton block'],
          ['`--usk-highlight`', '`#f3f4f6`', 'Bright band of shimmer / wave / sheen'],
          ['`--usk-radius`', '`8px`', 'Corner radius of rectangular blocks'],
          ['`--usk-duration`', '`1.4s`', 'One animation cycle'],
        ],
      },
      {
        t: 'code',
        lang: 'css',
        label: 'restyle every skeleton on the page',
        code: `:root {
  --usk-color: #cbd5e1;     /* block grey       */
  --usk-highlight: #e2e8f0; /* moving band      */
  --usk-radius: 12px;       /* rect corners     */
  --usk-duration: 2s;       /* animation cycle  */
}`,
      },
      {
        t: 'example',
        title: 'Colors and speed, switched live',
        demo: 'css-vars',
        lang: 'javascript',
        code: `SkeletonLoader.scan('#app', {
  color: '#a7f3d0',
  highlightColor: '#d1fae5',
  duration: '1.8s',
});`,
      },
      { t: 'h2', text: 'Per-block overrides' },
      {
        t: 'p',
        text: 'Individual elements can opt out of the global palette with `data-skeleton-color`, `data-skeleton-highlight` and `data-skeleton-radius` — handy for accent-colored skeletons or mixed-radius layouts.',
      },
      {
        t: 'code',
        lang: 'html',
        label: 'per-element attributes',
        code: `<img src="user.png" data-skeleton-color="#a7f3d0" />
<div class="card" data-skeleton-radius="16"></div>`,
      },
      {
        t: 'callout',
        kind: 'tip',
        text: 'Precedence, from strongest to weakest: `data-skeleton-*` attributes → scan `color` / `highlightColor` options → `theme` palette → global CSS variables. Remember this chain when something looks &ldquo;stuck&rdquo; — an explicit color is usually winning.',
      },
    ],
  },

  /* ---------------------------------------------------------------- */
  /* API — SkeletonLoader                                              */
  /* ---------------------------------------------------------------- */
  {
    slug: 'api-loader',
    title: 'SkeletonLoader',
    description:
      'The programmatic API — four static methods cover the full lifecycle, and every scan returns a handle for fine-grained control. Everything below is also available as UniversalSkeleton.SkeletonLoader on the CDN build.',
    blocks: [
      { t: 'h2', text: 'Methods' },
      {
        t: 'table',
        head: ['Method', 'Signature', 'Description'],
        rows: [
          ['`scan()`', '`scan(target, options?) → SkeletonHandle`', 'Mirror the real UI of an Element or CSS selector as a skeleton. Scanning the same target again replaces the previous skeleton.'],
          ['`restore()`', '`restore(target)`', 'Remove the active skeleton and reveal the real UI. Safe no-op when nothing is active.'],
          ['`isActive()`', '`isActive(target) → boolean`', 'True while a skeleton is showing on the target.'],
          ['`while()`', '`while(source, target, options?) → Promise<T>`', 'Show a skeleton while a promise or function runs, then restore automatically — even when it rejects. The resolved value passes through unchanged.'],
        ],
      },
      {
        t: 'code',
        lang: 'javascript',
        label: 'typical flow',
        code: `const handle = SkeletonLoader.scan('#dashboard', { effect: 'wave' });

// later — any of these restore the UI:
handle.destroy();
SkeletonLoader.restore('#dashboard');

const data = await SkeletonLoader.while(
  () => fetch('/api/feed').then((r) => r.json()),
  '#dashboard',
  { minDuration: 400, effect: 'fade' }
);`,
      },
      {
        t: 'example',
        title: 'scan() / restore() in action',
        demo: 'scan-toggle',
        lang: 'javascript',
        code: `SkeletonLoader.scan('#profile', { effect: 'shimmer' });
SkeletonLoader.restore('#profile');`,
      },
      { t: 'h2', text: 'SkeletonHandle' },
      {
        t: 'table',
        head: ['Member', 'Description'],
        rows: [
          ['`handle.root`', 'The scanned root element.'],
          ['`handle.overlay`', 'The overlay element holding every skeleton block.'],
          ['`handle.blocks`', 'Number of skeleton blocks currently painted.'],
          ['`handle.update()`', 'Re-measure the real UI and rebuild every block (runs automatically on resize).'],
          ['`handle.setEffect(effect)`', 'Swap the animation at runtime — any of the 8 effect names, without re-measuring.'],
          ['`handle.setTheme(theme)`', 'Swap the color palette at runtime — `light`, `dark` or `auto`.'],
          ['`handle.destroy()`', 'Remove the skeleton and restore the real UI. Idempotent.'],
        ],
      },
      { t: 'h2', text: 'SkeletonOptions' },
      {
        t: 'table',
        head: ['Option', 'Type', 'Default', 'Description'],
        rows: [
          ['`effect`', '`shimmer | wave | pulse | fade | blink | sheen | bounce | none`', `'shimmer'`, 'Animation style'],
          ['`theme`', `'light' | 'dark' | 'auto'`, `'auto'`, 'Block color palette — `auto` follows `prefers-color-scheme`'],
          ['`color`', 'string', `'#e5e7eb'`, 'Base color of every block (any CSS color)'],
          ['`highlightColor`', 'string', `'#f3f4f6'`, 'Bright band of shimmer / wave / sheen'],
          ['`duration`', 'string | number', `'1.4s'`, 'One animation cycle — CSS time (`2s`) or milliseconds (`900`)'],
          ['`radius`', 'number | null', '8', 'Corner radius (px) of rect blocks; text bars stay pill-shaped'],
          ['`exclude`', 'string | fn', '—', 'CSS selector or `(el) => boolean`; matching elements are skipped'],
          ['`textLines`', 'boolean', 'true', 'One pill bar per estimated text line'],
          ['`responsive`', 'boolean', 'true', 'ResizeObserver rebuilds blocks when the layout changes'],
          ['`blockInteraction`', 'boolean', 'true', 'Block pointer events while the skeleton is visible'],
          ['`minDuration`', 'number', '0', '`while()` only — keep the skeleton visible at least this long (ms)'],
        ],
      },
      {
        t: 'callout',
        kind: 'warn',
        text: 'Scanning a target that already has a skeleton **replaces** it — you never get two overlays. Both `restore()` and `handle.destroy()` are idempotent, so cleanup code can call them without guards.',
      },
      {
        t: 'callout',
        kind: 'info',
        text: '`while()` restores **even when the promise rejects** — wrap risky fetches without try/finally. Use `minDuration` to avoid skeleton flicker on fast responses.',
      },
    ],
  },

  /* ---------------------------------------------------------------- */
  /* API — Web Component                                               */
  /* ---------------------------------------------------------------- */
  {
    slug: 'api-web-component',
    title: '<skeleton-screen>',
    description:
      'A zero-configuration Web Component: wrap your real markup, toggle one attribute. Because custom elements are the one component format every framework speaks, the same tag works in React, Vue, Angular, Svelte, Lit, jQuery and plain HTML.',
    blocks: [
      {
        t: 'code',
        lang: 'html',
        label: 'basic usage',
        code: `<skeleton-screen loading effect="shimmer">
  <!-- your real markup stays in the light DOM -->
  <article>…</article>
</skeleton-screen>`,
      },
      { t: 'h2', text: 'Attributes' },
      {
        t: 'table',
        head: ['Attribute', 'Values', 'Description'],
        rows: [
          ['`loading`', 'present, or `""` / `"true"` / `"1"` / `"on"`', 'Show the skeleton; remove the attribute (or set `"false"`) to reveal the UI'],
          ['`effect`', 'the 8 effect names', 'Animation style (default `shimmer`)'],
          ['`theme`', '`light` / `dark` / `auto`', 'Block color palette (default `auto` — follows the OS setting)'],
          ['`color`', 'any CSS color', 'Base block color'],
          ['`highlight-color`', 'any CSS color', 'Bright band color'],
          ['`duration`', '`"2s"` or `"900"`', 'One animation cycle'],
          ['`radius`', 'px number', 'Corner radius of rect blocks'],
          ['`delay`', 'milliseconds', 'Anti-flicker grace period — a load that finishes inside it never shows a skeleton'],
          ['`timeout`', 'milliseconds', 'Failsafe watchdog — auto-destroys a stuck skeleton and reveals the UI'],
        ],
      },
      {
        t: 'example',
        title: 'Toggle loading & switch effect — live',
        demo: 'web-component',
        lang: 'html',
        code: `<skeleton-screen loading effect="wave">
  <article>…</article>
</skeleton-screen>`,
      },
      { t: 'h2', text: 'Methods on the element' },
      {
        t: 'p',
        text: 'The element also exposes `show()` and `hide()` for imperative control. Options passed to `show()` override the attributes for that scan.',
      },
      {
        t: 'code',
        lang: 'javascript',
        label: 'imperative API',
        code: `const el = document.querySelector('skeleton-screen');

el.show({ effect: 'bounce', color: '#cbd5e1' }); // options override attributes
el.hide();                                       // reveal the real UI`,
      },
      { t: 'h2', text: 'Registering a custom tag name' },
      {
        t: 'code',
        lang: 'javascript',
        label: 'alias',
        code: `import { registerSkeletonScreen } from 'universal-skeleton';
registerSkeletonScreen('my-skeleton'); // <my-skeleton loading>`,
      },
      {
        t: 'callout',
        kind: 'info',
        text: 'Children stay in the **light DOM** — they inherit your site styles, remain inspectable, and crawlers that ignore JS still see the real content behind the overlay.',
      },
      {
        t: 'callout',
        kind: 'warn',
        text: 'SSR frameworks: custom elements upgrade on the client. In React 19 render the tag directly; in Vue, Angular and Svelte it works natively — but gate it behind a mounted check in Next.js/Nuxt/Astro to avoid hydration mismatches (shown in each framework guide).',
      },
    ],
  },

  /* ---------------------------------------------------------------- */
  /* API — data-skeleton attributes                                    */
  /* ---------------------------------------------------------------- */
  {
    slug: 'api-attributes',
    title: 'data-skeleton attributes',
    description:
      'Fine-tune the scan per element with plain HTML attributes — force shapes, override colors, or exclude subtrees — without touching any JavaScript.',
    blocks: [
      { t: 'h2', text: 'data-skeleton values' },
      {
        t: 'table',
        head: ['Value', 'Effect'],
        rows: [
          ['`auto`', 'Normal auto-detection (the default when the attribute is absent)'],
          ['`circle`', 'Paint this element as a circle block'],
          ['`rect`', 'Paint this element as one rounded rectangular block'],
          ['`text`', 'Force pill text bars even for non-text elements'],
          ['`image`', 'Treat the element as media — a single block with its corner radius'],
          ['`none`', 'Skip the skeleton for this element (children still scanned)'],
          ['`ignore`', 'Skip this element **and its whole subtree**'],
        ],
      },
      { t: 'h2', text: 'Related attributes' },
      {
        t: 'table',
        head: ['Attribute', 'Values', 'Effect'],
        rows: [
          ['`data-skeleton-radius`', 'number (px)', 'Override the corner radius of this block'],
          ['`data-skeleton-color`', 'CSS color', 'Base color for this block'],
          ['`data-skeleton-highlight`', 'CSS color', 'Bright band color for this block'],
          ['`data-skeleton-ignore`', 'boolean attribute', 'Skip this element anywhere in a scanned tree (badges, spinners…)'],
        ],
      },
      {
        t: 'example',
        title: 'Shape and radius overrides, live',
        demo: 'data-attributes',
        lang: 'html',
        code: `<img src="avatar.png" data-skeleton="circle" />
<div class="plate" data-skeleton="rect" data-skeleton-radius="10"></div>
<span class="live" data-skeleton-ignore>LIVE</span>`,
      },
      { t: 'h2', text: 'When to use which' },
      {
        t: 'bullets',
        items: [
          '`circle` / `rect` — when auto-detection cannot see the final shape (CSS applied later, shape comes from a parent).',
          '`text` — force line pills on custom elements or icon-text rows.',
          '`none` — keep an element interactive while the rest skeletonizes (a cancel button, a search input).',
          '`ignore` — hide badges, ticks and spinners from the skeleton entirely.',
        ],
      },
      {
        t: 'code',
        lang: 'html',
        label: 'mixed overrides',
        code: `<div id="toolbar">
  <img class="avatar" data-skeleton="circle" />
  <button data-skeleton="none">Cancel</button>
  <span class="pill" data-skeleton="rect" data-skeleton-radius="999"
        data-skeleton-color="#a7f3d0"></span>
</div>`,
      },
      {
        t: 'callout',
        kind: 'tip',
        text: 'Attributes only apply while a scan covers them — they are read at scan time and re-read on every rebuild, so toggling one dynamically updates the next paint.',
      },
      {
        t: 'callout',
        kind: 'info',
        text: 'These classic attributes have a framework-agnostic twin: the **data-us-* contract** — see the next page. When both are set on the same element, `data-skeleton-*` wins.',
      },
    ],
  },

  /* ---------------------------------------------------------------- */
  /* API — the universal data-us-* contract                            */
  /* ---------------------------------------------------------------- */
  {
    slug: 'api-us-contract',
    title: 'The data-us-* contract',
    description:
      'One declarative attribute contract for plain HTML, PHP/Blade templates, HTMX, Turbo Frames and every framework that prefers markup over code — the exact same engine underneath, zero JavaScript required to drive it.',
    blocks: [
      { t: 'h2', text: 'Declarative loading' },
      {
        t: 'p',
        text: 'Set `data-us-loading` on any container and the library watches it for you — a single shared, lazily-created MutationObserver batches reactions through requestAnimationFrame. Flip the attribute from anywhere (server-rendered markup, HTMX swaps, Turbo streams, jQuery, template conditionals) and the skeleton follows.',
      },
      {
        t: 'code',
        lang: 'html',
        label: 'plain HTML / PHP / WordPress — zero build step',
        code: `<link rel="stylesheet" href="/assets/universal-skeleton.css" />
<script src="/assets/universal-skeleton.iife.js" defer></script>

<div data-us-loading="true" data-us-delay="150" data-us-timeout="15000">
  <article class="card">
    <span class="badge" data-us-ignore>Featured</span>
    <img src="avatar.jpg" data-us-shape="circle" />
    <h3 data-us-width="65%">Article heading</h3>
    <p data-us-lines="3">Summary paragraph placeholder text.</p>
    <button type="button">Read more</button>
  </article>
</div>

<!-- swap to real content from anywhere: -->
<!-- el.setAttribute('data-us-loading', 'false') -->`,
      },
      {
        t: 'table',
        head: ['Attribute', 'Values', 'Effect'],
        rows: [
          ['`data-us-loading`', '`"true"` / `"false"` (also `""`, `"1"`, `"on"`, `"loading"`)', 'Turns the skeleton on this container on and off. Removing the element from the DOM destroys its skeleton automatically — no leaks on route changes'],
          ['`data-us-ignore`', 'boolean attribute', 'Exclude this element (and its subtree) from the skeleton — badges, spinners, live counters'],
          ['`data-us-shape`', '`circle` / `pill` / `square` / `rect`', 'Force the geometry of this block — `pill` is fully rounded, `square` has zero radius'],
          ['`data-us-lines`', '`1…6`', 'Expand one text element into N pill bars with ragged-right endings'],
          ['`data-us-width`', '`"65%"` / `"120px"` / `"120"`', 'Pin the width of this element’s text bars — percentage of the element or absolute pixels'],
          ['`data-us-color`', 'CSS color', 'Base color of this block (alias of `data-skeleton-color`)'],
          ['`data-us-highlight`', 'CSS color', 'Shimmer band color of this block (alias of `data-skeleton-highlight`)'],
        ],
      },
      { t: 'h2', text: 'Timing guards' },
      {
        t: 'p',
        text: 'Two attributes make loading states production-safe on any network. They work with `data-us-loading`, `SkeletonLoader.scan()` / `.while()` options, and `<skeleton-screen delay timeout>` alike.',
      },
      {
        t: 'table',
        head: ['Attribute', 'Values', 'Effect'],
        rows: [
          ['`data-us-delay`', 'milliseconds', '**Anti-flicker grace period.** The skeleton stays invisible (laid out, but hidden) and is cancelled entirely if loading finishes first — cached responses under 150 ms never flash'],
          ['`data-us-timeout`', 'milliseconds', '**Failsafe watchdog.** If the data has not arrived after N ms the skeleton destroys itself and fires the optional `onTimeout` callback — a hanging API can never freeze the UI in a permanent skeleton'],
          ['`data-us-repeat`', '`1…50`', 'The loop this container backs is empty — paint N evenly stacked placeholder rows instead of one grey void (`@foreach` with `[]`, `v-for` with an empty list, `.map()` over `null`)'],
        ],
      },
      { t: 'h2', text: 'Enterprise hardening, built in' },
      {
        t: 'bullets',
        items: [
          '**Interactive lockdown.** While a skeleton is visible, every interactive descendant (`a[href]`, `button`, `input`, `select`, `textarea`, `iframe`, `[tabindex]`, `[contenteditable]`) gets the native `inert` attribute — no phantom clicks, no keyboard focus into hidden controls, no double submits. Original attributes are restored exactly on `destroy()`.',
          '**Zero-CLS container pin.** The scanned root’s current height is pinned as an inline `min-height` during loading, so emptying the container for the fetch can never collapse the layout. Restored on destroy.',
          '**Iterative traversal, depth-capped.** The DOM walk is queue-based (no recursion) with a `maxDepth` guard (default 20, configurable) and a visited-set cycle guard — pathologically deep or malformed trees can never crash the tab.',
          '**Deterministic output.** No `Math.random()` anywhere — every bar width is seeded from DOM order, so the same markup always paints the same skeleton (SSR and hydration snapshots stay stable).',
          '**Screen-reader announcements.** `aria-busy="true"` on the active region, `aria-hidden` on all generated blocks, and one shared debounced `role="status"` live region per document that says *Loading content…* → *Content loaded*.',
          '**Save-Data aware.** On `Save-Data: on` connections the animation is switched off automatically — static blocks, no repaint cost.',
          '**Strict-CSP friendly.** Styles are injected lazily (first skeleton, not import). For `style-src \'self\'` policies call `setAutoInject(false)` and ship `dist/universal-skeleton.css` as a static asset instead.',
          '**Reduced motion.** Every animation is disabled under `prefers-reduced-motion: reduce` out of the box.',
        ],
      },
      {
        t: 'code',
        lang: 'javascript',
        label: 'same guards via the JS API',
        code: `SkeletonLoader.scan('#dashboard', {
  delay: 150,          // anti-flicker grace period (ms)
  timeout: 15000,      // failsafe watchdog (ms)
  onTimeout(root) {    // graceful fallback when data hangs
    root.textContent = 'Could not load — retry';
  },
});

// promise form — guards compose with while()
SkeletonLoader.while(fetchUser(), '#profile', {
  delay: 150,
  timeout: 10000,
});`,
      },
      {
        t: 'callout',
        kind: 'info',
        text: 'Precedence on a single element: `data-skeleton-*` (classic) → `data-us-*` (universal). Both contracts drive the exact same engine, so you can migrate attribute by attribute — nothing breaks in between.',
      },
    ],
  },
];
