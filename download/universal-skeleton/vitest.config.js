import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Isolate from any parent project's PostCSS/PostCSS config (e.g. when this
  // repo is nested inside a larger workspace): tests need no CSS processing.
  css: { postcss: { plugins: [] } },
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.js'],
    globals: true,
  },
});
