/**
 * universal-skeleton — scan.js
 *
 * The layout engine: walks a DOM subtree, classifies every visible leaf
 * (text, images, buttons, inputs…) and paints grey blocks that mirror the
 * real geometry of the UI, so the skeleton looks "just like the UI".
 *
 * Strategy
 * --------
 * 1. An empty overlay <div> is appended inside the root (positioned over it).
 * 2. Every meaningful leaf element is measured with getBoundingClientRect().
 * 3. Grey blocks are absolutely positioned inside the overlay at the exact
 *    coordinates of the real elements; the real content is hidden with CSS.
 * 4. destroy() removes the overlay and all helper classes — nothing mutated
 *    the DOM permanently.
 *
 * Hardening (enterprise spec)
 * ---------------------------
 * - Iterative, queue-based traversal (no recursion) capped by `maxDepth`
 *   (default 20) with a visited-set cycle guard — deeply nested or malformed
 *   trees can never crash the tab with a stack overflow.
 * - Deterministic seeded widths — no Math.random anywhere, so the same DOM
 *   always produces the same skeleton (SSR/hydration-safe).
 * - Interactive descendants (links, buttons, inputs…) are locked with the
 *   native `inert` attribute while the skeleton is visible, and cleanly
 *   restored afterwards — no phantom clicks, tab stops or double submits.
 * - `delay` (anti-flicker) keeps fast skeletons invisible; `timeout`
 *   (failsafe watchdog) auto-destroys skeletons whose data never arrives.
 * - A shared `role="status"` live region announces "Loading content…" /
 *   "Content loaded" once per document (debounced).
 * - `Save-Data` network hints automatically switch animations off.
 */

/** Elements that are always rendered as ONE solid block (no recursion). */
const SELF_BLOCK_TAGS = new Set([
  'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'METER', 'PROGRESS',
  'IMG', 'PICTURE', 'VIDEO', 'CANVAS', 'SVG', 'OBJECT', 'EMBED',
]);
const MEDIA_TAGS = new Set(['IMG', 'PICTURE', 'VIDEO', 'CANVAS', 'SVG', 'OBJECT', 'EMBED']);

/**
 * "Shaped" elements — ones that paint their own visible background (badges,
 * chips, pills, coloured labels…) — are skeletonised as ONE solid block over
 * the whole shape instead of leaving the colour visible under text bars.
 *
 * SHAPE_MIN_ALPHA   backgrounds weaker than this alpha (glows, overlays at
 *                   10–20% opacity) are decorative, not shapes.
 * SHAPE_MAX_HEIGHT  elements taller than this (cards, callouts, code blocks…)
 *                   keep the classic per-line text bars.
 */
const SHAPE_MIN_ALPHA = 0.35;
const SHAPE_MAX_HEIGHT = 64;

/**
 * Interactive elements that get locked (inert / tabindex -1) while their
 * container shows a skeleton — prevents phantom clicks, keyboard focus and
 * double submits on the real UI hiding underneath.
 */
const INTERACTIVE_SELECTOR =
  'a[href], button, input, select, textarea, iframe, details, summary, [contenteditable], [tabindex]';

/** Extract the alpha channel of a computed CSS color string, 0–1. */
function colorAlpha(color) {
  if (!color) return 0;
  const s = String(color).trim().toLowerCase();
  if (!s || s === 'transparent' || s === 'none') return 0;
  // Modern syntax with a slash alpha: rgb(0 0 0 / 0.4), oklch(0.7 0.1 200 / 0.5),
  // rgb(0 0 0 / 40%) — the alpha may be a fraction or a percentage.
  const slash = s.match(/\/\s*([0-9.]+)(%?)\s*\)$/);
  if (slash) return parseFloat(slash[1]) * (slash[2] ? 0.01 : 1);
  // Hex with alpha channel: #rgba / #rrggbbaa
  if (s.startsWith('#')) {
    if (s.length === 5) return parseInt(s[4] + s[4], 16) / 255;
    if (s.length === 9) return parseInt(s.slice(7), 16) / 255;
    return 1;
  }
  // Tailwind v4 opacity modifiers compile to color-mix(): the first percentage
  // is the color share and the rest is transparent, so that ratio IS the alpha.
  if (s.startsWith('color-mix')) {
    const mix = s.match(/([\d.]+)%/);
    if (mix && s.includes('transparent')) return parseFloat(mix[1]) / 100;
    return 1;
  }
  // Legacy syntax: rgba(r, g, b, a)
  const legacy = s.match(/rgba?\(([^)]+)\)/);
  if (legacy) {
    const parts = legacy[1].split(/[\s,]+/).filter(Boolean);
    if (parts.length >= 4) return parseFloat(parts[3]);
    return 1;
  }
  return 1; // named colors and other color functions (oklch, oklab, lab, lch) — assume visible
}

