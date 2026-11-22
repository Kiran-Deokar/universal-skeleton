'use client';

/**
 * Site shell — a hash-router over three views:
 *   #/                 → landing page
 *   #/docs/<slug>      → documentation (left sidebar + content + pager)
 *   #/playground       → interactive playground
 * The whole site is fully themed in light and dark via next-themes.
 */

import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Github, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/theme-toggle';
import { Landing } from './landing';
import { Playground } from './playground';
import { EffectsPage } from './effects-page';
import { DocRenderer } from './doc-renderer';
import { CORE_PAGES } from './doc-pages';
import { DOC_NAV, DOC_ORDER } from './doc-nav';
import { GuideArticle } from './guides';
import { GUIDES } from './guides-data';

/* ------------------------------------------------------------------ */
/* Routing                                                              */
/* ------------------------------------------------------------------ */

type Route = { view: 'home' } | { view: 'playground' } | { view: 'docs'; slug: string };

function parseHash(): Route {
  const h = window.location.hash;
  if (h.startsWith('#/docs/')) {
    const slug = h.slice('#/docs/'.length).replace(/\/+$/, '');
    if (slug) return { view: 'docs', slug };
  }
  if (h === '#/playground') return { view: 'playground' };
  return { view: 'home' };
}

function routeKey(r: Route): string {
  return r.view === 'docs' ? `docs/${r.slug}` : r.view;
}

function routeToHash(route: string): string {
  return `#/${route}`;
}

/* ------------------------------------------------------------------ */
/* Sidebar navigation — the titles column                               */
/* ------------------------------------------------------------------ */

