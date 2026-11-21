/**
 * universal-skeleton — test suite (Vitest + jsdom)
 *
 * jsdom has no layout engine, so getBoundingClientRect() returns zeros.
 * Each test mocks the rects it needs to simulate a real layout.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  SkeletonLoader,
  registerSkeletonScreen,
  injectStyles,
  SKELETON_CSS,
} from '../src/index.js';

/** Override getBoundingClientRect on an element to simulate real geometry. */
function mockRect(el, x, y, w, h) {
  el.getBoundingClientRect = () => ({
    x, y, left: x, top: y,
    right: x + w, bottom: y + h,
    width: w, height: h,
    toJSON() {},
  });
}

let host;

beforeEach(() => {
  document.head.innerHTML = '';
  document.body.innerHTML = '<div id="host"></div>';
  host = document.getElementById('host');
});

/** A small "social post" fixture with mocked layout rects. */
function setupFeed() {
  host.innerHTML = `
    <div class="card">
      <img id="avatar" class="avatar" alt="avatar" />
      <h2 id="name">Ada Lovelace</h2>
      <p id="bio">First programmer in history. Wrote the first algorithm.</p>
      <button id="follow">Follow</button>
    </div>`;
  mockRect(host, 0, 0, 400, 300);
  mockRect(host.querySelector('.card'), 0, 0, 400, 300);
  mockRect(document.getElementById('avatar'), 16, 16, 48, 48);
  mockRect(document.getElementById('name'), 80, 20, 200, 28);
  mockRect(document.getElementById('bio'), 16, 64, 368, 44);
  mockRect(document.getElementById('follow'), 16, 120, 96, 36);
}

describe('styles', () => {
  it('injects the stylesheet exactly once', () => {
    expect(injectStyles()).toBe(true);
    expect(injectStyles()).toBe(false);
    expect(document.querySelectorAll('#universal-skeleton-styles').length).toBe(1);
  });

  it('exports the CSS source with shimmer + pulse keyframes', () => {
    expect(SKELETON_CSS).toContain('usk-shimmer');
    expect(SKELETON_CSS).toContain('usk-pulse');
    expect(SKELETON_CSS).toContain('prefers-reduced-motion');
  });
});

describe('SkeletonLoader.scan()', () => {
  it('builds an overlay with blocks mirroring text, images and buttons', () => {
    setupFeed();
    const handle = SkeletonLoader.scan('#host');

    const overlay = host.querySelector('.usk-overlay');
    expect(overlay).toBeTruthy();
    expect(overlay.className).toContain('usk-effect-shimmer');

    // avatar (1) + name (1) + bio (2 lines) + button (1) = 5 blocks
    expect(handle.blocks).toBe(5);

    expect(host.classList.contains('usk-active')).toBe(true);
    expect(host.getAttribute('aria-busy')).toBe('true');

    // text elements are flagged so CSS can hide the glyphs
    expect(document.getElementById('name').classList.contains('usk-t')).toBe(true);
    expect(document.getElementById('avatar').classList.contains('usk-t')).toBe(false);

    handle.destroy();
  });

  it('destroy() removes the overlay, classes and aria-busy completely', () => {
    setupFeed();
    const handle = SkeletonLoader.scan('#host');
    handle.destroy();

    expect(host.querySelector('.usk-overlay')).toBeNull();
    expect(host.classList.contains('usk-active')).toBe(false);
    expect(host.getAttribute('aria-busy')).toBeNull();
    expect(document.getElementById('name').classList.contains('usk-t')).toBe(false);
  });

  it('is idempotent — destroy() twice is a safe no-op', () => {
    setupFeed();
    const handle = SkeletonLoader.scan('#host');
    handle.destroy();
    expect(() => handle.destroy()).not.toThrow();
  });

  it('scanning twice does not stack overlays', () => {
    setupFeed();
    const first = SkeletonLoader.scan('#host');
    const second = SkeletonLoader.scan('#host');
    expect(host.querySelectorAll('.usk-overlay').length).toBe(1);
    second.destroy();
    expect(host.querySelector('.usk-overlay')).toBeNull();
    expect(() => first.destroy()).not.toThrow();
  });

  it('restore() is a safe no-op when nothing is active', () => {
    setupFeed();
    expect(() => SkeletonLoader.restore('#host')).not.toThrow();
  });

  it('isActive() reflects the current state', () => {
    setupFeed();
    const handle = SkeletonLoader.scan('#host');
    expect(SkeletonLoader.isActive('#host')).toBe(true);
    handle.destroy();
    expect(SkeletonLoader.isActive('#host')).toBe(false);
  });

  it('throws a helpful error for unknown selectors', () => {
    expect(() => SkeletonLoader.scan('#does-not-exist')).toThrow(/No element matches/);
  });

  it('throws a helpful error for invalid targets', () => {
    expect(() => SkeletonLoader.scan(42)).toThrow(TypeError);
    expect(() => SkeletonLoader.scan(null)).toThrow(TypeError);
  });
});

