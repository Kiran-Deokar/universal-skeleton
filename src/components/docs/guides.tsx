'use client';

/**
 * Framework guide article — renders one guide inside the docs shell.
 * Navigation between guides is handled by the docs sidebar; this file
 * only renders the content plus a live "see it working" panel.
 */

import { ChevronRight } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Guide, GuideSection } from './guides-data';
import { CodeBlock } from './code-block';
import { renderInline } from './inline';
import { GuideLiveDemo } from './demos';
import type { SkeletonEffect } from '@/lib/universal-skeleton/index.esm.mjs';

/** Signature animation per framework — used for the live preview panel. */
const GUIDE_EFFECTS: Record<string, SkeletonEffect> = {
  vanilla: 'shimmer',
  react: 'shimmer',
  nextjs: 'fade',
  vue: 'pulse',
  nuxt: 'wave',
  angular: 'sheen',
  svelte: 'bounce',
  lit: 'fade',
  jquery: 'blink',
};

function Section({ section }: { section: GuideSection }) {
  return (
    <div className="mt-8 first:mt-0">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
        <span className="h-4 w-1 rounded-full bg-emerald-500" aria-hidden />
        {section.heading}
      </h2>
      {section.body ? (
        <p className="mt-2.5 leading-7 text-muted-foreground">{renderInline(section.body)}</p>
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
              <ChevronRight className="mt-1 h-3.5 w-3.5 shrink-0 text-emerald-500" aria-hidden />
              <span>{renderInline(b)}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function GuideArticle({ guide }: { guide: Guide }) {
  const Icon = guide.icon;
  const effect = GUIDE_EFFECTS[guide.slug] ?? 'shimmer';
  const firstCode = guide.sections.find((s) => s.code)?.code;

  return (
    <article className="max-w-3xl">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-muted/40">
          <Icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" aria-hidden />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{guide.title}</h1>
          <span className="mt-0.5 inline-block rounded-full bg-emerald-100 px-2 py-0.5 font-mono text-[11px] text-emerald-700 ring-1 ring-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:ring-emerald-900">
            {guide.tag}
          </span>
        </div>
      </div>
      <p className="mt-4 leading-7 text-muted-foreground">{renderInline(guide.intro)}</p>

      <div>
        {guide.sections.map((s) => (
          <Section key={s.heading} section={s} />
        ))}
      </div>

      {/* Live result — Preview | Code */}
      <div className="mt-10 overflow-hidden rounded-2xl border border-border bg-card">
        <Tabs defaultValue="preview">
          <div className="flex items-center justify-between gap-3 border-b border-border bg-muted/40 px-4 py-2">
            <span className="min-w-0 truncate text-sm font-medium text-foreground">
              Result — the real library running this exact setup
            </span>
            <TabsList className="h-8 shrink-0 border border-border bg-background p-0.5">
              <TabsTrigger value="preview" className="h-6 rounded-md px-3 text-xs">Preview</TabsTrigger>
              <TabsTrigger value="code" className="h-6 rounded-md px-3 text-xs">Code</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="preview" className="mt-0">
            <div className="p-4 sm:p-6">
              <GuideLiveDemo effect={effect} />
            </div>
          </TabsContent>
          <TabsContent value="code" className="mt-0">
            <CodeBlock
              code={firstCode?.code ?? `SkeletonLoader.scan('#app', { effect: '${effect}' });`}
              language={firstCode?.lang ?? 'javascript'}
              flush
              maxHeight={440}
            />
          </TabsContent>
        </Tabs>
      </div>
    </article>
  );
}
