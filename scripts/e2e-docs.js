/**
 * e2e verification for universal-skeleton demo + docs site.
 * Loads every page in headless Chromium, checks console errors, exercises
 * the interactive controls, verifies skeletons really render, and saves
 * screenshots (README images + visual-check renders).
 */
import { chromium } from 'playwright';
import fs from 'node:fs';

const ROOT = '/home/z/my-project/download/universal-skeleton';
const SHOT = '/tmp/render';
fs.rmSync(SHOT, { recursive: true, force: true });
fs.mkdirSync(SHOT, { recursive: true });

const errors = [];
const pages = [
  { name: 'demo', url: `file://${ROOT}/demo/index.html` },
  { name: 'docs-home', url: `file://${ROOT}/docs/index.html` },
  { name: 'docs-api', url: `file://${ROOT}/docs/api.html` },
  { name: 'guide-vanilla', url: `file://${ROOT}/docs/guides/vanilla.html` },
  { name: 'guide-react', url: `file://${ROOT}/docs/guides/react.html` },
  { name: 'guide-vue', url: `file://${ROOT}/docs/guides/vue.html` },
  { name: 'guide-angular', url: `file://${ROOT}/docs/guides/angular.html` },
  { name: 'guide-svelte', url: `file://${ROOT}/docs/guides/svelte.html` },
  { name: 'guide-lit', url: `file://${ROOT}/docs/guides/lit.html` },
  { name: 'guide-jquery', url: `file://${ROOT}/docs/guides/jquery.html` },
];

const browser = await chromium.launch();
// NOTE: viewport must be at least as tall as the page — this headless Chromium
// build loses some rasterized blocks when fullPage capture expands a smaller
// viewport. 1750 covers the demo page (1684px tall).
const page = await browser.newPage({ viewport: { width: 1280, height: 1750 } });

