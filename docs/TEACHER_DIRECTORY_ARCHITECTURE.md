# Teacher Directory Architecture

Introduced in Prompt 29, on top of the profile system from Prompts 26-28
(`docs/TEACHER_ARCHITECTURE.md`, `docs/TAXONOMY_ARCHITECTURE.md`). Read
those first — this covers only the discovery layer: search, filters, the
directory listing itself, and why it's empty today.

## One URL, not two

`/teachers` is both the audience landing page (why a teacher would join)
and the directory (how a family finds one) — the same pattern
`/resources` and `/games` already use (an explanatory band, then a
browsable, filterable grid), rather than splitting "what this is" and
"search it" across `/teachers` and a second route. Every
filter/search/page combination canonicalizes back to the base `/teachers`
URL, so a query like `/teachers?subject=mathematics` is never its own
indexable page — exactly the "avoid thousands of low-value URLs" Part 8
asks for.

## Why the directory is empty today, correctly

There is still no shared backend (`src/lib/supabase/is-configured.ts`).
Every teacher profile lives only in the browser that created it — there
is no cross-visitor data source `getApprovedTeacherDirectoryEntries()`
(`src/lib/accounts/teacher-directory.ts`) could honestly read from, so it
always returns `[]`. This is not a stub waiting to be finished before
launch — it is the correct, honest behavior Prompt 29 explicitly asks
for: "do not populate the directory with fake teachers... create an
excellent empty state instead."

On top of that architectural gap, there's a second, independent reason
the directory stays empty even once a backend exists: **listing requires
human approval**, not just the teacher's own opt-in. See "Two gates," below.

## Two gates: the teacher's choice, and the platform's review

`TeacherProfile` carries two independent fields:

- `visibility: "private" | "public"` — the teacher's own choice (Prompt 27).
- `moderationStatus: "pending" | "approved" | "rejected" | "hidden"` — the
  platform's side (Prompt 29 Part 7), defaulting to `"pending"` on every
  new profile. Nothing in this codebase ever sets it to `"approved"`
  automatically — the same rule `verified` already follows.

`src/lib/accounts/teacher-visibility.ts` defines exactly how they
combine, mirroring the same two-gate shape as `isResourcePublished()` and
`isGamePublished()`:

- `canViewTeacherProfile(teacher)` — `visibility === "public"` AND
  moderation hasn't actively blocked it (`rejected`/`hidden` fail this;
  `pending` passes). A brand-new public profile is viewable via its
  direct link right away — reviewed-or-not isn't the same question as
  banned-or-not.
- `canListTeacherInDirectory(teacher)` — everything above, AND
  `moderationStatus === "approved"`. Being viewable directly isn't the
  same as being discoverable through search.

A real reviewer tool now exists — `/admin/teachers/[teacherId]`
(`docs/ADMIN_ARCHITECTURE.md`, Prompt 56) — so a profile genuinely can
reach `moderationStatus: "approved"` today. The directory still stays
empty for every visitor even after that, on purpose: `getApprovedTeacherDirectoryEntries()`
(`src/lib/accounts/teacher-directory.ts`) always returns `[]` regardless
of any local profile's moderation state, because there is still no
cross-visitor data source for it to honestly read from — the same
architectural gap as before, just no longer entangled with "nothing can
ever be approved." Approving a profile today has a real, immediate effect
elsewhere instead: `canViewTeacherProfile()` already governs the direct
link at `/teachers/p/[slug]`, so rejecting or hiding a profile blocks that
link right away, in this same browser. This is deliberate: showing a
teacher their own profile in "the directory" while nobody else's approval
could ever be shared would look like inconsistent, environment-specific
behavior rather than an honest, uniform empty state — `canListTeacherInDirectory()`
is real, tested, and will drive real results the moment a shared backend
exists, without changing shape.

The Teacher Dashboard shows this plainly: a "Directory listing" badge
(Pending review / Approved / Not approved / Hidden) next to the
visibility toggle, with a note explaining that public + approved is what
listing actually requires.

## Search and filters (Parts 2-3)

`src/lib/accounts/teacher-directory-filters.ts` — `filterTeacherDirectory()`
and `paginateTeacherDirectory()`, the same pure-function-over-an-array
shape as `filterResources()`/`paginateResources()`
(`src/lib/resources/filters.ts`): real logic, unit-tested
(`teacher-directory-filters.test.ts`) against synthetic data, ready to
move server-side as a real query's WHERE clause without any caller
changing.

