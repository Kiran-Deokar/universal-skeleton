/**
 * JSX typing so React 19 accepts <skeleton-screen ... /> directly.
 *
 * The universal-skeleton npm package ships its own index.d.ts for the
 * programmatic API (SkeletonLoader, SkeletonHandle, ...). Custom elements
 * also need to be registered in React's JSX namespace — this file does that.
 */

import type { DetailedHTMLProps, HTMLAttributes } from 'react';

type SkeletonScreenAttributes = DetailedHTMLProps<
  HTMLAttributes<HTMLElement> & {
    loading?: boolean | string;
    effect?: string;
    theme?: string;
    color?: string;
    'highlight-color'?: string;
    duration?: string | number;
    radius?: number | string;
  },
  HTMLElement
>;

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'skeleton-screen': SkeletonScreenAttributes;
    }
  }
}
