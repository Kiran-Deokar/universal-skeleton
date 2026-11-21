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

import { injectStyles } from './styles.js';
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
   * @returns {object} handle — { root, overlay, blocks, update(), setEffect(), destroy() }
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
      get blocks() { return built.blocks; },
      update: () => built.update(),
      setEffect: (effect) => built.setEffect(effect),
      destroy: () => {
        built.destroy();
        handles.delete(root);
      },
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
