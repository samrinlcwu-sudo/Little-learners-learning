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
