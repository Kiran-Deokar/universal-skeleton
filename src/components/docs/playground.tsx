'use client';

import { useEffect, useMemo, useState } from 'react';
import { Dices, Loader2, Play, RotateCcw } from 'lucide-react';
import { SkeletonLoader, type SkeletonEffect } from 'universal-skeleton';
import { ProfileCard, useSkeleton, useMounted } from './sample-card';
import { CodeBlock } from './code-block';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const EFFECT_LIST: SkeletonEffect[] = ['shimmer', 'wave', 'pulse', 'fade', 'blink', 'sheen', 'bounce', 'none'];

const PRESETS: Record<string, [string, string]> = {
  grey: ['#e5e7eb', '#f3f4f6'],
  slate: ['#cbd5e1', '#e2e8f0'],
  emerald: ['#a7f3d0', '#d1fae5'],
  amber: ['#fcd34d', '#fef9c3'],
  dark: ['#334155', '#475569'],
};

function EffectChips({ value, onChange }: { value: SkeletonEffect; onChange: (e: SkeletonEffect) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {EFFECT_LIST.map((e) => (
        <button
          key={e}
          onClick={() => onChange(e)}
          className={`rounded-lg border px-3 py-1.5 font-mono text-xs transition-colors ${
            value === e
              ? 'border-emerald-600 bg-emerald-100 text-emerald-700 dark:border-emerald-500 dark:bg-emerald-950 dark:text-emerald-300'
              : 'border-border bg-card text-muted-foreground hover:text-accent-foreground'
          }`}
        >
          {e}
        </button>
      ))}
    </div>
  );
}

function ControlRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <Label className="text-foreground">{label}</Label>
        {hint ? <span className="font-mono text-xs text-emerald-600 dark:text-emerald-300">{hint}</span> : null}
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

