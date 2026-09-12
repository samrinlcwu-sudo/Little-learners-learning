# Taxonomy Architecture

Introduced in Prompt 28. Answers one question: when a new list of
selectable categories is needed somewhere (a teacher's subjects, their
age groups, a resource's type), where does it live, what shape does it
take, and how does it stay consistent with every other list like it
across the site?

## One taxonomy, reused everywhere (Part 6)

The 16 subjects named in Prompt 28 Part 1 aren't a new list — they're
`src/config/learning-categories.ts`, the same categories `/learn`, the
Resource Library, the Games Hub, and the teacher profile's "Subjects"
field have all shared since early in this project. Nothing in this
prompt introduces a second, competing subject list. The rule going
forward: **a category that already exists somewhere is referenced from
there, never retyped as a new array.** Concretely:

| Concept | Lives in | Reused by |
|---|---|---|
| Subjects / learning areas | `src/config/learning-categories.ts` | `/learn`, Resource Library, Games Hub, teacher profile |
| Content formats | `src/lib/content/types.ts` (`ContentType`) | Resources, games, teacher resource types |
| Resource formats | `src/lib/resources/types.ts` (`ResourceType`, derived from `ContentType`) | Resource Library, teacher resource types |
| Teacher age groups | `src/config/teacher-options.ts` | Teacher profile, public profile |
| Teacher languages | `src/config/teacher-options.ts` | Teacher profile, public profile |
| Teaching interests | `src/config/teacher-options.ts` | Teacher profile |
| Teacher resource types | `src/config/teacher-resource-types.ts` (subset of `ResourceType`) | Prepared for a future "create a resource" form |

The "future teacher directory" and "future search" the brief mentions
would filter by exactly these same lists — a directory filter for
"Mathematics" and a resource-library filter for "Mathematics" must always
mean the same category, which is only guaranteed if they're the same
`learning-categories.ts` entry, not two independently-maintained strings
that happen to read the same today.

## Every taxonomy option follows the same shape (Part 9)

`src/lib/taxonomy/types.ts` defines `TaxonomyOption<Id>` — `{ id, label,
active? }` — and `getActiveOptions()`, which every accessor function
(`getAllLearningCategories()`, `getAllTeacherAgeGroupOptions()`,
`getAllTeacherLanguageOptions()`, `getAllTeachingInterestOptions()`,
`getAllTeacherResourceTypeOptions()`) already filters through. `active`
being omitted (or `true`) means the option shows up everywhere it's
used; no admin tool sets it to `false` yet — `/admin/teachers`
(`docs/ADMIN_ARCHITECTURE.md`, Prompt 56) manages teacher accounts, not
taxonomy options, so this specific control still doesn't exist anywhere —
but the mechanism is real and live today, not a placeholder field nobody
reads. `LearningCategory` keeps its own
established `slug`/`name` fields (renaming them to `id`/`label` across
every file that already uses them would be a large, purely cosmetic
change) but follows the identical `active` convention.

**Why this is "admin readiness" without an admin dashboard**: every
taxonomy in this codebase is read through a function
(`getAllLearningCategories()`, not a raw imported array), never directly
from the exported constant. That indirection is the entire trick — when
a real admin panel exists, each of those functions swaps a static array
literal for a database query (`WHERE active = true ORDER BY sort_order`),
and nothing that calls the function needs to change, because the return
shape is identical. Adding, renaming, or deactivating a category becomes
a data change behind an unchanged interface, not a code change scattered
across every page that lists subjects.

## Age groups: friendly labels, configurable ranges (Part 2)

`TeacherAgeGroupOption` (`src/config/teacher-options.ts`) pairs a
child-friendly `label` (Nursery, Preschool, Kindergarten, Primary — not
"0-3y") with a real `ageRange: { minYears, maxYears }`, reusing the exact
`AgeRange` shape learning categories, games, and resources already use.
The range is data, not text baked into the label string —
`formatTeacherAgeGroupLabel()` builds the displayed "Preschool (3–5)"
from that data at render time, so changing a range later means editing
one object, not finding every place the old numbers were typed out.

## Languages: only ever self-reported (Part 3)

`TEACHER_LANGUAGES` (`src/lib/accounts/types.ts`) is a fixed checkbox
list a teacher selects from — nothing on this site infers a language
from a teacher's name, country, or any other field. There was nothing to
change here in Prompt 28; it already followed this rule since Prompt 27.

## Teaching interests: multi-select, not free text (Part 4)

Before this prompt, "teaching interests" was a free-text paragraph.
Prompt 28 explicitly asks for multi-select, so `TeacherProfile.teachingInterests`
is now `TeachingInterest[]` — ids from a fixed 16-option list
(`TEACHING_INTERESTS`, `src/lib/accounts/types.ts`), presented as a
checkbox grid with a plain-text search filter above it
(`src/components/patterns/teacher-profile-form.tsx`) once the list is
long enough that scanning it isn't instant. A profile saved before this
prompt had a string here; `local-teacher.ts`'s `normalize()` reads that
defensively and resets it to `[]` rather than guessing which of the new
fixed options an old sentence might have meant — the same "don't invent
expertise" rule the brief states outright applies to migrating data, not
just to what a teacher types going forward.

## Resource categorization: prepared, not enabled (Part 5)

`src/config/teacher-resource-types.ts` defines which `ResourceType`
values (`src/lib/resources/types.ts`) a teacher's own creation could
eventually be filed under: Worksheet, Activity, Lesson Resource, Ebook,
Puzzle, Maze, Coloring. `"lesson"` is a genuinely new addition to
`ResourceType` (previously excluded because the platform's own `/learn`
lessons are interactive, on-site content, not something to browse and
download) — added because a teacher-authored lesson *plan* is a
real, sensible thing to publish as a downloadable resource, unlike the
platform's own lessons. "Game" is deliberately absent: an interactive
game is a `Game` record (`src/lib/games/types.ts`), a different content
kind with its own shape, not a `Resource` — folding it into this list
would be exactly the kind of duplicate/overlapping category Part 6 warns
against. Both `Resource` and `Game` already carry `ContentAuthor` /
`author` with an optional `teacherId`, so the data model has room for
teacher authorship on either kind whenever a real authoring flow exists.

**Nothing here enables publishing.** There is no "create a resource"
form, no submission queue, no file upload, no review step — the Teacher
Dashboard's Resources section states this plainly and shows the planned
types as information, not as a working picker. Part 5 says not to enable
publishing until the workflow exists, and it doesn't yet.

## SEO: prepared, deliberately not built out yet (Part 7)

No new indexable pages exist in this prompt. The guardrail for whoever
builds the future teacher directory or a category-filtered search page:
index the categories themselves (`/learn/mathematics` already does this
today), not every possible combination of category × age group ×
language × resource type — that's exactly the "thousands of thin pages"
Part 7 warns against, and search engines actively penalize it. A
directory page filtered to one meaningful axis (subject, or age group)
is worth indexing; a page that only exists because a URL pattern allows
crossing four filters together usually isn't.

## AEO: plain labels over internal names (Part 8)

Every taxonomy option in this prompt has a human `label` distinct from
its internal `id` — `id: "phonics-based-reading"` reads as "Phonics-based
reading," never as the raw id, kebab-case, or an abbreviation, anywhere
in the UI. This matters as much for a person skimming a checkbox grid as
for an answer engine trying to understand what a category means; neither
should ever see the internal identifier.