function SidebarNav({
  currentSlug,
  onNavigate,
}: {
  currentSlug: string;
  onNavigate: (route: string) => void;
}) {
  return (
    <nav aria-label="Documentation" className="space-y-5">
      {DOC_NAV.map((group) => (
        <div key={group.label}>
          <p className="mb-1.5 px-3 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            {group.label}
          </p>
          <ul>
            {group.items.map((item) => {
              const isActive = item.slug === currentSlug;
              return (
                <li key={item.slug}>
                  <button
                    onClick={() => onNavigate(`docs/${item.slug}`)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex w-full items-center rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${
                      isActive
                        ? 'bg-emerald-100 font-medium text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    {item.title}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/* Mini skeleton-bars logo                                              */
/* ------------------------------------------------------------------ */

function LogoMark() {
  return (
    <span className="flex h-8 w-8 flex-col justify-center gap-1 rounded-lg border bg-muted/40 p-1.5" aria-hidden>
      <span className="h-1.5 w-full animate-pulse rounded-full bg-emerald-500/70 dark:bg-emerald-400/70" />
      <span className="h-1.5 w-2/3 animate-pulse rounded-full bg-muted-foreground/40" style={{ animationDelay: '150ms' }} />
      <span className="h-1.5 w-1/2 animate-pulse rounded-full bg-muted-foreground/30" style={{ animationDelay: '300ms' }} />
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Docs shell — sidebar + content + pager                               */
/* ------------------------------------------------------------------ */

function titleForSlug(slug: string): string {
  for (const g of DOC_NAV) {
    const found = g.items.find((i) => i.slug === slug);
    if (found) return found.title;
  }
  return 'Documentation';
}

function DocsShell({ slug, onNavigate }: { slug: string; onNavigate: (route: string) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const guide = GUIDES.find((g) => g.slug === slug);

  let content: React.ReactNode;
  if (slug === 'effects') {
    content = <EffectsPage />;
  } else if (guide) {
    content = <GuideArticle guide={guide} />;
  } else {
    const page = CORE_PAGES.find((p) => p.slug === slug) ?? CORE_PAGES[0];
    content = <DocRenderer page={page} />;
  }

  // Previous / next pager in reading order
  const idx = DOC_ORDER.indexOf(slug);
  const prev = idx > 0 ? DOC_ORDER[idx - 1] : null;
  const next = idx >= 0 && idx < DOC_ORDER.length - 1 ? DOC_ORDER[idx + 1] : null;

  const mobileNav = (
    <SidebarNav
      currentSlug={slug}
      onNavigate={(route) => {
        setMenuOpen(false);
        onNavigate(route);
      }}
    />
  );

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)]">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:block">
        <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pb-8 pr-2">
          <SidebarNav currentSlug={slug} onNavigate={onNavigate} />
        </div>
      </aside>

      {/* Content */}
      <div className="min-w-0">
        {/* Sidebar — mobile (sheet) */}
        <div className="mb-6 lg:hidden">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Menu className="h-4 w-4" />
                {titleForSlug(slug)}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 overflow-y-auto px-5 pb-8 pt-6">
              <SheetTitle className="font-mono text-sm">Documentation</SheetTitle>
              <div className="mt-4">{mobileNav}</div>
            </SheetContent>
          </Sheet>
        </div>

        {content}

        {/* Pager */}
        <div className="mt-14 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:justify-between">
          {prev ? (
            <button
              onClick={() => onNavigate(`docs/${prev}`)}
              className="group flex items-center gap-2 rounded-xl border border-border px-4 py-3 text-left text-sm transition-colors hover:border-emerald-500/50 hover:bg-accent"
            >
              <ChevronLeft className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-x-0.5" />
              <span>
                <span className="block text-xs text-muted-foreground">Previous</span>
                <span className="font-medium text-foreground">{titleForSlug(prev)}</span>
              </span>
            </button>
          ) : (
            <span className="hidden sm:block" />
          )}
          {next ? (
            <button
              onClick={() => onNavigate(`docs/${next}`)}
              className="group flex items-center gap-2 rounded-xl border border-border px-4 py-3 text-right text-sm transition-colors hover:border-emerald-500/50 hover:bg-accent sm:ml-auto"
            >
              <span>
                <span className="block text-xs text-muted-foreground">Next</span>
                <span className="font-medium text-foreground">{titleForSlug(next)}</span>
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Site shell                                                           */
/* ------------------------------------------------------------------ */

const HEADER_LINKS = [
  { route: 'home', label: 'Home' },
  { route: 'docs/introduction', label: 'Docs' },
  { route: 'playground', label: 'Playground' },
] as const;

export function DocsSite() {
  const [route, setRoute] = useState<Route>({ view: 'home' });

  // Sync with the URL hash — deep links like #/docs/effects work directly
  useEffect(() => {
    const fromHash = () => setRoute(parseHash());
    fromHash();
    window.addEventListener('hashchange', fromHash);
    return () => window.removeEventListener('hashchange', fromHash);
  }, []);

  // New view → back to the top
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [routeKey(route)]);

  const navigate = useCallback((target: string) => {
    const hash = routeToHash(target);
    if (window.location.hash === hash) {
      setRoute(parseHash());
    } else {
      window.location.hash = hash; // triggers hashchange → setRoute
    }
  }, []);

  const isDocs = route.view === 'docs';

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top navigation */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4 sm:gap-4 sm:px-6">
          <button
            onClick={() => navigate('home')}
            className="flex items-center gap-2.5 rounded-lg px-1 py-1 transition-opacity hover:opacity-80"
          >
            <LogoMark />
            {/* Wordmark hidden on phones — the logo mark alone is tappable and
                keeps the header inside the viewport on 360-420px screens. */}
            <span className="hidden text-left sm:block">
              <span className="block font-mono text-sm font-semibold leading-tight text-foreground">universal-skeleton</span>
              <span className="hidden text-[11px] leading-tight text-muted-foreground sm:block">framework-agnostic skeleton loader</span>
            </span>
          </button>

          <nav aria-label="Main" className="ml-auto flex items-center gap-1">
            {HEADER_LINKS.map((l) => {
              const active = routeKey(route) === l.route || (isDocs && l.route === 'docs/introduction');
              return (
                <button
                  key={l.route}
                  onClick={() => navigate(l.route)}
                  aria-current={active ? 'page' : undefined}
                  className={`rounded-lg px-2.5 py-2 text-sm font-medium transition-colors sm:px-3 ${
                    l.route === 'home' ? 'hidden sm:block' : ''
                  } ${
                    active
                      ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:ring-emerald-900'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  {l.label}
                </button>
              );
            })}
            <a
              href="https://github.com/your-username/universal-skeleton"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="GitHub repository"
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <Github className="h-4.5 w-4.5" />
            </a>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="w-full flex-1">
        {route.view === 'home' && (
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
            <Landing onNavigate={navigate} />
          </div>
        )}
        {route.view === 'playground' && (
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
            <Playground />
          </div>
        )}
        {isDocs && <DocsShell slug={route.slug} onNavigate={navigate} />}
      </main>

      {/* Footer — sticks to the bottom on short pages */}
      <footer className="mt-auto border-t border-border bg-background">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <p>
            <span className="font-mono text-foreground/80">universal-skeleton</span> v1.2.1 · MIT License ·
            zero runtime dependencies
          </p>
          <p>Every demo on this site runs the real library — scan the page and see.</p>
        </div>
      </footer>
    </div>
  );
}
