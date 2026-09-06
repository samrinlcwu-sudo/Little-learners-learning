# Resource Library Architecture

Introduced in Prompt 9. Distinct from, but built on the same primitives as,
the learning-content model from [LEARNING_ARCHITECTURE.md](LEARNING_ARCHITECTURE.md).

## Why a separate `Resource` type, not a reuse of `LearningContent`

Resources include Teacher and Parent resources, which often don't belong to
any of the 16 learning categories (e.g. "Classroom Circle Time Ideas" isn't
a subject). `Resource` (`src/lib/resources/types.ts`) makes `category`
optional and adds a free-text `subject` fallback, plus two fields
`LearningContent` doesn't need: `downloadFile` and `accessTier`. It reuses
`LearningContent`'s shared building blocks (`AgeRange`, `ContentAuthor`,
`DifficultyLevel`, `PublicationStatus`, `ReligiousReviewStatus`, and the
religious-review category list) rather than redefining them, and derives
`ResourceType` from the master `ContentType` union with `Extract<>` so the
two can never drift apart.

## Resource types

Nine, exactly as specified: worksheet, activity, ebook, puzzle, maze,
coloring, writing-practice, teacher-resource, parent-resource. Adding a
tenth later is a one-line change to the `Extract<>` list in
`src/lib/resources/types.ts` (assuming it's already a member of
`ContentType`) — nothing else needs updating.

## Worksheets & Activities (Prompt 11)

Prompt 11 asked for matching/tracing/sorting/counting/letter/coloring
activities as if they were separate top-level types — they aren't, because
a tracing exercise, say, can just as easily ship as a `worksheet` as an
`activity`. Instead, `activitySubtype` (`matching | tracing | sorting |
counting | letter | coloring | general`) is an independent, optional
classification on top of `resourceType`, so it composes rather than forking
the type system. `ResourceCard` shows it as "Worksheet · Tracing" etc. when
set.

Three more optional fields support the worksheet/activity detail
experience: `skillsDeveloped` (a short list, distinct from the single
`learningObjective` sentence), `instructions` (ordered steps — labeled
"Instructions" for a worksheet, "Steps" for an activity, on the detail
page), and `materialsRequired` (activities only, in practice — physical
items needed, shown under "What you'll need").

The detail page also splits "Related resources" into **Related worksheets**
and **Related activities** (same category, matching type) specifically
when the current resource is a worksheet or an activity; every other
resource type keeps the single generic related list, since the split
doesn't make sense for e.g. an ebook.

### Future teacher functionality (not implemented)

Save resource, assign resource, create resource, and track resource usage
all require accounts, which don't exist yet. When they do, each is a
Supabase table keyed by `resource.id` plus a future `teacher_id`/`child_id`
(e.g. `saved_resources`, `assignments`, `resource_usage_events`) — additive
tables, no change to the `Resource` model itself.

## Ebooks & Digital Resources (Prompt 12)

Prompt 12's "supported digital resources" list (ebooks, booklets, activity/
coloring/puzzle books, educational guides) isn't a new taxonomy — every one
of these is `resourceType: "ebook"` (or occasionally `teacher-resource`/
`parent-resource`) distinguished by its existing `category`, `tags`, and
the three fields added this prompt: `subtitle`, `pageCount`, and
`learningObjectives` (plural — a booklet can have several distinct goals;
`getResourceObjectives()` returns the plural list when set, otherwise the
single required `learningObjective` sentence as a one-item list, so
detail-page rendering never has to branch on which field is populated).

The detail page gives ebooks a **Cover** slot (the real `thumbnail` image
if set, otherwise an honest "No cover yet" placeholder — visually and
semantically distinct from the **Preview** section below it, which is
about sample page content, not the book's identity). Structured data for
an ebook uses `@type: ["LearningResource", "Book"]` and adds
`numberOfPages` when `pageCount` is set — still built only from real model
fields.

Two samples now exist: `first-shapes-ebook` (premium, no file — the
existing sample, enhanced) and `my-first-letters-booklet` (free, no file —
new, to exercise the free-ebook messaging path). Neither has a real
`downloadFile`, so `canDownload()` correctly keeps both on the
informational "Not available yet" path — no fake download ever appears.

## Downloads — what's real and what isn't

No resource has a real `downloadFile`. `canDownload()` is the single gate
every card and the detail page call: it requires a published resource,
`accessTier === "free"`, and a real `downloadFile`. Fails any one of those
and the UI shows an honest disabled/informational state instead of a
button that goes nowhere — never a fake download link.

## Future business model

`AccessTier` is `"free" | "premium" | "membership"` — present on every
resource today for display only. No payment processing, no purchase flow,
no entitlement checks exist. When they do, `canDownload()` is the one
function that needs to grow (checking a real entitlement instead of just
"is this free"); every card and page that calls it stays the same.

## Routes

- `/resources` — the library index. **Server-rendered and URL-driven**
  (query params: `q`, `category`, `type`, `age`, `difficulty`, `tier`,
  `sort`, `page` — the Prompt 9 build shipped without `age`/`difficulty`
  controls in the form despite the filter logic supporting them; Prompt 10
  added the missing inputs),
  not client-state like the Learning Hub's browser. This is a deliberate
  difference: the Learning Hub holds a small, fixed set of categories, so
  instant client-side filtering is fine; a resource library is designed to
  grow large, so filtering/sorting/pagination happen server-side (an
  in-memory slice today, a database query with `LIMIT`/`OFFSET` later) and
  only one page of results is ever sent to the browser. The filter form
  works with JavaScript disabled.
- `/resources/[resource]` — one detail page per resource
  (`generateStaticParams` from the currently-published sample set).
  Breadcrumb, full detail, a Preview area (the real `preview` image if set,
  otherwise an honest "No preview available yet" placeholder — never a
  fabricated image), a structured metadata list (objective, age, category,
  type, creator), an honest download/access section, and related resources
  (same category or same type). Each also emits `schema.org/LearningResource`
  JSON-LD built only from real model fields — no ratings, reviews, or other
  social-proof properties, since none exist.

## Card visual language (Prompt 10)

`ResourceCard` gained an icon-tile header — the resource type's icon
(`RESOURCE_TYPE_ICONS`, reusing icons already used elsewhere on the site
for the same resource formats, e.g. `FileText` for worksheets) in a
`primary-100` tile — plus a "Learn to: …" line surfacing the learning
objective at a glance. Every color and spacing value used is an existing
design token; nothing new was introduced.

## Filtering, sorting, pagination

`src/lib/resources/filters.ts`: `filterResources` (same shape as
`filterContent`), `sortResources` (newest/oldest/title), and
`paginateResources`, which returns `{items, page, pageCount, totalCount}` —
the exact shape a `.range()` Supabase query will return later, so the page
component doesn't change when the in-memory array becomes a real query.

## SEO strategy

Every resource detail page gets a unique title/description and a
self-referencing canonical URL. `/resources` itself always canonicalizes to
the bare `/resources` URL — filtered and paginated views
(`/resources?category=mathematics&page=2`) are real, crawlable, working
pages, but they canonicalize back to the base library page rather than
each competing as a separate indexable page (standard practice for faceted
navigation). Only `isResourcePublished()` resources appear in the sitemap.

## Sample data

`src/lib/resources/sample-resources.ts` — 5 hand-written records. Four are
ordinary published samples (visibly badged "Sample" everywhere they
render); the fifth (`arabic-letters-tracing-pack`) is deliberately left
`religiousReview: "pending-review"` specifically to prove
`isResourcePublished()` hides it from every listing, sitemap entry, and
direct-slug lookup — covered by `types.test.ts`.