/**
 * What kind of visible surface the element paints on itself, if any:
 *   'solid'    — an opaque-enough background-color
 *   'gradient' — a background-image (gradient) on a text element
 *   null       — no visible shape (transparent, decorative-only or none)
 */
function paintedSurface(el) {
  const cs = computedStyle(el);
  if (colorAlpha(cs.backgroundColor) >= SHAPE_MIN_ALPHA) return 'solid';
  const image = cs.backgroundImage;
  if (image && image !== 'none' && image !== '') return 'gradient';
  return null;
}

/** Elements that never get a skeleton and are never recursed into. */
const SKIP_TAGS = new Set([
  'SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'LINK', 'META', 'BASE',
  'TITLE', 'HEAD', 'BR', 'WBR', 'SOURCE', 'TRACK', 'AREA', 'MAP', 'PARAM',
]);

/** Allowed values of the data-skeleton attribute. */
const MANUAL = new Set(['circle', 'rect', 'text', 'image', 'none', 'ignore', 'auto']);

/**
 * Every animation effect the engine knows, in display order.
 * Unknown values always fall back to 'shimmer'.
 */
export const EFFECTS = ['shimmer', 'wave', 'pulse', 'fade', 'blink', 'sheen', 'bounce', 'none'];

const EFFECT_SET = new Set(EFFECTS);

/**
 * Color palettes for the skeleton blocks.
 *   light — grey blocks for light UIs (the classic look)
 *   dark  — dark blocks for dark UIs
 *   auto  — follows the OS `prefers-color-scheme`, zero JavaScript
 * Explicit color options always win over the palette.
 */
export const THEMES = ['light', 'dark', 'auto'];

const THEME_SET = new Set(THEMES);

function rectOf(el) {
  const r = el.getBoundingClientRect();
  return { left: r.left, top: r.top, width: r.width, height: r.height };
}

function computedStyle(el) {
  const view = el.ownerDocument && el.ownerDocument.defaultView;
  if (view && view.getComputedStyle) return view.getComputedStyle(el);
  return typeof getComputedStyle === 'function' ? getComputedStyle(el) : {};
}

function isVisible(el) {
  if (el.hasAttribute('hidden')) return false;
  const cs = computedStyle(el);
  if (cs.display === 'none' || cs.visibility === 'hidden') return false;
  return true;
}

function isExcluded(el, exclude) {
  if (!exclude) return false;
  if (typeof exclude === 'string') {
    try { return el.matches(exclude); } catch { return false; }
  }
  if (typeof exclude === 'function') {
    try { return exclude(el) === true; } catch { return false; }
  }
  return false;
}

/** Numeric attribute helper — null when missing or not a finite number. */
function attrNum(el, name) {
  const raw = el.getAttribute(name);
  if (raw === null || raw === '') return null;
  const n = parseFloat(raw);
  return Number.isFinite(n) ? n : null;
}

/** Integer attribute helper clamped to [min, max] — null when missing. */
function attrInt(el, name, min, max) {
  const n = attrNum(el, name);
  if (n === null) return null;
  return Math.min(Math.max(Math.round(n), min), max);
}

