/**
 * universal-skeleton — auto-loading.js
 *
 * The declarative loading contract for plain HTML, PHP templates, HTMX,
 * Turbo frames and every framework that prefers attributes over code:
 *
 *   <div data-us-loading="true" data-us-delay="150" data-us-timeout="15000">
 *     …real markup…
 *   </div>
 *
 * One shared, lazily-created MutationObserver watches the whole document for
 * `data-us-loading` changes and additions, batches reactions through
 * requestAnimationFrame, and drives SkeletonLoader.scan()/restore():
 *
 *   data-us-loading="true"   → skeleton appears (after the optional delay)
 *   data-us-loading="false"  → skeleton is removed, real UI restored
 *   element removed from DOM → its skeleton is destroyed (no leaks)
 *
 * Works together with data-us-delay / data-us-timeout / data-us-repeat
 * which are read directly by the engine.
 */

import { SkeletonLoader } from './skeleton-loader.js';

const TRUTHY = new Set(['', 'true', '1', 'on', 'loading']);

let observer = null;
let raf = 0;
const queue = new Set();

/** Read the engine options a container expresses through data-us-* attributes. */
export function optionsFromAttrs(el) {
  const o = {};
  const delay = parseInt(el.getAttribute('data-us-delay'), 10);
  if (Number.isFinite(delay) && delay > 0) o.delay = delay;
  const timeout = parseInt(el.getAttribute('data-us-timeout'), 10);
  if (Number.isFinite(timeout) && timeout > 0) o.timeout = timeout;
  const repeat = parseInt(el.getAttribute('data-us-repeat'), 10);
  if (Number.isFinite(repeat) && repeat > 0) o.repeat = repeat;
  const effect = el.getAttribute('data-us-effect');
  if (effect) o.effect = effect;
  const theme = el.getAttribute('data-us-theme');
  if (theme) o.theme = theme;
  return o;
}

/** The data-us-loading attribute accepts the usual truthy spellings. */
export function isLoadingTruthy(el) {
  const value = el.getAttribute('data-us-loading');
  if (value === null) return false;
  return TRUTHY.has(String(value).toLowerCase());
}

function sync(el) {
  if (!el || !el.isConnected) return;
  if (isLoadingTruthy(el)) {
    if (!SkeletonLoader.isActive(el)) SkeletonLoader.scan(el, optionsFromAttrs(el));
  } else {
    SkeletonLoader.restore(el);
  }
}

function flush() {
  raf = 0;
  const items = Array.from(queue);
  queue.clear();
  for (const el of items) sync(el);
}

function schedule(el) {
  queue.add(el);
  if (raf) return;
  raf = typeof requestAnimationFrame === 'function'
    ? requestAnimationFrame(flush)
    : setTimeout(flush, 16);
}

/** Destroy the skeleton of a node (and of any data-us-loading descendants)
 *  that left the DOM — the engine must never keep timers on detached nodes. */
function restoreTree(node) {
  if (!node || node.nodeType !== 1) return;
  if (node.hasAttribute && node.hasAttribute('data-us-loading')) SkeletonLoader.restore(node);
  if (node.querySelectorAll) {
    node.querySelectorAll('[data-us-loading]').forEach((n) => SkeletonLoader.restore(n));
  }
}

/**
 * Start the shared document observer (idempotent). Called automatically when
 * the library is imported in a browser; tests and micro-frontends may call
 * it explicitly to control the lifecycle.
 *
 * @returns {MutationObserver|null} the observer, or null outside the browser
 */
export function startAutoLoading() {
  if (observer) return observer;
  if (typeof document === 'undefined' || typeof MutationObserver === 'undefined') return null;

  if (!document.body) {
    document.addEventListener('DOMContentLoaded', startAutoLoading, { once: true });
    return null;
  }

  document.querySelectorAll('[data-us-loading]').forEach(schedule);

  observer = new MutationObserver((records) => {
    for (const rec of records) {
      if (rec.type === 'attributes') {
        schedule(rec.target);
      } else if (rec.type === 'childList') {
        rec.addedNodes.forEach((node) => {
          if (node.nodeType !== 1) return;
          if (node.hasAttribute('data-us-loading')) schedule(node);
          node.querySelectorAll('[data-us-loading]').forEach(schedule);
        });
        rec.removedNodes.forEach(restoreTree);
      }
    }
  });
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['data-us-loading'],
    childList: true,
    subtree: true,
  });
  return observer;
}

/** Stop observing (tests, hot reloading, micro-frontend teardown). */
export function stopAutoLoading() {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
}
