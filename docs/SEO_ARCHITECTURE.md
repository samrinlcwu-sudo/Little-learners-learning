# SEO & AEO Architecture

Introduced in Prompt 24. This isn't a plan to rank #1 for anything — it's
the technical groundwork so search engines and answer engines (AI-powered
search, voice assistants) can actually understand what this site is,
crawl it correctly, and keep private pages out of results. Nothing here
guarantees a ranking; nothing here is written for a crawler instead of a
person.

## The one rule everything else follows

**Write for the parent or teacher reading the page. If it also happens to
help a search engine, good — but never the other way around.** No keyword
repetition, no invented statistics or reviews, no page created just
because a keyword exists. Every page on this site already had a real
reason to exist before this prompt; this prompt made sure search engines
can find and understand it, not the reverse.

## Where page metadata lives

Every route's `page.tsx` exports a `metadata` object (or
`generateMetadata` for dynamic routes like `/learn/[category]`) — title,
description, canonical URL, and social preview data, right next to the
page it describes. There's no separate "SEO settings" file to keep in
sync with the actual content; the metadata and the page it describes can
never drift apart because they live in the same file.

```tsx
// The shape every public page follows
const description = "One clear sentence, written for a person.";

export const metadata: Metadata = {
  title: "Page Name", // becomes "Page Name — Little Learners Learning" via the root layout's title template
  description,
  alternates: { canonical: `${siteConfig.url}/page-path` },
  ...buildSocialMetadata("Page Name — " + siteConfig.name, description, "/page-path"),
};
```

`src/lib/seo/social-metadata.ts`'s `buildSocialMetadata()` exists because
Next.js treats `openGraph`/`twitter` as whole objects — a page that sets
its own `openGraph` **replaces** the site-wide default in
`src/app/layout.tsx` entirely rather than merging into it. Calling this
helper instead of writing `openGraph`/`twitter` by hand means a page can
never accidentally lose the site's logo or type/locale fields just
because it only meant to override the title.

## Titles and descriptions

`src/app/layout.tsx` sets a title template
(`"%s — Little Learners Learning"`), so every page only needs to name
itself (`title: "Games"`) — the brand suffix is automatic and consistent.
Every public page's title and description are unique and describe that
specific page (verified: no two pages in `src/app` share a title string).
Dynamic pages (`/learn/[category]`, `/resources/[resource]`,
`/games/[game]`) generate their title/description straight from the real
content record (`category.name`, `resource.description`, ...) via
`generateMetadata` — a new resource or game gets a correct, unique title
automatically, nobody has to remember to write one.

## Sitemap and robots

- `src/app/sitemap.ts` is **hand-curated**, not a scan of every file in
  `src/app`. It lists the homepage, the primary nav pages, `/support` and
  `/faq` explicitly (neither is in the header nav), every learning
  category, and every published resource and game. A route only appears
  here if it's genuinely meant to be found via search — adding a new
  page here is a deliberate choice, not automatic.
- `src/app/robots.ts` allows everything (`allow: "/"`) and points to the
  sitemap. It does **not** disallow the private routes below — see
  the next section for why. It does disallow `/admin` specifically
  (Prompt 68) as defense in depth on top of every admin page's own
  `noindex` meta tag — see "Keeping private pages private" below for why
  admin gets a `robots.txt` block while account/dashboard pages don't.
- A search-results-style page (`/search`, Prompt 72) is **not** disallowed
  in `robots.txt` — it deliberately sets `robots: { index: false, follow: true }`
  in its own metadata instead, so a crawler can still reach it and follow
  the real resource/game/article/category links it points to, without the
  search page's own infinite query/filter URL combinations ever being
  indexed themselves.

## Keeping private pages private

Every page that shouldn't appear in search results sets
`robots: { index: false, follow: false }` directly in its own metadata:
sign-in, sign-up, forgot/reset password, account, dashboard, the
child-specific dashboard route, every `/admin/*` page, every
`/teachers/register*` step, the teacher dashboard, the teacher's own
public profile route (`/teachers/p/[slug]` — see below for why that one's
different), and the internal style guide. `terms` and `privacy` use
`follow: true` since they're genuine (if still-unwritten) legal pages,
not private account surfaces.

