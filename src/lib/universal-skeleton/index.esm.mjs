/*! universal-skeleton v1.1.0 | MIT License | npm i universal-skeleton */

// src/styles.js
var SKELETON_CSS = (
  /* css */
  `
:root {
  --usk-color: #e5e7eb;        /* base grey of every skeleton block   */
  --usk-highlight: #f3f4f6;    /* bright band of the shimmer wave     */
  --usk-radius: 8px;           /* corner radius of rectangular blocks */
  --usk-duration: 1.4s;        /* one shimmer/pulse cycle             */
}

/* The Web Component host must be a block box, otherwise the absolutely
   positioned overlay inside it collapses (unknown elements default to inline) */
skeleton-screen { display: block; }

/* Theme palettes \u2014 light (default), dark, or auto (follows the OS setting).
   Explicit color options and data-skeleton-color always win over these. */
.usk-theme-light {
  --usk-color: #e5e7eb;
  --usk-highlight: #f3f4f6;
}
.usk-theme-dark {
  --usk-color: #27272a;
  --usk-highlight: #3f3f46;
}
/* 'auto' mirrors the site's own color scheme with zero JavaScript */
@media (prefers-color-scheme: dark) {
  .usk-theme-auto {
    --usk-color: #27272a;
    --usk-highlight: #3f3f46;
  }
}

/* Force a positioning context on the scanned root (only when static) */
.usk-rel { position: relative !important; }

/* Skeleton layer \u2014 one overlay per scanned root */
.usk-overlay {
  position: absolute;
  inset: 0;
  z-index: 2147483000;
  overflow: hidden;
  border-radius: inherit;
}
.usk-overlay.usk-blocking {
  pointer-events: auto;
  cursor: progress;
}
.usk-overlay:not(.usk-blocking) {
  pointer-events: none;
}

/* Every grey block inside the overlay */
.usk-block {
  position: absolute;
  background: var(--usk-color);
  border-radius: var(--usk-radius);
  box-sizing: border-box;
}
.usk-block.usk-circle { border-radius: 50%; }

/* Effect: shimmer (moving gradient wave, Facebook / YouTube style) */
.usk-effect-shimmer .usk-block {
  background: linear-gradient(
    90deg,
    var(--usk-color) 25%,
    var(--usk-highlight) 50%,
    var(--usk-color) 75%
  );
  background-size: 200% 100%;
  animation: usk-shimmer var(--usk-duration) ease-in-out infinite;
}

/* Effect: pulse (opacity fade, Tailwind style) */
.usk-effect-pulse .usk-block {
  animation: usk-pulse 1.6s ease-in-out infinite;
}

/* Effect: wave (diagonal light sweep \u2014 softer "aurora" look) */
.usk-effect-wave .usk-block {
  background: linear-gradient(
    115deg,
    var(--usk-color) 30%,
    var(--usk-highlight) 50%,
    var(--usk-color) 70%
  );
  background-size: 250% 250%;
  animation: usk-wave var(--usk-duration) ease-in-out infinite;
}

/* Effect: fade (staggered breathing cascade \u2014 blocks light up one after another) */
.usk-effect-fade .usk-block {
  animation: usk-fade var(--usk-duration) ease-in-out infinite;
}
${stagger(".usk-effect-fade .usk-block", 12, 0.09)}

/* Effect: blink (hard "terminal cursor" blink) */
.usk-effect-blink .usk-block {
  animation: usk-blink calc(var(--usk-duration) * 0.75) steps(1, end) infinite;
}

/* Effect: sheen (one glossy light band sweeping across the whole overlay) */
.usk-effect-sheen::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    100deg,
    transparent 35%,
    var(--usk-highlight) 50%,
    transparent 65%
  );
  background-size: 200% 100%;
  animation: usk-shimmer var(--usk-duration) ease-in-out infinite;
  pointer-events: none;
}

/* Effect: bounce (gentle vertical bob \u2014 playful, Material style) */
.usk-effect-bounce .usk-block {
  animation: usk-bounce var(--usk-duration) ease-in-out infinite;
}

@keyframes usk-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
@keyframes usk-pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.45; }
}
@keyframes usk-wave {
  0%   { background-position: 100% 100%; }
  100% { background-position: -100% -100%; }
}
@keyframes usk-fade {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.3; }
}
@keyframes usk-blink {
  0%, 49%   { opacity: 1; }
  50%, 100% { opacity: 0.3; }
}
@keyframes usk-bounce {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-4px); }
}

/* Hide the real content that sits underneath the skeleton layer */
.usk-active .usk-t { color: transparent !important; }
.usk-active img,
.usk-active picture,
.usk-active video,
.usk-active iframe,
.usk-active svg,
.usk-active canvas {
  visibility: hidden !important;
}

/* Respect users who prefer less motion */
@media (prefers-reduced-motion: reduce) {
  .usk-effect-shimmer .usk-block,
  .usk-effect-pulse .usk-block,
  .usk-effect-wave .usk-block,
  .usk-effect-fade .usk-block,
  .usk-effect-blink .usk-block,
  .usk-effect-bounce .usk-block,
  .usk-effect-sheen::after { animation: none; }
}
`
);
function stagger(selector, steps, size) {
  const rules = [];
  for (let n = 2; n <= steps; n++) {
    rules.push(`${selector}:nth-child(${n}) { animation-delay: calc(var(--usk-duration) * ${Number((size * (n - 1)).toFixed(2))}); }`);
  }
  return rules.join("\n");
}
var STYLE_ID = "universal-skeleton-styles";
function injectStyles(doc = typeof document !== "undefined" ? document : null) {
  if (!doc) return false;
  if (doc.getElementById(STYLE_ID)) return false;
  const style = doc.createElement("style");
  style.id = STYLE_ID;
  style.textContent = SKELETON_CSS;
  (doc.head || doc.documentElement).appendChild(style);
  return true;
}

