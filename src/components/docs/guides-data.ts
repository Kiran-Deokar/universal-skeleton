/**
 * Integration guide content for the docs site.
 * Each guide is self-contained: prose + runnable code samples.
 */

import type { LucideIcon } from 'lucide-react';
import {
  Braces,
  Component,
  FileCode2,
  Globe,
  History,
  Layers,
  Radio,
  ShieldCheck,
  Triangle,
  Type,
  Workflow,
} from 'lucide-react';

export interface GuideSection {
  heading: string;
  body?: string;
  code?: { lang: string; label?: string; code: string };
  bullets?: string[];
}

export interface Guide {
  slug: string;
  title: string;
  tag: string;
  icon: LucideIcon;
  intro: string;
  sections: GuideSection[];
}

export const GUIDES: Guide[] = [
  {
    slug: 'vanilla',
    title: 'Plain HTML / Vanilla JS',
    tag: 'CDN',
    icon: Globe,
    intro:
      'The zero-build path: one script tag and the library is on your page. This is also the exact same API every other guide calls under the hood.',
    sections: [
      {
        heading: 'Install via CDN',
        body: 'unpkg and jsDelivr serve the browser build automatically. The global is UniversalSkeleton and the stylesheet is injected for you — no <link> needed.',
        code: {
          lang: 'html',
          label: 'index.html',
          code: `<!DOCTYPE html>
<html>
  <head>
    <!-- pick one CDN -->
    <script src="https://unpkg.com/universal-skeleton/dist/index.iife.min.js"></script>
    <!-- <script src="https://cdn.jsdelivr.net/npm/universal-skeleton/dist/index.iife.min.js"></script> -->
  </head>
  <body>
    <div id="app">
      <h1>My dashboard</h1>
      <img id="avatar" src="avatar.jpg" alt="me" />
      <p id="bio">Loading my profile…</p>
    </div>

    <script>
      // 1. Skeleton mirrors the real UI of #app
      UniversalSkeleton.SkeletonLoader.scan('#app');

      // 2. …your data arrives…
      fetch('/api/me')
        .then(function (r) { return r.json(); })
        .then(function (me) {
          document.getElementById('bio').textContent = me.bio;
        })
        .finally(function () {
          // 3. Restore the real UI
          UniversalSkeleton.SkeletonLoader.restore('#app');
        });
    </script>
  </body>
</html>`,
        },
      },
      {
        heading: 'The while() helper',
        body: 'show skeleton while a promise runs, restore automatically — even when it rejects:',
        code: {
          lang: 'javascript',
          code: `const data = await UniversalSkeleton.SkeletonLoader.while(
  fetch('/api/feed').then((r) => r.json()),
  '#feed',
  { effect: 'wave', minDuration: 400 }
);`,
        },
      },
      {
        heading: 'Or use the Web Component — no JavaScript at all',
        code: {
          lang: 'html',
          code: `<skeleton-screen loading effect="sheen">
  <article class="post">…your real markup…</article>
</skeleton-screen>

<!-- later, plain JS flips it: -->
<script>
  document
    .querySelector('skeleton-screen')
    .removeAttribute('loading');   // skeleton off, real UI on
</script>`,
        },
      },
      {
        heading: 'ES module instead of a global?',
        code: {
          lang: 'javascript',
          code: `import { SkeletonLoader, SkeletonScreen } from
  'https://cdn.jsdelivr.net/npm/universal-skeleton/dist/index.esm.js';`,
        },
      },
    ],
  },
  {
    slug: 'react',
    title: 'React (Vite, CRA, CSR)',
    tag: 'CSR',
    icon: Component,
    intro:
      'Two options: the imperative scan/restore API for data-fetching flows, or the <skeleton-screen> element used like any other JSX tag. The package ships TypeScript declarations, so no @types install is needed.',
    sections: [
      {
        heading: 'Install',
        code: { lang: 'bash', code: 'npm install universal-skeleton' },
      },
      {
        heading: 'Option A — scan() / while() in useEffect',
        body: 'Scan after the browser has painted the real DOM; the handle cleans up on unmount.',
        code: {
          lang: 'jsx',
          label: 'Feed.jsx',
          code: `import { useEffect, useRef, useState } from 'react';
import { SkeletonLoader } from 'universal-skeleton';

export function Feed() {
  const ref = useRef(null);
  const [user, setUser] = useState(null);

  // Show skeleton while there is no data
  useEffect(() => {
    if (!user && ref.current) {
      const handle = SkeletonLoader.scan(ref.current, { effect: 'fade' });
      return () => handle.destroy(); // restore on unmount / data
    }
  }, [user]);

  // Simplest flow: skeleton around the fetch itself
  const load = () =>
    SkeletonLoader.while(fetch('/api/user').then((r) => r.json()), ref.current)
      .then(setUser);

  return (
    <section ref={ref}>
      <h2>{user ? user.name : 'Loading…'}</h2>
      <button onClick={load}>Reload</button>
    </section>
  );
}`,
        },
      },
      {
        heading: 'Option B — the <skeleton-screen> element',
        body: 'React 19 supports custom elements natively. Pass boolean attributes as an empty string (present) or undefined (removed):',
        code: {
          lang: 'jsx',
          code: `import { useState } from 'react';
import 'universal-skeleton'; // registers <skeleton-screen> once

export function Card() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <skeleton-screen loading={loading ? '' : undefined} effect="wave" radius="12">
      <ProductCard />
    </skeleton-screen>
  );
}`,
        },
      },
      {
        heading: 'React 16–18?',
        bullets: [
          'React treats unknown elements as strings-only before v19 — boolean props must be strings: loading={loading ? "" : undefined} (never loading={true}).',
          'event listeners on custom elements need a ref callback — but you rarely need events here.',
          'For full JSX typing in older setups, add the global JSX declaration from the package (index.d.ts already declares <skeleton-screen> for classic JSX namespaces).',
        ],
      },
    ],
  },
  {
    slug: 'nextjs',
    title: 'Next.js (App Router)',
    tag: 'SSR',
    icon: Triangle,
    intro:
      'Skeletons are a browser concern: the library is SSR-safe (importing it on the server does nothing), but scanning must happen in client components after hydration.',
    sections: [
      {
        heading: 'Install + mark the component as client',
        code: {
          lang: 'bash',
          code: 'npm install universal-skeleton',
        },
      },
      {
        heading: 'Option A — while() around a client-side fetch',
        body: 'The cleanest Next.js pattern: a "use client" island that fetches on mount, with the skeleton mirroring your real markup while the request is in flight.',
        code: {
          lang: 'jsx',
          label: 'app/feed.tsx',
          code: `'use client';

import { useEffect, useRef, useState } from 'react';
import { SkeletonLoader } from 'universal-skeleton';

type Post = { title: string; body: string };

export function Feed() {
  const ref = useRef<HTMLDivElement>(null);
  const [posts, setPosts] = useState<Post[] | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    SkeletonLoader.while(
      fetch('/api/posts').then((r) => r.json()) as Promise<Post[]>,
      ref.current,
      { effect: 'shimmer', minDuration: 300 }
    )
      .then(setPosts)
      .catch(() => setPosts([])); // restore even on failure
  }, []);

  return (
    <div ref={ref} className="feed">
      {(posts ?? []).map((p) => (
        <article key={p.title}>
          <h3>{p.title}</h3>
          <p>{p.body}</p>
        </article>
      ))}
    </div>
  );
}`,
        },
      },
      {
        heading: 'Option B — <skeleton-screen> inside a client component',
        body: 'In SSR frameworks, render the element only after mount: the library upgrades server-rendered custom elements before hydration and mutates the DOM under React, which trips the hydration check. One mounted flag fixes it:',
        code: {
          lang: 'tsx',
          code: `'use client';

import { useEffect, useState } from 'react';
import 'universal-skeleton'; // registers the custom element in the browser

export function Profile() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => setMounted(true), []); // wait for hydration

  return mounted ? (
    <skeleton-screen loading={loading ? '' : undefined} effect="sheen">
      <ProfileView onReady={() => setLoading(false)} />
    </skeleton-screen>
  ) : (
    <ProfileSkeletonFallback /> // or null — SSR renders this
  );
}`,
        },
        bullets: [
          'The scan()/while() API (Option A) does not need the gate — scanning happens in useEffect, which always runs after hydration.',
          'Plain client-side rendered React (Vite, CRA) can render the element directly, no gate needed.',
        ],
      },
      {
        heading: 'Server Components & streaming',
        bullets: [
          'Do not import the library in a Server Component file — it would bundle into the RSC graph. Keep it inside "use client" files only.',
          'For streamed RSC content, React Suspense fallback markup is still the right tool; combine it: Suspense renders a static skeleton, universal-skeleton covers client fetches.',
          'The CJS build (dist/index.cjs) is what Node loads — importing it never touches document, so build/SSR never crashes.',
        ],
      },
    ],
  },
  {
    slug: 'vue',
    title: 'Vue 3',
    tag: 'Composition API',
    icon: Layers,
    intro:
      'Vue templates accept custom elements directly — <skeleton-screen> is usable without any plugin. For the imperative API, call scan() from lifecycle hooks.',
    sections: [
      {
        heading: 'Install',
        code: { lang: 'bash', code: 'npm install universal-skeleton' },
      },
      {
        heading: 'Option A — the element in your template',
        code: {
          lang: 'html',
          label: 'ProfileCard.vue',
          code: `<script setup>
import { ref, onMounted } from 'vue';
import 'universal-skeleton'; // registers <skeleton-screen> in the browser

const loading = ref(true);

onMounted(async () => {
  const user = await fetchUser(); // your loader
  loading.value = false;
});
</script>

<template>
  <skeleton-screen :loading="loading ? '' : undefined" effect="fade" radius="10">
    <UserCard :user="user" />
  </skeleton-screen>
</template>`,
        },
      },
      {
        heading: 'Tell the compiler it is a custom element (optional)',
        body: 'Vue dev builds warn about unknown tags. One line in vite.config silences it — not required in production:',
        code: {
          lang: 'javascript',
          label: 'vite.config.ts',
          code: `export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag === 'skeleton-screen',
        },
      },
    }),
  ],
});`,
        },
      },
      {
        heading: 'Option B — scan() / restore()',
        code: {
          lang: 'javascript',
          code: `import { SkeletonLoader } from 'universal-skeleton';

const root = useTemplateRef('root'); // Vue 3.5+
let handle = null;

onMounted(async () => {
  handle = SkeletonLoader.scan(root.value, { effect: 'wave' });
  Object.assign(state, await fetchUser());
  handle.destroy();
});

onBeforeUnmount(() => handle?.destroy());`,
        },
      },
    ],
  },
  {
    slug: 'nuxt',
    title: 'Nuxt 3',
    tag: 'SSR',
    icon: Workflow,
    intro:
      'The library is SSR-safe — importing it on the server is a no-op. The Web Component, however, should be rendered client-side only with <ClientOnly> for a clean hydration.',
    sections: [
      {
        heading: 'Install + configure the custom element',
        code: {
          lang: 'typescript',
          label: 'nuxt.config.ts',
          code: `export default defineNuxtConfig({
  vue: {
    compilerOptions: {
      isCustomElement: (tag) => tag === 'skeleton-screen',
    },
  },
});`,
        },
      },
      {
        heading: 'Use it — ClientOnly + attribute binding',
        code: {
          lang: 'html',
          label: 'app.vue',
          code: `<script setup>
import { ref } from 'vue';

const loading = ref(true);
const user = ref(null);

onMounted(async () => {
  user.value = await $fetch('/api/me');
  loading.value = false;
});
</script>

<template>
  <ClientOnly>
    <skeleton-screen :loading="loading ? '' : undefined" effect="pulse">
      <UserCard :user="user" />
    </skeleton-screen>
  </ClientOnly>
</template>`,
        },
      },
      {
        heading: 'Imperative API in a Nuxt page',
        code: {
          lang: 'javascript',
          code: `// Always client-side: inside onMounted / event handlers
onMounted(() => {
  SkeletonLoader.while($fetch('/api/feed'), '#feed', { effect: 'blink' });
});`,
        },
        bullets: [
          'Import the package inside <script setup> of a component that also renders on the client — Nuxt tree-shakes it correctly per environment.',
          'For data fetched in useAsyncData (server-side), you usually do not need a skeleton at all — the page arrives with data; use skeletons for client-side navigations and lazy components.',
        ],
      },
    ],
  },
  {
    slug: 'angular',
    title: 'Angular',
    tag: 'v17+',
    icon: ShieldCheck,
    intro:
      'Angular needs one schema tweak to accept custom elements, then the Web Component binds like any other tag. The imperative API works from services and lifecycle hooks.',
    sections: [
      {
        heading: 'Install + declare the element',
        code: {
          lang: 'typescript',
          label: 'app.component.ts',
          code: `import { CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';
import 'universal-skeleton'; // registers <skeleton-screen> in the browser

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // ← allow custom elements
})
export class AppComponent {
  loading = true;

  ngOnInit() {
    this.api.getProfile().subscribe(() => (this.loading = false));
  }
}`,
        },
      },
      {
        heading: 'Template — attribute binding',
        body: 'Angular cannot set a bare attribute conditionally, so bind loading as a string attribute:',
        code: {
          lang: 'html',
          label: 'app.component.html',
          code: `<skeleton-screen
  [attr.loading]="loading ? '' : null"
  effect="shimmer"
  color="#e2e8f0"
  radius="12">
  <app-profile></app-profile>
</skeleton-screen>`,
        },
      },
      {
        heading: 'Imperative API in a service',
        code: {
          lang: 'typescript',
          code: `import { SkeletonLoader } from 'universal-skeleton';

@Injectable({ providedIn: 'root' })
export class FeedService {
  load(target: HTMLElement) {
    return SkeletonLoader.while(
      this.http.get<Feed>('/api/feed'),
      target,
      { effect: 'fade' }
    );
  }
}`,
        },
      },
      {
        heading: 'Standalone components (v17+)',
        bullets: [
          'Add schemas: [CUSTOM_ELEMENTS_SCHEMA] to @Component({ … }) directly — the same declaration works for standalone and NgModule apps.',
        ],
      },
    ],
  },
  {
    slug: 'svelte',
    title: 'Svelte / SvelteKit',
    tag: 'Svelte 5',
    icon: Braces,
    intro:
      'Svelte treats any tag containing a dash as a custom element, so <skeleton-screen> works out of the box — in Svelte 4 and 5, in SPA and SvelteKit apps alike.',
    sections: [
      {
        heading: 'Install',
        code: { lang: 'bash', code: 'npm install universal-skeleton' },
      },
      {
        heading: 'Web Component in a component',
        code: {
          lang: 'html',
          label: 'Profile.svelte',
          code: `<script>
  import { onMount } from 'svelte';
  import 'universal-skeleton'; // registers the element in the browser

  let loading = $state(true); // Svelte 5 runes — a plain let works in v4

  onMount(async () => {
    await loadProfile();
    loading = false;
  });
</script>

<skeleton-screen loading={loading ? '' : undefined} effect="bounce">
  <article class="profile">…</article>
</skeleton-screen>`,
        },
      },
      {
        heading: 'Imperative API + actions',
        body: 'A tiny Svelte action is the most idiomatic way to drive scan()/restore():',
        code: {
          lang: 'javascript',
          label: 'skeleton.action.js',
          code: `import { SkeletonLoader } from 'universal-skeleton';

// A tiny Svelte action — the idiomatic way to drive scan()/restore()
export function skeleton(node, options = {}) {
  SkeletonLoader.scan(node, options);
  return {
    update(nextOptions) { SkeletonLoader.scan(node, nextOptions); },
    destroy() { SkeletonLoader.restore(node); },
  };
}

// Usage:
// <div use:skeleton={{ effect: 'wave', duration: 1200 }}>…</div>`,
        },
      },
      {
        heading: 'SvelteKit notes',
        bullets: [
          'SSR renders the tag fine, but register it client-side: import "universal-skeleton" in a component with onMount or inside +layout.client.svelte.',
          'For load functions in +page.js, data already exists before render — skeletons shine for client-side navigation and streamed data.',
        ],
      },
    ],
  },
  {
    slug: 'lit',
    title: 'Lit & Web Component apps',
    tag: 'WC',
    icon: Radio,
    intro:
      'Because the library IS a Web Component, Lit apps can compose <skeleton-screen> inside their own templates — or extend the exported class to subclass it.',
    sections: [
      {
        heading: 'Use the element in a Lit template',
        code: {
          lang: 'javascript',
          label: 'my-card.js',
          code: `import { LitElement, html } from 'lit';
import 'universal-skeleton'; // registers <skeleton-screen>

export class MyCard extends LitElement {
  static properties = { loading: { type: Boolean } };

  constructor() {
    super();
    this.loading = true;
  }

  render() {
    return html\`
      <!-- ?attr= sets the attribute when true, removes it when false -->
      <skeleton-screen ?loading=\${this.loading} effect="sheen">
        <slot></slot>
      </skeleton-screen>
    \`;
  }
}
customElements.define('my-card', MyCard);`,
        },
      },
      {
        heading: 'Subclass the component',
        code: {
          lang: 'javascript',
          code: `import { SkeletonScreen } from 'universal-skeleton';

class LoadingCard extends SkeletonScreen {}
customElements.define('loading-card', LoadingCard);`,
        },
        bullets: [
          'The Web Component renders in light DOM — your slotted content is measured directly, no shadow DOM surprises.',
          'Note: one custom element class maps to one tag name; use registerSkeletonScreen("other-name") for extra aliases.',
        ],
      },
    ],
  },
  {
    slug: 'jquery',
    title: 'jQuery & legacy stacks',
    tag: 'No build',
    icon: History,
    intro:
      'Any page where you can add a script tag works: WordPress, Rails ERB, Django, Laravel Blade, JSP — the browser build has zero dependencies and needs no bundler.',
    sections: [
      {
        heading: 'Script tag + jQuery AJAX',
        code: {
          lang: 'html',
          label: 'page.html',
          code: `<script src="https://unpkg.com/universal-skeleton/dist/index.iife.min.js"></script>
<script>
  var loader = UniversalSkeleton.SkeletonLoader.scan('#legacy-panel', { effect: 'shimmer' });

  $.get('/api/data')
    .done(function (data) {
      $('#legacy-panel').html(render(data));
    })
    .fail(function () {
      alert('failed — restoring UI anyway');
    })
    .always(function () {
      UniversalSkeleton.SkeletonLoader.restore('#legacy-panel');
    });
</script>`,
        },
      },
      {
        heading: 'Server-rendered lists (htmx, Rails, Django…)',
        body: 'For server templates there is no JS state to sync — just scan before a request and restore on completion, or use data attributes to fine-tune what gets skeletonized:',
        code: {
          lang: 'html',
          code: `<!-- Django / ERB / PHP template -->
<div id="list" hx-get="/items" hx-swap="innerHTML">
  {% for item in items %}
    <p data-skeleton="text">{{ item.title }}</p>  <!-- mirrors as text bars -->
  {% endfor %}
  <img src="{{ user.avatar }}" data-skeleton="circle" />
  <button data-skeleton="ignore">Skip me</button>
</div>`,
        },
      },
      {
        heading: 'Prefer the Web Component?',
        code: {
          lang: 'html',
          code: `<skeleton-screen loading>
  <?php include 'product-row.php'; ?>
</skeleton-screen>
<script>
  fetch('/api/stock').then(function () {
    document.querySelector('skeleton-screen').removeAttribute('loading');
  });
</script>`,
        },
      },
    ],
  },
  {
    slug: 'typescript',
    title: 'TypeScript',
    tag: '.d.ts',
    icon: Type,
    intro:
      'The package ships index.d.ts inside — install and you get typed options, handles and JSX support immediately. No @types package, no ambient setup.',
    sections: [
      {
        heading: 'Everything is typed out of the box',
        code: {
          lang: 'typescript',
          code: `import {
  SkeletonLoader,
  type SkeletonHandle,
  type SkeletonEffect,
  EFFECTS, // ['shimmer', 'wave', 'pulse', 'fade', 'blink', 'sheen', 'bounce', 'none']
} from 'universal-skeleton';

const handle: SkeletonHandle = SkeletonLoader.scan('#app', {
  effect: 'wave',          // only the 8 valid names compile
  duration: 900,           // string | number
  radius: 12,
  exclude: (el) => el.classList.contains('ads'),
});

handle.setEffect('fade');   // autocompletes all effect names
handle.destroy();`,
        },
      },
      {
        heading: 'The SkeletonOptions interface',
        code: {
          lang: 'typescript',
          code: `interface SkeletonOptions {
  effect?: SkeletonEffect;              // 'shimmer' | 'wave' | 'pulse' | 'fade' | 'blink' | 'sheen' | 'bounce' | 'none'
  color?: string;                       // any CSS color
  highlightColor?: string;
  duration?: string | number;           // '2s' or 900 (ms)
  radius?: number | null;
  exclude?: string | ((el: Element) => boolean);
  textLines?: boolean;                  // one bar per text line
  responsive?: boolean;                 // ResizeObserver rebuild
  blockInteraction?: boolean;           // block clicks while visible
  minDuration?: number;                 // while() only
}`,
        },
      },
      {
        heading: 'JSX typing for <skeleton-screen>',
        body: 'The bundled declarations cover classic JSX and React 19. If your setup does not pick them up (e.g. custom JSX runtime), declare the element once:',
        code: {
          lang: 'typescript',
          label: 'skeleton-screen.d.ts',
          code: `import 'universal-skeleton';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'skeleton-screen': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          loading?: boolean | string;
          effect?: SkeletonEffect;
          color?: string;
          'highlight-color'?: string;
          duration?: string | number;
          radius?: number | string;
        },
        HTMLElement
      >;
    }
  }
}`,
        },
      },
      {
        heading: 'tsconfig note',
        bullets: [
          'moduleResolution: "bundler" (recommended) or "node16"/"nodenext" resolve the exports map — both point to dist/index.esm.js + index.d.ts.',
          'The CJS build has matching types for Node/SSR tooling.',
        ],
      },
    ],
  },
  {
    slug: 'anywhere',
    title: 'Astro, Remix, Solid, htmx & more',
    tag: 'Universal',
    icon: FileCode2,
    intro:
      'If it renders HTML, it is supported. This page is the same recipe: one script tag (or import) + optional data-skeleton attributes.',
    sections: [
      {
        heading: 'Astro — script in the layout',
        code: {
          lang: 'astro',
          label: 'src/layouts/Base.astro',
          code: `---
// Astro processes <script> tags — import npm packages directly
import 'universal-skeleton';
---
<html>
  <body>
    <slot />
    <!-- boolean attribute with no value → skeleton until JS removes it -->
    <skeleton-screen loading effect="wave">
      <slot name="hero" />
    </skeleton-screen>
  </body>
</html>`,
        },
        bullets: [
          'Use is:inline or place the CDN <script src> in <head> to skip Astro bundling entirely.',
        ],
      },
      {
        heading: 'Remix / React Router',
        body: 'Same as the React guide — skeletons belong in client components (files under .client/ or components using useEffect).',
        code: {
          lang: 'tsx',
          code: `// app/routes/dashboard.tsx
import { json } from '@remix-run/node';
import { SkeletonLoader } from 'universal-skeleton';

export async function clientLoader() {
  const data = await SkeletonLoader.while(
    fetch('/api/dashboard').then((r) => r.json()),
    '#dash',
    { effect: 'pulse', minDuration: 250 }
  );
  return json(data);
}`,
        },
      },
      {
        heading: 'Solid, preact, alpine…',
        bullets: [
          'Solid: use ref + onMount(() => SkeletonLoader.scan(ref, options)).',
          'Preact: identical to the React guide (custom elements are first-class there).',
          'Alpine.js: x-init="document.querySelector(&apos;skeleton-screen&apos;).removeAttribute(&apos;loading&apos;)" after fetching.',
        ],
      },
      {
        heading: 'htmx / Turbo / server-driven apps',
        body: 'Hook the request lifecycle events — scan before the request, restore when the DOM updates:',
        code: {
          lang: 'javascript',
          code: `document.body.addEventListener('htmx:beforeRequest', (e) => {
  UniversalSkeleton.SkeletonLoader.scan(e.target, { effect: 'sheen' });
});
document.body.addEventListener('htmx:afterSwap', (e) => {
  UniversalSkeleton.SkeletonLoader.restore(e.target);
});`,
        },
      },
    ],
  },
];

export const GUIDE_INDEX = GUIDES.map(({ slug, title, tag }) => ({ slug, title, tag }));
