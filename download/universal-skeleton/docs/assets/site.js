/**
 * universal-skeleton docs site — shared behaviors
 *  1. copy buttons on every <pre>
 *  2. [data-usk-hero] — live scan/restore loop (effect via data-usk-effect)
 *  3. [data-usk-gallery] — one live tile per effect; clicking a tile retargets the hero
 */
(function () {
  'use strict';

  /* ---------- 1. copy buttons ---------- */
  document.querySelectorAll('pre').forEach(function (pre) {
    var text = pre.textContent;
    var btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.type = 'button';
    btn.textContent = 'Copy';
    btn.addEventListener('click', function () {
      navigator.clipboard.writeText(text).then(function () {
        btn.textContent = 'Copied!';
        setTimeout(function () { btn.textContent = 'Copy'; }, 1400);
      });
    });
    pre.appendChild(btn);
  });

  /* ---------- 2 + 3 need the library ---------- */
  var USK = window.UniversalSkeleton;
  if (!USK || !USK.SkeletonLoader) return;

  var AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23e0e7ff'/%3E%3Ccircle cx='32' cy='26' r='13' fill='%23a5b4fc'/%3E%3Cpath d='M10 64c2-16 12-22 22-22s20 6 22 22z' fill='%23a5b4fc'/%3E%3C/svg%3E";

  /* ---------- 2. hero loop ---------- */
  var heroTimers = [];

  function stopHero() {
    heroTimers.forEach(clearTimeout);
    heroTimers = [];
    if (window.__uskHeroHandle) {
      window.__uskHeroHandle.destroy();
      window.__uskHeroHandle = null;
    }
  }

  function startHero() {
    var el = document.querySelector('[data-usk-hero]');
    if (!el) return;
    stopHero();
    var effect = el.getAttribute('data-usk-effect') || 'shimmer';

    var run = function () {
      if (!el.isConnected) return;
      window.__uskHeroHandle = USK.SkeletonLoader.scan(el, { effect: effect, theme: 'light' });
      heroTimers.push(setTimeout(function () {
        if (window.__uskHeroHandle) { window.__uskHeroHandle.destroy(); window.__uskHeroHandle = null; }
        heroTimers.push(setTimeout(run, 1100));
      }, 2800));
    };
    heroTimers.push(setTimeout(run, 500));
  }

  /* ---------- 3. effects gallery ---------- */
  function buildGallery() {
    var grids = document.querySelectorAll('[data-usk-gallery]');
    if (!grids.length) return;
    var effects = USK.EFFECTS || ['shimmer', 'wave', 'pulse', 'fade', 'blink', 'sheen', 'bounce', 'none'];

    grids.forEach(function (grid) {
      effects.forEach(function (fx) {
        var tile = document.createElement('div');
        tile.className = 'fx-tile';
        tile.setAttribute('data-effect', fx);
        tile.innerHTML =
          '<div class="fx-ui">' +
            '<div class="fx-row">' +
              '<img alt="" src="' + AVATAR + '" />' +
              '<div class="lines"><b>Full Name</b><span>username &middot; role</span></div>' +
            '</div>' +
            '<span class="fx-cta">Follow</span>' +
          '</div>' +
          '<div class="fx-name"><span>' + fx + '</span><span class="use">use &rarr;</span></div>';
        grid.appendChild(tile);

        var handle = USK.SkeletonLoader.scan(tile.querySelector('.fx-ui'), { effect: fx, theme: 'light' });
        // keep gallery handles alive — do not register them in the hero slot
        void handle;

        tile.addEventListener('click', function () {
          var hero = document.querySelector('[data-usk-hero]');
          if (hero) {
            hero.setAttribute('data-usk-effect', fx);
            startHero();
          }
          if (grid === document.querySelector('[data-usk-gallery]')) {
            grid.querySelectorAll('.fx-tile').forEach(function (t) {
              var on = t.getAttribute('data-effect') === fx;
              t.classList.toggle('current', on);
              var label = t.querySelector('.fx-name .use');
              label.textContent = on ? 'current' : 'use \u2192';
              label.classList.toggle('now', on);
            });
          }
        });
      });
    });

    // mark the hero's starting effect as current
    var hero = document.querySelector('[data-usk-hero]');
    if (hero) {
      var fx0 = hero.getAttribute('data-usk-effect') || 'shimmer';
      grids.forEach(function (grid) {
        grid.querySelectorAll('.fx-tile').forEach(function (t) {
          var on = t.getAttribute('data-effect') === fx0;
          t.classList.toggle('current', on);
          var label = t.querySelector('.fx-name .use');
          if (on) { label.textContent = 'current'; label.classList.add('now'); }
        });
      });
    }
  }

  function init() {
    buildGallery();
    startHero();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
