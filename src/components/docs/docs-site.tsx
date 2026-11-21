'use client';

import { useCallback, useEffect, useState } from 'react';
import { Landing } from './landing';
import { EffectsShowcase } from './effects-showcase';
import { Guides } from './guides';
import { ApiReference } from './api-reference';
import { Playground } from './playground';

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
    <span className="flex h-8 w-8 flex-col justify-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900 p-1.5" aria-hidden>
      <span className="h-1.5 w-full animate-pulse rounded-full bg-emerald-400/70" />
      <span className="h-1.5 w-2/3 animate-pulse rounded-full bg-zinc-600" style={{ animationDelay: '150ms' }} />
      <span className="h-1.5 w-1/2 animate-pulse rounded-full bg-zinc-700" style={{ animationDelay: '300ms' }} />
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
    <div className="flex min-h-screen flex-col bg-zinc-950">
      {/* Top navigation */}
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
          <button
            onClick={() => navigate('overview')}
            className="flex items-center gap-2.5 rounded-lg px-1 py-1 transition-opacity hover:opacity-80"
          >
            <LogoMark />
            <span className="text-left">
              <span className="block font-mono text-sm font-semibold leading-tight text-white">universal-skeleton</span>
              <span className="block text-[11px] leading-tight text-zinc-500">framework-agnostic skeleton loader</span>
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
                    ? 'bg-emerald-950/70 text-emerald-300 ring-1 ring-emerald-900'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
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
            className="ml-auto rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-300 md:hidden"
          >
            {VIEWS.map((v) => (
              <option key={v.id} value={v.id}>
                {v.label}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Mobile secondary nav as chips (select above is functional; chips add touch targets) */}
      <div className="border-b border-zinc-900 bg-zinc-950 md:hidden">
        <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-2.5">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              onClick={() => navigate(v.id)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs ${
                view === v.id
                  ? 'border-emerald-700 bg-emerald-950 text-emerald-300'
                  : 'border-zinc-800 text-zinc-400'
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
      <footer className="mt-auto border-t border-zinc-800 bg-zinc-950">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-zinc-500 sm:flex-row sm:px-6">
          <p>
            <span className="font-mono text-zinc-400">universal-skeleton</span> v1.1.0 · MIT License ·
            zero runtime dependencies
          </p>
          <p>Every demo on this site runs the real library — scan the page and see.</p>
        </div>
      </footer>
    </div>
  );
}