/** Parse a width spec ('65%', '120px', '120') against a base pixel width. */
function widthPx(spec, baseWidth) {
  const s = String(spec).trim();
  if (s.endsWith('%')) {
    const p = parseFloat(s);
    return Number.isFinite(p) ? (baseWidth * p) / 100 : baseWidth;
  }
  const px = parseFloat(s);
  return Number.isFinite(px) ? px : baseWidth;
}

/**
 * Parse the manual skeleton hints of an element. Two attribute contracts are
 * understood — they describe the exact same engine:
 *
 *   classic    data-skeleton="circle|rect|text|…" + data-skeleton-radius /
 *              data-skeleton-color / data-skeleton-highlight
 *   universal  data-us-ignore, data-us-shape="circle|pill|rect|square",
 *              data-us-lines="1..6", data-us-width="65%",
 *              data-us-color, data-us-highlight
 *
 * Classic attributes win when both are present on the same element.
 */
function dataOpts(el) {
  const raw = (el.getAttribute('data-skeleton') || '').trim().toLowerCase();
  let type = MANUAL.has(raw) ? raw : null;
  let radius = attrNum(el, 'data-skeleton-radius');
  let ignore = false;

  // ---- Universal contract (data-us-* ) --------------------------------
  // Classic data-skeleton attributes win when both are present.
  if (el.hasAttribute('data-us-ignore')) ignore = true;
  const shape = (el.getAttribute('data-us-shape') || '').trim().toLowerCase();
  if (!type) {
    if (shape === 'circle') {
      type = 'circle';
    } else if (shape === 'pill') {
      type = 'rect';
      radius = 'pill'; // resolved to half the height at render time
    } else if (shape === 'square') {
      type = 'rect';
      radius = 0;
    } else if (shape === 'rect') {
      type = 'rect';
    }
  }

  return {
    type,
    radius,
    ignore,
    lines: attrInt(el, 'data-us-lines', 1, 6),
    width: el.getAttribute('data-us-width'),
    color: el.getAttribute('data-skeleton-color') || el.getAttribute('data-us-color'),
    highlight: el.getAttribute('data-skeleton-highlight') || el.getAttribute('data-us-highlight'),
  };
}

/** Deterministic 0.50–0.94 width factor for the last line of a text block. */
function lastLineWidth(seed) {
  return 0.5 + ((seed * 53) % 45) / 100;
}

/** True when an element is visually round (border-radius 50% or half its size). */
function looksCircle(el, r) {
  const br = computedStyle(el).borderRadius;
  if (!br) return false;
  if (br.endsWith('%')) return parseFloat(br) >= 45;
  const px = parseFloat(br);
  return Number.isFinite(px) && Math.abs(px - Math.min(r.width, r.height) / 2) <= 2.5;
}

/** Computed corner radius in px, or null when flat/unset. */
function inheritRadius(el) {
  const px = parseFloat(computedStyle(el).borderRadius);
  return Number.isFinite(px) && px > 0 ? Math.round(px) : null;
}

function addBlock(out, overlayRect, spec) {
  const { x, y, w, h, shape = 'rect', radius = null, color = null, highlight = null } = spec;
  if (w < 2 || h < 2) return;
  const b = document.createElement('span');
  b.className = 'usk-block' + (shape === 'circle' ? ' usk-circle' : '');
  b.style.left = `${x - overlayRect.left}px`;
  b.style.top = `${y - overlayRect.top}px`;
  b.style.width = `${w}px`;
  b.style.height = `${h}px`;
  // radius === 'pill' → fully rounded ends (data-us-shape="pill")
  const rr = radius === 'pill' ? Math.round(h / 2) : radius;
  if (shape !== 'circle' && rr != null) b.style.borderRadius = `${rr}px`;
  if (color) b.style.setProperty('--usk-color', color);
  if (highlight) b.style.setProperty('--usk-highlight', highlight);
  out.push(b);
}

/**
 * Paint one pill-shaped bar per visual text line of `el`.
 * The number of lines comes from the estimated height, or from an explicit
 * data-us-lines="N" override; widths can be pinned with data-us-width.
 */
