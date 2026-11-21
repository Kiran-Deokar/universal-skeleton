'use client';

import { useCallback, useEffect, useState } from 'react';
import { Landing } from './landing';
import { EffectsShowcase } from './effects-showcase';
import { Guides } from './guides';
import { ApiReference } from './api-reference';
import { Playground } from './playground';
import { ThemeToggle } from '@/components/theme-toggle';

const VIEWS = [
  { id: 'overview', label: 'Overview' },
  { id: 'effects', label: 'Effects' },
  { id: 'guides', label: 'Guides' },
  { id: 'api', label: 'API' },
  { id: 'playground', label: 'Playground' },
] as const;

type ViewId = (typeof VIEWS)[number]['id'];

function isViewId(value: string): value is ViewId {
  return VIEWS.some((v) => v.id === value);
}

/** Mini skeleton-bars logo. */
function LogoMark() {
  return (
    <span className="flex h-8 w-8 flex-col justify-center gap-1 rounded-lg border bg-muted/40 p-1.5" aria-hidden>
      <span className="h-1.5 w-full animate-pulse rounded-full bg-emerald-500/70 dark:bg-emerald-400/70" />
      <span className="h-1.5 w-2/3 animate-pulse rounded-full bg-muted-foreground/40" style={{ animationDelay: '150ms' }} />
      <span className="h-1.5 w-1/2 animate-pulse rounded-full bg-muted-foreground/30" style={{ animationDelay: '300ms' }} />
    </span>
  );
}

export function DocsSite() {
  const [view, setView] = useState<ViewId>('overview');

  // Sync with the URL hash (deep links like #playground)
  useEffect(() => {
    const fromHash = () => {
      const id = window.location.hash.replace('#', '');
      if (isViewId(id)) setView(id);
    };
    fromHash();
    window.addEventListener('hashchange', fromHash);
    return () => window.removeEventListener('hashchange', fromHash);
  }, []);

  const navigate = useCallback((id: string) => {
    if (!isViewId(id)) return;
    setView(id);
    if (window.location.hash !== `#${id}`) {
      window.history.replaceState(null, '', `#${id}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top navigation */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:gap-4 sm:px-6">
          <button
            onClick={() => navigate('overview')}
            className="flex items-center gap-2.5 rounded-lg px-1 py-1 transition-opacity hover:opacity-80"
          >
            <LogoMark />
            <span className="text-left">
              <span className="block font-mono text-sm font-semibold leading-tight text-foreground">universal-skeleton</span>
              <span className="block text-[11px] leading-tight text-muted-foreground">framework-agnostic skeleton loader</span>
            </span>
          </button>

          <nav aria-label="Main" className="ml-auto hidden items-center gap-1 md:flex">
            {VIEWS.map((v) => (
              <button
                key={v.id}
                id={`nav-${v.id}`}
                onClick={() => navigate(v.id)}
                aria-current={view === v.id ? 'page' : undefined}
                className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                  view === v.id
                    ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:ring-emerald-900'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                {v.label}
              </button>
            ))}
          </nav>

          {/* Mobile view select */}
          <select
            aria-label="Section"
            value={view}
            onChange={(e) => navigate(e.target.value)}
            className="ml-auto rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground md:hidden"
          >
            {VIEWS.map((v) => (
              <option key={v.id} value={v.id}>
                {v.label}
              </option>
            ))}
          </select>

          <ThemeToggle />
        </div>
      </header>

      {/* Mobile secondary nav as chips (select above is functional; chips add touch targets) */}
      <div className="border-b border-border bg-background md:hidden">
        <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-2.5">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              onClick={() => navigate(v.id)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs ${
                view === v.id
                  ? 'border-emerald-600 bg-emerald-100 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'border-border text-muted-foreground'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        {view === 'overview' && <Landing onNavigate={navigate} />}
        {view === 'effects' && <EffectsShowcase />}
        {view === 'guides' && <Guides />}
        {view === 'api' && <ApiReference />}
        {view === 'playground' && <Playground />}
      </main>

      {/* Footer — sticks to the bottom on short pages */}
      <footer className="mt-auto border-t border-border bg-background">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <p>
            <span className="font-mono text-foreground/80">universal-skeleton</span> v1.1.0 · MIT License ·
            zero runtime dependencies
          </p>
          <p>Every demo on this site runs the real library — scan the page and see.</p>
        </div>
      </footer>
    </div>
  );
}
