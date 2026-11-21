'use client';

import { useTheme } from 'next-themes';
import { Monitor, Moon, Sun } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useMounted } from '@/components/docs/sample-card';

/** Light / dark / system switcher for the docs site. */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  // next-themes resolves the theme on the client only — render a stable
  // placeholder until mounted to keep hydration clean.
  const mounted = useMounted();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle theme"
          className="text-muted-foreground hover:text-foreground"
        >
          {/* Render both icons; CSS shows the right one per resolved theme */}
          <Sun className="h-4.5 w-4.5 dark:hidden" />
          <Moon className="hidden h-4.5 w-4.5 dark:block" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="border-border">
        {mounted ? (
          <>
            <DropdownMenuItem
              onClick={() => setTheme('light')}
              className={theme === 'light' ? 'text-emerald-600 dark:text-emerald-300' : ''}
            >
              <Sun className="mr-2 h-4 w-4" /> Light
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setTheme('dark')}
              className={theme === 'dark' ? 'text-emerald-600 dark:text-emerald-300' : ''}
            >
              <Moon className="mr-2 h-4 w-4" /> Dark
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setTheme('system')}
              className={theme === 'system' ? 'text-emerald-600 dark:text-emerald-300' : ''}
            >
              <Monitor className="mr-2 h-4 w-4" /> System
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
