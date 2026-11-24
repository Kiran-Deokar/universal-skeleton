/**
 * universal-skeleton
 * Framework-agnostic skeleton loader for any UI — any language, any framework,
 * any JS or TS project. Zero runtime dependencies.
 *
 *   SkeletonLoader.scan(el)        → auto-mirrors the real UI as skeleton blocks
 *   data-skeleton="…" attributes   → manual control per element
 *   data-us-* contract             → declarative loading, shapes, delays, timeouts
 *   <skeleton-screen loading>      → drop-in Web Component for every framework
 *
 * The stylesheet is injected lazily — on the first skeleton, not at import —
 * so strict-CSP apps can opt out with setAutoInject(false) and ship
 * dist/universal-skeleton.css as a static asset. The <skeleton-screen> Web
 * Component is registered automatically in browser environments, and the
 * data-us-loading attribute contract is observed document-wide.
 */

import { injectStyles, SKELETON_CSS, setAutoInject } from './styles.js';
import { SkeletonLoader } from './skeleton-loader.js';
import { SkeletonScreen, registerSkeletonScreen } from './web-component.js';
import { startAutoLoading, stopAutoLoading } from './auto-loading.js';
import { EFFECTS, THEMES } from './scan.js';

// In the browser: register the Web Component and start watching the
// data-us-loading contract. Style injection stays lazy (first skeleton).
// (In Node — e.g. during SSR or tests — both calls are safely skipped.)
if (typeof document !== 'undefined') {
  registerSkeletonScreen();
  startAutoLoading();
}

export {
  SkeletonLoader,
  SkeletonScreen,
  registerSkeletonScreen,
  injectStyles,
  SKELETON_CSS,
  EFFECTS,
  THEMES,
  setAutoInject,
  startAutoLoading,
  stopAutoLoading,
};

export default SkeletonLoader;
