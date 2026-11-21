'use client';

/**
 * Renders documentation pages (DocPage) built from typed blocks.
 * The star of the show is ExampleBlock: a card with Preview / Code tabs —
 * the Preview tab runs the real library, the Code tab has a copy button.
 */

import { Info, Lightbulb, TriangleAlert } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { DocBlock, DocPage } from './doc-types';
import { ApiTable } from './api-table';
import { renderInline } from './inline';
import { CodeBlock } from './code-block';
import { DemoById } from './demos';

/* ------------------------------------------------------------------ */
/* Example block — Preview | Code                                       */
/* ------------------------------------------------------------------ */

export function ExampleBlock({
  title,
  demo,
  code,
  lang = 'javascript',
}: {
  title?: string;
  demo: Parameters<typeof DemoById>[0]['id'];
  code: string;
  lang?: string;
}) {
  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
      <Tabs defaultValue="preview">
        <div className="flex items-center justify-between gap-3 border-b border-border bg-muted/40 px-4 py-2">
          {title ? (
            <span className="min-w-0 truncate text-sm font-medium text-foreground">{title}</span>
          ) : (
            <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">example</span>
          )}
          <TabsList className="h-8 shrink-0 border border-border bg-background p-0.5">
            <TabsTrigger value="preview" className="h-6 rounded-md px-3 text-xs">Preview</TabsTrigger>
            <TabsTrigger value="code" className="h-6 rounded-md px-3 text-xs">Code</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="preview" className="mt-0">
          <div className="p-4 sm:p-6">
            <DemoById id={demo} />
          </div>
        </TabsContent>
        <TabsContent value="code" className="mt-0">
          <CodeBlock code={code} language={lang} flush maxHeight={440} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Callout                                                              */
/* ------------------------------------------------------------------ */

const CALLOUT_STYLES = {
  info: { icon: Info, box: 'border-border bg-muted/40', iconColor: 'text-sky-600 dark:text-sky-400' },
  tip: { icon: Lightbulb, box: 'border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40', iconColor: 'text-emerald-600 dark:text-emerald-400' },
  warn: { icon: TriangleAlert, box: 'border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40', iconColor: 'text-amber-600 dark:text-amber-400' },
} as const;

function Callout({ kind, text }: { kind: 'info' | 'tip' | 'warn'; text: string }) {
  const s = CALLOUT_STYLES[kind];
  const Icon = s.icon;
  return (
    <div className={`mt-6 flex gap-3 rounded-xl border p-4 ${s.box}`}>
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${s.iconColor}`} aria-hidden />
      <p className="text-sm leading-6 text-muted-foreground [&_code]:text-[0.85em]">{renderInline(text)}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Block renderer                                                       */
/* ------------------------------------------------------------------ */

function Block({ block }: { block: DocBlock }) {
  switch (block.t) {
    case 'h2':
      return <h2 className="mt-12 scroll-mt-24 text-xl font-semibold text-foreground first:mt-0">{block.text}</h2>;
    case 'h3':
      return <h3 className="mt-8 text-base font-semibold text-foreground">{block.text}</h3>;
    case 'p':
      return <p className="mt-4 leading-7 text-muted-foreground">{renderInline(block.text)}</p>;
    case 'bullets':
      return (
        <ul className="mt-4 space-y-2.5">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-2.5 text-sm leading-6 text-muted-foreground">
              <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden />
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      );
    case 'code':
      return (
        <div className="mt-5">
          <CodeBlock code={block.code} language={block.lang} label={block.label} />
        </div>
      );
    case 'table':
      return <ApiTable head={block.head} rows={block.rows} />;
    case 'callout':
      return <Callout kind={block.kind} text={block.text} />;
    case 'example':
      return (
        <ExampleBlock
          title={block.title}
          demo={block.demo}
          code={block.code}
          lang={block.lang}
        />
      );
    default:
      return null;
  }
}

/* ------------------------------------------------------------------ */
/* Page renderer                                                        */
/* ------------------------------------------------------------------ */

export function DocRenderer({ page }: { page: DocPage }) {
  return (
    <article className="max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">{page.title}</h1>
      <p className="mt-3 leading-7 text-muted-foreground">{page.description}</p>
      <div className="pb-4">
        {page.blocks.map((b, i) => (
          <Block key={i} block={b} />
        ))}
      </div>
    </article>
  );
}
