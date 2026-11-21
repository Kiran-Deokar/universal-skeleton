'use client';

import type { ReactNode } from 'react';
import { CodeBlock } from './code-block';

function ApiTable({ rows, headers }: { headers: string[]; rows: ReactNode[][] }) {
  return (
    <div className="mt-4 overflow-x-auto rounded-xl border border-border">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-muted/50">
            {headers.map((h) => (
              <th key={h} className="border-b border-border px-4 py-2.5 text-left font-medium text-foreground">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="odd:bg-muted/30">
              {row.map((cell, j) => (
                <td key={j} className="border-b border-border/60 px-4 py-2.5 align-top text-muted-foreground [&_code]:font-mono [&_code]:text-emerald-700 dark:[&_code]:text-emerald-300">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function H2({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <h2 id={id} className="mt-12 text-xl font-semibold text-foreground first:mt-0">
      {children}
    </h2>
  );
}

export function ApiReference() {
  return (
    <div className="max-w-4xl space-y-2">
      <h1 className="text-3xl font-bold text-foreground">API reference</h1>
      <p className="mt-2 leading-7 text-muted-foreground">
        Everything below is exported from <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-emerald-700 dark:text-emerald-300">universal-skeleton</code> —
        and from the global <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-emerald-700 dark:text-emerald-300">UniversalSkeleton</code> object on the CDN build.
      </p>

      <H2>SkeletonLoader</H2>
      <ApiTable
        headers={['Method', 'Signature', 'Description']}
        rows={[
          [<code key="s">scan()</code>, <code key="s">scan(target, options?) → SkeletonHandle</code>, 'Mirror the real UI of an Element or CSS selector as a skeleton. Scanning the same target again replaces the previous skeleton.'],
          [<code key="r">restore()</code>, <code key="r">restore(target)</code>, 'Remove the active skeleton and reveal the real UI. Safe no-op when nothing is active.'],
          [<code key="i">isActive()</code>, <code key="i">isActive(target) → boolean</code>, 'True while a skeleton is showing on the target.'],
          [<code key="w">while()</code>, <code key="w">while(source, target, options?) → Promise&lt;T&gt;</code>, 'Show a skeleton while a promise or function runs, then restore automatically — even when it rejects. Supports minDuration.'],
        ]}
      />
      <CodeBlock
        language="javascript"
        label="typical flow"
        code={`const handle = SkeletonLoader.scan('#dashboard', { effect: 'wave' });

// later — any of these restore the UI:
handle.destroy();
SkeletonLoader.restore('#dashboard');

const data = await SkeletonLoader.while(
  () => fetch('/api/feed').then((r) => r.json()),
  '#dashboard',
  { minDuration: 400, effect: 'fade' }
);`}
      />

      <H2>SkeletonHandle</H2>
      <ApiTable
        headers={['Member', 'Description']}
        rows={[
          [<code key="a">handle.root</code>, 'The scanned root element.'],
          [<code key="b">handle.overlay</code>, 'The overlay element holding every skeleton block.'],
          [<code key="c">handle.blocks</code>, 'Number of skeleton blocks currently painted.'],
          [<code key="d">handle.update()</code>, 'Re-measure the real UI and rebuild every block (called automatically on resize).'],
          [<code key="e">handle.setEffect(effect)</code>, 'Swap the animation at runtime — one of the 8 effect names, without re-measuring.'],
          [<code key="g">handle.setTheme(theme)</code>, "Swap the color palette at runtime — 'light', 'dark' or 'auto'."],
          [<code key="f">handle.destroy()</code>, 'Remove the skeleton and restore the real UI. Idempotent.'],
        ]}
      />

      <H2>SkeletonOptions</H2>
      <ApiTable
        headers={['Option', 'Type', 'Default', 'Description']}
        rows={[
          [<code key="1">effect</code>, "'shimmer' | 'wave' | 'pulse' | 'fade' | 'blink' | 'sheen' | 'bounce' | 'none'", "'shimmer'", 'Animation style'],
          [<code key="11">theme</code>, "'light' | 'dark' | 'auto'", "'auto'", "Block color palette — 'auto' follows prefers-color-scheme"],
          [<code key="2">color</code>, 'string', "'#e5e7eb'", 'Base grey of every block (any CSS color)'],
          [<code key="3">highlightColor</code>, 'string', "'#f3f4f6'", 'Bright band of shimmer / wave / sheen'],
          [<code key="4">duration</code>, 'string | number', "'1.4s'", 'One animation cycle — CSS time (\u20182s\u2019) or milliseconds (900)'],
          [<code key="5">radius</code>, 'number | null', '8', 'Corner radius (px) of rect blocks; text bars are always pills'],
          [<code key="6">exclude</code>, 'string | fn', '—', 'CSS selector or (el) => boolean; matching elements are skipped'],
          [<code key="7">textLines</code>, 'boolean', 'true', 'One bar per estimated text line'],
          [<code key="8">responsive</code>, 'boolean', 'true', 'ResizeObserver rebuilds blocks when the layout changes'],
          [<code key="9">blockInteraction</code>, 'boolean', 'true', 'Block pointer events while the skeleton is visible'],
          [<code key="10">minDuration</code>, 'number', '0', 'while() only — keep the skeleton visible at least this long (ms)'],
        ]}
      />

      <H2>data-skeleton attributes</H2>
      <ApiTable
        headers={['Attribute', 'Values', 'Effect']}
        rows={[
          [<code key="a">data-skeleton</code>, 'auto / circle / rect / text / image / none / ignore', 'circle paints a circle, rect a rounded block, text forces text bars, none/ignore skip the element and its subtree, auto uses normal detection'],
          [<code key="b">data-skeleton-radius</code>, 'number (px)', 'Override the corner radius of this block'],
          [<code key="c">data-skeleton-color</code>, 'CSS color', 'Base color for this block'],
          [<code key="d">data-skeleton-highlight</code>, 'CSS color', 'Bright band color for this block'],
          [<code key="e">data-skeleton-ignore</code>, 'boolean attribute', 'Skip this element anywhere in a scanned tree (badges, spinners…)'],
        ]}
      />

      <H2>&lt;skeleton-screen&gt; Web Component</H2>
      <ApiTable
        headers={['Attribute', 'Values', 'Description']}
        rows={[
          [<code key="a">loading</code>, 'present / "", "true", "1", "on"', 'Show the skeleton; remove the attribute (or "false") to reveal the UI'],
          [<code key="b">effect</code>, 'the 8 effect names', 'Animation style (default shimmer)'],
          [<code key="g">theme</code>, 'light | dark | auto', 'Block color palette (default auto — follows the OS setting)'],
          [<code key="c">color</code>, 'CSS color', 'Base block color'],
          [<code key="d">highlight-color</code>, 'CSS color', 'Bright band color'],
          [<code key="e">duration</code>, '"2s" or "900"', 'One animation cycle'],
          [<code key="f">radius</code>, 'px number', 'Corner radius of rect blocks'],
        ]}
      />
      <CodeBlock
        language="javascript"
        label="JS API on the element"
        code={`const el = document.querySelector('skeleton-screen');

el.show({ effect: 'bounce', color: '#cbd5e1' }); // options override attributes
el.hide();                                        // reveal the real UI

// register the component under a different tag name:
import { registerSkeletonScreen } from 'universal-skeleton';
registerSkeletonScreen('my-skeleton');            // <my-skeleton loading>`}
      />

      <H2>CSS variables (theming)</H2>
      <ApiTable
        headers={['Variable', 'Default', 'Description']}
        rows={[
          [<code key="a">--usk-color</code>, '#e5e7eb', 'Base grey of every skeleton block — the theme palettes set this to #27272a on dark surfaces'],
          [<code key="b">--usk-highlight</code>, '#f3f4f6', 'Bright band of shimmer / wave / sheen — dark palette uses #3f3f46'],
          [<code key="c">--usk-radius</code>, '8px', 'Corner radius of rectangular blocks'],
          [<code key="d">--usk-duration</code>, '1.4s', 'One animation cycle — also settable via the duration option'],
        ]}
      />

      <H2>Builds & environments</H2>
      <ApiTable
        headers={['File', 'Format', 'Use it with']}
        rows={[
          [<code key="a">dist/index.esm.js</code>, 'ES module', 'Bundlers — Vite, Next, Nuxt, SvelteKit, Astro, webpack'],
          [<code key="b">dist/index.cjs</code>, 'CommonJS', 'Node / SSR tooling, require()'],
          [<code key="c">dist/index.iife.min.js</code>, <>IIFE, global <code>UniversalSkeleton</code></>, 'CDN script tags — the unpkg / jsDelivr default (~4.3 KB gzip)'],
          [<code key="d">dist/universal-skeleton.css</code>, 'Stylesheet', 'Optional — CSS is normally injected automatically'],
        ]}
      />

      <H2>Accessibility</H2>
      <div className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">
        <p>
          The scanned region gets <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-emerald-700 dark:text-emerald-300">aria-busy=&quot;true&quot;</code> while
          the skeleton is visible, and the overlay itself is <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-emerald-700 dark:text-emerald-300">aria-hidden</code>,
          so screen readers announce the loading state without reading the placeholders.
        </p>
        <p>
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-emerald-700 dark:text-emerald-300">blockInteraction</code> swallows clicks on the invisible
          UI underneath (with a progress cursor) — no more clicking a button you cannot see.
        </p>
        <p>
          Every effect ships with a <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-emerald-700 dark:text-emerald-300">prefers-reduced-motion</code> override:
          motion-sensitive users get static blocks automatically.
        </p>
      </div>

      <H2>Browser support</H2>
      <p className="mt-2 text-sm leading-7 text-muted-foreground">
        Every modern browser (Chrome, Edge, Firefox, Safari — desktop and iOS/Android). Requires
        Custom Elements v1, ResizeObserver and CSS custom properties — baseline features since
        2020. No polyfills needed for current browsers.
      </p>
    </div>
  );
}
