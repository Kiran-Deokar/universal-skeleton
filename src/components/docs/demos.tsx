'use client';

/**
 * Live demo components for the docs site example blocks.
 * Every demo runs the REAL library — the Preview tab is not a mock.
 * All demos follow the site theme (light/dark) via useSiteTheme().
 */

import { useEffect, useRef, useState } from 'react';
import { RefreshCcw, RotateCcw, Scan } from 'lucide-react';
import {
  SkeletonLoader,
  type SkeletonEffect,
  type SkeletonOptions,
} from 'universal-skeleton';
import { Button } from '@/components/ui/button';
import { ProfileCard, useMounted } from './sample-card';
import { useSiteTheme } from './use-site-theme';

/* ------------------------------------------------------------------ */
/* Shared bits                                                          */
/* ------------------------------------------------------------------ */

/** Theme-following surface the demos skeletonize. Accepts a ref (React 19). */
export function DemoSurface({
  children,
  className = '',
  ref,
}: {
  children: React.ReactNode;
  className?: string;
  ref?: React.Ref<HTMLDivElement>;
}) {
  return (
    <div ref={ref} className={`rounded-xl border border-border bg-card p-4 text-foreground ${className}`}>
      {children}
    </div>
  );
}

/** Small mono chip row used to pick options inside demos. */
function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-3 py-1.5 font-mono text-xs transition-colors ${
        active
          ? 'border-emerald-600 bg-emerald-100 text-emerald-700 dark:border-emerald-500 dark:bg-emerald-950 dark:text-emerald-300'
          : 'border-border bg-card text-muted-foreground hover:text-accent-foreground'
      }`}
    >
      {children}
    </button>
  );
}

function ToggleButton({ active, onToggle, children }: { active: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <Button size="sm" variant="outline" className="mt-3" onClick={onToggle}>
      {active ? <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> : <Scan className="mr-1.5 h-3.5 w-3.5" />}
      {children}
    </Button>
  );
}

/* ------------------------------------------------------------------ */
/* scan() / restore()                                                   */
/* ------------------------------------------------------------------ */

function ScanToggleDemo() {
  const theme = useSiteTheme();
  const [active, setActive] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !active) return;
    const handle = SkeletonLoader.scan(el, { effect: 'shimmer', theme });
    return () => handle.destroy();
  }, [active, theme]);

  return (
    <div>
      <div ref={ref}>
        <ProfileCard surface={theme} />
      </div>
      <ToggleButton active={active} onToggle={() => setActive((a) => !a)}>
        {active ? 'SkeletonLoader.restore()' : 'SkeletonLoader.scan()'}
      </ToggleButton>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* while() — async helper                                               */
/* ------------------------------------------------------------------ */

function WhilePromiseDemo() {
  const theme = useSiteTheme();
  const ref = useRef<HTMLDivElement>(null);
  const [loadedAt, setLoadedAt] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const run = () => {
    const el = ref.current;
    if (!el || busy) return;
    setBusy(true);
    SkeletonLoader.while(
      new Promise((resolve) => window.setTimeout(resolve, 1700)),
      el,
      { effect: 'fade', duration: 1100, theme, minDuration: 400 }
    ).then(() => {
      setLoadedAt(new Date().toLocaleTimeString());
      setBusy(false);
    });
  };

  return (
    <div>
      <DemoSurface ref={ref}>
        <p className="text-sm leading-6">
          {loadedAt
            ? `Feed loaded at ${loadedAt} — the skeleton was removed automatically.`
            : 'Click the button — a skeleton covers this card while the promise runs, then the UI comes back on its own.'}
        </p>
      </DemoSurface>
      <Button size="sm" variant="outline" className="mt-3" disabled={busy} onClick={run}>
        <RefreshCcw className={`mr-1.5 h-3.5 w-3.5 ${busy ? 'animate-spin' : ''}`} />
        SkeletonLoader.while(fetch())
      </Button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* <skeleton-screen> Web Component                                      */
/* ------------------------------------------------------------------ */

const EFFECT_CHIPS: SkeletonEffect[] = ['shimmer', 'wave', 'pulse', 'fade', 'sheen', 'bounce', 'blink', 'none'];

function WebComponentDemo() {
  const theme = useSiteTheme();
  const mounted = useMounted();
  const [loading, setLoading] = useState(true);
  const [effect, setEffect] = useState<SkeletonEffect>('wave');

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        {EFFECT_CHIPS.map((e) => (
          <Chip key={e} active={effect === e} onClick={() => setEffect(e)}>
            {e}
          </Chip>
        ))}
      </div>
      {mounted ? (
        <skeleton-screen loading={loading ? '' : undefined} effect={effect} theme={theme}>
          <ProfileCard surface={theme} />
        </skeleton-screen>
      ) : (
        <ProfileCard surface={theme} />
      )}
      <ToggleButton active={loading} onToggle={() => setLoading((l) => !l)}>
        {loading ? 'remove loading attribute' : 'add loading attribute'}
      </ToggleButton>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Quick-start result — while() over a small dashboard                  */
/* ------------------------------------------------------------------ */

function QuickStartDemo() {
  const theme = useSiteTheme();
  const ref = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [loadedAt, setLoadedAt] = useState<string | null>('09:41:07');

  const reload = () => {
    const el = ref.current;
    if (!el || busy) return;
    setBusy(true);
    SkeletonLoader.while(
      new Promise((resolve) => window.setTimeout(resolve, 1500)),
      el,
      { effect: 'shimmer', theme, minDuration: 500 }
    ).then(() => {
      setLoadedAt(new Date().toLocaleTimeString());
      setBusy(false);
    });
  };

  return (
    <div>
      <DemoSurface ref={ref}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Revenue</p>
            <p className="mt-1 text-2xl font-bold">$12,480</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Active users</p>
            <p className="mt-1 text-2xl font-bold">1,284</p>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            +18% this week
          </span>
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
            updated {loadedAt ?? '—'}
          </span>
        </div>
      </DemoSurface>
      <Button size="sm" variant="outline" className="mt-3" disabled={busy} onClick={reload}>
        <RefreshCcw className={`mr-1.5 h-3.5 w-3.5 ${busy ? 'animate-spin' : ''}`} />
        Reload data — while(fetch())
      </Button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Text mirroring — one pill per line                                   */
/* ------------------------------------------------------------------ */

function TextMirrorDemo() {
  const theme = useSiteTheme();
  const [active, setActive] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !active) return;
    const handle = SkeletonLoader.scan(el, { effect: 'shimmer', theme });
    return () => handle.destroy();
  }, [active, theme]);

  return (
    <div>
      <div ref={ref}>
        <DemoSurface>
          <h3 className="text-base font-semibold">Weekly engineering digest</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            The scanner estimates how many visual lines each text element occupies from its height
            and line-height, then paints one pill bar per line. The last line is deliberately
            shorter, the way real paragraphs end — which is what makes the result read as
            &ldquo;your UI, waiting for data&rdquo; instead of generic grey boxes.
          </p>
        </DemoSurface>
      </div>
      <ToggleButton active={active} onToggle={() => setActive((a) => !a)}>
        {active ? 'restore()' : 'scan()'}
      </ToggleButton>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* data-skeleton attributes                                             */
/* ------------------------------------------------------------------ */

function DataAttrDemo() {
  const theme = useSiteTheme();
  const [active, setActive] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !active) return;
    const handle = SkeletonLoader.scan(el, { effect: 'bounce', theme });
    return () => handle.destroy();
  }, [active, theme]);

  return (
    <div>
      <div ref={ref}>
        <DemoSurface>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-amber-200 dark:bg-amber-900" data-skeleton="circle" />
            <div className="h-10 flex-1 rounded-lg bg-violet-100 dark:bg-violet-950" data-skeleton="rect" data-skeleton-radius="10" />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            <code>data-skeleton=&quot;circle&quot;</code> and <code>data-skeleton=&quot;rect&quot;</code> override auto-detection per element.
          </p>
        </DemoSurface>
      </div>
      <ToggleButton active={active} onToggle={() => setActive((a) => !a)}>
        {active ? 'restore()' : 'scan()'}
      </ToggleButton>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Circle auto-detection                                                */
/* ------------------------------------------------------------------ */

function CircleDetectDemo() {
  const theme = useSiteTheme();
  const [active, setActive] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !active) return;
    const handle = SkeletonLoader.scan(el, { effect: 'pulse', theme });
    return () => handle.destroy();
  }, [active, theme]);

  const AVATAR =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect width="96" height="96" fill="#d1fae5"/><circle cx="48" cy="36" r="16" fill="#059669"/><path d="M16 88c0-18 14-30 32-30s32 12 32 30" fill="#059669"/></svg>'
    );

  return (
    <div>
      <div ref={ref}>
        <DemoSurface>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <img src={AVATAR} alt="Round avatar" className="h-14 w-14 rounded-full object-cover" draggable={false} />
              <p className="mt-1.5 font-mono text-[11px] text-muted-foreground">rounded-full</p>
            </div>
            <div className="text-center">
              <img src={AVATAR} alt="Squared avatar" className="h-14 w-14 rounded-xl object-cover" draggable={false} />
              <p className="mt-1.5 font-mono text-[11px] text-muted-foreground">rounded-xl</p>
            </div>
          </div>
        </DemoSurface>
      </div>
      <ToggleButton active={active} onToggle={() => setActive((a) => !a)}>
        {active ? 'restore()' : 'scan()'}
      </ToggleButton>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Theme palettes                                                       */
/* ------------------------------------------------------------------ */

const PALETTES = [
  { value: 'light', label: 'theme: "light"' },
  { value: 'dark', label: 'theme: "dark"' },
  { value: 'auto', label: 'theme: "auto"' },
] as const;

function ThemePaletteDemo() {
  const siteTheme = useSiteTheme();
  const mounted = useMounted();
  const [palette, setPalette] = useState<'light' | 'dark' | 'auto'>('light');
  const surface: 'light' | 'dark' = palette === 'auto' ? siteTheme : palette;

  const content = <ProfileCard variant={0} surface={surface} />;

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        {PALETTES.map((p) => (
          <Chip key={p.value} active={palette === p.value} onClick={() => setPalette(p.value)}>
            {p.label}
          </Chip>
        ))}
      </div>
      {mounted ? (
        <skeleton-screen loading="" effect="shimmer" theme={palette}>
          {content}
        </skeleton-screen>
      ) : (
        content
      )}
      <p className="mt-3 text-xs text-muted-foreground">
        <strong>auto</strong> follows the OS <code>prefers-color-scheme</code>; the demo surface switches with it so you can see both palettes.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Colors via options / CSS variables                                   */
/* ------------------------------------------------------------------ */

const COLOR_PRESETS: Record<string, { color: string; highlight: string }> = {
  grey: { color: '#e5e7eb', highlight: '#f3f4f6' },
  slate: { color: '#cbd5e1', highlight: '#e2e8f0' },
  emerald: { color: '#a7f3d0', highlight: '#d1fae5' },
  amber: { color: '#fcd34d', highlight: '#fef9c3' },
};

function CssVarDemo() {
  const [preset, setPreset] = useState<string>('emerald');
  const ref = useRef<HTMLDivElement>(null);
  const colors = COLOR_PRESETS[preset] ?? COLOR_PRESETS.grey;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handle = SkeletonLoader.scan(el, {
      effect: 'sheen',
      theme: 'light',
      color: colors.color,
      highlightColor: colors.highlight,
      duration: '1.8s',
    });
    return () => handle.destroy();
  }, [colors.color, colors.highlight]);

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        {Object.entries(COLOR_PRESETS).map(([key, c]) => (
          <Chip key={key} active={preset === key} onClick={() => setPreset(key)}>
            <span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full align-[-1px]" style={{ background: c.color }} />
            {key}
          </Chip>
        ))}
      </div>
      <div ref={ref} className="rounded-xl border border-border bg-white p-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-zinc-300" />
          <div>
            <div className="h-3 w-36 rounded bg-zinc-200" />
            <div className="mt-1.5 h-2.5 w-24 rounded bg-zinc-100" />
          </div>
          <div className="ml-auto h-7 rounded-md bg-zinc-200 px-3 text-xs leading-7 text-zinc-600">Follow</div>
        </div>
        <div className="mt-3 space-y-1.5">
          <div className="h-2.5 w-full rounded bg-zinc-200" />
          <div className="h-2.5 w-3/4 rounded bg-zinc-200" />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Responsive rebuilds                                                  */
/* ------------------------------------------------------------------ */

function ResponsiveDemo() {
  const theme = useSiteTheme();
  const [width, setWidth] = useState(100);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handle = SkeletonLoader.scan(el, { effect: 'fade', theme });
    return () => handle.destroy();
  }, [theme]);

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        {[50, 65, 80, 100].map((w) => (
          <Chip key={w} active={width === w} onClick={() => setWidth(w)}>
            {w}%
          </Chip>
        ))}
      </div>
      <div style={{ width: `${width}%`, transition: 'width .35s ease' }}>
        <div ref={ref}>
          <ProfileCard variant={1} surface={theme} />
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        A <code>ResizeObserver</code> re-measures and repaints the blocks — narrower card, different line counts, still pixel-accurate.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Framework guide live preview                                         */
/* ------------------------------------------------------------------ */

export function GuideLiveDemo({ effect = 'shimmer' }: { effect?: SkeletonEffect }) {
  const theme = useSiteTheme();
  const [active, setActive] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !active) return;
    const handle = SkeletonLoader.scan(el, { effect, theme });
    return () => handle.destroy();
  }, [active, theme, effect]);

  return (
    <div>
      <div ref={ref}>
        <ProfileCard variant={2} surface={theme} />
      </div>
      <ToggleButton active={active} onToggle={() => setActive((a) => !a)}>
        {active ? 'restore()' : 'scan()'}
      </ToggleButton>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Registry                                                             */
/* ------------------------------------------------------------------ */

export type DemoId =
  | 'scan-toggle'
  | 'while-promise'
  | 'web-component'
  | 'quick-start'
  | 'text-mirror'
  | 'data-attributes'
  | 'circle-detect'
  | 'theme-palettes'
  | 'css-vars'
  | 'responsive';

const DEMOS: Record<DemoId, () => React.JSX.Element> = {
  'scan-toggle': ScanToggleDemo,
  'while-promise': WhilePromiseDemo,
  'web-component': WebComponentDemo,
  'quick-start': QuickStartDemo,
  'text-mirror': TextMirrorDemo,
  'data-attributes': DataAttrDemo,
  'circle-detect': CircleDetectDemo,
  'theme-palettes': ThemePaletteDemo,
  'css-vars': CssVarDemo,
  responsive: ResponsiveDemo,
};

export function DemoById({ id }: { id: DemoId }) {
  const Demo = DEMOS[id];
  return Demo ? <Demo /> : null;
}

/** Re-export for typed option objects in docs pages. */
export type { SkeletonOptions };
