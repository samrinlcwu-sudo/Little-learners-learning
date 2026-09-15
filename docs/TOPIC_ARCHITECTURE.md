# Learning Topic & Keyword Architecture

Prompt 75. Read `docs/LEARNING_ARCHITECTURE.md` (the 16 learning
categories) and `docs/INTERNAL_LINKING_ARCHITECTURE.md` (category-level
cross-linking, Prompt 71) first — this prompt adds one layer between
them: a **subtopic**, sitting between a learning category and the real
content that teaches it.

## Why this is data, not new pages

The brief's own example (`Early Literacy → Letter Recognition → Early
Writing → Printable Activities → Literacy Games → Parent/Teacher
Articles`) reads like a breadcrumb into a dedicated subtopic page. That
would mean a new route per subtopic — and with 16 categories, "do not
create hundreds of thin SEO pages" rules that out immediately for a
catalog this size (7 resources, 6 games, 4 published articles, 4 sample
lessons in total). A page with one or two links on it isn't a page worth
having; it's the exact "created because a keyword exists" pattern
`docs/SEO_ARCHITECTURE.md` already warns against.

Instead, `src/config/subtopics.ts` defines the subtopic layer as **data**,
and the existing `/learn/[category]` page (unchanged URL, unchanged
canonical) renders it as a real, new "Explore by subtopic" section — the
hierarchy the brief wants (Category → Subtopic → Resource → Game →
Article) becomes visible structure *within* an existing indexable page,
linking out to each item's own already-real URL, rather than a tree of
near-empty new ones.

## Built from real tags, not brainstormed keywords

Every subtopic in `learningSubtopics` was found by reading the `tags`
(on `Resource`/`LearningContent`/`BlogArticle`) and `skill` (on `Game`)
fields that already exist on real sample content — not the reverse. The
full audit, category by category:

| Category | Real tagged content found | Subtopic created? |
|---|---|---|
| Mathematics | `counting`/`numbers` (2 resources, 2 games), `shapes` (1 resource, 1 game) | **Counting & Numbers**, **Shape Recognition** |
| English & Early Literacy | `alphabet`/`phonics` (2 resources/content), `letter recognition` (1 game) | **Letter Recognition & Phonics** |
| Early Writing | `fine-motor`/`pre-writing` (1 resource) | **Pencil Control & Pre-Writing** |
| Life Skills | `independence`/`routines` (1 content item) | **Independence & Daily Routines** |
| Puzzles | `shapes`/`matching` (1 content item) | **Shape Matching** |
| Creativity | `color recognition` (1 game) | **Color Recognition** |
| Arabic Letters | `arabic`/`tracing` (1 resource, 1 game) — both still `religiousReview: "pending-review"` | **Arabic Letter Tracing & Recognition** (defined, but currently shows zero items on the live page — see below) |
| World Around Us, Science & Discovery, Social & Emotional Learning, Qur'an Learning — Nazra, Foundational Qur'an Reading, Educational Activities, Mazes, Coloring, Learning Games | No content tagged with a subtopic-level keyword yet | **None** — no entry exists in `subtopics.ts` for these today |

The last row matters as much as the others: nine of the sixteen
categories get **no** subtopic entry, because inventing one with nothing
real behind it would be exactly the fabrication this prompt forbids
("only create subtopics where genuine content exists or is planned").
Adding a real entry later is a one-line addition to `subtopics.ts` the
moment real tagged content exists for one of these — not a redesign.

## Why Arabic Letter Tracing shows no items live today

`Explore by subtopic` only renders items that pass the same publish gate
every other section on the page already uses
(`isResourcePublished`/`isGamePublished`, sourced from
`getCategoryJourney()`). The one resource and one game that would realize
the "Arabic Letter Tracing & Recognition" subtopic are both still
`religiousReview: "pending-review"` (Prompt 7's policy) — so the
subtopic's own matcher would find them, but the page's existing gate
correctly excludes them anyway, the same way it already excludes them
from every other section on this page. The subtopic definition exists
(honestly reflecting real, if unpublished, content); the live page shows
nothing for it until a qualified person verifies that content — never a
special case, just the same gate every other section already goes
through.

## How a subtopic is matched, without touching existing content

`subtopicMatchesTags()` and `subtopicMatchesSkill()`
(`src/config/subtopics.ts`) are pure functions that check whether an
item's own real `tags`/`skill` field overlaps a subtopic's `matchTags` —
no existing `Resource`, `Game`, `LearningContent`, or `BlogArticle`
record was modified to add this. The relationship is entirely derived,
the same "combine real data, don't add a field to it" technique
`buildParentRows()` (Prompt 65) and `buildAdminResourceRows()` (Prompt 67)
already established elsewhere in this codebase.

## Search intent, applied selectively

The brief lists six generic intents (learning, activity ideas,
worksheets, games, parent guidance, teacher guidance, age-specific) and
is explicit that "not every page" should target all of them. In practice:

- A **subtopic card** on `/learn/[category]` already surfaces whichever
  intents have real content — "Counting & Numbers" happens to link to a
  lesson, a worksheet, two games, *and* a parent article, because all
  five genuinely exist; "Shape Recognition" only links to an ebook and a
  game, because that's all that exists for it. Nothing was added to make
  every subtopic "complete."
- **Age-specific discovery** was already real before this prompt — the
  `age` filter on `/resources`, `/games`, and `/search` (Prompts 9, 14,
  72) lets a visitor narrow by age today. This prompt did not add a
  per-age-group *page*, per the brief's own "do not create empty age
  pages" — with 2–8 possible ages across a handful of items, most static
  age pages would render near-empty. The filter approach already
  satisfies "discovery by age... where supported by actual content"
  without that risk.

## SEO titles and meta descriptions: audited, not templated

Every dynamic page's title and description already come from that
specific record's own real `name`/`title`/`description` field
(`docs/SEO_ARCHITECTURE.md`), so two categories, two resources, or two
articles never produce the same title or a description built from a
shared template string — confirmed again in this audit. No new
templating was introduced for subtopics either: `subtopic.description`
is one real sentence per subtopic, written once, never repeated with
keyword variations across categories.

## AEO

The subtopic section directly states, in one place, the relationship a
crawler or answer engine needs: *this category → these specific skills →
these exact resources, games, and articles that teach each one*. Combined
with the existing `BreadcrumbList` and `ItemList` structured data on the
same page (unchanged by this prompt), the full chain — Organization →
WebSite → Learning Category → Subtopic → real linked content — is
explicit in both the visible page and the underlying HTML structure, not
inferred from keyword density.

## Testing

`subtopics.test.ts` (9 cases): category filtering, every subtopic
references a real category slug, tag matching (including
case-insensitivity and no-match), and skill-text matching. Live-audited
representative pages across categories with and without subtopics:

- **Mathematics** (has subtopics): correct title/canonical/OG tags,
  `BreadcrumbList` + `ItemList` schema present, "Explore by subtopic"
  shows two real subtopic cards linking to 5 and 2 real items
  respectively, all resolving to real, correct URLs (`/resources/...`,
  `/games/...`, `/blog/...`, `#content` anchor).
- **Life Skills** (has one subtopic): "Independence & Daily Routines"
  renders correctly.
- **Arabic Letters** (subtopic defined, but content still pending
  religious review): confirmed the section correctly shows nothing live,
  proving the gate composes correctly rather than needing a special case.
- **Science & Discovery** (no subtopics defined): section correctly
  omitted entirely — no heading, no empty state, nothing.

Ran typecheck, lint, the full Vitest suite (279 tests, 9 new), and a
production build — all clean, mobile layout confirmed responsive.
