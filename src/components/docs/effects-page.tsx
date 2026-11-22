'use client';

/**
 * "Effects & animations" docs page — all 8 effects with live surfaces,
 * interactive global controls (duration / colors / radius) and a runtime
 * setEffect() switcher. Adapted to run inside the docs shell.
 */

import { useEffect, useRef, useState } from 'react';
import { SkeletonLoader, type SkeletonEffect, type SkeletonHandle } from 'universal-skeleton';
import { CodeBlock } from './code-block';
import { renderInline } from './inline';
import { useSiteTheme } from './use-site-theme';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

const EFFECT_INFO: { effect: SkeletonEffect; name: string; desc: string }[] = [
  { effect: 'shimmer', name: 'shimmer', desc: 'Moving gradient wave — the Facebook / YouTube classic. Default.' },
  { effect: 'wave', name: 'wave', desc: 'Diagonal light sweep with a softer, aurora-like motion.' },
  { effect: 'pulse', name: 'pulse', desc: 'Whole-block opacity fade, Tailwind style. Cheapest to composite.' },
  { effect: 'fade', name: 'fade', desc: 'Staggered breathing cascade — blocks light up one after another.' },
  { effect: 'blink', name: 'blink', desc: 'Hard terminal-cursor blink. Great for terminal or code UIs.' },
  { effect: 'sheen', name: 'sheen', desc: 'One glossy light band sweeps across the entire skeleton.' },
  { effect: 'bounce', name: 'bounce', desc: 'Gentle vertical bob — playful, Material style.' },
  { effect: 'none', name: 'none', desc: 'Static grey blocks. Perfect for print, tests or minimal UIs.' },
];

const COLOR_PRESETS: Record<string, { color: string; highlight: string }> = {
  grey: { color: '#e5e7eb', highlight: '#f3f4f6' },
  slate: { color: '#cbd5e1', highlight: '#e2e8f0' },
  emerald: { color: '#a7f3d0', highlight: '#d1fae5' },
  amber: { color: '#fcd34d', highlight: '#fef9c3' },
  dark: { color: '#334155', highlight: '#475569' },
};

/** Small white demo surface with fixed content that the effect animates over. */
function EffectSurface({ effect, duration, color, highlight, radius, seed }: {
  effect: SkeletonEffect;
  duration: number;
  color: string;
  highlight: string;
  radius: number;
  seed: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handle = SkeletonLoader.scan(el, {
      effect,
      theme: 'light', // demo surface is always white
      duration,
      color,
      highlightColor: highlight,
      radius,
    });
    return () => handle.destroy();
  }, [effect, duration, color, highlight, radius, seed]);

  return (
    <div ref={ref} className="rounded-xl bg-white p-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-zinc-300" />
        <div className="flex-1">
          <div className="h-3 w-28 rounded bg-zinc-200" />
          <div className="mt-1.5 h-2.5 w-4/5 rounded bg-zinc-200" />
        </div>
        <button type="button" className="h-8 rounded-lg bg-emerald-600 px-3 text-center text-xs leading-8 text-white">Follow</button>
      </div>
      <div className="mt-3 space-y-1.5">
        <div className="h-2.5 w-full rounded bg-zinc-200" />
        <div className="h-2.5 w-11/12 rounded bg-zinc-200" />
        <div className="h-2.5 w-3/5 rounded bg-zinc-200" />
      </div>
    </div>
  );
}

/** Runtime switcher — one persistent handle, setEffect() without rebuilding. */
function RuntimeSwitcher({ duration }: { duration: number }) {
  const theme = useSiteTheme();
  const ref = useRef<HTMLDivElement>(null);
  const handleRef = useRef<SkeletonHandle | null>(null);
  const [current, setCurrent] = useState<SkeletonEffect>('shimmer');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handle = SkeletonLoader.scan(el, { effect: current, theme, duration });
    handleRef.current = handle;
    return () => handle.destroy();
  }, [duration, theme]);

  return (
    <div className="rounded-2xl border border-border bg-card/50 p-5">
      <h2 className="font-medium text-foreground">Switch at runtime — setEffect()</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        One persistent handle; the animation swaps instantly without re-measuring the UI.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {EFFECT_INFO.map((e) => (
          <button
            key={e.effect}
            onClick={() => {
              handleRef.current?.setEffect(e.effect);
              setCurrent(e.effect);
            }}
            className={`rounded-lg border px-3 py-1.5 font-mono text-xs transition-colors ${
              current === e.effect
                ? 'border-emerald-600 bg-emerald-100 text-emerald-700 dark:border-emerald-500 dark:bg-emerald-950 dark:text-emerald-300'
                : 'border-border bg-card text-muted-foreground hover:text-accent-foreground'
            }`}
          >
            {e.effect}
          </button>
        ))}
      </div>
      <div className="mt-4">
        <div ref={ref} className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            <div className="h-3 w-40 rounded bg-zinc-200 dark:bg-zinc-700" />
            <div className="h-7 w-16 rounded-md bg-zinc-200 dark:bg-zinc-700" />
          </div>
          <div className="mt-3 h-2.5 w-2/3 rounded bg-zinc-200 dark:bg-zinc-700" />
        </div>
      </div>
      <div className="mt-4">
        <CodeBlock bare language="javascript" code={`handle.setEffect('${current}');`} />
      </div>
    </div>
  );
}

