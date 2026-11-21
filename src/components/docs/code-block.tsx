'use client';

import { useState, useCallback } from 'react';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import markup from 'react-syntax-highlighter/dist/esm/languages/prism/markup';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import css from 'react-syntax-highlighter/dist/esm/languages/prism/css';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import vscDarkPlus from 'react-syntax-highlighter/dist/esm/styles/prism/vsc-dark-plus';
import { Check, Copy } from 'lucide-react';

// Register only the languages the docs need (keeps the bundle small).
const LANGS = {
  javascript,
  jsx,
  typescript,
  markup,
  bash,
  css,
  json,
} as const;

export type CodeLang = keyof typeof LANGS;

const ALIASES: Record<string, CodeLang> = {
  js: 'javascript',
  javascript: 'javascript',
  jsx: 'jsx',
  ts: 'typescript',
  typescript: 'typescript',
  html: 'markup',
  xml: 'markup',
  markup: 'markup',
  bash: 'bash',
  sh: 'bash',
  shell: 'bash',
  css: 'css',
  json: 'json',
};

Object.entries(LANGS).forEach(([name, lang]) => {
  SyntaxHighlighter.registerLanguage(name as never, lang as never);
});

interface CodeBlockProps {
  code: string;
  language?: string;
  /** Hide the header bar for inline / compact snippets. */
  bare?: boolean;
  /** Optional filename or label shown on the right of the header. */
  label?: string;
  className?: string;
  maxHeight?: number;
  /** Drop the outer border/rounding — for embedding inside tab panels. */
  flush?: boolean;
}

export function CodeBlock({
  code,
  language = 'javascript',
  bare = false,
  label,
  className = '',
  maxHeight = 520,
  flush = false,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      // Fallback for non-secure contexts
      const ta = document.createElement('textarea');
      ta.value = code;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }, [code]);

  const lang = ALIASES[language] ?? 'javascript';

  if (bare) {
    return (
      <div className={`group relative overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950 ${className}`}>
        <SyntaxHighlighter
          language={lang}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: '0.9rem 1.25rem',
            background: 'transparent',
            fontSize: '0.8125rem',
            lineHeight: 1.65,
          }}
          codeTagProps={{
            style: {
              fontFamily: 'var(--font-mono), monospace',
              // Break long unbroken tokens (CDN URLs, paths) on narrow screens
              // — white-space: pre-wrap alone will not wrap them.
              overflowWrap: 'anywhere',
              wordBreak: 'break-word',
            },
          }}
          wrapLongLines
        >
          {code}
        </SyntaxHighlighter>
        <button
          onClick={copy}
          aria-label="Copy code"
          className="absolute right-2 top-2 rounded-md border border-zinc-700/70 bg-zinc-900/80 p-1.5 text-zinc-400 opacity-0 transition-opacity hover:text-zinc-100 group-hover:opacity-100 focus-visible:opacity-100"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
    );
  }

  return (
    <div
      className={`${flush ? 'bg-zinc-950' : 'overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950'} ${className}`}
    >
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/60 px-3 py-1.5">
        <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">{language}</span>
        {label ? <span className="font-mono text-[11px] text-zinc-500">{label}</span> : null}
        <button
          onClick={copy}
          aria-label="Copy code"
          className="flex items-center gap-1 rounded-md border border-zinc-700/70 bg-zinc-900 px-2 py-1 text-[11px] text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-100"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-400" /> Copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" /> Copy
            </>
          )}
        </button>
      </div>
      <div className="overflow-auto" style={{ maxHeight }}>
        <SyntaxHighlighter
          language={lang}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            padding: '1rem 1.25rem',
            background: 'transparent',
            fontSize: '0.8125rem',
            lineHeight: 1.65,
          }}
          codeTagProps={{
            style: {
              fontFamily: 'var(--font-mono), monospace',
              overflowWrap: 'anywhere',
              wordBreak: 'break-word',
            },
          }}
          wrapLongLines
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
