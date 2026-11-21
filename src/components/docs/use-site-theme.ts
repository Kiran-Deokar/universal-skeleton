'use client';

import { useTheme } from 'next-themes';
import { useMounted } from './sample-card';

/**
 * The site's resolved color scheme as the library understands it
 * ('light' | 'dark'). Every live demo uses this so the skeleton palette
 * always matches the theme toggle — light and dark are both first-class.
 */
export function useSiteTheme(): 'light' | 'dark' {
  const { resolvedTheme } = useTheme();
  const mounted = useMounted();
  if (!mounted || !resolvedTheme) return 'light';
  return resolvedTheme === 'dark' ? 'dark' : 'light';
}
