/**
 * universal-skeleton — enterprise hardening test suite
 *
 * Covers the zero-vulnerability / scale-adaptive spec:
 *   - data-us-* universal attribute contract (shape, lines, width, ignore,
 *     repeat, delay, timeout, loading)
 *   - interactive lockdown (inert) with clean restore
 *   - iterative traversal (maxDepth + cycle guard)
 *   - deterministic output (no Math.random anywhere)
 *   - zero-CLS min-height pinning
 *   - shared live region announcements
 *   - Save-Data compliance
 *   - strict-CSP auto-inject switch
 *
 * jsdom has no layout engine, so getBoundingClientRect() returns zeros —
 * each test mocks the rects it needs to simulate real geometry.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  SkeletonLoader,
  registerSkeletonScreen,
  injectStyles,
  setAutoInject,
} from '../src/index.js';
import { optionsFromAttrs, isLoadingTruthy } from '../src/auto-loading.js';

/** Override getBoundingClientRect on an element to simulate real geometry. */
function mockRect(el, x, y, w, h) {
  el.getBoundingClientRect = () => ({
    x, y, left: x, top: y,
    right: x + w, bottom: y + h,
    width: w, height: h,
    toJSON() {},
  });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let host;

beforeEach(() => {
  document.head.innerHTML = '';
  document.body.innerHTML = '<div id="host"></div>';
  host = document.getElementById('host');
  setAutoInject(true);
});

describe('data-us-* universal contract', () => {
  it('data-us-ignore removes an element from the skeleton', () => {
    host.innerHTML = `
      <div class="card">
        <span id="badge" data-us-ignore>Featured</span>
        <p id="title">Hello world</p>
      </div>`;
    mockRect(host, 0, 0, 400, 100);
    mockRect(host.querySelector('.card'), 0, 0, 400, 100);
    mockRect(document.getElementById('badge'), 8, 8, 80, 24);
    mockRect(document.getElementById('title'), 8, 40, 380, 24);

    const handle = SkeletonLoader.scan(host);
    const overlay = handle.overlay;
    // The badge's exact rect must have no block on it.
    const onBadge = Array.from(overlay.querySelectorAll('.usk-block')).filter((b) => {
      return b.style.left === '8px' && b.style.top === '8px';
    });
    expect(onBadge).toHaveLength(0);
    expect(document.getElementById('badge').classList.contains('usk-t')).toBe(false);
    // The title is still skeletonised.
    expect(document.getElementById('title').classList.contains('usk-t')).toBe(true);
    handle.destroy();
  });

  it('data-us-shape="circle" renders one circular block', () => {
    host.innerHTML = '<span id="dot" data-us-shape="circle">A</span>';
    mockRect(host, 0, 0, 100, 100);
    mockRect(document.getElementById('dot'), 10, 10, 40, 40);
    const handle = SkeletonLoader.scan(host);
    const block = handle.overlay.querySelector('.usk-block');
    expect(block).not.toBeNull();
    expect(block.classList.contains('usk-circle')).toBe(true);
    handle.destroy();
  });

  it('data-us-shape="pill" renders a fully rounded block', () => {
    host.innerHTML = '<span id="chip" data-us-shape="pill">New</span>';
    mockRect(host, 0, 0, 100, 100);
    mockRect(document.getElementById('chip'), 10, 10, 100, 32);
    const handle = SkeletonLoader.scan(host);
    const block = handle.overlay.querySelector('.usk-block');
    expect(block.classList.contains('usk-circle')).toBe(false);
    expect(block.style.borderRadius).toBe('16px'); // half of 32
    handle.destroy();
  });

  it('data-us-shape="square" renders a block without rounding', () => {
    host.innerHTML = '<span id="sq" data-us-shape="square"></span>';
    mockRect(host, 0, 0, 100, 100);
    mockRect(document.getElementById('sq'), 0, 0, 64, 64);
    const handle = SkeletonLoader.scan(host);
    const block = handle.overlay.querySelector('.usk-block');
    expect(block.style.borderRadius).toBe('0px');
    handle.destroy();
  });

  it('data-us-lines="3" forces exactly three bars on a text element', () => {
    host.innerHTML = '<p id="para">one short line of text</p>';
    mockRect(host, 0, 0, 400, 100);
    mockRect(document.getElementById('para'), 0, 0, 300, 66);
    const handle = SkeletonLoader.scan(host);
    expect(handle.overlay.querySelectorAll('.usk-block')).toHaveLength(3);
    handle.destroy();
  });

  it('data-us-width="65%" pins the text bar width', () => {
    host.innerHTML = '<p id="para" data-us-width="65%">narrow heading placeholder</p>';
    mockRect(host, 0, 0, 400, 100);
    mockRect(document.getElementById('para'), 0, 0, 200, 20);
    const handle = SkeletonLoader.scan(host);
    const block = handle.overlay.querySelector('.usk-block');
    // 65% of 200 = 130
    expect(block.style.width).toBe('130px');
    handle.destroy();
  });

  it('data-us-color is honoured as an alias for block color', () => {
    host.innerHTML = '<span id="tag" style="background-color: rgb(16,185,129)" data-us-color="#ff0000">Tag</span>';
    mockRect(host, 0, 0, 100, 100);
    mockRect(document.getElementById('tag'), 0, 0, 60, 24);
    const handle = SkeletonLoader.scan(host);
    const block = handle.overlay.querySelector('.usk-block');
    expect(block.style.getPropertyValue('--usk-color')).toBe('#ff0000');
    handle.destroy();
  });

  it('data-us-repeat="3" paints three placeholder rows in an empty container', () => {
    host.innerHTML = '<ul id="list" data-us-repeat="3"></ul>';
    mockRect(host, 0, 0, 400, 100);
    mockRect(document.getElementById('list'), 8, 8, 384, 300);
    const handle = SkeletonLoader.scan(document.getElementById('list'));
    const rows = handle.overlay.querySelectorAll('.usk-block');
    expect(rows).toHaveLength(3);
    // Stacked: no two rows share the same top offset, and none overlap.
    const tops = Array.from(rows).map((r) => parseFloat(r.style.top));
    expect(new Set(tops).size).toBe(3);
    expect(tops[1]).toBeGreaterThan(tops[0]);
    expect(tops[2]).toBeGreaterThan(tops[1]);
    handle.destroy();
  });

  it('classic data-skeleton attributes keep priority over data-us-*', () => {
    host.innerHTML = '<span id="mixed" data-skeleton="circle" data-us-shape="square">X</span>';
    mockRect(host, 0, 0, 100, 100);
    mockRect(document.getElementById('mixed'), 0, 0, 40, 40);
    const handle = SkeletonLoader.scan(host);
    const block = handle.overlay.querySelector('.usk-block');
    expect(block.classList.contains('usk-circle')).toBe(true);
    handle.destroy();
  });
});

describe('anti-flicker delay (data-us-delay)', () => {
  it('keeps the skeleton invisible during the grace period, then reveals', async () => {
    host.innerHTML = '<div id="box"><p id="t">content</p></div>';
    mockRect(host, 0, 0, 300, 80);
    mockRect(document.getElementById('t'), 0, 0, 280, 20);
    const handle = SkeletonLoader.scan(document.getElementById('box'), { delay: 40 });
    expect(handle.pending).toBe(true);
    expect(handle.overlay.classList.contains('usk-pending')).toBe(true);
    await sleep(140);
    expect(handle.pending).toBe(false);
    expect(handle.overlay.classList.contains('usk-pending')).toBe(false);
    handle.destroy();
  });

  it('never shows a skeleton when the data arrives within the delay', async () => {
    host.innerHTML = '<div id="box"><p>content</p></div>';
    mockRect(host, 0, 0, 300, 80);
    const handle = SkeletonLoader.scan(document.getElementById('box'), { delay: 60 });
    handle.destroy(); // resolve "instantly"
    await sleep(120);
    expect(SkeletonLoader.isActive(document.getElementById('box'))).toBe(false);
    expect(document.querySelectorAll('.usk-overlay').length).toBe(0);
    expect(document.getElementById('box').classList.contains('usk-active')).toBe(false);
  });

  it('data-us-delay attribute is honoured without options', async () => {
    host.innerHTML = '<div id="box" data-us-delay="40"><p>content</p></div>';
    mockRect(host, 0, 0, 300, 80);
    const handle = SkeletonLoader.scan(document.getElementById('box'));
    expect(handle.pending).toBe(true);
    await sleep(140);
    expect(handle.pending).toBe(false);
    handle.destroy();
  });

  it('SkeletonLoader.while() with delay never flashes on fast responses', async () => {
    host.innerHTML = '<div id="box"><p>fast</p></div>';
    mockRect(host, 0, 0, 300, 80);
    const result = await SkeletonLoader.while(
      () => new Promise((r) => setTimeout(() => r('ok'), 10)),
      document.getElementById('box'),
      { delay: 150 }
    );
    expect(result).toBe('ok');
    expect(SkeletonLoader.isActive(document.getElementById('box'))).toBe(false);
    expect(document.querySelectorAll('.usk-overlay').length).toBe(0);
  });
});

describe('failsafe timeout watchdog (data-us-timeout)', () => {
  it('auto-destroys the skeleton and fires onTimeout when data hangs', async () => {
    host.innerHTML = '<div id="box"><p>hanging</p></div>';
    mockRect(host, 0, 0, 300, 80);
    const onTimeout = vi.fn();
    SkeletonLoader.scan(document.getElementById('box'), { timeout: 60, onTimeout });
    expect(SkeletonLoader.isActive(document.getElementById('box'))).toBe(true);
    await sleep(160);
    expect(SkeletonLoader.isActive(document.getElementById('box'))).toBe(false);
    expect(document.querySelectorAll('.usk-overlay').length).toBe(0);
    expect(onTimeout).toHaveBeenCalledTimes(1);
    expect(onTimeout.mock.calls[0][0]).toBe(document.getElementById('box'));
  });

  it('does nothing extra when the promise resolves before the timeout', async () => {
    host.innerHTML = '<div id="box"><p>quick</p></div>';
    mockRect(host, 0, 0, 300, 80);
    const onTimeout = vi.fn();
    await SkeletonLoader.while(
      () => new Promise((r) => setTimeout(() => r('v'), 10)),
      document.getElementById('box'),
      { timeout: 5000, onTimeout }
    );
    await sleep(60);
    expect(onTimeout).not.toHaveBeenCalled();
    expect(SkeletonLoader.isActive(document.getElementById('box'))).toBe(false);
  });
});

describe('declarative loading (data-us-loading)', () => {
  it('optionsFromAttrs reads the full contract', () => {
    host.innerHTML = '<div id="box" data-us-delay="150" data-us-timeout="15000" data-us-effect="wave"></div>';
    expect(optionsFromAttrs(document.getElementById('box'))).toEqual({
      delay: 150,
      timeout: 15000,
      effect: 'wave',
    });
    expect(isLoadingTruthy(document.getElementById('box'))).toBe(false);
    document.getElementById('box').setAttribute('data-us-loading', 'true');
    expect(isLoadingTruthy(document.getElementById('box'))).toBe(true);
  });

  it('toggling data-us-loading shows and removes the skeleton', async () => {
    host.innerHTML = '<div id="live"><p>data</p></div>';
    mockRect(host, 0, 0, 300, 80);
    const box = document.getElementById('live');
    box.setAttribute('data-us-loading', 'true');
    await sleep(80); // observer batch (microtask + frame)
    expect(SkeletonLoader.isActive(box)).toBe(true);
    expect(box.classList.contains('usk-active')).toBe(true);

    box.setAttribute('data-us-loading', 'false');
    await sleep(80);
    expect(SkeletonLoader.isActive(box)).toBe(false);
    expect(box.classList.contains('usk-active')).toBe(false);
  }, 15000);

  it('destroying a container cleans up its skeleton', async () => {
    host.innerHTML = '<div id="doomed" data-us-loading="true"><p>x</p></div>';
    mockRect(host, 0, 0, 300, 80);
    await sleep(80);
    const doomed = document.getElementById('doomed');
    expect(SkeletonLoader.isActive(doomed)).toBe(true);
    doomed.remove();
    await sleep(80);
    // Removed node → observer destroyed the handle; no timers left to leak.
    expect(SkeletonLoader.isActive(doomed)).toBe(false);
    expect(document.body.querySelectorAll('.usk-overlay').length).toBe(0);
  }, 15000);
});

describe('interactive lockdown (inert)', () => {
  it('locks links and buttons while the skeleton shows, restores after', async () => {
    host.innerHTML = `
      <div class="card">
        <a id="lnk" href="/x">link</a>
        <button id="btn">go</button>
        <input id="inp" />
      </div>`;
    mockRect(host, 0, 0, 400, 100);
    mockRect(host.querySelector('.card'), 0, 0, 400, 100);
    mockRect(document.getElementById('lnk'), 0, 0, 60, 20);
    mockRect(document.getElementById('btn'), 80, 0, 80, 28);
    mockRect(document.getElementById('inp'), 0, 40, 200, 28);

    const handle = SkeletonLoader.scan(host);
    const lnk = document.getElementById('lnk');
    const btn = document.getElementById('btn');
    const inp = document.getElementById('inp');

    const locked = (el) =>
      el.hasAttribute('inert') ||
      (el.getAttribute('tabindex') === '-1' && el.classList.contains('usk-noio'));
    expect(locked(lnk)).toBe(true);
    expect(locked(btn)).toBe(true);
    expect(locked(inp)).toBe(true);

    handle.destroy();
    expect(lnk.hasAttribute('inert')).toBe(false);
    expect(btn.hasAttribute('inert')).toBe(false);
    expect(inp.hasAttribute('tabindex')).toBe(false);
    expect(inp.classList.contains('usk-noio')).toBe(false);
  });

  it('blockInteraction: false leaves the UI untouched', () => {
    host.innerHTML = '<button id="b">press</button>';
    mockRect(host, 0, 0, 100, 40);
    mockRect(document.getElementById('b'), 0, 0, 100, 40);
    const handle = SkeletonLoader.scan(host, { blockInteraction: false });
    expect(document.getElementById('b').hasAttribute('inert')).toBe(false);
    expect(document.getElementById('b').classList.contains('usk-noio')).toBe(false);
    handle.destroy();
  });
});

describe('iterative traversal & depth guard', () => {
  it('survives pathologically deep trees without stack overflow', () => {
    // Build the 5000-level chain incrementally: appending an already-deep
    // subtree would overflow jsdom's own recursive _attach, not our engine.
    let cur = document.createElement('div');
    const chain = [cur];
    host.appendChild(cur);
    for (let i = 0; i < 5000; i++) {
      const child = document.createElement('div');
      cur.appendChild(child);
      chain.push(child);
      cur = child;
    }
    cur.textContent = 'deep leaf';
    mockRect(host, 0, 0, 200, 40);
    // Recursion would throw RangeError here; the queue-based walk must not.
    expect(() => SkeletonLoader.scan(host)).not.toThrow();
    SkeletonLoader.restore(host);
    // Tear down incrementally too — jsdom's recursive _detach would blow up
    // on the deep chain inside body.innerHTML = '' of the next test.
    for (let i = chain.length - 1; i > 0; i--) {
      chain[i - 1].removeChild(chain[i]);
    }
    host.removeChild(chain[0]);
  });

  it('maxDepth option stops traversal at the configured depth', () => {
    host.innerHTML = `
      <div class="l1">
        <div class="l2">
          <div class="l3"><p id="deep">too deep to paint</p></div>
        </div>
      </div>`;
    mockRect(host, 0, 0, 400, 100);
    const handle = SkeletonLoader.scan(host, { maxDepth: 2 });
    // The <p> sits 3 levels below the root — beyond the cap → no bar for it.
    expect(document.getElementById('deep').classList.contains('usk-t')).toBe(false);
    handle.destroy();
    // Without the cap it is painted.
    const handle2 = SkeletonLoader.scan(host);
    expect(document.getElementById('deep').classList.contains('usk-t')).toBe(true);
    handle2.destroy();
  });
});

describe('deterministic output (hydration-safe)', () => {
  it('two scans of an identical DOM produce identical skeletons', () => {
    const build = () => `
      <p class="a">alpha line of text</p>
      <p class="b">beta line of slightly longer text here</p>
      <p class="c">gamma</p>`;
    host.innerHTML = build();
    mockRect(host, 0, 0, 400, 100);
    mockRect(host.querySelector('.a'), 0, 0, 360, 20);
    mockRect(host.querySelector('.b'), 0, 24, 360, 20);
    mockRect(host.querySelector('.c'), 0, 48, 360, 20);
    const first = SkeletonLoader.scan(host);
    const widths1 = Array.from(first.overlay.querySelectorAll('.usk-block')).map((b) => b.style.width);
    const tops1 = Array.from(first.overlay.querySelectorAll('.usk-block')).map((b) => b.style.top);
    first.destroy();

    host.innerHTML = build();
    mockRect(host, 0, 0, 400, 100);
    mockRect(host.querySelector('.a'), 0, 0, 360, 20);
    mockRect(host.querySelector('.b'), 0, 24, 360, 20);
    mockRect(host.querySelector('.c'), 0, 48, 360, 20);
    const second = SkeletonLoader.scan(host);
    const widths2 = Array.from(second.overlay.querySelectorAll('.usk-block')).map((b) => b.style.width);
    const tops2 = Array.from(second.overlay.querySelectorAll('.usk-block')).map((b) => b.style.top);
    second.destroy();

    expect(widths1).toEqual(widths2);
    expect(tops1).toEqual(tops2);
  });
});

describe('zero-CLS min-height pinning', () => {
  it('pins the container height and restores it on destroy', () => {
    host.innerHTML = '<div id="panel" style="height: 120px"><p>content</p></div>';
    const panel = document.getElementById('panel');
    mockRect(panel, 0, 0, 400, 120);
    const handle = SkeletonLoader.scan(panel);
    expect(panel.style.minHeight).toBe('120px');
    expect(panel.getAttribute('data-us-prev-minheight')).toBe('');
    handle.destroy();
    expect(panel.style.minHeight).toBe('');
    expect(panel.hasAttribute('data-us-prev-minheight')).toBe(false);
  });

  it('restores a pre-existing inline min-height', () => {
    host.innerHTML = '<div id="panel" style="height: 120px; min-height: 200px"></div>';
    const panel = document.getElementById('panel');
    mockRect(panel, 0, 0, 400, 120);
    const handle = SkeletonLoader.scan(panel);
    expect(panel.style.minHeight).toBe('120px');
    handle.destroy();
    expect(panel.style.minHeight).toBe('200px');
  });
});

describe('shared accessibility live region', () => {
  it('announces loading and loaded once per document', async () => {
    host.innerHTML = '<div id="a1"><p>one</p></div>';
    mockRect(host, 0, 0, 200, 40);
    const handle = SkeletonLoader.scan(host);
    await sleep(200); // debounce (120ms)
    const live = document.querySelector('.usk-live');
    expect(live).not.toBeNull();
    expect(live.getAttribute('role')).toBe('status');
    expect(live.textContent).toBe('Loading content…');

    handle.destroy();
    await sleep(20);
    expect(live.textContent).toBe('Content loaded');
  }, 15000);
});

describe('Save-Data compliance', () => {
  it('switches the animation off on data-saver networks', () => {
    host.innerHTML = '<div id="box"><p>x</p></div>';
    mockRect(host, 0, 0, 200, 40);
    const nav = window.navigator;
    const original = nav.connection;
    Object.defineProperty(nav, 'connection', {
      configurable: true,
      value: { saveData: true },
    });
    try {
      const handle = SkeletonLoader.scan(host);
      expect(handle.overlay.classList.contains('usk-effect-none')).toBe(true);
      handle.destroy();
    } finally {
      Object.defineProperty(nav, 'connection', {
        configurable: true,
        value: original,
      });
    }
  });
});

describe('strict-CSP auto-inject switch', () => {
  it('scan() skips style injection when setAutoInject(false)', () => {
    host.innerHTML = '<div id="box"><p>x</p></div>';
    mockRect(host, 0, 0, 200, 40);
    setAutoInject(false);
    document.getElementById('universal-skeleton-styles')?.remove();
    const handle = SkeletonLoader.scan(host);
    expect(document.getElementById('universal-skeleton-styles')).toBeNull();
    handle.destroy();
    setAutoInject(true);
    SkeletonLoader.scan(host).destroy();
    expect(document.getElementById('universal-skeleton-styles')).not.toBeNull();
  });
});

describe('web component delay / timeout attributes', () => {
  it('delay attribute keeps the component skeleton pending, then reveals', async () => {
    registerSkeletonScreen('x-us-delay');
    host.innerHTML = '<x-us-delay loading delay="40"><p>content</p></x-us-delay>';
    await sleep(20);
    const wc = host.querySelector('x-us-delay');
    mockRect(wc, 0, 0, 300, 80);
    const handle = wc._handle;
    expect(handle).toBeTruthy();
    expect(handle.pending).toBe(true);
    await sleep(160);
    expect(handle.pending).toBe(false);
    handle.destroy();
  }, 15000);

  it('timeout attribute auto-destroys a stuck skeleton', async () => {
    registerSkeletonScreen('x-us-timeout');
    host.innerHTML = '<x-us-timeout loading timeout="60"><p>content</p></x-us-timeout>';
    await sleep(20);
    const wc = host.querySelector('x-us-timeout');
    mockRect(wc, 0, 0, 300, 80);
    expect(SkeletonLoader.isActive(wc)).toBe(true);
    await sleep(180);
    expect(SkeletonLoader.isActive(wc)).toBe(false);
  }, 15000);
});
