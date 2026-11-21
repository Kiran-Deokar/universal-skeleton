'use client';

import { useEffect, useRef, useState } from 'react';
import { SkeletonLoader, type SkeletonEffect, type SkeletonHandle } from '@/lib/universal-skeleton/index.esm.mjs';
import { CodeBlock } from './code-block';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

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
        <div className="h-8 rounded-lg bg-emerald-600 px-3 leading-8 text-center text-white text-xs">Follow</div>
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
  const ref = useRef<HTMLDivElement>(null);
  const handleRef = useRef<SkeletonHandle | null>(null);
  const [current, setCurrent] = useState<SkeletonEffect>('shimmer');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handle = SkeletonLoader.scan(el, { effect: current, duration });
    handleRef.current = handle;
    return () => handle.destroy();
  }, [duration]);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
      <h3 className="font-medium text-white">Switch at runtime — setEffect()</h3>
      <p className="mt-1 text-sm text-zinc-400">
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
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              current === e.effect
                ? 'border-emerald-500 bg-emerald-950 text-emerald-300'
                : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
            }`}
          >
            {e.effect}
          </button>
        ))}
      </div>
      <div className="mt-4">
        <div ref={ref} className="rounded-xl bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-zinc-300" />
            <div className="h-3 w-40 rounded bg-zinc-200" />
            <div className="h-7 w-16 rounded-md bg-zinc-200" />
          </div>
          <div className="mt-3 h-2.5 w-2/3 rounded bg-zinc-200" />
        </div>
      </div>
      <div className="mt-4">
        <CodeBlock bare language="javascript" code={`handle.setEffect('${current}');`} />
      </div>
    </div>
  );
}

export function EffectsShowcase() {
  const [duration, setDuration] = useState(1400);
  const [preset, setPreset] = useState<keyof typeof COLOR_PRESETS>('grey');
  const [radius, setRadius] = useState(8);
  const [seed, setSeed] = useState(0); // bump to re-mount all demos

  const colors = COLOR_PRESETS[preset];

  return (
    <div className="space-y-12">
      <section>
        <h1 className="text-3xl font-bold text-white">Eight animation effects</h1>
        <p className="mt-3 max-w-3xl leading-7 text-zinc-400">
          Every effect is pure CSS on the same scanned skeleton — pick one per call with the{' '}
          <code className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-emerald-300">effect</code>{' '}
          option, change it live with{' '}
          <code className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-emerald-300">handle.setEffect()</code>,
          or set it declaratively with{' '}
          <code className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-emerald-300">&lt;skeleton-screen effect=&quot;wave&quot;&gt;</code>.
          Tune the controls below — every demo card updates in real time.
        </p>

        <div className="mt-6 grid gap-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 sm:grid-cols-3">
          <div>
            <Label className="text-zinc-300">
              Duration — <span className="font-mono text-emerald-300">{duration}ms</span>
            </Label>
            <Slider
              className="mt-3"
              min={400}
              max={3000}
              step={100}
              value={[duration]}
              onValueChange={(v) => setDuration(v[0])}
            />
            <p className="mt-1 text-xs text-zinc-500">One animation cycle (option: duration)</p>
          </div>
          <div>
            <Label className="text-zinc-300">Base color / highlight preset</Label>
            <div className="mt-3 flex flex-wrap gap-2">
              {Object.entries(COLOR_PRESETS).map(([key, c]) => (
                <button
                  key={key}
                  onClick={() => { setPreset(key as keyof typeof COLOR_PRESETS); setSeed((s) => s + 1); }}
                  className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition-colors ${
                    preset === key ? 'border-emerald-500 text-emerald-300' : 'border-zinc-700 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <span className="h-3 w-3 rounded-full" style={{ background: c.color }} />
                  {key}
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs text-zinc-500">Options: color + highlightColor</p>
          </div>
          <div>
            <Label className="text-zinc-300">
              Corner radius — <span className="font-mono text-emerald-300">{radius}px</span>
            </Label>
            <Slider
              className="mt-3"
              min={0}
              max={24}
              step={1}
              value={[radius]}
              onValueChange={(v) => setRadius(v[0])}
            />
            <p className="mt-1 text-xs text-zinc-500">Rect blocks only; text bars stay pill-shaped</p>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        {EFFECT_INFO.map((e) => (
          <div key={e.effect} className="flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-base font-semibold text-emerald-300">{e.name}</h3>
              <button
                onClick={() => setSeed((s) => s + 1)}
                className="text-xs text-zinc-500 transition-colors hover:text-zinc-300"
              >
                rescan
              </button>
            </div>
            <p className="mt-1.5 text-sm leading-6 text-zinc-400">{e.desc}</p>
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
      </section>

      <RuntimeSwitcher duration={duration} />

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
          <h3 className="font-medium text-white">Declarative — Web Component attribute</h3>
          <p className="mt-1.5 text-sm text-zinc-400">
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
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
          <h3 className="font-medium text-white">Global — CSS variables</h3>
          <p className="mt-1.5 text-sm text-zinc-400">
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
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
        <h3 className="font-medium text-white">Reduced motion</h3>
        <p className="mt-1.5 text-sm leading-6 text-zinc-400">
          Users with <code className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-xs text-emerald-300">prefers-reduced-motion: reduce</code>{' '}
          always get static blocks — every effect ships with the media query built in, so you never
          need to handle it yourself.
        </p>
      </section>
    </div>
  );
}