export function Playground() {
  const [effect, setEffect] = useState<SkeletonEffect>('shimmer');
  const [duration, setDuration] = useState(1400);
  const [radius, setRadius] = useState(8);
  const [colorKey, setColorKey] = useState('grey');
  const [color, setColor] = useState('#e5e7eb');
  const [highlight, setHighlight] = useState('#f3f4f6');
  const [textLines, setTextLines] = useState(true);
  const [blockInteraction, setBlockInteraction] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [variant, setVariant] = useState<0 | 1 | 2>(0);
  const [minDuration, setMinDuration] = useState(400);
  const [busy, setBusy] = useState(false);
  const [loadedAt, setLoadedAt] = useState<string | null>(null);
  // Render the Web Component only after hydration (see sample-card.tsx note)
  const mounted = useMounted();
  // Demo surface color scheme — the skeleton theme follows it so you can see
  // both palettes of the package (theme: 'light' | 'dark').
  const [surface, setSurface] = useState<'light' | 'dark'>('light');

  const options = useMemo(
    () => ({
      effect,
      theme: surface,
      duration,
      radius,
      color,
      highlightColor: highlight,
      textLines,
      blockInteraction,
    }),
    [effect, surface, duration, radius, color, highlight, textLines, blockInteraction]
  );

  const scanRef = useSkeleton(showSkeleton, () => options, [options, variant, surface]);

  /** Simulate a fetch: skeleton in → data → skeleton out (restore even on failure). */
  const simulate = () => {
    const el = scanRef.current;
    if (!el || busy) return;
    setBusy(true);
    setShowSkeleton(false); // release the always-on scan first
    SkeletonLoader.while(new Promise((r) => window.setTimeout(r, 1800)), el, {
      ...options,
      minDuration,
    }).then(() => {
      setLoadedAt(new Date().toLocaleTimeString());
      setBusy(false);
    });
  };

  const scanSnippet = `SkeletonLoader.scan('#demo', {
  effect: '${effect}',
  theme: '${surface}',
  duration: ${duration},
  color: '${color}',
  highlightColor: '${highlight}',
  radius: ${radius},
  textLines: ${textLines},
  blockInteraction: ${blockInteraction},
});`;

  const wcSnippet = `<skeleton-screen loading effect="${effect}" theme="${surface}" duration="${duration}"
  color="${color}" highlight-color="${highlight}" radius="${radius}">
  …your real markup…
</skeleton-screen>`;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Playground</h1>
        <p className="mt-2 max-w-3xl leading-7 text-muted-foreground">
          Tune the controls and watch both APIs react live: the left card is driven by{' '}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-emerald-700 dark:text-emerald-300">scan()</code>,
          the right one purely by Web Component attributes. Flip the demo surface between light and
          dark to see the skeleton palettes swap — the code below the demos always reflects your
          current settings.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        {/* Demo cards */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card/50 p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-medium text-foreground">1 · scan() — auto skeleton</h2>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowSkeleton((s) => !s)}
                >
                  {showSkeleton ? <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> : <Play className="mr-1.5 h-3.5 w-3.5" />}
                  {showSkeleton ? 'restore()' : 'scan()'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setVariant((v) => (((v + 1) % 3) as 0 | 1 | 2))}
                >
                  <Dices className="mr-1.5 h-3.5 w-3.5" />
                  Randomize content
                </Button>
                <Button
                  size="sm"
                  className="bg-emerald-600 text-white hover:bg-emerald-500"
                  disabled={busy}
                  onClick={simulate}
                >
                  {busy ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Play className="mr-1.5 h-3.5 w-3.5" />}
                  {busy ? 'Fetching…' : 'Simulate async while()'}
                </Button>
              </div>
            </div>
            <div ref={scanRef}>
              <ProfileCard variant={variant} surface={surface} />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {loadedAt ? `Data refreshed at ${loadedAt}.` : 'The skeleton mirrors this exact card — randomize the content and it re-measures.'}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card/50 p-5">
            <h2 className="mb-4 font-medium text-foreground">2 · &lt;skeleton-screen&gt; — declarative</h2>
            {/* key={variant + surface} remounts the element so it re-scans fresh
                content; mounted gates client-side-only rendering for clean hydration */}
            {mounted ? (
              <skeleton-screen
                key={`${variant}-${surface}`}
                loading={showSkeleton ? '' : undefined}
                effect={effect}
                theme={surface}
                duration={duration}
                color={color}
                highlight-color={highlight}
                radius={radius}
              >
                <ProfileCard variant={variant} surface={surface} />
              </skeleton-screen>
            ) : (
              <ProfileCard variant={variant} surface={surface} />
            )}
            <p className="mt-3 text-xs text-muted-foreground">
              Same controls, zero JavaScript: the attributes above are the only configuration.
            </p>
          </div>
        </div>

        {/* Controls */}
        <aside className="space-y-5 self-start rounded-2xl border border-border bg-card/50 p-5 xl:sticky xl:top-24">
          <ControlRow label="Effect">
            <EffectChips value={effect} onChange={setEffect} />
          </ControlRow>

          <ControlRow label="Demo surface (skeleton theme)">
            <div className="flex gap-2">
              {(['light', 'dark'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSurface(s);
                    // Explicit colors win over the theme palette — so switching
                    // surfaces resets the preset to a matching one.
                    const [c, h] = PRESETS[s === 'dark' ? 'dark' : 'grey'];
                    setColorKey(s === 'dark' ? 'dark' : 'grey');
                    setColor(c);
                    setHighlight(h);
                  }}
                  className={`rounded-lg border px-3 py-1.5 font-mono text-xs transition-colors ${
                    surface === s
                      ? 'border-emerald-600 bg-emerald-100 text-emerald-700 dark:border-emerald-500 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'border-border bg-card text-muted-foreground hover:text-accent-foreground'
                  }`}
                >
                  {s === 'light' ? 'light — theme: "light"' : 'dark — theme: "dark"'}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Resets the color preset to match — an explicit color always wins over the theme palette.
            </p>
          </ControlRow>

          <ControlRow label="Duration" hint={`${duration}ms`}>
            <Slider min={400} max={3000} step={100} value={[duration]} onValueChange={(v) => setDuration(v[0])} />
          </ControlRow>

          <ControlRow label="Radius" hint={`${radius}px`}>
            <Slider min={0} max={24} step={1} value={[radius]} onValueChange={(v) => setRadius(v[0])} />
          </ControlRow>

          <ControlRow label="Color preset">
            <div className="flex flex-wrap gap-2">
              {Object.entries(PRESETS).map(([key, [c, h]]) => (
                <button
                  key={key}
                  onClick={() => {
                    setColorKey(key);
                    setColor(c);
                    setHighlight(h);
                  }}
                  className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition-colors ${
                    colorKey === key
                      ? 'border-emerald-600 text-emerald-700 dark:border-emerald-500 dark:text-emerald-300'
                      : 'border-border text-muted-foreground hover:text-accent-foreground'
                  }`}
                >
                  <span className="h-3 w-3 rounded-full" style={{ background: c }} />
                  {key}
                </button>
              ))}
            </div>
          </ControlRow>

          <ControlRow label="Custom colors">
            <div className="flex gap-3">
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                base
                <input
                  type="color"
                  aria-label="Base color"
                  value={color}
                  onChange={(e) => { setColor(e.target.value); setColorKey('custom'); }}
                  className="h-7 w-9 cursor-pointer rounded border border-border bg-transparent"
                />
              </label>
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                highlight
                <input
                  type="color"
                  aria-label="Highlight color"
                  value={highlight}
                  onChange={(e) => { setHighlight(e.target.value); setColorKey('custom'); }}
                  className="h-7 w-9 cursor-pointer rounded border border-border bg-transparent"
                />
              </label>
            </div>
          </ControlRow>

          <div className="flex items-center justify-between">
            <Label className="text-foreground">textLines</Label>
            <Switch checked={textLines} onCheckedChange={setTextLines} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-foreground">blockInteraction</Label>
            <Switch checked={blockInteraction} onCheckedChange={setBlockInteraction} />
          </div>

          <ControlRow label="while() minDuration" hint={`${minDuration}ms`}>
            <Slider min={0} max={1500} step={50} value={[minDuration]} onValueChange={(v) => setMinDuration(v[0])} />
          </ControlRow>
        </aside>
      </div>

      {/* Generated code */}
      <div className="grid gap-5 lg:grid-cols-2">
        <CodeBlock code={scanSnippet} language="javascript" label="imperative API — live" />
        <CodeBlock code={wcSnippet} language="html" label="web component — live" />
      </div>
    </div>
  );
}