function addTextBars(out, overlayRect, el, seed, opts, manual = null) {
  const r = rectOf(el);
  const cs = computedStyle(el);
  // Guard: environments that do not resolve font units (e.g. '1.5em' in jsdom)
  // can report absurdly small values — fall back to the 16px browser default.
  let fontSize = parseFloat(cs.fontSize);
  if (!(fontSize >= 4)) fontSize = 16;
  const lineHeight = parseFloat(cs.lineHeight);
  const lineH = lineHeight >= fontSize ? lineHeight : Math.round(fontSize * 1.45);
  const avail = Math.max(r.height, fontSize * 0.6);
  let lines = opts.textLines
    ? Math.min(Math.max(Math.round(avail / lineH), 1), 6)
    : 1;
  if (manual && Number.isFinite(manual.lines) && manual.lines >= 1) lines = manual.lines;
  const perLine = lines === 1 ? r.height : lineH;
  const barH = Math.min(
    lines === 1 ? Math.max(Math.round(fontSize * 0.72), 8) : Math.round(lineH * 0.62),
    Math.round(perLine)
  );

  // data-us-width pins the bar width — a % of the element or a px value.
  const base = manual && manual.width ? widthPx(manual.width, r.width) : r.width;

  for (let i = 0; i < lines; i++) {
    const isLast = i === lines - 1 && lines > 1;
    const w = Math.max(isLast ? base * lastLineWidth(seed + i) : base, 24);
    const y = r.top + (lines === 1 ? 0 : i * lineH) + (perLine - barH) / 2;
    addBlock(out, overlayRect, {
      x: r.left, y, w, h: barH,
      shape: 'rect',
      radius: Math.round(barH / 2),
    });
  }
  el.classList.add('usk-t');
  return lines;
}

/** True when an element has no visible element children and no own text. */
function isEmptyContainer(el, ctx) {
  for (const child of el.children) {
    if (child !== ctx.overlay && isVisible(child)) return false;
  }
  return true;
}

/**
 * data-us-repeat="N" — the loop this container backs is empty, so paint N
 * evenly stacked placeholder rows instead of one big grey void.
 */
function addRepeatRows(out, overlayRect, el, n) {
  const r = rectOf(el);
  const gap = 12;
  const usable = r.height - gap * (n - 1);
  const rowH = usable > n * 8 ? usable / n : 56;
  for (let i = 0; i < n; i++) {
    addBlock(out, overlayRect, {
      x: r.left,
      y: r.top + i * (rowH + gap),
      w: r.width,
      h: rowH,
      shape: 'rect',
      radius: Math.round(Math.min(rowH / 2, 12)),
    });
  }
}

/**
 * Walk `root` and classify every visible node.
 *
 * Iterative on purpose: a plain stack instead of recursion, so pathologically
 * deep trees (nested comments, folder trees, malformed HTML) can never raise
 * RangeError. `maxDepth` (default 20) stops runaway nesting, the visited set
 * makes cycles impossible to follow.
 */
