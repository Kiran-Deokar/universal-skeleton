/**
 * universal-skeleton — web-component.js
 *
 * <skeleton-screen> — a zero-configuration Web Component that works in every
 * framework: plain HTML, React, Vue 3, Angular, Svelte, Lit, jQuery…
 *
 * Usage:
 *   <skeleton-screen loading effect="shimmer">
 *     ...your real markup (stays in the light DOM)...
 *   </skeleton-screen>
 *
 * Toggle the boolean `loading` attribute to switch between skeleton and UI.
 *
 * Attributes
 *   loading         present (or "true"/"1"/"on"/"loading") → show skeleton
 *   effect          shimmer | wave | pulse | fade | blink | sheen | bounce | none
 *                   (default shimmer)
 *   theme           light | dark | auto          (default auto — follows the OS)
 *   color           base grey, any CSS color
 *   highlight-color shimmer/wave band color
 *   duration        one animation cycle, e.g. "2s" or "800" (ms)
 *   radius          corner radius in px for rect blocks
 *   delay           anti-flicker grace period in ms (default 0)
 *   timeout         failsafe watchdog in ms (default 0 = disabled)
 */

import { SkeletonLoader } from './skeleton-loader.js';

const TRUTHY = new Set(['', 'true', '1', 'on', 'loading']);

// In Node (SSR — Next.js, Nuxt, Astro…) HTMLElement does not exist, so we
// fall back to a plain base class. registerSkeletonScreen() is guarded too,
// which keeps server-side imports crash-free.
const CustomElementBase = typeof HTMLElement !== 'undefined' ? HTMLElement : class {};

class SkeletonScreen extends CustomElementBase {
  static get observedAttributes() {
    return ['loading', 'effect', 'theme', 'color', 'highlight-color', 'duration', 'radius', 'delay', 'timeout'];
  }

  connectedCallback() {
    // During HTML parsing, connectedCallback fires when the start tag is
    // inserted — the light-DOM children do not exist yet. Defer one frame
    // so the real content is complete before scanning it.
    const sync = () => { if (this.isConnected) this._sync(); };
    if (typeof requestAnimationFrame === 'function') requestAnimationFrame(sync);
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
    const value = this.getAttribute('loading');
    if (value === null) return false;
    return TRUTHY.has(String(value).toLowerCase());
  }

  /** Show the skeleton (options override attributes). */
  show(options) {
    this.hide();
    const opts = { ...(options || {}) };
    const effect = this.getAttribute('effect');
    if (effect) opts.effect = effect;
    const theme = this.getAttribute('theme');
    if (theme) opts.theme = theme;
    const color = this.getAttribute('color');
    if (color) opts.color = color;
    const highlight = this.getAttribute('highlight-color');
    if (highlight) opts.highlightColor = highlight;
    const duration = this.getAttribute('duration');
    if (duration) opts.duration = duration;
    const radius = parseFloat(this.getAttribute('radius'));
    if (Number.isFinite(radius)) opts.radius = radius;
    const delay = parseInt(this.getAttribute('delay'), 10);
    if (Number.isFinite(delay) && delay > 0) opts.delay = delay;
    const timeout = parseInt(this.getAttribute('timeout'), 10);
    if (Number.isFinite(timeout) && timeout > 0) opts.timeout = timeout;
    this._handle = SkeletonLoader.scan(this, opts);
  }

  /** Hide the skeleton and reveal the real content. */
  hide() {
    if (this._handle) {
      this._handle.destroy();
      this._handle = null;
    }
  }
}

/**
 * Register the Web Component under a custom tag name.
 * Called automatically with 'skeleton-screen' when the library is imported
 * in a browser environment. Guarded, so double registration is impossible.
 *
 * @param {string} [name='skeleton-screen']
 */
export function registerSkeletonScreen(name = 'skeleton-screen') {
  if (typeof customElements === 'undefined' || typeof HTMLElement === 'undefined') return;
  if (customElements.get(name)) return;
  // Per the spec, one constructor can only be registered under a single tag
  // name — so every alias gets its own subclass.
  class NamedSkeletonScreen extends SkeletonScreen {}
  customElements.define(name, NamedSkeletonScreen);
}

export { SkeletonScreen };
