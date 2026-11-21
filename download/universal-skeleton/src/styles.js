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

@keyframes usk-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
@keyframes usk-pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.45; }
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
  .usk-effect-pulse .usk-block { animation: none; }
}
`;

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