function walk(rootEl, ctx) {
  const maxDepth = Number.isFinite(ctx.opts.maxDepth) && ctx.opts.maxDepth > 0
    ? ctx.opts.maxDepth
    : 20;
  const visited = new WeakSet();
  const stack = [{ el: rootEl, depth: 0 }];

  while (stack.length) {
    const { el, depth } = stack.pop();
    if (depth > maxDepth) continue;
    if (visited.has(el)) continue;
    visited.add(el);

    if (SKIP_TAGS.has(el.tagName)) continue;
    if (el.classList && el.classList.contains('usk-overlay')) continue;
    if (el.hasAttribute('data-skeleton-ignore') || el.hasAttribute('data-us-ignore')) continue;
    if (isExcluded(el, ctx.exclude)) continue;
    if (!isVisible(el)) continue;

    const r = rectOf(el);
    const manual = dataOpts(el);
    if (manual.ignore) continue;

    // Manual override wins and covers the whole element — no recursion.
    if (manual.type && manual.type !== 'auto') {
      if (manual.type === 'text') {
        addTextBars(ctx.out, ctx.overlayRect, el, ctx.seed++, ctx.opts, manual);
        continue;
      }
      if (manual.type === 'none' || manual.type === 'ignore') continue;
      addBlock(ctx.out, ctx.overlayRect, {
        x: r.left, y: r.top, w: r.width, h: r.height,
        shape: manual.type === 'circle' ? 'circle' : 'rect',
        radius: manual.radius,
        color: manual.color,
        highlight: manual.highlight,
      });
      continue;
    }

    // Elements that are always a single solid block.
    if (SELF_BLOCK_TAGS.has(el.tagName)) {
      const circle = el.tagName === 'IMG' && looksCircle(el, r);
      addBlock(ctx.out, ctx.overlayRect, {
        x: r.left, y: r.top, w: r.width, h: r.height,
        shape: circle ? 'circle' : 'rect',
        radius: manual.radius != null
          ? manual.radius
          : (circle ? null : (MEDIA_TAGS.has(el.tagName) ? ctx.opts.radius : inheritRadius(el))),
        color: manual.color,
        highlight: manual.highlight,
      });
      continue;
    }

    // Text leaf → pill bars — unless the element paints its own shape.
    // A badge / chip / pill with a coloured background must skeletonise as ONE
    // block over the whole shape; otherwise the colour stays visible and only
    // the text inside gets bars (grey bar on a green pill).
    const hasText = Array.prototype.some.call(
      el.childNodes,
      (n) => n.nodeType === 3 && n.textContent.trim().length > 0
    );
    const surface = paintedSurface(el);
    const badgeLike = surface !== null && (
      // coloured badge / chip / pill with text (compact enough to be one shape)
      (hasText && r.height <= SHAPE_MAX_HEIGHT) ||
      // empty coloured pill, dot or spacer — nothing inside to mirror anyway
      (!hasText && el.children.length === 0 && surface === 'solid')
    );
    if (badgeLike) {
      el.classList.add('usk-s');
      addBlock(ctx.out, ctx.overlayRect, {
        x: r.left, y: r.top, w: r.width, h: r.height,
        shape: 'rect',
        radius: manual.radius != null ? manual.radius : (inheritRadius(el) ?? 0),
        color: manual.color,
        highlight: manual.highlight,
      });
      continue;
    }
    if (hasText) {
      addTextBars(ctx.out, ctx.overlayRect, el, ctx.seed++, ctx.opts, manual);
      continue;
    }

    // Empty loop container with data-us-repeat → synthesize N placeholder rows.
    const repeat = attrInt(el, 'data-us-repeat', 1, 50);
    if (repeat && isEmptyContainer(el, ctx)) {
      addRepeatRows(ctx.out, ctx.overlayRect, el, repeat);
      continue;
    }

    // Pure container → recurse into element children.
    // Pushed in reverse so the LIFO pop preserves document order — that keeps
    // ctx.seed (and therefore text bar widths) identical to a recursive scan.
    for (let i = el.children.length - 1; i >= 0; i--) {
      stack.push({ el: el.children[i], depth: depth + 1 });
    }
  }
}

/* ------------------------------------------------------------------ *
 * Shared accessibility live region                                    *
 * ------------------------------------------------------------------ */

const liveRegions = new WeakMap(); // Document → <span role="status">
let liveCount = 0;
let liveTimer = 0;

function liveFor(doc) {
  let el = liveRegions.get(doc);
  if (!el || !el.isConnected) {
    el = doc.createElement('span');
    el.className = 'usk-live';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    (doc.body || doc.documentElement).appendChild(el);
    liveRegions.set(doc, el);
  }
  return el;
}

/** Debounced "Loading content…" — never spams the AT for quick swaps. */
function announceLoading(doc) {
  liveCount++;
  if (liveTimer) return;
  const schedule = typeof setTimeout === 'function' ? setTimeout : (fn) => fn();
  liveTimer = schedule(() => {
    liveTimer = 0;
    if (liveCount > 0 && typeof document !== 'undefined') {
      liveFor(doc).textContent = 'Loading content…';
    }
  }, 120);
}

