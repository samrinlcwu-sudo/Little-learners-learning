# Search & Content Discovery Architecture

Prompt 72. Read `docs/INTERNAL_LINKING_ARCHITECTURE.md` first — that
prompt connected content to *itself*; this one connects a visitor's
*query* to all of it at once. A real, working quick-search already
existed (`src/components/patterns/site-search.tsx`, `src/lib/search/index.ts`,
introduced earlier) — this prompt extends it and adds the one thing it
couldn't do: filters, sorting, and pagination, which only make sense on a
real page, not a small dropdown.

## What already existed (extended, not replaced)

`SiteSearch` — the header's ⌘-style quick-search dialog — was already a
real, working, in-memory substring search over pages, subjects, resources,
and games. It didn't index blog articles (a real gap, since the blog
launched after it did — Prompt 69) and ranked results only by array
order, not relevance. Both are fixed in place, not rebuilt: `SEARCH_INDEX`
now includes published articles, and `searchSite()` now ranks through the
same relevance function the new full search page uses.

## The relevance model

`src/lib/search/relevance.ts` — `scoreSearchMatch()` is a small, fully
transparent, rule-based scorer directly implementing the brief's stated
priority order:

1. Title (exact match > starts-with > contains)
2. Category
3. Educational topic/subject
4. Age-group (only when the searcher gave a target age)
5. Description

Every weight is a fixed constant, applied identically to every item —
nothing here is randomized, nothing is "boosted" for being newer,
featured, or paid. A score of `0` means "no real match," and every caller
drops those entirely rather than padding a result count with irrelevant
items. `rankBySearchMatch()` scores a list, drops zeros, and sorts
highest-first with a stable tiebreak (original order preserved for equal
scores) — used identically by the quick-search dialog and the full
`/search` page, so "how results are ordered" is one tested function, not
two different heuristics that could quietly diverge.

## The new `/search` page

`src/app/search/page.tsx` is a server-rendered, `searchParams`-driven page
— the same GET-form pattern `/resources` already established, so it works
without JavaScript and its results are real, crawlable HTML. It searches
across four real content types — Resources, Games, Articles, Learning
areas — using each type's own **existing, already-tested publish gate**
(`isResourcePublished`, `isGamePublished`, `isArticlePublished`) plus the
same structural filters those types' own hub pages already use
(category, age, resource type, access tier). The one genuine gap this
closed: **games had no shared, published-only filter function** —
`src/lib/games/filters.ts` (`filterGames`/`sortGames`/`paginateGames`) is
new, mirroring `resources/filters.ts` and `blog/filters.ts` exactly, so
all three content types now share one consistent filtering shape.

**Two views, depending on whether a specific type is selected:**

- **"Everything" (default)** — a sectioned overview: up to three
  top-ranked results per content type, each section's own real card
  component (`ResourceCard`, `GameCard`, `BlogArticleCard`, a new small
  `CategoryResultCard`), with a "View all N" link to that type's own
  filtered, paginated tab when there are more than three.
- **A specific type tab** (Resources/Games/Articles/Learning areas) — a
  full, paginated grid using that type's real page size and pagination
  function, with only the filters that actually apply to it (Resource
  type only shows for Resources; Access only shows where the content
  actually carries an access tier).

### A real bug found and fixed during testing

Live-testing surfaced a genuine bug: searching a term that matched, say,
only Categories and Articles but *not* Resources, then clicking the
"Resources" tab, rendered a bare "0 resources" heading with no real empty
state below it — the page only checked whether the *combined* total
across all four types was zero, not whether the *currently selected* tab
had any matches. Fixed by computing an `activeCount` that reflects
whichever tab is actually showing, and the empty state now also tells the
visitor when a match exists in a different tab ("this search does have
matches, just not in this category") rather than a dead end.

## Filters

- **Learning area**: all 16 real categories (`getAllLearningCategories()`).
- **Age**: the same 2–8 numeric range every existing browse page
  (`/resources`, `/games`) already uses — not a new age-group taxonomy.
- **Resource type**: only types that actually exist among published
  resources today (mirrors `/resources`'s own `availableTypes` logic) —
  never an option guaranteed to return zero results.
- **Access (Free/Premium/Membership)**: reuses the exact filter
  `/resources` already has. This is *not* a new feature this prompt
  introduced — `accessTier` is real, existing data on every resource and
  game, and filtering by it is metadata filtering, not a working paywall.
  Nothing about checkout or payment is implied or connected; the brief's
  caution against inventing premium functionality doesn't apply to
  reusing a filter that already shipped.

## Why there's no fake loading or error state

Every result on `/search` comes from a synchronous filter over in-memory
arrays — there is no network request to fail slowly, and nothing that
could hang. Rather than fabricate a spinner or a retry button for an
operation that can't meaningfully be slow, `loading.tsx` follows the same
convention every other route segment in this codebase already uses (a
skeleton for the brief moment of the route transition itself, not a
"searching…" state that would be dishonest for an instant operation), and
`error.tsx` is the same real `retry()`-based safety net every other page
has, for a genuine unexpected render error rather than a specific search
failure that can't actually occur here.

## SEO

`/search` sets `robots: { index: false, follow: true }`. A search page's
own URL is never a stable, unique piece of content — every `q`/filter/page
combination is a different view of the same underlying data, exactly the
"endless crawlable duplicate pages" the brief warns against indexing.
`follow: true` (deliberately *not* also disallowing the route in
`robots.ts`, unlike `/admin`) means a crawler that does reach `/search`
still passes crawl equity through to the real resource/game/article/category
pages it links to — the opposite goal from blocking a private area
entirely.

## AEO

Each result card carries the same real category/topic/age labels the
content's own detail page already shows — a machine-reading system
landing on a search results page sees the same entity relationships
(subject → resource → game → article) `docs/INTERNAL_LINKING_ARCHITECTURE.md`
already established, not a stripped-down list of titles.

## Performance

Every list here is a synchronous, in-memory filter over arrays with at
most a few dozen items — there is no API call to debounce, rate-limit, or
protect from a slow connection. The quick-search dialog re-filters on
every keystroke already, which is instant at this scale; adding a
debounce timer would add real complexity to work around a problem that
doesn't exist yet, not the honest choice this codebase otherwise makes.
Pagination (12 resources / 12 games / 9 articles per page, matching each
type's own existing page size) is real and load-bearing the moment the
catalog grows past a single page.

## Testing

`relevance.test.ts` (13 cases): every tier ranks above the one below it,
an empty or non-matching query returns nothing, age scoring only applies
when a target age is given and only when it falls in range, and ranking
is stable for ties. `games/filters.test.ts` (8 cases): the publish gate
(including the religious-review case), every filter individually, and
pagination — the same coverage `resources/filters.test.ts` and
`blog/filters.test.ts` already have. Live-verified: a query matching all
four content types shows correct per-section counts and top results; a
query matching only some types correctly hides empty sections in
"Everything" and shows the fixed empty state (not a bare "0 X" heading)
on a tab with no matches while other tabs do; the header quick-search
dialog now includes a "Blog" group and a working "See all results, with
filters →" link into the new page; mobile layout confirmed responsive;
typecheck, lint, the full test suite, and a production build all pass.
