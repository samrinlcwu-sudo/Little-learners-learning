# Blog Architecture

Introduced in Prompt 69, extended in Prompt 70 (`reviewer` field, real
author linking and structured data — see `docs/AUTHOR_ARCHITECTURE.md`)
Prompt 71 (category-matched cross-links to learning categories,
games, and resources — see `docs/INTERNAL_LINKING_ARCHITECTURE.md`), and
Prompt 72 (articles are now searchable from the header quick-search and
the site-wide `/search` page — see `docs/SEARCH_ARCHITECTURE.md`).
Built on the same primitives as the Resource Library
(`docs/RESOURCE_LIBRARY_ARCHITECTURE.md`) and the shared content model
(`docs/LEARNING_ARCHITECTURE.md`) — read those first, since `BlogArticle`
deliberately reuses their `ContentAuthor`, `PublicationStatus`,
`ReligiousReviewStatus`, and `AgeRange` types rather than redeclaring them.

## Why a new content type, not a `Resource`

A blog article isn't a downloadable resource — it has no file, no download
action, and no `ResourceType`. It's closer in spirit to `LearningContent`
(a `lesson`), but a lesson is content *for a child*; an article is content
*for the adult raising or teaching that child*. `BlogArticle`
(`src/lib/blog/types.ts`) is its own type for the same reason `Resource`
became its own type in Prompt 9 rather than reusing `LearningContent`
as-is: the two have enough genuinely different fields (`sections`,
`practicalExamples`, `faq`, `relatedResourceSlugs`, `audience`) that
bending one shape to cover both would need constant optional fields
neither side uses.

## Two categorization axes, not a duplicated taxonomy