/** "Content loaded" once the very last active skeleton is removed. */
function announceLoaded(doc) {
  liveCount = Math.max(liveCount - 1, 0);
  if (liveCount > 0) return;
  if (liveTimer) { clearTimeout(liveTimer); liveTimer = 0; }
  if (typeof document !== 'undefined') {
    liveFor(doc).textContent = 'Content loaded';
  }
}

/**
 * Lock every interactive descendant while the skeleton is visible.
 * Uses the native `inert` attribute when the browser supports it; otherwise
 * falls back to tabindex="-1" + a pointer-events:none class. All original
 * values are kept in a Map and restored by unlock().
 */
function lockInteractive(root) {
  const supportsInert =
    typeof HTMLElement !== 'undefined' && 'inert' in HTMLElement.prototype;
  const saved = new Map();
  const targets = [];

  if (root.matches && root.matches(INTERACTIVE_SELECTOR)) targets.push(root);
  root.querySelectorAll(INTERACTIVE_SELECTOR).forEach((el) => targets.push(el));

  for (const el of targets) {
    saved.set(el, {
      inert: el.getAttribute('inert'),
      tabindex: el.getAttribute('tabindex'),
      cls: el.classList.contains('usk-noio'),
    });
    if (supportsInert) {
      el.setAttribute('inert', '');
    } else {
      if (el.getAttribute('tabindex') === null) el.setAttribute('tabindex', '-1');
      el.classList.add('usk-noio');
    }
  }
  return saved;
}

function unlockInteractive(saved) {
  for (const [el, prev] of saved) {
    if (prev.inert === null) el.removeAttribute('inert');
    else el.setAttribute('inert', prev.inert);
    if (prev.tabindex === null) el.removeAttribute('tabindex');
    else el.setAttribute('tabindex', prev.tabindex);
    if (!prev.cls) el.classList.remove('usk-noio');
  }
  saved.clear();
}

/**
 * Build a skeleton overlay over `root`.
 *
 * @param {Element} root
 * @param {object}  [userOpts]
 * @param {import('./scan.js').Effect} [userOpts.effect='shimmer']
 * @param {'light'|'dark'|'auto'} [userOpts.theme='auto'] block color palette
 * @param {string}   [userOpts.color]          base grey (CSS color)
 * @param {string}   [userOpts.highlightColor] shimmer band color
 * @param {string|number} [userOpts.duration]  one animation cycle (CSS time like '2s', or ms number)
 * @param {number}   [userOpts.radius]         corner radius (px) for rect blocks
 * @param {string|((el: Element) => boolean)} [userOpts.exclude] selector or predicate to skip
 * @param {boolean}  [userOpts.textLines=true] one bar per estimated text line
 * @param {boolean}  [userOpts.responsive=true] rebuild on root resize
 * @param {boolean}  [userOpts.blockInteraction=true] lock interactive descendants (inert)
 *   while visible
 * @param {number}   [userOpts.delay=0]   anti-flicker grace period (ms) — the
 *   skeleton stays invisible and is cancelled entirely if destroy() happens
 *   first (fast cached responses never flash)
 * @param {number}   [userOpts.timeout=0] failsafe watchdog (ms) — auto-destroy
 *   if the data never arrives; fires opts.onTimeout(root) when it triggers
 * @param {number}   [userOpts.maxDepth=20] traversal depth cap
 * @param {Function} [userOpts.onTimeout]  watchdog callback
 *
 *   Shaped elements (badges, chips, pills with their own background colour)
 *   always become one solid block over the whole shape — use
 *   `data-skeleton="text"` or `data-us-shape` on a specific element to force
 *   a different treatment.
 *
 *   Root-level attributes data-us-delay / data-us-timeout / data-us-repeat
 *   are honoured automatically unless the matching option is passed.
 *
 * @returns {{root, overlay, blocks, update, setEffect, setTheme, destroy}}
 */
