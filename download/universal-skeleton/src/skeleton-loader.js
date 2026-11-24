/**
 * universal-skeleton — skeleton-loader.js
 *
 * Public programmatic API.
 *
 *   SkeletonLoader.scan(el | selector, options)  → handle { update, setEffect, destroy }
 *   SkeletonLoader.restore(el | selector)        → removes an active skeleton
 *   SkeletonLoader.isActive(el | selector)       → boolean
 *   SkeletonLoader.while(promiseOrFn, target, options) → shows skeleton while loading
 */

import { injectStyles, autoInjectEnabled } from './styles.js';
import { buildSkeleton } from './scan.js';

/** @type {WeakMap<Element, object>} */
const handles = new WeakMap();

function resolveTarget(target) {
  if (typeof target === 'string') {
    if (typeof document === 'undefined') {
      throw new Error('[universal-skeleton] No document available — pass an Element instead of a selector.');
    }
    const el = document.querySelector(target);
    if (!el) throw new Error(`[universal-skeleton] No element matches "${target}".`);
    return el;
  }
  const isElement = target && target.nodeType === 1 &&
    (typeof Element === 'undefined' || target instanceof Element);
  if (!isElement) {
    throw new TypeError('[universal-skeleton] target must be an Element or a CSS selector string.');
  }
  return target;
}

export class SkeletonLoader {
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
    // Lazy style injection: nothing is added to the document until the first
    // skeleton appears. Strict-CSP teams can call setAutoInject(false) and
    // ship dist/universal-skeleton.css themselves.
    if (autoInjectEnabled()) injectStyles();
    // The public handle is created up-front and passed to the engine as
    // _owner, so the timeout watchdog can expire the FULL handle (including
    // its registry entry), not just the internal overlay state.
    const handle = {};
    const built = buildSkeleton(root, { ...options, _owner: handle });
    handle.root = root;
    handle.overlay = built.overlay;
    Object.defineProperty(handle, 'blocks', { get: () => built.blocks });
    Object.defineProperty(handle, 'pending', { get: () => built.pending });
    handle.update = () => built.update();
    handle.setEffect = (effect) => built.setEffect(effect);
    handle.setTheme = (theme) => built.setTheme(theme);
    handle.destroy = () => {
      built.destroy();
      handles.delete(root);
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
    // `delay` (anti-flicker) and `timeout` (watchdog) are honoured inside the
    // scan handle: a promise that resolves within `delay` never shows a
    // skeleton; one that hangs longer than `timeout` gets rescued.
    const handle = this.scan(target, rest);
    const startedAt = Date.now();
    try {
      const result = await (typeof source === 'function' ? source() : source);
      const wait = minDuration - (Date.now() - startedAt);
      if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
      return result;
    } finally {
      handle.destroy();
    }
  }
}

export default SkeletonLoader;