| Brief's ask | Implementation |
|---|---|
| Teacher name | Folded into the general `query` search |
| Region ("where appropriate") | Folded into the same `query` search — no dedicated filter, since a fixed country list wasn't asked for and free-text keeps this simple |
| Expertise | A dedicated text input, substring-matched — `expertise` is itself free text (Prompt 27), so a fixed dropdown wouldn't fit it |
| Subject (Learning Area) | A dropdown from `getAllLearningCategories()` — the same 16-category list every other part of the site uses |
| Age Group | A dropdown from `getAllTeacherAgeGroupOptions()` |
| Language | A dropdown from `getAllTeacherLanguageOptions()` |
| Teaching interest (Prompt 43) | A dropdown from `getAllTeachingInterestOptions()` — a fixed multi-select on the profile, unlike free-text `expertise`, so an exact-match dropdown fits it |

No "unnecessary filters" were added — every filter above maps directly
to a real, teacher-entered field; nothing was invented to pad the list.

### Expanding the public-field allowlist for search

Prompt 27 deliberately kept `PublicTeacherProfile` narrow. Prompt 29 Part
2 explicitly asks to search by language and region, so `languages` and
`countryRegion` were added to that allowlist; Prompt 43 adds
`teachingInterests` the same way — a teacher's own selected teaching
styles are exactly as low-sensitivity as `subjects` or `expertise`
(already public), and useful for the same reason `languages` was added:
a parent narrowing down teachers by real, self-reported approach.
Everything else stays excluded: email, accountId, moderationStatus, and
every other private-dashboard-only field.

## The directory card (Part 4)

`src/components/patterns/teacher-directory-card.tsx` shows only what
Part 4 named: photo, name, headline, up to two expertise tags, age
groups, and up to three subjects (with a "+N more" indicator, never a
silent truncation). No bio, education, certifications, or region details
beyond the country line — a card is for browsing, not the full profile
(Part 10: don't load unnecessary profile information for a list view). A
`verified` checkmark renders only when the platform actually set
`verified: true`; there is no visual affordance anywhere that could be
mistaken for verification when it isn't set.

## Profile links (Part 5)

Cards link to `/teachers/p/[slug]` — kept as the existing namespaced
route from Prompt 27 rather than moving to a bare `/teachers/[slug]`.
The brief's own guidance ("use a stable identifier where necessary to
avoid URL conflicts") is exactly why that sub-path exists: `/teachers`
already has static child routes (`register`, `dashboard`), and
namespacing individual profiles under `/p/` avoids ever fighting a future
static route for the same segment.

## Structured data (Part 8)

`src/components/patterns/teacher-directory-structured-data.tsx` emits an
`ItemList` naming exactly the teachers rendered on the current page of
results — and renders nothing at all when that list is empty. A schema
describing zero items, or describing profiles a crawler can't see
rendered on the page, would be exactly the "search-engine content not
visible to users" rule already established in `docs/SEO_ARCHITECTURE.md`.
Today this component is real code that has never yet run with data.

## AEO (Part 9)

The directory's intro paragraph states plainly, in one place: what the
directory is (a search over teacher profiles), who teachers are (people
who created a profile and chose to make it public), what's searchable
(name, region, subjects, age groups, languages, teaching interests,
expertise), and where
that information comes from (the teacher's own profile, never inferred).
No keyword-stuffed variants of the same sentence exist elsewhere on the
page.

## Performance and pagination (Part 10)

`paginateTeacherDirectory()` slices to `DEFAULT_DIRECTORY_PAGE_SIZE` (12)
today, exactly like the Resource Library. Pagination controls only render
when `pageCount > 1`, which never happens yet — but the `?page=` param,
the slicing logic, and the "Page X of Y" UI are all real and tested, so
growing from zero to thousands of teachers changes nothing about this
page except which real numbers come back from
`getApprovedTeacherDirectoryEntries()`.

## Testing (Part 12)

Because live data is always empty, the actual proof this works is in
`src/lib/accounts/teacher-visibility.test.ts` (8 cases covering every
visibility/moderation combination) and
`src/lib/accounts/teacher-directory-filters.test.ts` (11 cases covering
each filter individually, combined filters, and pagination edge cases —
empty list, out-of-range page). Manually verified live: seeding a sample
entry through the (temporarily swapped, then reverted) data source
confirmed the card, structured data, and profile link all render
correctly; seeding a real local profile confirmed the "pending" dashboard
badge, the direct-link-still-works behavior, and the rejected-profile
block, each exactly as designed.