for (const p of pages) {
  page.on('pageerror', (e) => errors.push(`[${p.name}] pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`[${p.name}] console.error: ${m.text()}`);
  });
  await page.goto(p.url, { waitUntil: 'load' });
  await page.waitForTimeout(1400);

  const css = await page.evaluate(() =>
    getComputedStyle(document.body).fontFamily || ''
  );
  const cssOk = css.length > 0 && !css.includes('initial');
  console.log(`${p.name}: loaded, css=${cssOk ? 'ok' : 'MISSING'}`);
  if (!cssOk) errors.push(`[${p.name}] stylesheet did not apply`);
}

/* ---------------- demo interactions ---------------- */
console.log('\n--- demo interactions ---');
await page.goto(`file://${ROOT}/demo/index.html`, { waitUntil: 'load' });
await page.waitForTimeout(1200);

const demo = await page.evaluate(() => {
  const USK = window.UniversalSkeleton;
  const fxTiles = document.querySelectorAll('.fx-tile').length;
  const overlays = document.querySelectorAll('.usk-overlay').length;
  const blocks = document.querySelectorAll('.usk-block').length;
  const effectOptions = document.querySelectorAll('#effect option').length;
  const feedHas = !!document.querySelector('#feedCard .usk-overlay');
  const manualHas = !!document.querySelector('#manualCard .usk-overlay');
  const wcHas = !!document.querySelector('#wcDemo .usk-overlay');
  return {
    hasUSK: !!USK,
    effects: USK ? USK.EFFECTS : null,
    fxTiles, overlays, blocks, effectOptions, feedHas, manualHas, wcHas,
  };
});
console.log('demo state:', JSON.stringify(demo, null, 2));
if (!demo.hasUSK) errors.push('[demo] UniversalSkeleton global missing');
if (demo.fxTiles !== 8) errors.push(`[demo] expected 8 fx tiles, got ${demo.fxTiles}`);
if (demo.effectOptions !== 8) errors.push(`[demo] expected 8 effect options, got ${demo.effectOptions}`);
if (!demo.feedHas || !demo.manualHas || !demo.wcHas) errors.push('[demo] not all cards skeletonized at load');
if (demo.blocks < 20) errors.push(`[demo] too few blocks: ${demo.blocks}`);

// tile click applies effect everywhere via setEffect + WC attribute
await page.click('.fx-tile[data-effect="fade"]');
await page.waitForTimeout(300);
const afterTile = await page.evaluate(() => ({
  select: document.getElementById('effect').value,
  feedOverlay: document.querySelector('#feedCard .usk-overlay')?.className || '',
  wcEffect: document.getElementById('wcDemo').getAttribute('effect'),
}));
console.log('after tile click:', JSON.stringify(afterTile));
if (afterTile.select !== 'fade') errors.push('[demo] tile click did not update select');
if (!afterTile.feedOverlay.includes('usk-effect-fade')) errors.push('[demo] setEffect(fade) not applied to feed');
if (afterTile.wcEffect !== 'fade') errors.push('[demo] WC effect attribute not updated');

// theme switch applies setTheme
await page.selectOption('#theme', 'dark');
await page.waitForTimeout(200);
const themeCls = await page.evaluate(() => document.querySelector('#feedCard .usk-overlay')?.className || '');
if (!themeCls.includes('usk-theme-dark')) errors.push('[demo] setTheme(dark) not applied');
console.log('theme dark applied:', themeCls.includes('usk-theme-dark'));

// duration control sets CSS variable
await page.fill('#duration', '900');
await page.waitForTimeout(200);
const durVar = await page.evaluate(() =>
  document.documentElement.style.getPropertyValue('--usk-duration'));
if (!durVar.includes('900ms')) errors.push(`[demo] duration var not set: "${durVar}"`);
console.log('duration var:', durVar);

// web component toggle
await page.click('#wcToggle');
await page.waitForTimeout(250);
const wcGone = await page.evaluate(() => !document.querySelector('#wcDemo .usk-overlay'));
if (!wcGone) errors.push('[demo] WC toggle did not remove overlay');
console.log('wc toggle reveal ok:', wcGone);

// async while()
await page.click('#btnLoad');
await page.waitForTimeout(600);
const whileActive = await page.evaluate(() => !!document.querySelector('#asyncCard .usk-overlay'));
await page.waitForTimeout(1800);
const whileDone = await page.evaluate(() => ({
  gone: !document.querySelector('#asyncCard .usk-overlay'),
  role: document.getElementById('asyncRole').textContent,
}));
console.log('while(): active-during=', whileActive, 'restored=', whileDone.gone, 'role=', whileDone.role);
if (!whileActive) errors.push('[demo] while() overlay not visible during load');
if (!whileDone.gone) errors.push('[demo] while() overlay not removed after promise');
if (!whileDone.role.includes('1952')) errors.push('[demo] async result not applied');

// README screenshots: fresh demo, animations disabled so the infinite
// shimmer is canceled and every block renders in its static grey gradient.
await page.goto(`file://${ROOT}/demo/index.html`, { waitUntil: 'load' });
await page.waitForTimeout(1200);
await page.mouse.move(5, 5); // avoid hover rings on tiles
await page.screenshot({ path: `${SHOT}/demo.png`, fullPage: true, animations: 'disabled' });
await page.locator('#feedCard').screenshot({
  path: `${SHOT}/demo-autoscan.png`,
  animations: 'disabled',
});

/* ---------------- docs home: hero loop + gallery ---------------- */
console.log('\n--- docs home ---');
await page.goto(`file://${ROOT}/docs/index.html`, { waitUntil: 'load' });
await page.waitForTimeout(1000);
const home = await page.evaluate(() => {
  const hero = document.querySelector('[data-usk-hero]');
  const tiles = document.querySelectorAll('.fx-tile').length;
  const heroOverlay = !!hero?.querySelector('.usk-overlay');
  const tileOverlays = document.querySelectorAll('.fx-tile .usk-overlay').length;
  const blockSample = document.querySelector('.fx-tile .usk-block');
  return { tiles, heroOverlay, tileOverlays, hasBlock: !!blockSample };
});
console.log('docs home:', JSON.stringify(home));
if (home.tiles !== 8) errors.push(`[docs-home] gallery tiles: ${home.tiles}`);
if (!home.heroOverlay) errors.push('[docs-home] hero not skeletonized during loop');
if (home.tileOverlays !== 8) errors.push(`[docs-home] tile overlays: ${home.tileOverlays}`);

// click a gallery tile → hero retargets (new scan with that effect)
await page.click('.fx-tile[data-effect="blink"]');
await page.waitForTimeout(900);
const heroFx = await page.evaluate(() => {
  const hero = document.querySelector('[data-usk-hero]');
  const ov = hero?.querySelector('.usk-overlay');
  if (!ov) return 'no-overlay';
  return ov.className.includes('usk-effect-blink') ? 'blink' : ov.className;
});
console.log('hero effect after tile click:', heroFx);
if (heroFx !== 'blink') errors.push(`[docs-home] hero retarget failed: ${heroFx}`);
await page.mouse.move(5, 5);
await page.screenshot({ path: `${SHOT}/docs-home.png`, fullPage: true, animations: 'disabled' });
// top-viewport shot (no expansion) — reliable check of hero + gallery blocks
await page.evaluate(() => window.scrollTo(0, 0));
await page.screenshot({ path: `${SHOT}/docs-home-top.png`, animations: 'disabled' });

/* ---------------- api + guides: sidebar, copy buttons, broken links ---------------- */
console.log('\n--- api + guides ---');
for (const p of pages.slice(2)) {
  await page.goto(p.url, { waitUntil: 'load' });
  await page.waitForTimeout(300);
  const info = await page.evaluate(() => ({
    pre: document.querySelectorAll('pre').length,
    copyBtns: document.querySelectorAll('pre .copy-btn').length,
    sidebarLinks: document.querySelectorAll('.sidebar a').length,
    h1: document.querySelector('article.doc > h1')?.textContent?.trim() || null,
  }));
  console.log(`${p.name}: h1=${info.h1} pre=${info.pre} copy=${info.copyBtns} sidebar=${info.sidebarLinks}`);
  if (!info.h1) errors.push(`[${p.name}] missing h1`);
  if (info.pre === 0) errors.push(`[${p.name}] no code blocks`);
}

// verify all internal links resolve to files
console.log('\n--- link check ---');
for (const p of pages.slice(1)) {
  await page.goto(p.url, { waitUntil: 'load' });
  const links = await page.evaluate(() =>
    Array.from(document.querySelectorAll('a[href]'))
      .map((a) => a.getAttribute('href'))
      .filter((h) => h && !h.startsWith('http') && !h.startsWith('#') && !h.startsWith('data:'))
  );
  const baseDir = p.url.slice(0, p.url.lastIndexOf('/'));
  for (const href of links) {
    const target = decodeURIComponent(new URL(href, baseDir + '/').pathname);
    if (!fs.existsSync(target)) errors.push(`[${p.name}] broken link: ${href}`);
  }
  console.log(`${p.name}: ${links.length} relative links checked`);
}

await browser.close();

console.log('\n==================== RESULT ====================');
if (errors.length) {
  console.log('FAILURES:');
  errors.forEach((e) => console.log(' -', e));
  process.exit(1);
} else {
  console.log('ALL CHECKS PASSED');
}