describe('element classification', () => {
  it('paints circular blocks for data-skeleton="circle" and skips data-skeleton="none" subtrees', () => {
    host.innerHTML = `
      <div>
        <img id="a" data-skeleton="circle" />
        <section id="s" data-skeleton="none">
          <p id="hidden-text">no skeleton here</p>
        </section>
      </div>`;
    mockRect(host, 0, 0, 300, 300);
    mockRect(document.getElementById('a'), 0, 0, 40, 40);

    const handle = SkeletonLoader.scan('#host');
    expect(handle.overlay.querySelector('.usk-circle')).toBeTruthy();
    expect(document.getElementById('hidden-text').classList.contains('usk-t')).toBe(false);
    expect(handle.blocks).toBe(1); // only the avatar block
    handle.destroy();
  });

  it('data-skeleton="rect" honours radius and per-element color overrides', () => {
    host.innerHTML = `
      <div id="panel" data-skeleton="rect"
           data-skeleton-radius="16" data-skeleton-color="#ff0000"></div>`;
    mockRect(host, 0, 0, 200, 200);
    mockRect(document.getElementById('panel'), 10, 10, 180, 120);

    const handle = SkeletonLoader.scan('#host');
    const block = handle.overlay.querySelector('.usk-block');
    expect(block).toBeTruthy();
    expect(block.style.borderRadius).toBe('16px');
    expect(handle.blocks).toBe(1);
    handle.destroy();
  });

  it('data-skeleton="ignore" excludes an element and its subtree', () => {
    host.innerHTML = `
      <div>
        <span id="kept">kept</span>
        <div id="zone" data-skeleton="ignore"><span id="dropped">dropped</span></div>
      </div>`;
    mockRect(host, 0, 0, 200, 100);
    mockRect(document.getElementById('kept'), 0, 0, 40, 16);
    mockRect(document.getElementById('zone'), 0, 20, 160, 40);
    mockRect(document.getElementById('dropped'), 4, 24, 60, 16);

    const handle = SkeletonLoader.scan('#host');
    expect(document.getElementById('kept').classList.contains('usk-t')).toBe(true);
    expect(document.getElementById('dropped').classList.contains('usk-t')).toBe(false);
    handle.destroy();
  });

  it('multi-line paragraphs get one bar per estimated line', () => {
    host.innerHTML = '<p id="bio">long text block</p>';
    mockRect(host, 0, 0, 400, 100);
    mockRect(document.getElementById('bio'), 0, 0, 400, 70); // ≈3 lines at 16px font

    const handle = SkeletonLoader.scan('#host');
    expect(handle.blocks).toBe(3);
    handle.destroy();
  });

  it('single-line elements get a single pill bar', () => {
    host.innerHTML = '<p id="title">short</p>';
    mockRect(host, 0, 0, 400, 100);
    mockRect(document.getElementById('title'), 0, 0, 400, 24);

    const handle = SkeletonLoader.scan('#host');
    expect(handle.blocks).toBe(1);
    const block = handle.overlay.querySelector('.usk-block');
    expect(block.style.borderRadius).toBe('6px'); // pill = bar height (12px) / 2
    handle.destroy();
  });

  it('detects circular avatars from 50% border-radius', () => {
    host.innerHTML = '<img id="avatar" style="border-radius: 50%" alt="" />';
    mockRect(host, 0, 0, 200, 200);
    mockRect(document.getElementById('avatar'), 10, 10, 64, 64);

    const handle = SkeletonLoader.scan('#host');
    expect(handle.overlay.querySelector('.usk-circle')).toBeTruthy();
    handle.destroy();
  });

  it('honours the exclude option (selector or function)', () => {
    setupFeed();

    const bySelector = SkeletonLoader.scan('#host', { exclude: '#follow' });
    expect(bySelector.blocks).toBe(4); // avatar + name + 2 bio lines
    bySelector.destroy();

    const byFn = SkeletonLoader.scan('#host', { exclude: (el) => el.tagName === 'BUTTON' });
    expect(byFn.blocks).toBe(4);
    byFn.destroy();
  });

  it('respects textLines: false (single bar per text element)', () => {
    host.innerHTML = '<p id="bio">long text block</p>';
    mockRect(host, 0, 0, 400, 100);
    mockRect(document.getElementById('bio'), 0, 0, 400, 70);

    const handle = SkeletonLoader.scan('#host', { textLines: false });
    expect(handle.blocks).toBe(1);
    handle.destroy();
  });
});