An article needs a topic (`src/config/blog-topics.ts`) — audience-facing
buckets like "Classroom Ideas" or "Parent Guidance" that answer "what is
this piece of adult guidance about." This is a genuinely different
question from what `learning-category` slugs already answer ("what
subject does this teach a child"). Rather than declaring a second
15-entry taxonomy that mostly restates the first under new slugs (an
earlier draft of this feature would have had both `life-skills` categories
existing twice, under two different systems), `blogTopics` only holds the
topics that have **no existing home** in `learningCategoryGroups`: Early
Childhood Education, Preschool Activities, Classroom Ideas, Child
Development, Learning Through Play, Teacher Guidance, Parent Guidance,
Educational Technology & AI, and Qur'an & Nazra Learning Guidance.

Where the brief's suggested content areas *are* just the adult-facing
angle on a subject that already exists (Early Literacy, Early Mathematics,
Life Skills, Social & Emotional Learning, Science & Discovery, Educational
Activities), an article sets `BlogArticle.category` to that real
learning-category slug instead — the exact same "required primary field +
optional cross-link" shape `Resource.resourceType` + `Resource.category`
already uses, just with the required/optional roles swapped (a blog
article's `topic` is always required since a blog is inherently
adult-topic-driven; `category` is the optional add-on, since not every
article maps to a child's subject).

## Audience: reusing "For Parents" / "For Teachers", not inventing a third split

The brief's audience list (parents, preschool teachers, kindergarten
teachers, early childhood educators, education professionals) all
collapses onto the site's existing two-way split — `src/config/nav.ts`
already has exactly "For Parents" and "For Teachers," and everyone in that
longer list is either a parent or someone who teaches young children.
`BlogAudience = "parents" | "teachers"` reuses that split rather than
building a third taxonomy no other page in this codebase would ever read.

## Structured body, not a rich-text engine

`BlogArticle.sections` is an ordered array of `{ heading, paragraphs }`.
No markdown parser, no rich-text editor, and no `dangerouslySetInnerHTML`
for article bodies exist anywhere in this codebase — plain, structured
data rendered as real `<h2>`/`<p>` elements, the same "keep it plain, keep
it real" approach every other piece of content here already takes. This
also directly satisfies the brief's "clear headings" requirement — the
heading structure isn't decorative, it's the actual outline of the article.

## The sample articles: real, small, and honestly disclosed

`src/lib/blog/sample-articles.ts` holds five articles — the same "a
handful of clearly-marked SAMPLE content, not a real library" pattern
`SAMPLE_RESOURCES` and `SAMPLE_GAMES` already established, extended here
in the direction the brief explicitly demands for a blog: **do not
fabricate expert claims, statistics, testimonials, or credentials.**
Concretely, every sample article:

- Is authored by `{ name: "Little Learners Learning", role: "platform" }`
  — never an invented named person with invented credentials ("Dr. Jane
  Smith, child psychologist").
- Contains no invented statistics ("studies show 90% of..."). Where the
  content asserts something about how children learn, it stays qualitative
  and general (e.g. "young children build number sense through repeated
  practice"), not a specific unverifiable number.
- Contains no testimonials, reviews, or claims of awards/recognition.
- Two articles (`counting-through-everyday-play`,
  `building-a-calm-morning-routine`) cross-link to a real, already-existing
  `SAMPLE_RESOURCES` entry via `relatedResourceSlugs` — real internal
  linking between two real pieces of sample content, never an invented
  connection. The resource detail page (`src/app/resources/[resource]/page.tsx`)
  computes the reverse link honestly: it searches published articles for
  one that names the current resource's slug, rather than the reverse link
  being a separate, hand-maintained field that could drift out of sync.
- `introducing-nazra-reading-at-home` is deliberately left
  `religiousReview: "pending-review"` — its topic
  (`quran-nazra-guidance`) requires human verification before publishing,
  the exact same policy Prompt 7 established for children's Qur'an/Arabic
  content, extended here to adult-facing guidance about the same subject.
  `isArticlePublished()` hides it from every listing until a qualified
  person marks it `"verified"` — see `types.test.ts`.

This is a small, real, checked-in set — proof the architecture (listing,
filtering, detail rendering, FAQ, structured data, related-content
linking) works end to end, not an attempt to "fill the website" with
volume.

## Why there's no progress-tracking on an article page

The Resource and Game detail pages both use `<TrackPageView>`
(`src/components/patterns/track-page-view.tsx`), which records a
`ProgressEvent` attributed to whichever *child* is currently active in
this browser (`src/lib/progress/types.ts` — every `ProgressEvent` carries
a `childId`). A blog article is adult-facing content; attributing a
parent's own reading to their child's learning-progress record would be
exactly the kind of fabricated/misattributed signal this codebase's
honesty rules forbid elsewhere (see docs/PROGRESS_ARCHITECTURE.md's
reasoning for why only real, observable child activity is ever recorded).
The blog detail page deliberately does not include `<TrackPageView>` for
this reason.

## SEO / AEO

- `seoTitle` / `metaDescription` / `canonicalUrl` are optional overrides on
  `BlogArticle`, the same pattern Prompt 67 added to `Resource` — every
  article already has a correct computed default (its own title, excerpt,
  and `{siteUrl}/blog/{slug}`).
- `generateMetadata()` on the article page calls `buildSocialMetadata()`
  for real Open Graph/Twitter tags, and the listing page does the same.
- Structured data: `BlogPosting` on the article page (headline, author,
  publisher, `datePublished`/`dateModified` from real `createdAt`/`updatedAt`
  — no fabricated `aggregateRating` or review count), plus a real
  `FAQPage` block whenever `article.faq` is non-empty — built directly
  from the same array rendered on the page, so the schema can never claim
  a question exists that a visitor can't actually see (same rule
  `/faq`'s own structured data already follows).
- The listing page's `ItemList` structured data names only the articles
  actually rendered on that page of results — same rule the Resource
  Library and Teacher Directory already follow.
- AEO: the "What Is Early Childhood Education, and Why Does It Matter?"
  article is deliberately written to directly answer the question in its
  own title, with a genuine FAQ section addressing follow-up questions a
  parent would actually search for ("At what age does early childhood
  education start?") — answer-focused, not keyword-stuffed.
- Internal linking: article → resource (`relatedResourceSlugs`), resource
  → article (the computed reverse link above), article → learning category
  (`category`), article → other articles sharing a topic ("More like
  this"), and the blog is in both `primaryNav` and `footerNav`
  (`src/config/nav.ts`), so `sitemap.ts`'s existing `primaryNav.map()`
  picked it up with no separate entry needed. Published articles are
  added to `sitemap.ts` the same way resources/games/offerings already are.
- No faceted blog URLs are indexable — `/blog?topic=...` and `/blog?q=...`
  all canonicalize back to `/blog`, the same "avoid thousands of low-value
  URLs" rule the Resource Library and Teacher Directory already follow.

## Design

`BlogArticleCard` (`src/components/patterns/blog-article-card.tsx`)
deliberately mirrors `ResourceCard`'s exact shape and spacing — a tinted
icon tile (no real photography exists for these articles, so an icon
tile is the honest choice, the same reasoning `ResourceCard` already uses
for resources with no thumbnail), a topic badge, title, excerpt, and
audience badges — so the blog reads as the same product as the rest of
the site, not a bolted-on separate section. The listing page reuses
`PageHeader`, `EmptyState`, `Container`/`Section`, and the same
form-based GET filter pattern `/resources` already established.

## Testing

`types.test.ts` (7 cases): draft/review/archived all hidden, a published
article with no religious-review requirement shown, a Qur'an/Nazra-guidance
article correctly hidden while pending review and shown once verified,
and a pending-review article on an unrelated topic correctly unaffected.
`filters.test.ts` (10 cases): the public gate hides unpublished articles,
every filter (topic/category/audience/tag/query) individually, and
sort/pagination edge cases including an empty list.

Live-verified: `/blog` lists exactly the 4 published sample articles
(never the pending-review Nazra one), with working search, topic, and
audience filters and a working "Featured" section; each article detail
page renders its real sections, practical examples, FAQ (where present),
related resources, and related articles; the two cross-linked resource
detail pages (`/resources/classroom-circle-time-ideas`,
`/resources/screen-time-conversation-starters`) now show a real "From the
blog" card linking back; mobile layout confirmed responsive. Ran
typecheck, lint, the full Vitest suite, and a production build — all
clean, with all 4 published articles statically generated.
