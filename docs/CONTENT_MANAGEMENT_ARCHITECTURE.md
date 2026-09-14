# Content Management Architecture

Prompt 67: the foundation for managing Little Learners Learning's
educational content from the Admin Dashboard. Read
`docs/RESOURCE_LIBRARY_ARCHITECTURE.md`, `docs/GAMES_HUB_ARCHITECTURE.md`,
and `docs/ADMIN_ARCHITECTURE.md` first — this only covers the new admin
authoring/moderation layer on top of those existing systems.

## What already existed, and what's new

Almost every field the brief asks for was already a real field on
`Resource` (`src/lib/resources/types.ts`): title, description, category,
age range, resource type, learning objective(s), difficulty,
free/premium/membership access tier, publication status, thumbnail,
downloadable file, author, created/updated dates. The genuinely new work
in this prompt is narrow:

1. A **"review" publication status** (`src/lib/content/types.ts`), between
   draft and published.
2. **SEO override fields** (`seoTitle`, `metaDescription`, `canonicalUrl`)
   on `Resource`.
3. A **real, working admin authoring store** for resources
   (`src/lib/resources/local-admin-resources.ts`) — until now, every
   resource in this codebase was either checked-in sample data
   (`SAMPLE_RESOURCES`) or created by a teacher through their own
   dashboard; nothing let the *platform itself* create a resource.
4. A **combined admin content library UI** (`/admin/content`) that shows
   all three of those sources side by side, with real search, filtering,
   and (for admin-created resources) full CRUD and a confirmed publish/
   archive workflow.
5. A **read-only games inspection view**, since no game-authoring flow
   exists to build real CRUD around.

Nothing here invents a resource, a game, a price, a statistic, or a
review — every table row is either checked-in sample content or a real
record this browser actually created.

## The four-state publication lifecycle

`PublicationStatus` (`src/lib/content/types.ts`) is now
`"draft" | "review" | "published" | "archived"`, shared by
`LearningContent`, `Resource`, `Game`, and `Offering`. Adding `"review"`
required no change to any existing gate — `isPubliclyVisible()`,
`isResourcePublished()`, and `isGamePublished()` all already special-case
only `"published"` and treat every other value as "not visible," the same
reason `"needs-changes"` slotted into `TeacherModerationStatus` without
touching `teacher-visibility.ts` (Prompt 66,
`docs/TEACHER_ARCHITECTURE.md`). `PUBLICATION_STATUS_LABELS` and
`PUBLICATION_STATUS_BADGE_VARIANT` are now shared exports, so the
resources table, the resource detail page, and the games table all show
the identical label and badge color for the same status — no drift.

**Publishing is always a separate, deliberate action.** Neither the
create form nor the edit form ever sets `publicationStatus` to
`"published"` or `"archived"` — creating a resource can only produce
`"draft"` or `"review"` (`local-admin-resources.ts`,
`addLocalAdminResource`), and editing an existing one never touches
status at all (`updateLocalAdminResource`). The only function that can
move a resource to `"published"` or `"archived"` is
`setLocalAdminResourceStatus()`, called from the resource detail page's
status buttons — and the UI wraps both of those two calls in
`window.confirm()` first (`admin-resource-detail.tsx`,
`CONFIRM_MESSAGE`). This is the same `window.confirm` convention
`teacher-dashboard.tsx` already uses for deleting a resource — no new
confirmation-dialog component was introduced for one new use.

## Three real sources, one table

`/admin/content`'s Resources tab is not a single array — it's three real
sources combined by `buildAdminResourceRows()`
(`src/lib/resources/admin-resource-rows.ts`):

