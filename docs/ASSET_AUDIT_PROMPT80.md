# Image, Illustration & Asset Audit (Prompt 80)

A full inventory of every visual asset on the site — not just the images
Prompt 79 already touched — classified and checked against the audit list
below. The headline finding: this site's "rich children's educational
atmosphere" comes almost entirely from **code**, not image files — colour,
typography, native SVG, and emoji — which is why so little needed
changing here.

## Full asset inventory

`public/` contains exactly three files, all under `public/brand/`:

| File | Role | Size |
|---|---|---|
| `little-learners-learning-logo.png` | The one official logo — source artwork, resized on the fly by `next/image` everywhere it's shown | 2.3MB (1254×1254 source) |
| `favicon.png` | Small favicon derivative (added Prompt 79) | 4.3KB |
| `og-image.png` | 512×512 social-preview derivative (added Prompt 79) | 135KB |

There are no other logos, hero images, resource thumbnails, game
graphics, blog images, or background images anywhere in the codebase.
This isn't a gap — every content record's optional image field
(`Resource.thumbnail`, `Resource.preview`, `BlogArticle.thumbnail`) is
genuinely unset on every sample record today (confirmed by grepping
every sample-data file), so the pages that would show them already
render an honest "No cover yet" / "No preview available yet" empty state
instead of a broken image or a placeholder stock photo.

## Where the visual richness actually comes from

- **Icons**: `lucide-react` SVG components (82 usages across the app) —
  vector, colored via Tailwind classes, zero network requests.
- **Decorative shapes**: `DecorativeBlob` (`src/components/ui/decorative-blob.tsx`)
  — a single inline `<svg>` path, tinted per-surface, `aria-hidden="true"`
  built into the component itself.
- **Child avatars**: `ChildAvatar` renders a real emoji character inside a
  colored circle (`src/components/patterns/child-avatar.tsx`) — no image
  file, infinitely crisp, and already wrapped with `role="img"` +
  `aria-label` (the emoji itself is `aria-hidden`, so a screen reader
  hears the label once, not the label plus a redundant glyph).
- **Game visuals**: all 9 game components (`color-match-game`,
  `shape-match-game`, `memory-game`, `counting-game`, etc.) render their
  pieces with SVG/CSS/icons only — confirmed via a repo-wide search for
  `<img>`, `next/image`, or `background-image` inside `src/components/games`:
  none found.

None of this needed "optimizing" in the traditional sense (compress,
resize, lazy-load) because none of it is a raster asset. It's already the
lightest possible representation, and touching it would risk exactly the
"minimal corporate style" and "unrelated illustrations" the brief warns
against — a real photo or stock illustration would look *less* consistent
with this style, not more.

## Classification

1. **Critical above-the-fold**: the header logo — `next/image`,
   `priority`, fixed `40×40`. Correct as-is.
2. **Important content images**: none exist yet (see above) — nothing to
   classify until real resource/article images are added.
3. **Lazy-load candidates**: the footer logo (`44×44`) and the auth-shell
   logo (`48×48`) — both already plain `next/image` with no `priority`,
   which is lazy by default. Correct as-is.
4. **Decorative assets**: `DecorativeBlob` instances (inline SVG, several
   pages) and every `aria-hidden` lucide icon used purely for visual
   rhythm (82 usages audited).
5. **Unused assets**: none found. All three files in `public/` are
   referenced from real code (`site-header.tsx`, `site-footer.tsx`,
   `auth-form-shell.tsx`, `layout.tsx`, `social-metadata.ts`,
   `site-structured-data.tsx`) — confirmed via a full-repo reference
   search before touching anything, per the brief's "inspect before
   changing" instruction.

## What was optimized

**Modern image format delivery** (`next.config.ts`): Next's default is
WebP only. Added `images: { formats: ["image/avif", "image/webp"] }` —
AVIF is offered first (the optimizer picks whichever the requesting
browser supports), and it compresses this site's one real
photographic/gradient-heavy asset (the brand logo) meaningfully better
than WebP. Verified live against the production build: the header logo
now serves as `image/avif` to a browser that sends the standard
`Accept: image/avif,image/webp,...` header — **1,033 bytes**, versus
**2,959 bytes** for the same 48px request without AVIF support (~65%
smaller). This applies automatically to every current and future
`next/image` usage on the site with no other code change.

Everything else on the audit list — compression, responsive sizing,
explicit width/height, avoiding duplicate images, preloading only
critical assets — was already correct (confirmed, not changed):

- Every `next/image` instance already has explicit `width`/`height` (no
  CLS risk).
- No manual `<link rel="preload">` exists anywhere to over-preload; the
  header logo's automatic preload (via `priority`) is the only one, and
  it's genuinely above-the-fold.
- The three brand files are differently-*sized* derivatives of one
  source for three different real uses (inline UI logo, favicon,
  OG image) — not duplicate copies of the same thing.

## Accessibility

- Every meaningful icon (verified-teacher badge, star ratings, game
  prompt shapes/colors) carries a real `aria-label` or `role="img"` +
  `aria-label` — checked by listing every `aria-label` usage in the
  codebase (27 instances) and confirming each describes real,
  non-redundant information.
- Every icon-only button (mobile menu toggle, notification bell, close
  buttons, search icon) has `aria-hidden` on the icon and a `sr-only`
  label or `aria-label` on its interactive parent — checked every
  `<Menu>`/`<X>`/`<Search>`/`<Bell>` usage in the codebase (15
  occurrences) individually.
- No information anywhere is conveyed only through an image with no
  text/label equivalent — game components that use color/shape as the
  "answer" (color-match, shape-match) already label the prompt via
  `aria-label`, not just visually.
- All three real logo `<Image>` instances use `alt={siteConfig.name}` —
  meaningful, not empty, since the logo doubles as the site's identity
  mark in each context it appears.

## Testing performed

- `npx tsc --noEmit` — clean.
- `npx vitest run` — 46 files, 289 tests, all passing (no test logic
  touches image/config files).
- `npx eslint .` — clean.
- `npx next build` — clean, all 71 routes generated; `.next/images-manifest.json`
  confirmed to contain `"formats":["image/avif","image/webp"]`.
- Live, against the production server (`npm run start`): confirmed AVIF
  delivery and its byte-size improvement over the PNG fallback;
  screenshotted the homepage (desktop) and the sign-in page (mobile,
  375px, showing all three logo instances at once — header, centered
  auth logo, and footer) to confirm the logo's proportions and quality
  are unchanged after this prompt.

## Confirmed: no visual lost

Every page that had a visual before this prompt has the identical visual
after it. The only two files added are new derivatives of the existing,
unmodified logo; the only code change beyond Prompt 79's is one
`next.config.ts` addition and this doc. No component was removed, no
illustration was deleted, and the official logo file itself
(`little-learners-learning-logo.png`) was not touched, cropped, or
redesigned.
