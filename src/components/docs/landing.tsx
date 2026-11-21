'use client';

/**
 * Landing page — hero with a live skeleton loop, install box, stats,
 * three live "how it works" demos, feature grid, effects teaser and CTA.
 * Every demo follows the site theme (light/dark).
 */

import { useEffect, useRef, useState } from 'react';
import {
  Accessibility,
  ArrowRight,
  Boxes,
  FileCode2,
  Package,
  Palette,
  RefreshCcw,
  Scan,
  Sparkles,
  Tags,
  Zap,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SkeletonLoader, type SkeletonEffect } from '@/lib/universal-skeleton/index.esm.mjs';
import { CodeBlock } from './code-block';
import { ProfileCard, useSkeleton, useMounted } from './sample-card';
import { useSiteTheme } from './use-site-theme';

/* ------------------------------------------------------------------ */
/* Hero — auto-toggling skeleton/real-UI loop built on the Web Component */
/* ------------------------------------------------------------------ */

function HeroDemo() {
  const theme = useSiteTheme();
  const [loading, setLoading] = useState(true);
  const [variant, setVariant] = useState(0);
  // Render the custom element only after hydration: the library upgrades
  // SSR-rendered <skeleton-screen> elements pre-hydration and mutates the
  // DOM under React, which would trip the hydration check.
  const mounted = useMounted();

  useEffect(() => {
    if (!mounted) return;
    const timer = window.setInterval(() => {
      setLoading((prev) => {
        if (prev) {
          setVariant((v) => (((v + 1) % 3) as 0 | 1 | 2));
          return false; // reveal the (new) real UI
        }
        return true; // load next profile → skeleton
      });
    }, 2800);
    return () => window.clearInterval(timer);
  }, [mounted]);

  return (
    <div className="rounded-3xl border border-border bg-card/50 p-6 shadow-2xl shadow-black/10 dark:shadow-black/40">
      <div className="mb-4 flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${loading ? 'bg-amber-400' : 'bg-emerald-400'}`} />
        <span className="font-mono text-xs text-muted-foreground">
          {loading ? 'loading — skeleton is mirroring the real UI' : 'data ready — real UI restored'}
        </span>
      </div>
      {/* The Web Component in its purest form: toggle one attribute.
          theme follows the site toggle so light AND dark both look right. */}
      {mounted ? (
        <skeleton-screen loading={loading ? '' : undefined} effect="shimmer" theme={theme}>
          <ProfileCard variant={variant} surface={theme} />
        </skeleton-screen>
      ) : (
        <ProfileCard variant={variant} surface={theme} />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Install box with npm / CDN / ESM tabs                                */
/* ------------------------------------------------------------------ */

function InstallBox() {
  return (
    <Tabs defaultValue="npm" className="w-full max-w-xl">
      <TabsList className="border border-border bg-muted/50">
        <TabsTrigger value="npm" className="data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-300">npm</TabsTrigger>
        <TabsTrigger value="cdn" className="data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-300">CDN</TabsTrigger>
        <TabsTrigger value="esm" className="data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-300">ESM</TabsTrigger>
      </TabsList>
      <TabsContent value="npm">
        <CodeBlock bare language="bash" code={'npm install universal-skeleton'} />
      </TabsContent>
      <TabsContent value="cdn">
        <CodeBlock
          bare
          language="html"
          code={'<script src="https://unpkg.com/universal-skeleton/dist/index.iife.min.js"></script>'}
        />
      </TabsContent>
      <TabsContent value="esm">
        <CodeBlock
          bare
          language="javascript"
          code={'import { SkeletonLoader } from "https://cdn.jsdelivr.net/npm/universal-skeleton/dist/index.esm.js";'}
        />
      </TabsContent>
    </Tabs>
  );
}

/* ------------------------------------------------------------------ */
/* "How it works" mini demos                                            */
/* ------------------------------------------------------------------ */

function ScanDemo() {
  const theme = useSiteTheme();
  const [active, setActive] = useState(true);
  const ref = useSkeleton(active, () => ({ effect: 'shimmer', theme }), [theme]);
  return (
    <div>
      <div ref={ref} className="rounded-xl border border-border bg-card p-4 text-foreground">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-zinc-300 dark:bg-zinc-700" />
          <div className="flex-1">
            <div className="h-3 w-28 rounded bg-zinc-200 dark:bg-zinc-700" />
            <div className="mt-1.5 h-2.5 w-44 rounded bg-zinc-200/70 dark:bg-zinc-700/60" />
          </div>
        </div>
      </div>
      <Button
        size="sm"
        variant="outline"
        className="mt-3"
        onClick={() => setActive((a) => !a)}
      >
        <Scan className="mr-1.5 h-3.5 w-3.5" />
        {active ? 'SkeletonLoader.restore()' : 'SkeletonLoader.scan()'}
      </Button>
    </div>
  );
}

function WhileDemo() {
  const theme = useSiteTheme();
  const ref = useRef<HTMLDivElement>(null);
  const [loadedAt, setLoadedAt] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const run = () => {
    if (!ref.current || busy) return;
    setBusy(true);
    SkeletonLoader.while(
      new Promise((resolve) => window.setTimeout(resolve, 1700)),
      ref.current,
      { effect: 'fade', duration: 1100, theme }
    ).then(() => {
      setLoadedAt(new Date().toLocaleTimeString());
      setBusy(false);
    });
  };

  return (
    <div>
      <div ref={ref} className="rounded-xl border border-border bg-card p-4 text-foreground">
        <p className="text-sm leading-6">
          {loadedAt ? `Feed loaded at ${loadedAt}` : 'Click the button — skeleton covers the card while the promise runs.'}
        </p>
      </div>
      <Button
        size="sm"
        variant="outline"
        disabled={busy}
        className="mt-3"
        onClick={run}
      >
        <RefreshCcw className={`mr-1.5 h-3.5 w-3.5 ${busy ? 'animate-spin' : ''}`} />
        SkeletonLoader.while(fetch())
      </Button>
    </div>
  );
}

function DataAttrDemo() {
  const theme = useSiteTheme();
  const [active, setActive] = useState(true);
  const ref = useSkeleton(active, () => ({ effect: 'bounce', theme }), [theme]);
  return (
    <div>
      <div ref={ref} className="rounded-xl border border-border bg-card p-4 text-foreground">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-amber-200 dark:bg-amber-900" data-skeleton="circle" />
          <div className="h-10 flex-1 rounded-lg bg-violet-100 dark:bg-violet-950" data-skeleton="rect" data-skeleton-radius="10" />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">data-skeleton=&quot;circle&quot; / &quot;rect&quot;</p>
      </div>
      <Button
        size="sm"
        variant="outline"
        className="mt-3"
        onClick={() => setActive((a) => !a)}
      >
        <Tags className="mr-1.5 h-3.5 w-3.5" />
        {active ? 'restore()' : 'scan()'}
      </Button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Effects teaser — four live mini surfaces                             */
/* ------------------------------------------------------------------ */

const TEASER_EFFECTS: SkeletonEffect[] = ['shimmer', 'wave', 'fade', 'bounce'];

function EffectsTeaser({ onNavigate }: { onNavigate?: (route: string) => void }) {
  const theme = useSiteTheme();
  const [seed, setSeed] = useState(0);
  const ref0 = useRef<HTMLDivElement>(null);
  const ref1 = useRef<HTMLDivElement>(null);
  const ref2 = useRef<HTMLDivElement>(null);
  const ref3 = useRef<HTMLDivElement>(null);
  const refs = [ref0, ref1, ref2, ref3];

  useEffect(() => {
    const handles = refs.map((r, i) => {
      const el = r.current;
      if (!el) return null;
      return SkeletonLoader.scan(el, { effect: TEASER_EFFECTS[i], theme, duration: 1600 });
    });
    return () => handles.forEach((h) => h?.destroy());
  }, [theme, seed]);

  const miniContent = (
    <div className="rounded-xl border border-border bg-card p-3.5 text-foreground">
      <div className="flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-full bg-zinc-300 dark:bg-zinc-700" />
        <div className="flex-1">
          <div className="h-2.5 w-24 rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="mt-1 h-2 w-16 rounded bg-zinc-200/70 dark:bg-zinc-700/60" />
        </div>
      </div>
      <div className="mt-2.5 space-y-1.5">
        <div className="h-2 w-full rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="h-2 w-2/3 rounded bg-zinc-200 dark:bg-zinc-700" />
      </div>
    </div>
  );

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Eight effects, one option</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            shimmer, wave, pulse, fade, blink, sheen, bounce — or none. Pure CSS on the same scanned
            skeleton, switchable at runtime.
          </p>
        </div>
        <Button variant="outline" onClick={() => onNavigate?.('docs/effects')}>
          Explore all effects
          <ArrowRight className="ml-1.5 h-4 w-4" />
        </Button>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {TEASER_EFFECTS.map((e, i) => (
          <div key={e} className="rounded-2xl border border-border bg-card/50 p-3.5">
            <div className="flex items-center justify-between px-1 pb-2.5">
              <span className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">{e}</span>
              <button
                onClick={() => setSeed((s) => s + 1)}
                className="text-[11px] text-muted-foreground/70 transition-colors hover:text-foreground"
              >
                rescan
              </button>
            </div>
            <div ref={refs[i]}>{miniContent}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

const FEATURES = [
  { icon: Scan, title: 'Auto-scan the real DOM', text: 'Measures text, avatars, images, buttons and inputs with getBoundingClientRect, then mirrors their exact geometry — no placeholder JSX to write.' },
  { icon: Boxes, title: 'One Web Component', text: '<skeleton-screen loading> works in every framework because custom elements are the one component format they all speak.' },
  { icon: Sparkles, title: '8 animation effects', text: 'shimmer, wave, pulse, fade, blink, sheen, bounce and none — switchable at runtime via setEffect().' },
  { icon: Tags, title: 'data-skeleton attributes', text: 'Force circles, rectangles, text bars or exclude subtrees with plain HTML attributes — zero configuration code.' },
  { icon: Palette, title: 'Light, dark & auto themes', text: 'Skeleton blocks follow prefers-color-scheme automatically, or force a palette with the theme option and setTheme().' },
  { icon: RefreshCcw, title: 'Responsive by default', text: 'A ResizeObserver rebuilds the skeleton whenever the layout changes — resize the window and it keeps mirroring.' },
  { icon: Accessibility, title: 'Accessible out of the box', text: 'aria-busy on the scanned region, aria-hidden on the overlay, blocks phantom clicks, honors prefers-reduced-motion.' },
  { icon: FileCode2, title: 'TypeScript-ready', text: 'Ships with .d.ts declarations and JSX typings — full IntelliSense in TS projects, no @types package needed.' },
];

const STACKS = [
  'Plain HTML', 'React', 'Next.js', 'Vue 3', 'Nuxt', 'Angular', 'Svelte',
  'SvelteKit', 'Lit', 'jQuery', 'Astro', 'Remix', 'Solid', 'htmx',
  'Rails', 'Django', 'PHP', 'WordPress',
];

const STATS = [
  { icon: Package, value: '0', label: 'runtime dependencies' },
  { icon: Zap, value: '~4.4 KB', label: 'gzipped CDN build' },
  { icon: Sparkles, value: '8', label: 'animation effects' },
  { icon: Boxes, value: '18+', label: 'stacks it works with' },
];

export function Landing({ onNavigate }: { onNavigate?: (route: string) => void }) {
  return (
    <div className="space-y-20">
      {/* Hero */}
      <section className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <Badge variant="outline" className="mb-5 border-emerald-300 bg-emerald-50 font-mono text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
            v1.1.0 · MIT · zero dependencies
          </Badge>
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
            Skeleton screens that look like{' '}
            <span className="text-emerald-600 dark:text-emerald-400">your real UI</span> — in every framework.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground">
            universal-skeleton scans the DOM you already have and paints grey placeholders over it,
            so the skeleton always mirrors the exact layout of your content. Plain HTML, React,
            Vue, Angular, Svelte or jQuery — one package, no adapters, no dependencies.
          </p>
          <div className="mt-7">
            <InstallBox />
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              size="lg"
              className="bg-emerald-600 text-white hover:bg-emerald-500"
              onClick={() => onNavigate?.('docs/introduction')}
            >
              Read the docs
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => onNavigate?.('playground')}
            >
              Open the playground
            </Button>
          </div>
        </div>
        <HeroDemo />
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card/50 p-5 text-center">
            <s.icon className="mx-auto h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <div className="mt-2 text-2xl font-bold text-foreground">{s.value}</div>
            <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </section>

      {/* How it works */}
      <section>
        <h2 className="text-2xl font-semibold text-foreground">Three ways to use it</h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          The same engine powers all three APIs. Try each one live — every demo below runs the
          real library.
        </p>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {[
            { n: '1', title: 'scan() — auto mode', body: 'Point SkeletonLoader.scan() at any element; it mirrors the real UI and restores it on destroy().', demo: <ScanDemo /> },
            { n: '2', title: 'while() — async helper', body: 'Wraps a promise: skeleton in, skeleton out — even when the promise rejects. Optional minDuration.', demo: <WhileDemo /> },
            { n: '3', title: '<skeleton-screen> — markup', body: 'Wrap your markup once, toggle the loading attribute from any framework code.', demo: <DataAttrDemo /> },
          ].map((s) => (
            <div key={s.n} className="rounded-2xl border border-border bg-card/50 p-5">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 font-mono text-sm font-semibold text-emerald-700 ring-1 ring-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:ring-emerald-800">
                  {s.n}
                </span>
                <h3 className="font-medium text-foreground">{s.title}</h3>
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{s.body}</p>
              <div className="mt-4">{s.demo}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Effects teaser */}
      <EffectsTeaser onNavigate={onNavigate} />

      {/* Features */}
      <section>
        <h2 className="text-2xl font-semibold text-foreground">Everything included</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-card/50 p-5 transition-colors hover:border-emerald-500/40">
              <f.icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="mt-3 font-medium text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stacks */}
      <section>
        <h2 className="text-2xl font-semibold text-foreground">Runs anywhere the DOM runs</h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          No adapters, no peer dependencies: it only talks to the browser. If your stack renders
          HTML — server templates included — it works.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {STACKS.map((s) => (
            <span key={s} className="rounded-full border border-border bg-card/60 px-3.5 py-1.5 text-sm text-muted-foreground">
              {s}
            </span>
          ))}
        </div>
      </section>

      {/* CTA band */}
      <section className="rounded-3xl border border-border bg-muted/40 px-6 py-10 text-center sm:px-10">
        <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
          Ship loaders that fit your UI — not grey boxes that don&apos;t.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          One install, one attribute, every framework. Start with the quick start — the first
          skeleton takes about a minute.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button
            size="lg"
            className="bg-emerald-600 text-white hover:bg-emerald-500"
            onClick={() => onNavigate?.('docs/quick-start')}
          >
            Get started
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
          <Button size="lg" variant="outline" onClick={() => onNavigate?.('docs/installation')}>
            Installation
          </Button>
        </div>
        <p className="mt-5 font-mono text-xs text-muted-foreground">npm install universal-skeleton</p>
      </section>
    </div>
  );
}
