/**
 * universal-skeleton — styles.js
 *
 * Single source of truth for all skeleton CSS.
 *
 * The stylesheet is injected automatically the first time a skeleton is
 * created, so the CDN build needs no extra <link> tag. It is also published
 * as dist/universal-skeleton.css for teams that prefer shipping stylesheets.
 */

export const SKELETON_CSS = /* css */ `
:root {
  --usk-color: #e5e7eb;        /* base grey of every skeleton block   */
  --usk-highlight: #f3f4f6;    /* bright band of the shimmer wave     */
  --usk-radius: 8px;           /* corner radius of rectangular blocks */
  --usk-duration: 1.4s;        /* one shimmer/pulse cycle             */
}

/* The Web Component host must be a block box, otherwise the absolutely
   positioned overlay inside it collapses (unknown elements default to inline) */
skeleton-screen { display: block; }

/* Theme palettes — light (default), dark, or auto (follows the OS setting).
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

/* Skeleton layer — one overlay per scanned root */
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

/* Effect: wave (diagonal light sweep — softer "aurora" look) */
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

/* Effect: fade (staggered breathing cascade — blocks light up one after another) */
.usk-effect-fade .usk-block {
  animation: usk-fade var(--usk-duration) ease-in-out infinite;
}
${stagger('.usk-effect-fade .usk-block', 12, 0.09)}

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

/* Effect: bounce (gentle vertical bob — playful, Material style) */
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

/* Shaped elements (badges, chips, pills…) that are covered by ONE solid
   block must not leak their own colour, border or shadow around it */
.usk-s {
  background: transparent !important;
  border-color: transparent !important;
  box-shadow: none !important;
  color: transparent !important;
}
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
`;

/**
 * Build the nth-child stagger rules used by the cascade effects (fade).
 * Children of the overlay are exactly the skeleton blocks, so :nth-child(n)
 * addresses block n — delays grow left-to-right, top-to-bottom.
 *
 * @param {string} selector base selector for one block
 * @param {number} steps how many distinct delay steps to generate
 * @param {number} size step size as a fraction of --usk-duration
 * @returns {string} CSS rules
 */
function stagger(selector, steps, size) {
  const rules = [];
  for (let n = 2; n <= steps; n++) {
    rules.push(`${selector}:nth-child(${n}) { animation-delay: calc(var(--usk-duration) * ${Number((size * (n - 1)).toFixed(2))}); }`);
  }
  return rules.join('\n');
}

const STYLE_ID = 'universal-skeleton-styles';

/**
 * Inject the stylesheet once per document.
 * Safe to call repeatedly — a second call is a no-op.
 * @param {Document} [doc] defaults to the global document
 * @returns {boolean} true when the style was injected now, false if it already existed
 */
export function injectStyles(doc = typeof document !== 'undefined' ? document : null) {
  if (!doc) return false;
  if (doc.getElementById(STYLE_ID)) return false;
  const style = doc.createElement('style');
  style.id = STYLE_ID;
  style.textContent = SKELETON_CSS;
  (doc.head || doc.documentElement).appendChild(style);
  return true;
}
