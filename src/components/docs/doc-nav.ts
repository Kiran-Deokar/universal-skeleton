import { GUIDES } from './guides-data';

export interface DocNavItem {
  slug: string;
  title: string;
}

export interface DocNavGroup {
  label: string;
  items: DocNavItem[];
}

/**
 * Sidebar navigation — the titles column of the docs area.
 * Framework guide slugs come from the guides data module.
 */
export const DOC_NAV: DocNavGroup[] = [
  {
    label: 'Getting Started',
    items: [
      { slug: 'introduction', title: 'Introduction' },
      { slug: 'installation', title: 'Installation' },
      { slug: 'quick-start', title: 'Quick Start' },
    ],
  },
  {
    label: 'Core Concepts',
    items: [
      { slug: 'how-it-works', title: 'How scanning works' },
      { slug: 'effects', title: 'Effects & animations' },
      { slug: 'theming', title: 'Theming & CSS variables' },
    ],
  },
  {
    label: 'API Reference',
    items: [
      { slug: 'api-loader', title: 'SkeletonLoader' },
      { slug: 'api-web-component', title: '<skeleton-screen>' },
      { slug: 'api-attributes', title: 'data-skeleton attributes' },
      { slug: 'api-us-contract', title: 'data-us-* contract' },
    ],
  },
  {
    label: 'Framework Guides',
    items: GUIDES.map((g) => ({ slug: g.slug, title: g.title })),
  },
];

/** Flat reading order — used by the previous / next pager. */
export const DOC_ORDER: string[] = DOC_NAV.flatMap((g) => g.items.map((i) => i.slug));
