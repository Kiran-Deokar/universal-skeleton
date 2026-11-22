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

/** Parse the data-skeleton* attributes of an element. */
function dataOpts(el) {
  const raw = (el.getAttribute('data-skeleton') || '').trim().toLowerCase();
  const type = MANUAL.has(raw) ? raw : null;
  const radiusAttr = el.getAttribute('data-skeleton-radius');
  const radius = radiusAttr !== null && radiusAttr !== '' ? parseFloat(radiusAttr) : null;
  return {
    type,
    radius: Number.isFinite(radius) ? radius : null,
    color: el.getAttribute('data-skeleton-color'),
    highlight: el.getAttribute('data-skeleton-highlight'),
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
  if (shape !== 'circle' && radius != null) b.style.borderRadius = `${radius}px`;
  if (color) b.style.setProperty('--usk-color', color);
  if (highlight) b.style.setProperty('--usk-highlight', highlight);
  out.push(b);
}

/**
 * Paint one pill-shaped bar per visual text line of `el`.
 * The number of lines is estimated from the element height and line-height.
 */
function addTextBars(out, overlayRect, el, seed, opts) {
  const r = rectOf(el);
  const cs = computedStyle(el);
  // Guard: environments that do not resolve font units (e.g. '1.5em' in jsdom)
  // can report absurdly small values — fall back to the 16px browser default.
  let fontSize = parseFloat(cs.fontSize);
  if (!(fontSize >= 4)) fontSize = 16;
  const lineHeight = parseFloat(cs.lineHeight);
  const lineH = lineHeight >= fontSize ? lineHeight : Math.round(fontSize * 1.45);
  const avail = Math.max(r.height, fontSize * 0.6);
  const lines = opts.textLines
    ? Math.min(Math.max(Math.round(avail / lineH), 1), 6)
    : 1;
  const perLine = lines === 1 ? r.height : lineH;
  const barH = Math.min(
    lines === 1 ? Math.max(Math.round(fontSize * 0.72), 8) : Math.round(lineH * 0.62),
    Math.round(perLine)
  );

  for (let i = 0; i < lines; i++) {
    const isLast = i === lines - 1 && lines > 1;
    const w = isLast ? Math.max(r.width * lastLineWidth(seed + i), 24) : r.width;
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

function walk(el, ctx) {
  if (SKIP_TAGS.has(el.tagName)) return;
  if (el.hasAttribute('data-skeleton-ignore')) return;
  if (isExcluded(el, ctx.exclude)) return;
  if (!isVisible(el)) return;

  const r = rectOf(el);
  const manual = dataOpts(el);

  // Manual override wins and covers the whole element — no recursion.
  if (manual.type && manual.type !== 'auto') {
    if (manual.type === 'text') {
      addTextBars(ctx.out, ctx.overlayRect, el, ctx.seed++, ctx.opts);
      return;
    }
    if (manual.type === 'none' || manual.type === 'ignore') return;
    addBlock(ctx.out, ctx.overlayRect, {
      x: r.left, y: r.top, w: r.width, h: r.height,
      shape: manual.type === 'circle' ? 'circle' : 'rect',
      radius: manual.radius,
      color: manual.color,
      highlight: manual.highlight,
    });
    return;
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
    return;
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
    return;
  }
  if (hasText) {
    addTextBars(ctx.out, ctx.overlayRect, el, ctx.seed++, ctx.opts);
    return;
  }

  // Pure container → recurse into element children.
  for (const child of el.children) walk(child, ctx);
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
 * @param {boolean}  [userOpts.blockInteraction=true] block clicks while visible
 *   Shaped elements (badges, chips, pills with their own background colour)
 *   always become one solid block over the whole shape — use
 *   `data-skeleton="text"` on a specific element to force per-line bars.
 * @returns {{root, overlay, blocks, update, setEffect, destroy}}
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
    ...userOpts,
  };

  if (typeof document === 'undefined') {
    throw new Error('[universal-skeleton] buildSkeleton() requires a DOM (document).');
  }

  const ownerDoc = root.ownerDocument || document;

  const overlay = ownerDoc.createElement('div');
  const effect = EFFECT_SET.has(opts.effect) ? opts.effect : 'shimmer';
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

  root.appendChild(overlay);

  const ctx = { out: [], overlayRect: rectOf(overlay), opts, exclude: opts.exclude, seed: 1 };
  walk(root, ctx);
  for (const b of ctx.out) overlay.appendChild(b);

  // Accessibility: announce the region as busy while the skeleton shows.
  const prevBusy = root.getAttribute('aria-busy');
  root.setAttribute('aria-busy', 'true');
  root.classList.add('usk-active');

  let destroyed = false;
  let raf = 0;
  const schedule = typeof requestAnimationFrame === 'function'
    ? (fn) => { raf = requestAnimationFrame(fn); }
    : (fn) => { raf = setTimeout(fn, 16); };

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

  return {
    root,
    overlay,
    get blocks() { return overlay.querySelectorAll('.usk-block').length; },
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
      overlay.remove();
      root.classList.remove('usk-active');
      if (addedRel) root.classList.remove('usk-rel');
      root.querySelectorAll('.usk-t, .usk-s').forEach((el) => el.classList.remove('usk-t', 'usk-s'));
      if (prevBusy === null) root.removeAttribute('aria-busy');
      else root.setAttribute('aria-busy', prevBusy);
    },
  };
}