// src/scan.js
var SELF_BLOCK_TAGS = /* @__PURE__ */ new Set([
  "BUTTON",
  "INPUT",
  "SELECT",
  "TEXTAREA",
  "METER",
  "PROGRESS",
  "IMG",
  "PICTURE",
  "VIDEO",
  "CANVAS",
  "SVG",
  "OBJECT",
  "EMBED"
]);
var MEDIA_TAGS = /* @__PURE__ */ new Set(["IMG", "PICTURE", "VIDEO", "CANVAS", "SVG", "OBJECT", "EMBED"]);
var SKIP_TAGS = /* @__PURE__ */ new Set([
  "SCRIPT",
  "STYLE",
  "NOSCRIPT",
  "TEMPLATE",
  "LINK",
  "META",
  "BASE",
  "TITLE",
  "HEAD",
  "BR",
  "WBR",
  "SOURCE",
  "TRACK",
  "AREA",
  "MAP",
  "PARAM"
]);
var MANUAL = /* @__PURE__ */ new Set(["circle", "rect", "text", "image", "none", "ignore", "auto"]);
var EFFECTS = ["shimmer", "wave", "pulse", "fade", "blink", "sheen", "bounce", "none"];
var EFFECT_SET = new Set(EFFECTS);
var THEMES = ["light", "dark", "auto"];
var THEME_SET = new Set(THEMES);
function rectOf(el) {
  const r = el.getBoundingClientRect();
  return { left: r.left, top: r.top, width: r.width, height: r.height };
}
function computedStyle(el) {
  const view = el.ownerDocument && el.ownerDocument.defaultView;
  if (view && view.getComputedStyle) return view.getComputedStyle(el);
  return typeof getComputedStyle === "function" ? getComputedStyle(el) : {};
}
function isVisible(el) {
  if (el.hasAttribute("hidden")) return false;
  const cs = computedStyle(el);
  if (cs.display === "none" || cs.visibility === "hidden") return false;
  return true;
}
function isExcluded(el, exclude) {
  if (!exclude) return false;
  if (typeof exclude === "string") {
    try {
      return el.matches(exclude);
    } catch (e) {
      return false;
    }
  }
  if (typeof exclude === "function") {
    try {
      return exclude(el) === true;
    } catch (e) {
      return false;
    }
  }
  return false;
}
function dataOpts(el) {
  const raw = (el.getAttribute("data-skeleton") || "").trim().toLowerCase();
  const type = MANUAL.has(raw) ? raw : null;
  const radiusAttr = el.getAttribute("data-skeleton-radius");
  const radius = radiusAttr !== null && radiusAttr !== "" ? parseFloat(radiusAttr) : null;
  return {
    type,
    radius: Number.isFinite(radius) ? radius : null,
    color: el.getAttribute("data-skeleton-color"),
    highlight: el.getAttribute("data-skeleton-highlight")
  };
}
function lastLineWidth(seed) {
  return 0.5 + seed * 53 % 45 / 100;
}
function looksCircle(el, r) {
  const br = computedStyle(el).borderRadius;
  if (!br) return false;
  if (br.endsWith("%")) return parseFloat(br) >= 45;
  const px = parseFloat(br);
  return Number.isFinite(px) && Math.abs(px - Math.min(r.width, r.height) / 2) <= 2.5;
}
function inheritRadius(el) {
  const px = parseFloat(computedStyle(el).borderRadius);
  return Number.isFinite(px) && px > 0 ? Math.round(px) : null;
}
function addBlock(out, overlayRect, spec) {
  const { x, y, w, h, shape = "rect", radius = null, color = null, highlight = null } = spec;
  if (w < 2 || h < 2) return;
  const b = document.createElement("span");
  b.className = "usk-block" + (shape === "circle" ? " usk-circle" : "");
  b.style.left = `${x - overlayRect.left}px`;
  b.style.top = `${y - overlayRect.top}px`;
  b.style.width = `${w}px`;
  b.style.height = `${h}px`;
  if (shape !== "circle" && radius != null) b.style.borderRadius = `${radius}px`;
  if (color) b.style.setProperty("--usk-color", color);
  if (highlight) b.style.setProperty("--usk-highlight", highlight);
  out.push(b);
}
function addTextBars(out, overlayRect, el, seed, opts) {
  const r = rectOf(el);
  const cs = computedStyle(el);
  let fontSize = parseFloat(cs.fontSize);
  if (!(fontSize >= 4)) fontSize = 16;
  const lineHeight = parseFloat(cs.lineHeight);
  const lineH = lineHeight >= fontSize ? lineHeight : Math.round(fontSize * 1.45);
  const avail = Math.max(r.height, fontSize * 0.6);
  const lines = opts.textLines ? Math.min(Math.max(Math.round(avail / lineH), 1), 6) : 1;
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
      x: r.left,
      y,
      w,
      h: barH,
      shape: "rect",
      radius: Math.round(barH / 2)
    });
  }
  el.classList.add("usk-t");
  return lines;
}
function walk(el, ctx) {
  if (SKIP_TAGS.has(el.tagName)) return;
  if (el.hasAttribute("data-skeleton-ignore")) return;
  if (isExcluded(el, ctx.exclude)) return;
  if (!isVisible(el)) return;
  const r = rectOf(el);
  const manual = dataOpts(el);
  if (manual.type && manual.type !== "auto") {
    if (manual.type === "text") {
      addTextBars(ctx.out, ctx.overlayRect, el, ctx.seed++, ctx.opts);
      return;
    }
    if (manual.type === "none" || manual.type === "ignore") return;
    addBlock(ctx.out, ctx.overlayRect, {
      x: r.left,
      y: r.top,
      w: r.width,
      h: r.height,
      shape: manual.type === "circle" ? "circle" : "rect",
      radius: manual.radius,
      color: manual.color,
      highlight: manual.highlight
    });
    return;
  }
  if (SELF_BLOCK_TAGS.has(el.tagName)) {
    const circle = el.tagName === "IMG" && looksCircle(el, r);
    addBlock(ctx.out, ctx.overlayRect, {
      x: r.left,
      y: r.top,
      w: r.width,
      h: r.height,
      shape: circle ? "circle" : "rect",
      radius: manual.radius != null ? manual.radius : circle ? null : MEDIA_TAGS.has(el.tagName) ? ctx.opts.radius : inheritRadius(el),
      color: manual.color,
      highlight: manual.highlight
    });
    return;
  }
  const hasText = Array.prototype.some.call(
    el.childNodes,
    (n) => n.nodeType === 3 && n.textContent.trim().length > 0
  );
  if (hasText) {
    addTextBars(ctx.out, ctx.overlayRect, el, ctx.seed++, ctx.opts);
    return;
  }
  for (const child of el.children) walk(child, ctx);
}
function buildSkeleton(root, userOpts = {}) {
  const opts = {
    effect: "shimmer",
    theme: "auto",
    color: null,
    highlightColor: null,
    duration: null,
    radius: null,
    exclude: null,
    textLines: true,
    responsive: true,
    blockInteraction: true,
    ...userOpts
  };
  if (typeof document === "undefined") {
    throw new Error("[universal-skeleton] buildSkeleton() requires a DOM (document).");
  }
  const ownerDoc = root.ownerDocument || document;
  const overlay = ownerDoc.createElement("div");
  const effect = EFFECT_SET.has(opts.effect) ? opts.effect : "shimmer";
  const theme = THEME_SET.has(opts.theme) ? opts.theme : "auto";
  overlay.className = `usk-overlay usk-effect-${effect} usk-theme-${theme}`;
  overlay.setAttribute("aria-hidden", "true");
  if (opts.blockInteraction) overlay.classList.add("usk-blocking");
  if (opts.color) overlay.style.setProperty("--usk-color", opts.color);
  if (opts.highlightColor) overlay.style.setProperty("--usk-highlight", opts.highlightColor);
  if (opts.duration) {
    const ms = Number(opts.duration);
    overlay.style.setProperty("--usk-duration", Number.isFinite(ms) ? `${ms}ms` : String(opts.duration));
  }
  const rootCS = computedStyle(root);
  let addedRel = false;
  if (rootCS.position === "static") {
    root.classList.add("usk-rel");
    addedRel = true;
  }
  root.appendChild(overlay);
  const ctx = { out: [], overlayRect: rectOf(overlay), opts, exclude: opts.exclude, seed: 1 };
  walk(root, ctx);
  for (const b of ctx.out) overlay.appendChild(b);
  const prevBusy = root.getAttribute("aria-busy");
  root.setAttribute("aria-busy", "true");
  root.classList.add("usk-active");
  let destroyed = false;
  let raf = 0;
  const schedule = typeof requestAnimationFrame === "function" ? (fn) => {
    raf = requestAnimationFrame(fn);
  } : (fn) => {
    raf = setTimeout(fn, 16);
  };
  function rebuild() {
    overlay.textContent = "";
    ctx.overlayRect = rectOf(overlay);
    ctx.out = [];
    ctx.seed = 1;
    walk(root, ctx);
    for (const b of ctx.out) overlay.appendChild(b);
  }
  let observer = null;
  if (opts.responsive && typeof ResizeObserver !== "undefined") {
    let first = true;
    observer = new ResizeObserver(() => {
      if (first) {
        first = false;
        return;
      }
      if (destroyed) return;
      if (raf) return;
      schedule(() => {
        raf = 0;
        if (!destroyed) rebuild();
      });
    });
    observer.observe(root);
  }
  return {
    root,
    overlay,
    get blocks() {
      return overlay.querySelectorAll(".usk-block").length;
    },
    /** Re-measure the real UI and rebuild every block. */
    update() {
      if (!destroyed) rebuild();
    },
    /** Switch the animation at runtime — any name from EFFECTS. */
    setEffect(next) {
      if (destroyed) return;
      const e = EFFECT_SET.has(next) ? next : "shimmer";
      overlay.classList.remove(...EFFECTS.map((name) => `usk-effect-${name}`));
      overlay.classList.add(`usk-effect-${e}`);
    },
    /** Switch the color palette at runtime — 'light' | 'dark' | 'auto'. */
    setTheme(next) {
      if (destroyed) return;
      const t = THEME_SET.has(next) ? next : "auto";
      overlay.classList.remove(...THEMES.map((name) => `usk-theme-${name}`));
      overlay.classList.add(`usk-theme-${t}`);
    },
    /** Remove the skeleton and restore the real UI. Idempotent. */
    destroy() {
      if (destroyed) return;
      destroyed = true;
      if (observer) observer.disconnect();
      if (raf && typeof cancelAnimationFrame === "function") cancelAnimationFrame(raf);
      else if (raf && typeof clearTimeout === "function") clearTimeout(raf);
      overlay.remove();
      root.classList.remove("usk-active");
      if (addedRel) root.classList.remove("usk-rel");
      root.querySelectorAll(".usk-t").forEach((el) => el.classList.remove("usk-t"));
      if (prevBusy === null) root.removeAttribute("aria-busy");
      else root.setAttribute("aria-busy", prevBusy);
    }
  };
}

