/**
 * universal-skeleton
 * Framework-agnostic skeleton loader for any UI — any language, any framework,
 * any JS or TS project. Zero runtime dependencies.
 *
 *   SkeletonLoader.scan(el)        → auto-mirrors the real UI as skeleton blocks
 *   data-skeleton="…" attributes   → manual control per element
 *   <skeleton-screen loading>      → drop-in Web Component for every framework
 *
 * The stylesheet is injected automatically, and the <skeleton-screen> Web
 * Component is registered automatically in browser environments.
 */

import { injectStyles, SKELETON_CSS } from './styles.js';
import { SkeletonLoader } from './skeleton-loader.js';
import { SkeletonScreen, registerSkeletonScreen } from './web-component.js';

// Auto-inject styles + auto-register the Web Component in the browser.
// (In Node — e.g. during SSR or tests — both calls are safely skipped.)
if (typeof document !== 'undefined') {
  injectStyles();
  registerSkeletonScreen();
}

export {
  SkeletonLoader,
  SkeletonScreen,
  registerSkeletonScreen,
  injectStyles,
  SKELETON_CSS,
};

export default SkeletonLoader;
