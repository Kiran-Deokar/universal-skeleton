'use client';

import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { GUIDES, type Guide, type GuideSection } from './guides-data';
import { CodeBlock } from './code-block';

function Section({ section }: { section: GuideSection }) {
  return (
    <div className="mt-8 first:mt-0">
      <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
        <span className="h-4 w-1 rounded-full bg-emerald-500" />
        {section.heading}
      </h3>
      {section.body ? (
        <p className="mt-2.5 leading-7 text-muted-foreground">{section.body}</p>
      ) : null}
      {section.code ? (
        <div className="mt-4">
          <CodeBlock
            code={section.code.code}
            language={section.code.lang}
            label={section.code.label}
          />
        </div>
      ) : null}
      {section.bullets ? (
        <ul className="mt-3 space-y-2">
          {section.bullets.map((b, i) => (
            <li key={i} className="flex gap-2.5 text-sm leading-6 text-muted-foreground">
              <ChevronRight className="mt-1 h-3.5 w-3.5 shrink-0 text-emerald-500" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function GuidePage({ guide }: { guide: Guide }) {
  const Icon = guide.icon;
  return (
    <article className="max-w-4xl">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-muted/40">
          <Icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{guide.title}</h1>
          <span className="mt-0.5 inline-block rounded-full bg-emerald-100 px-2 py-0.5 font-mono text-[11px] text-emerald-700 ring-1 ring-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:ring-emerald-900">
            {guide.tag}
          </span>
        </div>
      </div>
      <p className="mt-4 leading-7 text-muted-foreground">{guide.intro}</p>
      <div className="mt-6 space-y-4">
        {guide.sections.map((s) => (
          <Section key={s.heading} section={s} />
        ))}
      </div>
    </article>
  );
}

export function Guides() {
  const [activeSlug, setActiveSlug] = useState(GUIDES[0].slug);
  const active = GUIDES.find((g) => g.slug === activeSlug) ?? GUIDES[0];

  return (
    <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
      {/* Sidebar */}
      <nav aria-label="Framework guides" className="lg:sticky lg:top-24 lg:self-start">
        <p className="mb-3 px-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">
          Integration guides
        </p>
        <ul className="flex flex-row flex-wrap gap-2 lg:flex-col lg:gap-1">
          {GUIDES.map((g) => {
            const Icon = g.icon;
            const isActive = g.slug === activeSlug;
            return (
              <li key={g.slug} className="w-auto lg:w-full">
                <button
                  onClick={() => setActiveSlug(g.slug)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left text-sm transition-colors ${
                    isActive
                      ? 'border-emerald-300 bg-emerald-50 text-foreground dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-white'
                      : 'border-transparent text-muted-foreground hover:border-border hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`} />
                  <span className="flex-1">{g.title}</span>
                  <span className="hidden rounded-full bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground lg:inline">
                    {g.tag}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Active guide */}
      <div className="min-w-0 rounded-2xl border border-border bg-card/40 p-6 sm:p-8">
        <GuidePage guide={active} />
      </div>
    </div>
  );
}
