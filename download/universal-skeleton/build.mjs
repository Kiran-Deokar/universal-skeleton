/**
 * Build script — produces every distributable format with esbuild:
 *
 *   dist/index.esm.js            ES module (bundler imports)
 *   dist/index.cjs.js            CommonJS (Node require)
 *   dist/index.iife.js           IIFE, global `UniversalSkeleton` (CDN, readable)
 *   dist/index.iife.min.js       minified CDN build (unpkg / jsDelivr default)
 *   dist/universal-skeleton.css  optional standalone stylesheet
 *
 * Run with:  npm run build
 */

import { build } from 'esbuild';
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { SKELETON_CSS } from './src/styles.js';

const require = createRequire(import.meta.url);
const pkg = require('./package.json');

mkdirSync('dist', { recursive: true });

const banner = {
  js: `/*! universal-skeleton v${pkg.version} | MIT License | npm i universal-skeleton */`,
};

const common = {
  entryPoints: ['src/index.js'],
  bundle: true,
  sourcemap: true,
  banner,
  logLevel: 'info',
  target: ['es2018'],
  legalComments: 'none',
};

const jobs = [
  { ...common, format: 'esm', outfile: 'dist/index.esm.js' },
  // .cjs extension is mandatory: the package is "type": "module", so Node
  // would otherwise parse a .js CJS bundle as ESM.
  { ...common, format: 'cjs', outfile: 'dist/index.cjs' },
  { ...common, format: 'iife', globalName: 'UniversalSkeleton', outfile: 'dist/index.iife.js' },
  {
    ...common,
    format: 'iife',
    globalName: 'UniversalSkeleton',
    outfile: 'dist/index.iife.min.js',
    minify: true,
    sourcemap: false,
  },
];

for (const job of jobs) {
  // eslint-disable-next-line no-await-in-loop
  await build(job);
}

writeFileSync('dist/universal-skeleton.css', `${SKELETON_CSS.trim()}\n`);
console.log('\nCSS written to dist/universal-skeleton.css');
console.log('Build complete.');