export function EffectsPage() {
  const [duration, setDuration] = useState(1400);
  const [preset, setPreset] = useState<keyof typeof COLOR_PRESETS>('grey');
  const [radius, setRadius] = useState(8);
  const [seed, setSeed] = useState(0); // bump to re-mount all demos

  const colors = COLOR_PRESETS[preset];

  return (
    <article className="max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Effects &amp; animations</h1>
      <p className="mt-3 leading-7 text-muted-foreground">
        Eight pure-CSS effects on the same scanned skeleton — pick one per call with the{' '}
        {renderInline('`effect`')} option, change it live with {renderInline('`handle.setEffect()`')}, or set it
        declaratively with {renderInline('`<skeleton-screen effect="wave">`')}. Tune the controls below — every
        demo card updates in real time.
      </p>

      <div className="mt-6 grid gap-6 rounded-2xl border border-border bg-card/50 p-5 sm:grid-cols-3">
        <div>
          <Label className="text-foreground">
            Duration — <span className="font-mono text-emerald-600 dark:text-emerald-300">{duration}ms</span>
          </Label>
          <Slider
            className="mt-3"
            min={400}
            max={3000}
            step={100}
            value={[duration]}
            onValueChange={(v) => setDuration(v[0])}
          />
          <p className="mt-1 text-xs text-muted-foreground">One animation cycle (option: duration)</p>
        </div>
        <div>
          <Label className="text-foreground">Base color / highlight preset</Label>
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(COLOR_PRESETS).map(([key, c]) => (
              <button
                key={key}
                onClick={() => { setPreset(key as keyof typeof COLOR_PRESETS); setSeed((s) => s + 1); }}
                className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition-colors ${
                  preset === key
                    ? 'border-emerald-600 text-emerald-700 dark:border-emerald-500 dark:text-emerald-300'
                    : 'border-border text-muted-foreground hover:text-accent-foreground'
                }`}
              >
                <span className="h-3 w-3 rounded-full" style={{ background: c.color }} />
                {key}
              </button>
            ))}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Options: color + highlightColor</p>
        </div>
        <div>
          <Label className="text-foreground">
            Corner radius — <span className="font-mono text-emerald-600 dark:text-emerald-300">{radius}px</span>
          </Label>
          <Slider
            className="mt-3"
            min={0}
            max={24}
            step={1}
            value={[radius]}
            onValueChange={(v) => setRadius(v[0])}
          />
          <p className="mt-1 text-xs text-muted-foreground">Rect blocks only; text bars stay pill-shaped</p>
        </div>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {EFFECT_INFO.map((e) => (
          <div key={e.effect} className="flex flex-col rounded-2xl border border-border bg-card/50 p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-mono text-base font-semibold text-emerald-600 dark:text-emerald-300">{e.name}</h2>
              <button
                onClick={() => setSeed((s) => s + 1)}
                className="text-xs text-muted-foreground/70 transition-colors hover:text-foreground"
              >
                rescan
              </button>
            </div>
            <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{e.desc}</p>
            <div className="mt-4">
              <EffectSurface
                effect={e.effect}
                duration={duration}
                color={colors.color}
                highlight={colors.highlight}
                radius={radius}
                seed={seed}
              />
            </div>
            <div className="mt-4">
              <CodeBlock
                bare
                language="javascript"
                code={`SkeletonLoader.scan(el, { effect: '${e.effect}' });`}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <RuntimeSwitcher duration={duration} />
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card/50 p-5">
          <h2 className="font-medium text-foreground">Declarative — Web Component attribute</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            The effect attribute is reactive: change it in any framework and the animation swaps.
          </p>
          <div className="mt-4">
            <CodeBlock
              language="html"
              label="any framework template"
              code={`<skeleton-screen loading effect="wave" duration="900" color="#cbd5e1">
  <article>…your real markup…</article>
</skeleton-screen>`}
            />
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card/50 p-5">
          <h2 className="font-medium text-foreground">Global — CSS variables</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Restyle every skeleton on the page without touching any code — plain CSS, no build tools.
          </p>
          <div className="mt-4">
            <CodeBlock
              language="css"
              label="site theme"
              code={`:root {
  --usk-color: #cbd5e1;     /* block grey       */
  --usk-highlight: #e2e8f0; /* moving band      */
  --usk-radius: 12px;       /* rect corners     */
  --usk-duration: 2s;       /* animation cycle  */
}`}
            />
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card/50 p-5">
          <h2 className="font-medium text-foreground">Light, dark or follow the OS</h2>
          <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
            Blocks pick their grey from the {renderInline('`theme`')} palette. The default{' '}
            {renderInline('`auto`')} follows the user&apos;s {renderInline('`prefers-color-scheme`')} with zero
            JavaScript — switch this site&apos;s theme (sun icon in the header) and watch skeletons adapt
            everywhere on the site.
          </p>
          <div className="mt-4">
            <CodeBlock
              language="javascript"
              label="palettes"
              code={`SkeletonLoader.scan('#app');                     // auto (default)
SkeletonLoader.scan('#app', { theme: 'dark' });  // force dark blocks
handle.setTheme('light');                        // switch at runtime

// the palette used by each value:
// light → #e5e7eb blocks, dark → #27272a blocks`}
            />
          </div>
        </div>
        <DarkSurfaceCard />
      </div>

      <div className="mt-10 rounded-2xl border border-border bg-card/50 p-5">
        <h2 className="font-medium text-foreground">Reduced motion</h2>
        <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
          Users with {renderInline('`prefers-reduced-motion: reduce`')} always get static blocks — every effect
          ships with the media query built in, so you never need to handle it yourself.
        </p>
      </div>
    </article>
  );
}

/** Dark-surface demo: scan with theme 'dark' over a dark card. */
function DarkSurfaceCard() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(true);
  const [effect, setEffect] = useState<SkeletonEffect>('shimmer');

  useEffect(() => {
    const el = ref.current;
    if (!el || !active) return;
    const handle = SkeletonLoader.scan(el, { effect, theme: 'dark' });
    return () => handle.destroy();
  }, [active, effect]);

  return (
    <div className="rounded-2xl border border-border bg-card/50 p-5">
      <h2 className="font-medium text-foreground">Live — dark palette on a dark surface</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">
        The same card on a dark surface, skeletonized with {renderInline("`theme: 'dark'`")}.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {(['shimmer', 'wave', 'fade'] as SkeletonEffect[]).map((e) => (
          <button
            key={e}
            onClick={() => setEffect(e)}
            className={`rounded-lg border px-3 py-1.5 font-mono text-xs transition-colors ${
              effect === e
                ? 'border-emerald-600 bg-emerald-100 text-emerald-700 dark:border-emerald-500 dark:bg-emerald-950 dark:text-emerald-300'
                : 'border-border bg-card text-muted-foreground hover:text-accent-foreground'
            }`}
          >
            {e}
          </button>
        ))}
        <button
          onClick={() => setActive((a) => !a)}
          className="rounded-lg border border-border bg-card px-3 py-1.5 font-mono text-xs text-muted-foreground transition-colors hover:text-accent-foreground"
        >
          {active ? 'restore()' : 'scan()'}
        </button>
      </div>
      <div className="mt-4">
        <div ref={ref} className="rounded-xl bg-zinc-900 p-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-zinc-700" />
            <div>
              <div className="h-3 w-28 rounded bg-zinc-700" />
              <div className="mt-1.5 h-2.5 w-20 rounded bg-zinc-700/70" />
            </div>
            <button type="button" className="h-7 rounded-md bg-zinc-700 px-3 text-xs leading-7 text-white">Follow</button>
          </div>
          <div className="mt-3 space-y-1.5">
            <div className="h-2.5 w-full rounded bg-zinc-700" />
            <div className="h-2.5 w-2/3 rounded bg-zinc-700" />
          </div>
        </div>
      </div>
    </div>
  );
}