// src/skeleton-loader.js
var handles = /* @__PURE__ */ new WeakMap();
function resolveTarget(target) {
  if (typeof target === "string") {
    if (typeof document === "undefined") {
      throw new Error("[universal-skeleton] No document available \u2014 pass an Element instead of a selector.");
    }
    const el = document.querySelector(target);
    if (!el) throw new Error(`[universal-skeleton] No element matches "${target}".`);
    return el;
  }
  const isElement = target && target.nodeType === 1 && (typeof Element === "undefined" || target instanceof Element);
  if (!isElement) {
    throw new TypeError("[universal-skeleton] target must be an Element or a CSS selector string.");
  }
  return target;
}
var SkeletonLoader = class {
  /**
   * Show a skeleton over `target` (an Element or a CSS selector) that
   * automatically mirrors the real UI geometry.
   *
   * Scanning the same target twice replaces the previous skeleton.
   *
   * @param {Element|string} target
   * @param {import('./scan.js').ScanOptions} [options]
   * @returns {object} handle — { root, overlay, blocks, update(), setEffect(), setTheme(), destroy() }
   */
  static scan(target, options = {}) {
    const root = resolveTarget(target);
    const existing = handles.get(root);
    if (existing) existing.destroy();
    injectStyles();
    const built = buildSkeleton(root, options);
    const handle = {
      root,
      overlay: built.overlay,
      get blocks() {
        return built.blocks;
      },
      update: () => built.update(),
      setEffect: (effect) => built.setEffect(effect),
      setTheme: (theme) => built.setTheme(theme),
      destroy: () => {
        built.destroy();
        handles.delete(root);
      }
    };
    handles.set(root, handle);
    return handle;
  }
  /**
   * Remove the skeleton from `target` if one is active. Safe no-op otherwise.
   * @param {Element|string} target
   */
  static restore(target) {
    const root = resolveTarget(target);
    const handle = handles.get(root);
    if (handle) handle.destroy();
  }
  /**
   * True while a skeleton is showing on `target`.
   * @param {Element|string} target
   * @returns {boolean}
   */
  static isActive(target) {
    return handles.has(resolveTarget(target));
  }
  /**
   * Show a skeleton while `source` runs, then remove it automatically —
   * even when the promise rejects. The resolved value is returned unchanged.
   *
   * @template T
   * @param {Promise<T> | (() => T | Promise<T>)} source
   * @param {Element|string} target
   * @param {import('./scan.js').ScanOptions & {minDuration?: number}} [options]
   * @returns {Promise<T>}
   */
  static async while(source, target, options = {}) {
    const { minDuration = 0, ...rest } = options;
    const handle = this.scan(target, rest);
    const startedAt = Date.now();
    try {
      const result = await (typeof source === "function" ? source() : source);
      const wait = minDuration - (Date.now() - startedAt);
      if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
      return result;
    } finally {
      handle.destroy();
    }
  }
};