describe('effects', () => {
  it('supports the pulse and none effects via options', () => {
    setupFeed();
    const pulse = SkeletonLoader.scan('#host', { effect: 'pulse' });
    expect(pulse.overlay.className).toContain('usk-effect-pulse');
    pulse.destroy();

    const none = SkeletonLoader.scan('#host', { effect: 'none' });
    expect(none.overlay.className).toContain('usk-effect-none');
    none.destroy();
  });

  it('setEffect() switches the animation at runtime', () => {
    setupFeed();
    const handle = SkeletonLoader.scan('#host');
    handle.setEffect('pulse');
    expect(handle.overlay.className).toContain('usk-effect-pulse');
    handle.setEffect('nonsense');
    expect(handle.overlay.className).toContain('usk-effect-shimmer'); // falls back
    handle.destroy();
  });

  it('blockInteraction=false keeps the overlay click-through', () => {
    setupFeed();
    const passive = SkeletonLoader.scan('#host', { blockInteraction: false });
    expect(passive.overlay.className).not.toContain('usk-blocking');
    passive.destroy();

    const blocking = SkeletonLoader.scan('#host');
    expect(blocking.overlay.className).toContain('usk-blocking');
    blocking.destroy();
  });
});

describe('SkeletonLoader.update()', () => {
  it('re-measures and rebuilds blocks', () => {
    host.innerHTML = '<p id="bio">text that grows</p>';
    mockRect(host, 0, 0, 400, 100);
    mockRect(document.getElementById('bio'), 0, 0, 400, 44);

    const handle = SkeletonLoader.scan('#host');
    expect(handle.blocks).toBe(2);

    mockRect(document.getElementById('bio'), 0, 0, 400, 70); // grows to 3 lines
    handle.update();
    expect(handle.blocks).toBe(3);
    handle.destroy();
  });
});

describe('SkeletonLoader.while()', () => {
  it('shows a skeleton and restores it when the promise resolves', async () => {
    setupFeed();
    const result = await SkeletonLoader.while(Promise.resolve('data'), '#host');
    expect(result).toBe('data');
    expect(host.querySelector('.usk-overlay')).toBeNull();
  });

  it('accepts a function returning a value', async () => {
    setupFeed();
    const result = await SkeletonLoader.while(() => 7, '#host');
    expect(result).toBe(7);
    expect(host.querySelector('.usk-overlay')).toBeNull();
  });

  it('restores the skeleton even when the promise rejects', async () => {
    setupFeed();
    await expect(
      SkeletonLoader.while(Promise.reject(new Error('boom')), '#host')
    ).rejects.toThrow('boom');
    expect(host.querySelector('.usk-overlay')).toBeNull();
  });

  it('respects minDuration', async () => {
    setupFeed();
    const start = Date.now();
    await SkeletonLoader.while(Promise.resolve(1), '#host', { minDuration: 120 });
    expect(Date.now() - start).toBeGreaterThanOrEqual(100);
    expect(host.querySelector('.usk-overlay')).toBeNull();
  });
});

describe('<skeleton-screen> web component', () => {
  // connectedCallback defers one animation frame so parsed children exist
  const tick = () => new Promise((resolve) => setTimeout(resolve, 30));

  it('toggles with the loading attribute', async () => {
    registerSkeletonScreen('x-skeleton-test');
    host.innerHTML = '<x-skeleton-test loading><p id="wc-text">content</p></x-skeleton-test>';
    const ce = host.querySelector('x-skeleton-test');
    mockRect(ce, 0, 0, 300, 100);
    mockRect(document.getElementById('wc-text'), 0, 10, 300, 20);
    await tick();

    // connected with loading → skeleton visible
    expect(ce.querySelector('.usk-overlay')).toBeTruthy();

    ce.setAttribute('loading', 'false');
    await tick();
    expect(ce.querySelector('.usk-overlay')).toBeNull();

    ce.setAttribute('loading', '');
    await tick();
    expect(ce.querySelector('.usk-overlay')).toBeTruthy();

    ce.removeAttribute('loading');
    await tick();
    expect(ce.querySelector('.usk-overlay')).toBeNull();
  });

  it('does not double-register the tag name', () => {
    registerSkeletonScreen('x-skeleton-dup');
    expect(() => registerSkeletonScreen('x-skeleton-dup')).not.toThrow();
    expect(customElements.get('x-skeleton-dup')).toBeTruthy();
  });
});