This is a per-page `<meta name="robots">` tag, not a `robots.txt`
disallow rule — deliberately. A `robots.txt` disallow **blocks crawling
entirely**, which can leave a bare, description-less URL sitting in
search results (Google still lists a page it was told not to crawl if
something links to it — it just can't show a snippet). A `noindex` meta
tag is crawled, understood, and then correctly left out of results
altogether. `docs/ACCOUNTS_ARCHITECTURE.md` and
`docs/PROGRESS_ARCHITECTURE.md` cover why these specific pages hold
nothing worth indexing in the first place: child and account data never
leaves the browser it was entered in, so there's nothing on the server
side to accidentally expose even if this were misconfigured.

`/teachers/p/[slug]` is the one route that's genuinely public content
(a teacher's own profile) but stays `noindex` anyway — not because it's
private, but because `generateMetadata` runs server-side and, with no
shared backend yet, has no way to know whether the profile behind a given
slug is actually public, private, or exists at all (see
`docs/TEACHER_ARCHITECTURE.md`). It becomes indexable per-profile the
moment a real lookup replaces the local-only one.

## Structured data (schema.org)

Only added where it accurately describes something already visible on
the page — never a rating, review, price, or organization detail that
isn't real.

| Schema | Where | Source |
|---|---|---|
| `Organization` + `WebSite` | Every page (`src/app/layout.tsx`) | `src/components/patterns/site-structured-data.tsx` — name, url, logo only; no fake founding date or social profiles |
| `BreadcrumbList` | Every page with a breadcrumb trail | `src/components/ui/breadcrumb.tsx` — generated from the exact same `items` prop that renders the visible trail, so it can't drift from what a visitor sees |
| `FAQPage` | `/faq`, and any `/blog/[article]` whose real `faq` array is non-empty | Built directly from the same array the visible accordion/FAQ section renders — a schema can never claim a question exists that isn't actually on the page |
| `LearningResource` (+ `Book` for ebooks) | `/resources/[resource]` | Every field maps to a real field on the `Resource` record — no ratings |
| `LearningResource` + `Game` | `/games/[game]` | Same pattern, from the `Game` record |
| `BlogPosting` | `/blog/[article]` (Prompt 69) | Real title/excerpt/dates from the `BlogArticle` record — see `docs/BLOG_ARCHITECTURE.md` |
| `Person` (author) / `Organization` (author) | Any resource/article's `author` field, and the teacher's own `/teachers/p/[slug]` page | `src/lib/seo/author-schema.ts` (Prompt 70) — `Person` only for a real named teacher, `Organization` for the platform itself; never the reverse. The teacher's own profile page gets a full `Person` schema built only from fields they actually entered (`knowsAbout` from their real subjects/expertise) — see `docs/AUTHOR_ARCHITECTURE.md` for why `image`/`alumniOf` are deliberately excluded |
| `ItemList` | `/resources`, `/games`, `/blog`, `/teachers` (directory), `/search` | Names only the items actually rendered on that page of results — never claims more exists than a visitor (or crawler) can see |

`Article` now legitimately exists (as `BlogPosting`, its more specific
subtype) for real blog content added in Prompt 69 — it's still never used
for a service page like `/about`, which isn't a post or article. No
`Review`/`AggregateRating` exists anywhere because no reviews exist.

## AEO: writing for answer engines

An answer engine (AI-powered search, a voice assistant) generally works
by finding a page that already states something plainly and lifting that
statement — so the best AEO investment is exactly the kind of clear,
direct writing that already helps a human skim the page. In practice,
this means:

- Answer the obvious question in the first sentence or two under a
  heading, not three paragraphs in.
- Use a real heading for each distinct question or sub-topic
  (`/learn/[category]`'s "What this covers" section, `/faq`'s
  question-per-`<AccordionItem>` structure) rather than burying multiple
  answers under one generic heading.
- State facts as facts ("Every game is free and doesn't require an
  account") instead of vague marketing language — vague language has
  nothing for an answer engine (or a person) to quote.
- Never write a sentence whose only purpose is to repeat a keyword — if a
  sentence doesn't help the person reading it, remove it, regardless of
  what it might do for a crawler.

`/faq` is the clearest existing example: 21 real questions, each with a
direct, factual, one-paragraph answer, each honestly distinguishing
what's live today from what's planned. That page needed no rewriting for
this prompt — it already was AEO-friendly, because it was written
honestly for a person in the first place.

## How to add a new page without hurting SEO

1. Give it a unique `title` and a one-sentence `description` that
   actually describes it (not the site in general).
2. Add `alternates: { canonical: ... }`.
3. Spread `...buildSocialMetadata(...)` so it gets a real social preview.
4. If it's genuinely public and worth someone finding via search, add it
   to `src/app/sitemap.ts`. If it's private (an account/dashboard-style
   page), set `robots: { index: false, follow: false }` instead — never
   both, and never neither.
5. Only add structured data if a real schema.org type accurately matches
   what's on the page. When in doubt, add none — inaccurate schema is
   worse than no schema.
6. Don't create a page just because a keyword exists. Every page here
   was built because a parent or teacher needed it; the URL structure
   and title were written afterward to describe it clearly, not the
   other way around.

## What "avoid keyword stuffing" means in practice here

Every learning category already has a name and description written
once, in `src/config/learning-categories.ts`, and reused everywhere it
appears (the homepage, `/learn`, the category page, search results,
related-content lists) — never rewritten with slightly different keyword
variations per surface. That's the actual discipline: one honest
description per real thing, reused consistently, not padded with
synonyms “for SEO.”

## Prompt 74: technical SEO foundation audit

A full audit of every real route's metadata (title/description/canonical/
social/robots), the sitemap, robots.txt, structured data, headings, and
image alt text, done after Prompts 69–73 added the blog, author
credibility, internal linking, and search systems. Found and fixed three
real gaps: `/games/[game]`, `/learn/[category]`, and `/offerings/[slug]`
all had a correct canonical URL but no `buildSocialMetadata()` call, so
sharing any of those pages produced a blank or wrong social preview card.
Everything else audited — sitemap contents, `robots.txt`, per-page
`noindex` coverage, canonical URLs on every faceted listing page (they
correctly point to the clean base URL regardless of query params),
structured data accuracy, heading structure, and `alt` text — was already
correct; this doc's own structured-data table and "Keeping private pages
private" list were the things actually out of date (both fixed above to
reflect Prompts 68–72's real additions).

**Deliberately not built**: a new `buildPageMetadata()` helper that would
wrap title/description/canonical/social into one call. Every page already
produces correct, consistent metadata through the existing manual pattern
plus `buildSocialMetadata()` — confirmed by this audit, not assumed.
Introducing a new abstraction and retrofitting it across 20+ existing
page files would be exactly the unnecessary rebuild this prompt's own
"do not rebuild the project" instruction warns against, for a
consistency problem that doesn't actually exist today.

## Prompt 76: on-page content audit

A page-by-page content audit (title, H1/H2 hierarchy, intro copy, alt
text, internal links) across the homepage, About, category pages,
resource/game/blog pages, and teacher profiles — checking for keyword
stuffing, generic filler, repetitive meta-description templates, and
missing on-page elements, not just the technical metadata Prompt 74
already covered. Found one real, if small, content gap: `/about`'s "What
we offer" list was written before the blog existed (Prompt 69) and never
mentioned it — of the platform's five real content formats, only four
were listed. Added a fifth "The Blog" entry, matching the same one-line,
non-promotional description style every other entry already uses. No
other page needed a content change: titles/descriptions are already
unique per record (never a shared template), alt text already describes
each image's real purpose (`"Cover of {title}"`, a person's own name for
a profile photo) rather than a keyword-stuffed string, heading hierarchy
on every audited page has exactly one H1 with a logical H2/H3 structure
and no decorative heading misuse, and every dynamic page's copy already
comes from that specific record's own real fields rather than a
generated template — confirmed again, not rewritten.