// src/web-component.js
var TRUTHY = /* @__PURE__ */ new Set(["", "true", "1", "on", "loading"]);
var CustomElementBase = typeof HTMLElement !== "undefined" ? HTMLElement : class {
};
var SkeletonScreen = class extends CustomElementBase {
  static get observedAttributes() {
    return ["loading", "effect", "theme", "color", "highlight-color", "duration", "radius"];
  }
  connectedCallback() {
    const sync = () => {
      if (this.isConnected) this._sync();
    };
    if (typeof requestAnimationFrame === "function") requestAnimationFrame(sync);
    else setTimeout(sync, 0);
  }
  disconnectedCallback() {
    this.hide();
  }
  attributeChangedCallback(_name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (this.isConnected) this._sync();
  }
  /** Internal: show or hide based on the current `loading` attribute. */
  _sync() {
    if (this._isLoading()) this.show();
    else this.hide();
  }
  /** The loading attribute accepts "", "true", "1", "on", "loading" as truthy. */
  _isLoading() {
    const value = this.getAttribute("loading");
    if (value === null) return false;
    return TRUTHY.has(String(value).toLowerCase());
  }
  /** Show the skeleton (options override attributes). */
  show(options) {
    this.hide();
    const opts = { ...options || {} };
    const effect = this.getAttribute("effect");
    if (effect) opts.effect = effect;
    const theme = this.getAttribute("theme");
    if (theme) opts.theme = theme;
    const color = this.getAttribute("color");
    if (color) opts.color = color;
    const highlight = this.getAttribute("highlight-color");
    if (highlight) opts.highlightColor = highlight;
    const duration = this.getAttribute("duration");
    if (duration) opts.duration = duration;
    const radius = parseFloat(this.getAttribute("radius"));
    if (Number.isFinite(radius)) opts.radius = radius;
    this._handle = SkeletonLoader.scan(this, opts);
  }
  /** Hide the skeleton and reveal the real content. */
  hide() {
    if (this._handle) {
      this._handle.destroy();
      this._handle = null;
    }
  }
};
function registerSkeletonScreen(name = "skeleton-screen") {
  if (typeof customElements === "undefined" || typeof HTMLElement === "undefined") return;
  if (customElements.get(name)) return;
  class NamedSkeletonScreen extends SkeletonScreen {
  }
  customElements.define(name, NamedSkeletonScreen);
}

// src/index.js
if (typeof document !== "undefined") {
  injectStyles();
  registerSkeletonScreen();
}
var src_default = SkeletonLoader;
export {
  EFFECTS,
  SKELETON_CSS,
  SkeletonLoader,
  SkeletonScreen,
  THEMES,
  src_default as default,
  injectStyles,
  registerSkeletonScreen
};
//# sourceMappingURL=index.esm.js.map