| Source | Where it lives | Editable here? |
|---|---|---|
| `seed` | `SAMPLE_RESOURCES` (checked into the repo) | No — not a real database row |
| `admin` | `local-admin-resources.ts` (this browser's localStorage) | Yes — full CRUD |
| `teacher` | `local-teacher-resources.ts` (this browser's one teacher account, if any) | No — reviewed at `/admin/teachers/[teacherId]` instead |

This mirrors the exact technique `buildParentRows()`
(`src/lib/accounts/admin-user-rows.ts`, Prompt 65) established: combine
real data from multiple real places rather than inventing a fourth,
unified "resources table" that doesn't exist. `AdminResourceRow.editable`
is `true` only for the `admin` source, and every write action in the UI
(`Edit`, `Delete`, the status buttons) is gated on it — a seed or teacher
row simply has no edit/delete controls rendered, not a disabled button
with a confusing tooltip.

Teacher-submitted resources are shown here for a *complete library view*,
but reviewing them (approve/reject) stays exactly where Prompt 66 already
put it — `/admin/teachers/[teacherId]` — because that decision belongs to
reviewing the teacher's submission in the context of their profile, not
to the content librarian's own CRUD. The detail page links there instead
of duplicating approve/reject controls a second time.

### Why the admin-authored store is separate from the teacher one

`local-admin-resources.ts` is its own localStorage key and its own set of
functions, not a shared "resources" store with a `role` flag. Same reason
admin and teacher accounts are separate stores in this codebase: an
admin-authored resource has `author.role: "platform"` and never carries
`reviewStatus` (nothing reviews the platform's own content the way it
reviews a teacher's), while a teacher's resource always does. Merging
them into one store would mean every reader has to branch on `role`
before deciding which rules apply — keeping them separate means each
store's own functions already encode the right rules.

## What "Publish" actually does today

There is still no shared backend (`src/lib/supabase/is-configured.ts`),
so an admin-created resource's `publicationStatus` only ever changes in
*this browser's* localStorage — the public `/resources` and
`/resources/[resource]` pages are server components that read only
`SAMPLE_RESOURCES` (a static, checked-in array), because there is no
cross-visitor data source they could otherwise honestly read from. This
is exactly the same architectural gap `docs/TEACHER_DIRECTORY_ARCHITECTURE.md`
already discloses for the teacher directory ("why the directory is empty
today, correctly") — not a bug introduced by this prompt, and not
something this prompt tries to work around with a fake shared store.

Publishing here is still real and honest, though: it updates the
resource's actual lifecycle state, it's reflected immediately and
correctly everywhere this admin area reads it (the list, the detail page,
`canDownload()`), and the moment a real backend exists, the exact same
`setLocalAdminResourceStatus()` call becomes a real database write with
no UI change — the public pages just need to start reading from that
table instead of `SAMPLE_RESOURCES`, which was already the documented
plan before this prompt.

The one case where "Publish" *does* have an immediate, real, public
effect: a `seed` resource that's already `published` in the checked-in
data genuinely is live at `/resources/[slug]` — the detail page shows a
"View live page" link only for that case (`isLivePublic` in
`admin-resource-detail.tsx`), never for an `admin`-sourced resource.

## Checkpoint fix (Prompt 68): admin content routes were missing `noindex`

The Prompt 68 quality-control checkpoint found a real regression: `/admin/content`,
`/admin/content/new`, and `/admin/content/[resourceId]/edit` were built as
`"use client"` page files with all of their UI (including the route's
`metadata` export requirement) inline. A client component **cannot** export
`metadata` in Next.js, so unlike every other `/admin/*` page in this
codebase, these three had no `robots: { index: false, follow: false }` —
silently reachable by a crawler if one ever found the URL. Fixed by moving
each page's UI into its own client pattern component
(`admin-content-tabs.tsx`, `admin-resource-create.tsx`,
`admin-resource-edit.tsx`) and turning the route `page.tsx` files back into
plain server components that export `metadata` and render the client
component — the exact same split `admin-teacher-list.tsx` and
`admin-user-list.tsx` already use. `/admin/content/[resourceId]/page.tsx`
was already a server component but had simply never been given a
`metadata` export either; that was added directly. Verified live:
`document.querySelector('meta[name="robots"]').content` now reads
`"noindex, nofollow"` on all four routes, and each page renders identically
to before the fix. `src/app/robots.ts` also gained an explicit
`disallow: "/admin"` rule as defense in depth on top of the per-page
meta tag (the meta tag remains the actual enforcement; Proxy, `src/proxy.ts`,
remains the actual access control — this is SEO hygiene, not a security
boundary).

## Games: read-only by design

`/admin/content`'s Games tab (`admin-game-list.tsx`) is deliberately not
symmetric with Resources. There is no `local-admin-games.ts` and no
"create a game" form, because no game-authoring flow exists anywhere in
this codebase — `src/config/teacher-resource-types.ts` explicitly
excludes games from what a teacher can author, and nothing in
`docs/GAMES_HUB_ARCHITECTURE.md` describes one either. Building a write
store with nothing real to write into it would be exactly the invented
capability the brief's "do not implement content types that are not
technically appropriate" rule warns against. What *is* real — search and
filtering over the existing `SAMPLE_GAMES` catalog
(`src/lib/games/admin-game-filters.ts`, tested) — is built, tested, and
ready to extend the moment a real authoring flow exists.

## SEO metadata, built into the architecture

`Resource.seoTitle` / `metaDescription` / `canonicalUrl` are optional
overrides, not new required fields — every resource already has a
correct computed default (its own title, description, and
`{siteUrl}/resources/{slug}`) with none of them set.
`src/app/resources/[resource]/page.tsx`'s `generateMetadata()` now reads
`resource.seoTitle || resource.title` (and the same pattern for the other
two), and also calls `buildSocialMetadata()` for Open Graph/Twitter tags,
which that page didn't do before. An admin who never touches the SEO
section of the resource form gets exactly the metadata this page always
generated — these fields exist to let a deliberate override happen, not
because a default was missing.

## Content safety: what's real today, what isn't yet

There is still no server-side file storage anywhere in this codebase.
What's real:

- **File-type validation**: `src/lib/utils/file-validation.ts` (new,
  shared) rejects a thumbnail that isn't an image or a downloadable file
  that isn't a PDF before it's ever read into memory — a real MIME-prefix
  allowlist check, not a stub.
- **Upload size limits**: 2MB for a thumbnail, 5MB for a downloadable
  file — enforced by the same function, before the browser reads the file
  into a data URL.
- **No unsafe execution surface**: an uploaded file is stored as a data
  URL and only ever rendered as an `<img>` (thumbnail) or offered as a
  plain download link (`<a href>`) — never evaluated, parsed as HTML, or
  otherwise executed.

What doesn't apply yet, and why: "protect private files" and "prevent
path traversal" are properties of a server filesystem or object store
path — there is no server-side file storage today (see
`docs/TEACHER_ARCHITECTURE.md`'s identical disclosure for teacher photo
uploads), so there is no path to traverse or private file to protect.
When real server-side storage exists, this is the one place that
validation moves to — the client-side check stays as defense in depth,
not as a replacement.

User-generated text (title, description, instructions, etc.) is rendered
as plain text through React's default escaping everywhere in this
codebase — no `dangerouslySetInnerHTML` is used for any resource field —
so it's already safe against injected markup without a separate
sanitizer library.

## Testing

New unit tests: `admin-resource-rows.test.ts` (source tagging and
editability), `admin-resource-filters.test.ts` (every filter individually
and combined, confirming drafts/archived/review are all included — unlike
the public `filterResources` gate), `admin-game-filters.test.ts` (same
shape, confirming an unpublished or pending-religious-review game is
still visible to the admin filter). All existing suites
(`teacher-visibility.test.ts`, `admin-teacher-filters.test.ts`,
`admin-user-rows.test.ts`, the resource/content/games `types.test.ts`
files, etc.) pass unchanged.

Live-verified in the browser: created a real resource through
`/admin/content/new` (Basics → Learning details → Access & media → SEO),
confirmed it appears in the list as "In review" / "Created here";
confirmed clicking "Published" and dismissing the confirmation dialog
leaves it at "In review" (the accidental-publish guard actually works);
confirmed accepting the confirmation moves it to "Published" and the
detail page's status buttons update correctly; edited its fields via
`/admin/content/[id]/edit` and confirmed the single "Save changes" button
never changes status; deleted it and confirmed it's gone from the list.
Confirmed the Games tab lists all 6 sample games (including the
pending-religious-review one, correctly hidden from the public Games Hub
but correctly visible here) with working category/type/status/access
filters. Confirmed the public `/resources` page still shows exactly the 6
published sample resources (never the resource created above — no shared
backend exists to make that live), and a resource detail page's title/
description/canonical metadata are unchanged from before this prompt.

Ran `npm run typecheck`, `npm run lint`, `npm test` (full suite), and
`npm run build` — all clean, 65 routes generated including the four new
`/admin/content*` routes.

## What was not built (disclosed, not hidden)

- No cross-visitor content — the same disclosed limitation as every other
  admin area in this codebase (see "What 'Publish' actually does today").
- No game-authoring flow, and therefore no admin CRUD for games — see
  "Games: read-only by design."
- No learning-category taxonomy editor — `src/config/learning-categories.ts`
  is still edited in code. This is the one piece of the original Prompt
  64 roadmap item ("Resources, games & learning categories") this prompt
  didn't build; the `/admin` roadmap panel was updated to reflect that.
- No bulk actions (bulk publish/archive/delete) — every action in this
  foundation is single-resource, matching the brief's "foundation" framing
  rather than a full production content-ops tool.
