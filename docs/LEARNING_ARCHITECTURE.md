# Learning Ecosystem Architecture

How the platform's subject content is modeled, routed, and will eventually
be searched — introduced in Prompt 7. No real lesson/resource content exists
yet; this is the structure it will fill.

## Content model

`src/lib/content/types.ts` defines `LearningContent` — the shape every
future resource (lesson, worksheet, ebook, game, ...) conforms to:
title, description, category/subcategory, age range, learning objective,
difficulty, content type, thumbnail, preview, tags, author, publication
status, religious-review status, featured flag, and timestamps. It has no
dependency on Supabase — the shape is the contract; where it's stored
(Postgres, eventually) is a separate decision.

## Categories

`src/config/learning-categories.ts` holds all 16 categories, grouped into
Core Subjects / Qur'an & Arabic / Activities & Play, each with a `slug`
(drives the URL), a target `ageRange`, and the `contentTypes` it's expected
to hold. This is the single source of truth — the homepage teaser, the
`/learn` index, the `/learn/[category]` pages, and the sitemap all read
from it, so they can never list different subjects.

## Age architecture

`AgeRange` is `{ minYears, maxYears }` — a numeric range on each content
item and category, not a fixed enum like "toddler/preschool". Nothing in
the app assumes one age; a future age filter just compares a number against
each item's range (see `filterContent`).

## Content types

Eleven types in `ContentType` (lesson, worksheet, activity, ebook,
writing-practice, puzzle, maze, coloring, game, parent-resource,
teacher-resource) — covering everything the brief asked for, including the
future parent/teacher resource categories. `CONTENT_TYPE_LABELS` maps each
to display text.

## Route strategy

- `/learn` — the Learning Hub: category grid, a small "Featured" row, and
  a full search/filter browser (see below).
- `/learn/[category]` — one page per category (`generateStaticParams`
  builds all 16 at build time — no runtime lookup, no huge client-side
  data load). Shows the category's scope (age range, expected content
  types), its learning objectives, that category's content (if any), and
  a "Related categories" list for internal linking. 404s via
  `notFound()` for any slug that isn't a real category.
- Both are plain, readable URLs (`/learn/mathematics`, not
  `/learn?id=2`), which is what makes each category independently
  indexable by search engines. Each has a self-referencing canonical URL.

## Sample content (Prompt 8)

`src/lib/content/sample-content.ts` holds exactly 4 hand-written
`LearningContent` records — enough to prove the model, cards, and filters
work end to end, not a content library. Every card rendered from this file
carries a visible "Sample" badge (`LearningCard`'s `isSample` prop) so
nothing is mistaken for a real, published resource. None are in a
Qur'an/Arabic category — those pages show only the empty state until real,
human-reviewed content exists.

## Card system

`src/components/patterns/learning-card.tsx` — the one card for any content
item anywhere it's listed: title, category, age, content type, difficulty,
and an action (a real link once content exists; a disabled "coming soon"
button for samples, since there's nowhere real for it to lead yet).

## Search strategy

`src/lib/content/filters.ts` defines `ContentFilters` (query, category,
age, difficulty, content type, tags) and `filterContent`, a plain
in-memory `Array.filter` — deliberately not a search engine. It exists so
every future search/filter UI (global search, category search, age
filtering, etc.) targets one stable shape. Once real content lives in
Supabase, the body of `filterContent` becomes a SQL query using the same
`ContentFilters` input — calling code doesn't change.

`src/components/patterns/learning-content-browser.tsx` is the first real
UI built on that contract: a client-side search box plus age/content-type
(and, on the hub, category) filters over whatever `items` array it's
given. It's genuinely functional today against the 4 samples — not a
placeholder — and needs no changes when real content replaces them.

## SEO strategy

Every category page gets its own metadata (`generateMetadata`, using the
category's real name/description) and its own sitemap entry
(`src/app/sitemap.ts` now includes all 16 category URLs). No content
stuffing — descriptions are the same honest one-liners used everywhere
else on the site.

## Qur'an / Arabic — safeguards

`src/lib/content/arabic-alphabet.ts` contains only objective linguistic
data: the 28-letter Arabic alphabet and the three short-vowel harakat
(fatha, kasra, damma). It contains **no Qur'anic verses or religious
instructional content** — none exists yet, and none should be generated.

The enforcement point is `isPubliclyVisible()` in `types.ts`: any content
under `quran-nazra`, `arabic-letters`, or `foundational-quran-reading`
(`RELIGIOUS_REVIEW_REQUIRED_CATEGORIES`) is hidden unless its
`religiousReview` field is explicitly `"verified"` — set by a person, never
by default and never by generation. This is a code-level gate, not just a
policy note.

## Future parent/teacher integration

Not implemented yet — `LearningContent.author` already distinguishes
`"platform"` vs `"teacher"` authorship (with a `teacherId` once teacher
accounts exist), which is the only hook needed now. Progress and
assignments will be separate tables later (e.g. `child_progress`,
`assignments`) that reference `content.id` — no schema exists for these
yet, deliberately, since no accounts exist to attach them to.