export function buildSkeleton(root, userOpts = {}) {
  const opts = {
    effect: 'shimmer',
    theme: 'auto',
    color: null,
    highlightColor: null,
    duration: null,
    radius: null,
    exclude: null,
    textLines: true,
    responsive: true,
    blockInteraction: true,
    delay: 0,
    timeout: 0,
    maxDepth: 20,
    onTimeout: null,
    ...userOpts,
  };

  if (typeof document === 'undefined') {
    throw new Error('[universal-skeleton] buildSkeleton() requires a DOM (document).');
  }

  const ownerDoc = root.ownerDocument || document;

  // Root-level universal attributes are honoured unless explicitly overridden.
  if (!userOpts.delay) opts.delay = attrInt(root, 'data-us-delay', 1, 60000) || 0;
  if (!userOpts.timeout) opts.timeout = attrInt(root, 'data-us-timeout', 1, 600000) || 0;

  // Data-saver networks get static blocks — no shimmer animation cost.
  let effect = EFFECT_SET.has(opts.effect) ? opts.effect : 'shimmer';
  if (
    effect !== 'none' &&
    typeof navigator !== 'undefined' &&
    navigator.connection &&
    navigator.connection.saveData
  ) {
    effect = 'none';
  }

  const overlay = ownerDoc.createElement('div');
  const theme = THEME_SET.has(opts.theme) ? opts.theme : 'auto';
  overlay.className = `usk-overlay usk-effect-${effect} usk-theme-${theme}`;
  overlay.setAttribute('aria-hidden', 'true');
  if (opts.blockInteraction) overlay.classList.add('usk-blocking');
  if (opts.color) overlay.style.setProperty('--usk-color', opts.color);
  if (opts.highlightColor) overlay.style.setProperty('--usk-highlight', opts.highlightColor);
  if (opts.duration) {
    const ms = Number(opts.duration);
    overlay.style.setProperty('--usk-duration', Number.isFinite(ms) ? `${ms}ms` : String(opts.duration));
  }

  // Give the overlay a positioning context only when needed.
  const rootCS = computedStyle(root);
  let addedRel = false;
  if (rootCS.position === 'static') {
    root.classList.add('usk-rel');
    addedRel = true;
  }

  // Anti-flicker: while pending, the overlay is laid out but invisible, so
  // geometry can be measured up-front and reveal is instant.
  const pending = opts.delay > 0;
  if (pending) overlay.classList.add('usk-pending');

  root.appendChild(overlay);

  const ctx = {
    out: [],
    overlayRect: rectOf(overlay),
    opts,
    exclude: opts.exclude,
    seed: 1,
    overlay,
  };
  walk(root, ctx);
  for (const b of ctx.out) overlay.appendChild(b);

  // Accessibility: announce the region as busy while the skeleton shows.
  const prevBusy = root.getAttribute('aria-busy');
  root.setAttribute('aria-busy', 'true');
  root.classList.add('usk-active');

  // Zero-CLS guard: pin the container to its current height so removing
  // children during the fetch can never collapse (and reflow) the layout.
  const rootHeight = parseFloat(rootCS.height);
  let pinnedHeight = false;
  if (Number.isFinite(rootHeight) && rootHeight > 0) {
    root.setAttribute('data-us-prev-minheight', root.style.minHeight || '');
    root.style.minHeight = `${Math.round(rootHeight)}px`;
    pinnedHeight = true;
  }

  // Keyboard / pointer lockdown of the real UI underneath the overlay.
  let savedInteractive = null;
  if (opts.blockInteraction) savedInteractive = lockInteractive(root);

  let destroyed = false;
  let revealed = !pending;
  let raf = 0;
  let delayTimer = 0;
  let timeoutTimer = 0;
  const schedule = typeof requestAnimationFrame === 'function'
    ? (fn) => { raf = requestAnimationFrame(fn); }
    : (fn) => { raf = setTimeout(fn, 16); };

  function reveal() {
    delayTimer = 0;
    if (destroyed) return;
    revealed = true;
    overlay.classList.remove('usk-pending');
    rebuild(); // content may have changed while the skeleton was pending
    announceLoading(ownerDoc);
  }

  function rebuild() {
    overlay.textContent = '';
    ctx.overlayRect = rectOf(overlay);
    ctx.out = [];
    ctx.seed = 1;
    walk(root, ctx);
    for (const b of ctx.out) overlay.appendChild(b);
  }

  let observer = null;
  if (opts.responsive && typeof ResizeObserver !== 'undefined') {
    let first = true;
    observer = new ResizeObserver(() => {
      if (first) { first = false; return; } // ignore the initial observe() tick
      if (destroyed) return;
      if (raf) return;
      schedule(() => { raf = 0; if (!destroyed) rebuild(); });
    });
    observer.observe(root);
  }

  // Failsafe watchdog — a hanging API can never leave an eternal skeleton.
  // The expiry must destroy the PUBLIC handle (SkeletonLoader's wrapper) so
  // its registry entry is cleaned up too; fall back to the built-in api when
  // the engine is used directly.
  if (opts.timeout > 0) {
    timeoutTimer = setTimeout(() => {
      timeoutTimer = 0;
      if (destroyed) return;
      // Resolved lazily: the public handle gains its destroy() only after
      // buildSkeleton returns.
      const owner = opts._owner && typeof opts._owner.destroy === 'function' ? opts._owner : api;
      owner.destroy();
      if (typeof opts.onTimeout === 'function') {
        try { opts.onTimeout(root); } catch { /* user callback must not break us */ }
      }
    }, opts.timeout);
  }

  if (pending) {
    delayTimer = setTimeout(reveal, opts.delay);
  } else {
    announceLoading(ownerDoc);
  }

  const api = {
    root,
    overlay,
    get blocks() { return overlay.querySelectorAll('.usk-block').length; },
    /** True while the anti-flicker delay has not elapsed yet. */
    get pending() { return !revealed; },
    /** Re-measure the real UI and rebuild every block. */
    update() {
      if (!destroyed) rebuild();
    },
    /** Switch the animation at runtime — any name from EFFECTS. */
    setEffect(next) {
      if (destroyed) return;
      const e = EFFECT_SET.has(next) ? next : 'shimmer';
      overlay.classList.remove(...EFFECTS.map((name) => `usk-effect-${name}`));
      overlay.classList.add(`usk-effect-${e}`);
    },
    /** Switch the color palette at runtime — 'light' | 'dark' | 'auto'. */
    setTheme(next) {
      if (destroyed) return;
      const t = THEME_SET.has(next) ? next : 'auto';
      overlay.classList.remove(...THEMES.map((name) => `usk-theme-${name}`));
      overlay.classList.add(`usk-theme-${t}`);
    },
    /** Remove the skeleton and restore the real UI. Idempotent. */
    destroy() {
      if (destroyed) return;
      destroyed = true;
      if (observer) observer.disconnect();
      if (raf && typeof cancelAnimationFrame === 'function') cancelAnimationFrame(raf);
      else if (raf && typeof clearTimeout === 'function') clearTimeout(raf);
      if (delayTimer) clearTimeout(delayTimer);
      if (timeoutTimer) clearTimeout(timeoutTimer);
      overlay.remove();
      root.classList.remove('usk-active');
      if (addedRel) root.classList.remove('usk-rel');
      root.querySelectorAll('.usk-t, .usk-s').forEach((el) => el.classList.remove('usk-t', 'usk-s'));
      if (savedInteractive) unlockInteractive(savedInteractive);
      if (pinnedHeight) {
        const prev = root.getAttribute('data-us-prev-minheight');
        if (prev === null || prev === '') root.style.removeProperty('min-height');
        else root.style.minHeight = prev;
        root.removeAttribute('data-us-prev-minheight');
      }
      if (prevBusy === null) root.removeAttribute('aria-busy');
      else root.setAttribute('aria-busy', prevBusy);
      if (revealed) announceLoaded(ownerDoc);
    },
  };

  return api;
}
