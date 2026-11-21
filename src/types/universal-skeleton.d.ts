/**
 * Type declarations for the vendored universal-skeleton ESM bundle
 * (src/lib/universal-skeleton/index.esm.mjs — mirrors universal-skeleton@1.1.0).
 */

declare module '@/lib/universal-skeleton/index.esm.mjs' {
  export type SkeletonEffect =
    | 'shimmer'
    | 'wave'
    | 'pulse'
    | 'fade'
    | 'blink'
    | 'sheen'
    | 'bounce'
    | 'none';

  export interface SkeletonOptions {
    effect?: SkeletonEffect;
    color?: string;
    highlightColor?: string;
    duration?: string | number;
    radius?: number | null;
    exclude?: string | ((el: Element) => boolean);
    textLines?: boolean;
    responsive?: boolean;
    blockInteraction?: boolean;
    minDuration?: number;
  }

  export interface SkeletonHandle {
    readonly root: Element;
    readonly overlay: HTMLElement;
    readonly blocks: number;
    update(): void;
    setEffect(effect: SkeletonEffect): void;
    destroy(): void;
  }

  export declare class SkeletonLoader {
    static scan(target: Element | string, options?: SkeletonOptions): SkeletonHandle;
    static restore(target: Element | string): void;
    static isActive(target: Element | string): boolean;
    static while<T>(
      source: Promise<T> | (() => T | Promise<T>),
      target: Element | string,
      options?: SkeletonOptions
    ): Promise<T>;
  }

  export declare class SkeletonScreen extends HTMLElement {
    show(options?: SkeletonOptions): void;
    hide(): void;
  }

  export declare function registerSkeletonScreen(name?: string): void;
  export declare function injectStyles(): boolean;
  export declare const SKELETON_CSS: string;
  export declare const EFFECTS: SkeletonEffect[];
  export default SkeletonLoader;
}

// ---------------------------------------------------------------------------
// JSX typing so React 19 accepts <skeleton-screen ... /> directly
// ---------------------------------------------------------------------------

import type { DetailedHTMLProps, HTMLAttributes } from 'react';

type SkeletonScreenAttributes = DetailedHTMLProps<
  HTMLAttributes<HTMLElement> & {
    loading?: boolean | string;
    effect?: string;
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
