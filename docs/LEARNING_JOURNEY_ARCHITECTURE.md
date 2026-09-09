# Learning Journey Architecture

Introduced in Prompt 36. Builds on three systems that already existed and
is deliberately not a new content pipeline, a new taxonomy, or a new
database table — it's a presentation and derivation layer over data this
platform already has: `src/config/learning-categories.ts` (subjects),
`SAMPLE_CONTENT`/`SAMPLE_RESOURCES`/`SAMPLE_GAMES` (what's actually
published in each subject), and `src/lib/progress` (what a specific child
has actually done — see docs/PROGRESS_ARCHITECTURE.md, whose own "Future
scalability" section named this exact feature before it existed).

All of it lives in one module, `src/lib/learning-journey.ts`, with two
pure functions.

## `getCategoryJourney(slug)` — naming what a category page already has

A category page (`/learn/[category]`) already had three sections: Content,
Games, Resources. This function doesn't add a fourth thing — it names the
existing three as steps in a journey (**Learn → Practice → Play**) and
reports, per step, whether real published content backs it and how much.
`LearningJourneySteps` (`src/components/patterns/learning-journey-steps.tsx`)
renders that as three cards linking to `#content`/`#games`/`#resources`
anchors already on the same page (id attributes added to the existing
section `div`s). A step with zero items renders "Coming soon" — the same
available/coming language as `CapabilityList` elsewhere on the site — never
hidden, never faked as available.

## `getNextStepSuggestion(events)` — the one recommendation on this platform

Takes a child's own recorded `ProgressEvent[]` (nothing else — no global
popularity, no editorial pick, no AI) and returns at most one suggestion:

1. Find the most recently touched subject (the `topic` on the newest
   event that has one).
2. Look for a published game, then a published resource, in that same
   subject that this child's own events don't already include the href
   of. Return the first one found.
3. If everything published in that subject has already been visited,
   fall back to a related subject (`getRelatedCategories`, same taxonomy
   the category page's own "Related categories" section uses) that this
   child hasn't explored yet.
4. If none of that produces anything — including a brand-new child with
   no events at all — return `null`.

Callers never fill that `null` with a fabricated default. Each surface
that uses it already had its own honest empty copy before this feature
existed (the dashboard's "Add a child to see their progress here," the
child view's "Nothing finished yet — pick something above to get
started!"), and keeps it.

Three surfaces call this same function — never three different
"recommendation" implementations that could drift:

| Surface | Where |
|---|---|
| Parent dashboard, per child | `src/components/patterns/parent-dashboard.tsx` |
| Child's own view | `src/components/patterns/child-experience.tsx` |

## Resource ↔ game cross-links

Separately, `/resources/[resource]` and `/games/[game]` each now look up
one published item of the other kind sharing the same category (plain
`.find()` over the existing sample arrays, same `isResourcePublished`
/`isGamePublished` gates every other listing uses) and show it as
"Practice the same skill with a game" / "Practice the same subject with a
resource." This is the taxonomy relationship the brief asked for
(a Mathematics worksheet connects to a Mathematics game) using the
category field that already existed on both content types — no new
relationship table, no manually curated links to keep in sync.

## Why no schema changes

Everything above is computed from data already in memory at request
time — category config, the sample content arrays, and a child's own
`localStorage` event log. There is no new persisted "journey" or
"recommendation" record anywhere, so there's nothing new to keep private
or accidentally leak. When real accounts and a real content database
exist, the same two functions still work unchanged against rows instead
of arrays — `getCategoryJourney` becomes a query filtered by category and
publication status (already the shape it assumes), and
`getNextStepSuggestion` becomes a query over that child's real
`progress_events` rows (already the shape `docs/PROGRESS_ARCHITECTURE.md`
describes). Building a dedicated `learning_paths` table now, before any
of that exists, would be schema for a scale this platform doesn't have
yet.

## SEO / AEO / privacy

`LearningJourneySteps` renders on the already-public, already-indexed
`/learn/[category]` pages — no new route, no new metadata, and the anchors
it links to were already real, visible sections on that same page, so this
only adds internal linking a crawler can already reach. `getNextStepSuggestion`
only ever renders inside the already-`noindex` `/dashboard` and
`/dashboard/children/[childId]` routes, and only from a specific child's
own browser-local event log — it's never computed server-side, never sent
anywhere, and never appears on a public page. No structured data changes.
