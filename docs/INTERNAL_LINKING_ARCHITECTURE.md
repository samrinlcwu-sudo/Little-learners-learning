# Internal Linking & Learning Discovery Architecture

Prompt 71. This doc covers what changed and, just as importantly, what
was reviewed and found already correct — most of the discovery system
the brief asks for already existed from Prompts 9–70; this prompt filled
in the real gaps and documents the rest as confirmed, not rebuilt.

## What already existed (confirmed, not touched)

- **Learn ↔ Resources ↔ Games**: `/learn/[category]` already showed real,
  category-matched resources and games with graceful empty states, plus
  a `LearningJourneySteps` "Learn → Practice → Play" flow
  (`src/lib/learning-journey.ts`) and a "Related categories" rail.
- **Resource ↔ Game**: the resource detail page already links to a
  category-matched game ("Practice the same skill with a game") and the
  game detail page already links back to a category-matched resource.
- **Resource ↔ Article** and **Article ↔ Resource**: built in Prompt 69 —
  an article's `relatedResourceSlugs` links forward to real resources, and
  the resource page computes the reverse link honestly (searches published
  articles for one that actually names its slug).
- **Article ↔ Category**: an article's optional `category` field already
  rendered as a linked badge to `/learn/[category]` on the article page.
- **Breadcrumbs**: every detail page (`resources/[resource]`,
  `games/[game]`, `blog/[article]`, `learn/[category]`) already renders a
  real `<Breadcrumb>` with matching `BreadcrumbList` structured data
  (`src/components/ui/breadcrumb.tsx`) — confirmed consistent across all
  four, no changes needed.

## What was missing, and what this prompt added

Three real gaps existed in the article ↔ category ↔ game ↔ resource web —
each filled using only existing content, matched by real category slugs,
never a fabricated connection:

1. **Learn category pages had no articles section at all.** Added
   "Articles for parents and teachers" to `/learn/[category]` — real
   published articles filtered by `article.category === category.slug`,
   rendered with `BlogArticleCard`, with the same graceful `EmptyState` +
   "Browse the blog" CTA pattern the existing Games/Resources sections on
   that same page already use (so it doesn't read as a new, differently-designed
   component bolted onto an established page).
2. **Game detail pages had no link to blog content.** Added "From the
   blog" — a single, category-matched published article, mirroring the
   resource page's own "From the blog" section verbatim in heading and
   layout.
3. **Blog article pages had no link to games.** Added "Practice the same
   skill with a game" — a single, category-matched published game,
   mirroring the resource page's own game section verbatim.

All three use **category matching** (`article.category === game.category`),
not a new explicit "related game/article" field — `BlogArticle.category`
and `Game.category`/`Resource.category` already exist for exactly this
purpose. Adding a fourth hand-authored cross-reference field would have
been unnecessary duplication of a connection the data already expresses.
Where an article has no `category` (e.g. `building-a-calm-morning-routine`,
which is `classroom-ideas`-only guidance with no child-facing subject
counterpart), no game section renders at all — never a forced or
irrelevant connection. This is the direct, working proof of the brief's
own two examples ("An article about early literacy could connect to...";
"An article about life skills could connect to..."): the
`counting-through-everyday-play` article (category: `mathematics`) now
connects to the Mathematics learning category, the "Count the Fruits"
game, and the "Counting Animals Worksheet" resource — a real, four-way
web through one shared category slug, not four separately maintained links.

4. **The homepage never mentioned the blog.** It's in `primaryNav` (so
   it's never orphaned), but nothing on the homepage itself pointed to it.
   Added "Read the Blog" to the existing closing CTA button row (one line
   in an existing list, not a new section) — the smallest change that
   closes the gap without disturbing an already-designed page.

## Why "More for this age group" wasn't built as its own component

The brief lists it as one of several discovery components to add "where
appropriate." Every learning category already has its own fixed age
range, and each category's resources/games are already effectively
age-scoped by belonging to that category — a dedicated cross-type,
cross-category age-band recommender would, with the current small sample
library (1–3 items per category), mostly produce sparse or empty
sections. Building a visible new component that would show an empty
state almost everywhere today isn't "graceful" the way the brief asks
for — it's noise. This is a deliberate scope decision, not an oversight.

## URL structure review

Reviewed every real route for readability, descriptiveness, consistency,
and stability. Finding: **no changes needed, and none were made.**
`/resources/[slug]`, `/games/[slug]`, `/blog/[slug]`, `/learn/[category]`,
`/teachers/p/[slug]` all follow the same flat, kebab-case,
human-readable pattern already. No URL was renamed, so no redirect logic
was needed — exactly the brief's own preference ("avoid unnecessary URL
changes").

## Orphan-page check

Every real content page is reachable from at least one real internal
link: category pages from `/learn` and every resource/game/article's own
category badge; resource/game/article detail pages from their respective
hub listing (`/resources`, `/games`, `/blog`) plus the new cross-links
above; `/about`, `/faq`, `/support`, `/privacy`, `/terms` from
`footerNav`; `/admissions`, `/parents`, `/teachers` from `primaryNav`.
`/style-guide` has no public link — confirmed intentional (a dev-only
component reference, not a content page meant for discovery). No genuine
orphan was found or needed fixing.

## SEO / AEO

- Every new link is a real `<a>` (via `next/link`) present in the
  server-rendered HTML — fully crawlable, no client-only link injection.
- Category discovery: a crawler reaching any single article, resource, or
  game can now always reach its learning category, and from there every
  other resource/game/article in that same subject — closing what would
  otherwise be a topic-siloed link graph.
- No structured data changed in this prompt — `BreadcrumbList`,
  `LearningResource`, `Game`, `BlogPosting`/`FAQPage`, and `Person`/
  `Organization` author schema (Prompt 70) were all already correct and
  are unaffected.

## Design

Each new section reuses that content type's own existing card
(`BlogArticleCard` for articles, `GameCard` for games) rather than a
generic list — so a "From the blog" section on a game page looks
distinctly like a blog card (secondary/terracotta tone, newspaper icon),
not a re-skinned game card. This is the brief's "do not make every card
visually identical" requirement, already satisfied by reusing each
family's established visual identity rather than inventing a new
"generic related item" card type.

## Testing

No new unit-testable logic was introduced — every addition is a direct
reuse of already-tested gates (`isArticlePublished`, `isGamePublished`,
`isResourcePublished`) and existing card components, composed with plain
`.filter()`/`.find()` by category slug. Verified via the full existing
suite (249 tests, unchanged pass count) plus a production build that
successfully statically generated all 16 category pages, all published
games, resources, and articles — proving every category/game/article
combination (including the ones with no match, which render their
graceful empty state or simply omit the optional section) builds without
error. Live-verified in the browser: the Mathematics category page shows
its real article; a category with none (Creativity) shows the graceful
empty state with a working "Browse the blog" link; the "Count the
Fruits" game and "Counting Through Everyday Play" article now link to
each other in both directions; the homepage's new "Read the Blog" button
resolves to `/blog`; mobile layout confirmed responsive; no new console
errors.
