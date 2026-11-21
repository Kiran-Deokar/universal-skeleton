import type { DemoId } from './demos';

/** One content block in a documentation page. */
export type DocBlock =
  | { t: 'p'; text: string }
  | { t: 'h2'; text: string }
  | { t: 'h3'; text: string }
  | { t: 'bullets'; items: string[] }
  | { t: 'code'; lang: string; label?: string; code: string }
  | { t: 'table'; head: string[]; rows: string[][] }
  | { t: 'callout'; kind: 'info' | 'tip' | 'warn'; text: string }
  | { t: 'example'; title?: string; demo: DemoId; code: string; lang?: string };

/** A full documentation page (Getting Started / Core Concepts / API Reference). */
export interface DocPage {
  slug: string;
  title: string;
  /** Lead paragraph shown under the H1. */
  description: string;
  blocks: DocBlock[];
}
