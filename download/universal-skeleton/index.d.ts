/**
 * universal-skeleton — type declarations
 *
 * The package is written in plain JavaScript, but this file ships with the
 * npm package, so TypeScript projects get full IntelliSense and type safety
 * with zero extra setup (no @types package needed).
 */

export type SkeletonEffect =
  | 'shimmer'
  | 'wave'
  | 'pulse'
  | 'fade'
  | 'blink'
  | 'sheen'
  | 'bounce'
  | 'none';

/** Color palette of the skeleton blocks. 'auto' follows prefers-color-scheme. */
export type SkeletonTheme = 'light' | 'dark' | 'auto';

/** Every animation effect the engine knows, in display order. */
export declare const EFFECTS: SkeletonEffect[];

/** Every theme palette the engine knows. */
export declare const THEMES: SkeletonTheme[];

export interface SkeletonOptions {
  /** Animation style. Default: 'shimmer'. */
  effect?: SkeletonEffect;
  /** Block color palette. Default: 'auto' — follows prefers-color-scheme. */
  theme?: SkeletonTheme;
  /** Base grey of every skeleton block (any CSS color). */
  color?: string;
  /** Bright band color of shimmer / wave / sheen effects. */
  highlightColor?: string;
  /** One animation cycle — CSS time like '2s' or milliseconds as a number. */
  duration?: string | number;
  /** Corner radius in px for rectangular blocks (text bars are always pill-shaped). */
  radius?: number | null;
  /** CSS selector or predicate function — matching elements are skipped. */
  exclude?: string | ((el: Element) => boolean);
  /** Paint one bar per estimated text line. Default: true. */
  textLines?: boolean;
  /** Rebuild blocks automatically when the root is resized. Default: true. */
  responsive?: boolean;
  /** Block pointer events while the skeleton is visible. Default: true. */
  blockInteraction?: boolean;
  /** SkeletonLoader.while() only: keep the skeleton visible at least this long (ms). */
  minDuration?: number;
  /** Anti-flicker grace period (ms) — the skeleton stays invisible and is
   *  cancelled entirely if loading finishes first. Default: 0. */
  delay?: number;
  /** Failsafe watchdog (ms) — auto-destroys the skeleton if loading is still
   *  pending after this long. Default: 0 (disabled). */
  timeout?: number;
  /** Called when the timeout watchdog fires (after the skeleton is removed). */
  onTimeout?: (root: Element) => void;
  /** Maximum DOM traversal depth. Default: 20. */
  maxDepth?: number;
}

export interface SkeletonHandle {
  readonly root: Element;
  readonly overlay: HTMLElement;
  /** Number of skeleton blocks currently painted. */
  readonly blocks: number;
  /** True while the anti-flicker delay has not elapsed yet. */
  readonly pending: boolean;
  /** Re-measure the real UI and rebuild every block. */
  update(): void;
  /** Switch the animation at runtime — any SkeletonEffect value. */
  setEffect(effect: SkeletonEffect): void;
  /** Switch the color palette at runtime — 'light' | 'dark' | 'auto'. */
  setTheme(theme: SkeletonTheme): void;
  /** Remove the skeleton and restore the real UI. Idempotent. */
  destroy(): void;
}

export declare class SkeletonLoader {
  /**
   * Show a skeleton over `target` (Element or CSS selector) that mirrors the
   * real UI geometry. Scanning the same target twice replaces the skeleton.
   */
  static scan(target: Element | string, options?: SkeletonOptions): SkeletonHandle;
  /** Remove the skeleton from `target` if one is active. Safe no-op otherwise. */
  static restore(target: Element | string): void;
  /** True while a skeleton is showing on `target`. */
  static isActive(target: Element | string): boolean;
  /**
   * Show a skeleton while `source` runs, then remove it automatically —
   * even when the promise rejects. The resolved value is returned unchanged.
   */
  static while<T>(
    source: Promise<T> | (() => T | Promise<T>),
    target: Element | string,
    options?: SkeletonOptions
  ): Promise<T>;
}

/** The <skeleton-screen> Web Component class (registered as a custom element). */
export declare class SkeletonScreen extends HTMLElement {
  /** Show the skeleton. Options override the element's attributes. */
  show(options?: SkeletonOptions): void;
  /** Hide the skeleton and reveal the real content. */
  hide(): void;
}

/**
 * Register the Web Component under a custom tag name.
 * Called automatically with 'skeleton-screen' in browser environments.
 */
export declare function registerSkeletonScreen(name?: string): void;

/** Inject the stylesheet once per document. Safe to call repeatedly. */
export declare function injectStyles(): boolean;

/** Enable/disable lazy style injection (strict-CSP mode: pass false and ship
 *  dist/universal-skeleton.css as a static asset instead). */
export declare function setAutoInject(value: boolean): void;

/** Start the shared data-us-loading attribute observer (runs automatically in
 *  the browser; exposed for tests and micro-frontend lifecycle control). */
export declare function startAutoLoading(): MutationObserver | null;

/** Stop the shared data-us-loading observer. */
export declare function stopAutoLoading(): void;

/** The complete skeleton stylesheet (also shipped as dist/universal-skeleton.css). */
export declare const SKELETON_CSS: string;

declare const _default: typeof SkeletonLoader;
export default _default;

// ---------------------------------------------------------------------------
// Optional JSX typing — lets React users write <skeleton-screen loading />
// ---------------------------------------------------------------------------

export interface SkeletonScreenAttributes {
  /** Present (or "true"/"1"/"on") shows the skeleton. */
  loading?: boolean | string;
  effect?: SkeletonEffect;
  theme?: SkeletonTheme;
  color?: string;
  'highlight-color'?: string;
  duration?: string | number;
  radius?: number | string;
  /** Anti-flicker grace period (ms). */
  delay?: number | string;
  /** Failsafe watchdog (ms). */
  timeout?: number | string;
  [key: string]: unknown;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'skeleton-screen': SkeletonScreenAttributes;
    }
  }
}
