# AI Knowledge Layer Architecture

Introduced in Prompt 47, on top of the AI architecture from Prompt 46
(`docs/AI_ASSISTANT_ARCHITECTURE.md`). This is the "knowledge/content
layer" that doc pointed to as a placeholder — it's now real code, still
answering nothing itself (no AI reasoning is implemented here), but
structured so a future assistant can retrieve real facts instead of
guessing.

## The rule this whole layer follows

Every function here **reads existing data** — `src/config/learning-categories.ts`,
`src/lib/resources`, `src/lib/games`, `src/lib/progress`,
`src/config/teacher-options.ts` — and reshapes it. Nothing here invents a
resource, a learning outcome, a teacher qualification, a statistic, or
religious text. Where the underlying data doesn't have something (a
category with no games yet, a child with no events yet), the knowledge
functions say so honestly (an empty array, `null`) rather than filling in
a plausible-sounding guess — the same rule `getNextStepSuggestion`
(`src/lib/learning-journey.ts`) already followed before this prompt.

## Why this isn't a new content system

The brief explicitly warns against duplicating the learning/resource/
teacher content systems. This layer creates **zero** new content records —
it composes functions that already existed:

| Knowledge function | Built from (already existed) |
|---|---|
| `getLearningAreaKnowledge` (public-knowledge.ts) | `getCategoryJourney` (src/lib/learning-journey.ts, Prompt 36) |
| `getLearningAreasForAge` / `getLearningAreasForNamedAgeGroup` | `getAllLearningCategories`, `TEACHER_AGE_GROUP_OPTIONS` (src/config/teacher-options.ts, Prompt 28's real age-band ranges — Nursery 2–3, Preschool 3–5, Kindergarten 5–6, Primary 6–8) |
| `findResourcesByKeyword` | `filterResources` (src/lib/resources/filters.ts) — the exact function the Resource Library page itself uses |
| `findGamesByKeyword` | `isGamePublished` (src/lib/games/types.ts); no equivalent games search existed, so this is the one small addition, not a duplicate of anything |
| `getChildProgressKnowledge` | `getEventsForChild`, `summarizeChildProgress`, `getEarnedAchievements`, `getNextStepSuggestion` — all pre-existing |
| `getTeacherResourceKnowledge` | `isResourcePublished` — the same gate the resource library already enforces |

If the existing content model didn't already support a relationship the
brief asked for (Learning Area → Age Group → Objective → Resource →
Activity → Game → Practice → Progress), no schema field was invented to
force it. It didn't need to be: `LearningCategory.ageRange` and
`.learningObjectives`, `Resource`/`Game`'s own `category`/`ageRange`/
`difficulty`, and `ProgressEvent.topic` already carry every link in that
chain. This layer is the first place all of it is read together.

## The five knowledge modules

`src/lib/ai/knowledge/`

- **`types.ts`** — `KnowledgeItemRef` (a slim, public-safe projection of a
  resource or game: slug, title, href, age range, difficulty — never the
  full record) and `LearningAreaKnowledge` (one learning area with its
  real objectives, resources, activities, and games attached).
- **`public-knowledge.ts`** — Public educational content only. Every
  function reads exclusively from already-published content:
  - `getLearningAreaKnowledge(slug)` / `getAllLearningAreaKnowledge()`
  - `getLearningAreasForAge(ageYears)` — "what's suitable for this age"
  - `getLearningAreasForNamedAgeGroup(ageGroupId)` — "what's available for
    preschool children," using the real Prompt 28 age-band ranges
  - `findResourcesByKeyword(keyword)` / `findGamesByKeyword(keyword)` —
    "which resources are related to counting"
- **`progress-knowledge.ts`** — Child-specific progress. `getChildProgressKnowledge(childId, events)`
  takes the caller's own already-scoped events and composes the real
  summary/achievements/next-step functions. Deliberately a separate module
  from `public-knowledge.ts` so nothing here can be mistaken for, or
  accidentally merged into, public content.
- **`teacher-knowledge.ts`** — Teacher-specific information.
  `getTeacherResourceKnowledge(teacherId, resources)` shows a teacher their
  own resources including drafts and pending submissions — the opposite of
  `public-knowledge.ts`, which only ever shows what
  `isResourcePublished()` allows.
- No `admin-knowledge.ts` exists. There is no admin route, admin data, or
  admin UI anywhere in this codebase yet (`AccountRole` carries `"admin"`
  as a placeholder only — src/lib/accounts/types.ts) — inventing an
  admin-only knowledge source now would mean modeling data that doesn't
  exist. This module is added the day real admin data does.

## Parent/child/teacher/public separation

This is enforced by which module a caller imports, not a runtime role
check inside one shared function — the same "impossible by construction"
pattern the rest of this local-first app already relies on:

- `public-knowledge.ts` never accepts a child id, teacher id, or any
  private field as input. There's nothing private it *could* leak.
- `progress-knowledge.ts` and `teacher-knowledge.ts` require the caller to
  already hold the right scope (a specific `childId`, a specific
  `teacherId` plus that teacher's own already-loaded resources) — exactly
  how `local-children.ts` and `local-teacher-resources.ts` already ensure
  a browser only ever holds one family's or one teacher's data.
- These modules map cleanly onto the `AiAudience` permissions from Prompt
  46 (`src/lib/ai/permissions.ts`): a real assistant integration should
  only call `progress-knowledge.ts` when
  `AI_AUDIENCE_PERMISSIONS[audience].mayDiscussOwnChildProgress` is true,
  and `teacher-knowledge.ts` only when `mayDiscussOwnTeacherAccount` is
  true. That wiring isn't built yet — Prompt 47 asks for the knowledge
  layer, not the reasoning that calls it — but the modules are already
  shaped to slot into that gate without changing.

## Example questions this layer can now honestly answer

| Question | Function |
|---|---|
| "What activities are available for preschool children?" | `getLearningAreasForNamedAgeGroup("preschool")`, then read `.activities` off each area |
| "Show me literacy resources." | `getLearningAreaKnowledge("english-early-literacy").resources` |
| "What can my child practice next?" | `getChildProgressKnowledge(childId, events).nextStep` |
| "What resources are suitable for this age group?" | `getLearningAreasForAge(ageYears)` |
| "Which resources are related to counting?" | `findResourcesByKeyword("counting")` |

None of these are wired into the assistant UI yet (`src/components/patterns/ai-assistant.tsx`
still only ever returns the Prompt 46 development-placeholder reply) — this
table describes what the data layer can now support, not a new feature a
visitor can use today.

## SEO/AEO

One real, additive change: `src/app/learn/[category]/page.tsx` now renders
`LearningAreaStructuredData` (`src/components/patterns/learning-area-structured-data.tsx`),
an `ItemList` naming exactly the resources and games already rendered on
that page — built from `getLearningAreaKnowledge`, so the schema can never
describe something the visible page doesn't. It renders nothing when a
category has no published content yet, the same rule
`teacher-directory-structured-data.tsx` already follows. No existing
canonical URL, title, description, or route changed.
