/**
 * react-syntax-highlighter ships no TypeScript types — declare the subpaths
 * the docs site uses (Prism light build + registered languages + style).
 */

declare module 'react-syntax-highlighter' {
  import type { ComponentType, CSSProperties, ReactNode } from 'react';

  export const PrismLight: ComponentType<{
    language?: string;
    style?: Record<string, Record<string, CSSProperties | string>>;
    showLineNumbers?: boolean;
    wrapLongLines?: boolean;
    customStyle?: CSSProperties;
    codeTagProps?: CSSProperties;
    className?: string;
    children?: ReactNode;
    [key: string]: unknown;
  }>;
  export const Prism: ComponentType<Record<string, unknown>>;
  export const LightAsync: ComponentType<Record<string, unknown>>;
  export const Light: ComponentType<Record<string, unknown>>;
}

declare module 'react-syntax-highlighter/dist/esm/languages/prism/*' {
  const language: unknown;
  export default language;
}

declare module 'react-syntax-highlighter/dist/esm/styles/prism/*' {
  const style: Record<string, Record<string, string>>;
  export default style;
}
