# Core Web Vitals & Performance Audit (Prompt 79)

A full inspection of the framework, rendering strategy, bundles, images,
fonts, animations, and caching, followed by two targeted fixes. Most of
what was inspected was already correct and is recorded here as
"confirmed, not changed" — this audit does not rebuild or replace any
architecture.

## What was already correct (inspected, no change needed)

- **Rendering strategy**: every `page.tsx` is a server component; no page
  is itself `"use client"`. Content pages are statically prerendered
  (`○`/`●`) wherever the content is known at build time; only pages that
  genuinely depend on query params (`/resources`, `/blog`, `/search`,
  `/offerings`, `/teachers`) are server-rendered on demand (`ƒ`) — correct
  use of each mode, confirmed via a full production build's route table.
- **Fonts**: `next/font/google` (Fraunces + Inter) — self-hosted at build
  time, no render-blocking font request, no CLS from font swap. Already
  optimal.
- **Images in cards**: `resource-card`, `game-card`, and
  `blog-article-card` render no thumbnail images at all (icon+text
  design) — zero CLS risk from image loading on any listing page.
  Teacher photos (`teacher-directory-card.tsx`) live in a fixed `size-14`
  container regardless of whether a photo loads, so there's no shift
  there either.
- **Logo usage in the header/footer/auth screens**: already `next/image`
  with explicit `width`/`height` and `priority` only on the
  above-the-fold header instance — correct LCP/CLS handling, confirmed by
  reading all three call sites.
- **Bundle size**: total client JS across the entire site is ~2MB raw;
  the largest single chunk (~96KB gzip) is the React/Next runtime itself,
  not application code. No bloated dependency found in any shipped chunk.
- **`@supabase/ssr` / `@supabase/supabase-js`**: listed in
  `package.json` but their only importers (`src/lib/supabase/client.ts`,
  `server.ts`) are never imported anywhere in the app — confirmed via a
  full-repo import search. They contribute **zero bytes** to any shipped
  bundle today; removing them would be a dependency-hygiene change, not a
  Core Web Vitals fix, so they were left alone.
- **Client-side search/filter components** (`learning-content-browser.tsx`,
  etc.): un-debounced, but operating over single-digit item counts
  (7 resources, 6 games, 4 articles today) — adding debounce/memoization
  here would be optimizing a cost that doesn't exist yet, not fixing a
  genuine problem.
- **Animations**: `tailwindcss-animate`-driven fade/zoom transitions on
  Radix dialogs, and static (non-animated) inline SVG decorative blobs.
  No JS-driven or heavy CSS animation anywhere.
- **Third-party scripts**: none exist on any public page.
- **Caching**: static asset caching is Next's own default (immutable,
  hashed filenames under `_next/static`) — already correct with no config
  needed. No API routes exist to cache (no backend), so "API caching" and
  "database queries" don't apply to this codebase yet.

## Real problems found and fixed

### 1. Oversized brand image served unoptimized as favicon and OG image

`public/brand/little-learners-learning-logo.png` is a 1254×1254,
**~2.3MB** file. It's used correctly (via `next/image`, small and
optimized at request time) in the header, footer, and auth screens — but
two other places referenced the raw file **directly**, bypassing Next's
image optimizer entirely, because favicons and OG images are fetched by
browsers/crawlers as plain static URLs, not through `<Image>`:

- `src/app/layout.tsx`'s `icons.icon` — fetched by every browser on every
  page load.
- `src/lib/seo/social-metadata.ts`'s `OG_IMAGE.url` — already declared as
  `512×512` in its own metadata, so every social crawler was fetching a
  2.3MB file for what the metadata already claimed was a 512×512 image.

**Fix**: generated two real derivatives of the same artwork (via `sharp`,
already a project dependency) — no new design, no cropping, same logo:

| File | Before | After |
|---|---|---|
| Favicon (served as `/favicon.ico` via Next's icon route) | 2.3MB (full logo file) | 25.9KB |
| OG/social image | 2.3MB (full logo file, mismatched vs. its own declared 512×512 metadata) | 135KB, actually 512×512 |

Both measured live against the production build, not estimated.

### 2. The AI assistant's chat panel was in the eagerly-loaded bundle on every page

`AiAssistant` (mounted once in the root layout, so it's present on every
public page) unconditionally rendered its full chat dialog — including
`useChildProfiles`, `useProgressEvents`, `useTeacherProfile`,
`useTeacherResources`, `useAiConversation`, and the parent/teacher
"home view" sections with their own knowledge-lookup calls — regardless
of whether the dialog was ever opened. Because it was a plain (not
dynamic) import in `layout.tsx`, all of that code and its transitive
imports shipped as part of the JS bundle loaded on every page, for every
visitor, even the majority who never open the assistant.

**Fix**: split the component. `ai-assistant.tsx` now only holds the tiny
context provider and trigger (a few hundred bytes); the actual dialog UI
moved to a new `ai-assistant-panel.tsx`, loaded via `next/dynamic(() =>
import("./ai-assistant-panel"), { ssr: false })` and mounted only once a
visitor actually clicks a trigger (`hasOpened` gate — stays mounted after
that, so conversation state and close animations behave exactly as
before). No behavior change; verified live against the production build:

- A fresh page load issues **zero** requests for the panel's chunk
  (confirmed via the network log on a clean homepage load).
- Clicking "Ask the assistant" triggers exactly one new request for
  `.../2a7mh4c_knmz_.js` (24.5KB raw / **7.5KB gzip**) and the dialog
  opens correctly, with the same content, prompts, and behavior as
  before the split.
- No leftover heavy code (child/teacher knowledge lookups, conversation
  hooks) was found in the eager bundle — confirmed by grepping the
  post-split eager chunk for panel-only identifiers (none found) and the
  lazy chunk for the same identifiers (all found there).

## Testing performed

- `npx tsc --noEmit` — clean.
- `npx vitest run` — 46 files, 289 tests, all passing (unchanged — this
  was a metadata/bundling change, no test logic needed to move).
- `npx eslint .` — clean.
- `npx next build` — clean, all 71 routes generated, twice (once to
  measure the "before" baseline chunk, once after the fix).
- Live, against the actual production server (`npm run start`, not dev
  mode): verified the favicon and OG image now serve the small
  derivatives with correct byte counts; verified the assistant panel
  chunk is not requested on page load and is requested exactly once when
  opened; verified the dialog still opens and behaves identically.
- Visual: screenshotted the homepage at desktop and mobile (375px) widths
  after all fixes — colorful, warm hero, decorative blobs, and card
  grids all render exactly as before. No visual regression from either
  fix (both are invisible-by-design: same logo artwork at a correct
  size, and a modal that now loads its code slightly later than before
  but looks and behaves identically once open).

## Not changed

No architecture was replaced. No feature was removed. No visual design
was altered. The two fixes are additive (new small image derivatives) and
structural-only (a code-split with an identical public API and identical
runtime behavior).
