'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';
import { SkeletonLoader, type SkeletonOptions } from '@/lib/universal-skeleton/index.esm.mjs';

const emptySubscribe = () => () => {};

/**
 * True after hydration. useSyncExternalStore keeps the server render
 * (false) and the client render (true) consistent without a setState
 * in an effect — the canonical React hydration-safe "is client" check.
 */
export function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

/**
 * Scan lifecycle as a hook: while `active` is true a skeleton overlays the
 * ref target; changing anything in `deps` re-scans with fresh options.
 */
export function useSkeleton(
  active: boolean,
  makeOptions: () => SkeletonOptions,
  deps: unknown[] = []
) {
  const ref = useRef<HTMLDivElement>(null);
  const make = useRef(makeOptions);
  useEffect(() => {
    make.current = makeOptions;
  }); // keep latest factory without re-scanning

  useEffect(() => {
    const el = ref.current;
    if (!el || !active) return;
    const handle = SkeletonLoader.scan(el, make.current());
    return () => handle.destroy();
  }, [active, ...deps]);

  return ref;
}

const AVATAR_SVG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect width="96" height="96" rx="48" fill="#dbeafe"/><circle cx="48" cy="36" r="16" fill="#64748b"/><path d="M16 88c0-18 14-30 32-30s32 12 32 30" fill="#64748b"/></svg>`
  );

const BANNER_SVG =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 160"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d1fae5"/><stop offset="1" stop-color="#a7f3d0"/></linearGradient></defs><rect width="600" height="160" fill="url(#g)"/><circle cx="520" cy="30" r="60" fill="#ffffff" opacity="0.4"/><circle cx="120" cy="130" r="80" fill="#ffffff" opacity="0.3"/></svg>`
  );

const VARIANTS = [
  {
    name: 'Ada Lovelace',
    handle: '@ada',
    bio: 'First programmer in history. Wrote the first algorithm for the Analytical Engine and pioneered computing.',
    stats: ['312 posts', '8.2k following', '129k followers'],
  },
  {
    name: 'Grace Hopper',
    handle: '@amazinggrace',
    bio: 'Rear admiral and computer scientist. Invented the compiler, coined "debugging" and led COBOL.',
    stats: ['128 posts', '1.4k following', '98k followers'],
  },
  {
    name: 'Alan',
    handle: '@turing',
    bio: 'Father of computer science and AI.',
    stats: ['54 posts', '210 following', '203k followers'],
  },
] as const;

export interface ProfileCardProps {
  /** Changing the variant re-renders content with different text lengths. */
  variant?: 0 | 1 | 2;
  className?: string;
}

/**
 * The demo UI that every live example skeletonizes — a small social profile
 * card with banner, avatar, text, buttons and a stats row.
 */
export function ProfileCard({ variant = 0, className = '' }: ProfileCardProps) {
  const v = VARIANTS[variant];
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm ${className}`}
    >
      <img
        src={BANNER_SVG}
        alt="Profile banner"
        className="h-24 w-full object-cover"
        draggable={false}
      />
      <div className="px-5 pb-5">
        <div className="flex items-end justify-between">
          <img
            src={AVATAR_SVG}
            alt="Avatar"
            className="-mt-8 h-16 w-16 rounded-full border-4 border-white object-cover"
            draggable={false}
          />
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-sm font-medium text-white"
            >
              Follow
            </button>
            <button
              type="button"
              className="rounded-lg border border-zinc-300 px-3.5 py-1.5 text-sm font-medium text-zinc-700"
            >
              Message
            </button>
          </div>
        </div>
        <h3 className="mt-3 text-lg font-semibold text-zinc-900">{v.name}</h3>
        <p className="text-sm text-zinc-500">{v.handle}</p>
        <p className="mt-2 text-sm leading-6 text-zinc-600">{v.bio}</p>
        <div className="mt-4 flex gap-5 border-t border-zinc-100 pt-3">
          {v.stats.map((s) => (
            <span key={s} className="text-xs font-medium text-zinc-500">
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
