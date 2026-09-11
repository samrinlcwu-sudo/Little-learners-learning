# Teacher AI Assistant Experience

Introduced in Prompt 49, on top of Prompt 46's architecture
(`docs/AI_ASSISTANT_ARCHITECTURE.md`), Prompt 47's knowledge layer
(`docs/AI_KNOWLEDGE_LAYER_ARCHITECTURE.md`), and the same pattern Prompt
48 established for parents (`docs/AI_PARENT_ASSISTANT_ARCHITECTURE.md`).
UI/UX only — the assistant still answers through the Prompt 46
development-placeholder provider. No teacher registration, profile,
expertise, directory, or resource-management code was touched beyond the
one new entry point described below.

## What changed

1. **`TeacherHomeSections`** (`src/components/patterns/ai-assistant.tsx`)
   — the teacher-only view shown before any message is sent, mirroring
   `ParentHomeSections`'s shape:
   - **Explore by age group** — the same four real bands a teacher's own
     profile already uses (`TEACHER_AGE_GROUP_OPTIONS`,
     `src/config/teacher-options.ts`: Nursery, Preschool, Kindergarten,
     Primary), linking to `/resources?age={band's minYears}`.
   - **Learning areas** — all 16 real categories, linking to
     `/learn/[slug]` — identical list to the parent view, since the
     platform's subjects don't differ by audience.
   - **Your resources** — a real, one-line status count for *this*
     teacher's own resources (draft / awaiting review / published),
     built from `getTeacherResourceKnowledge` (Prompt 47). A teacher with
     no resources yet sees an honest "You haven't created any resources
     yet" instead of a blank section or an invented number.
   - Quick links to the resource library and back to the teacher
     dashboard.
   All three sections are real navigation and real, already-computed
   data — nothing here is sent through `sendMessage()`/the provider, and
   nothing is fabricated (no invented lesson plans, qualifications, or
   curriculum claims).
2. **Teacher-specific suggested questions** — `AUDIENCE_PROMPTS.teacher`
   expanded from two items to four, covering more of the brief's use
   cases: finding resources by age group, finding resources by subject,
   publishing, and understanding what age groups the platform supports.
   Clicking one still goes through the same honest placeholder reply as
   every other audience.
3. **A "Development preview" entry point in the existing Quick Actions
   grid.** Rather than adding a separate card region (the parent
   dashboard's approach, appropriate there because no equivalent grid
   existed), the teacher dashboard already has a "Quick actions" grid
   (Prompt 41) — "Ask the Learning Assistant" was added as its first
   entry, using the grid's existing `onClick`-action shape. `QuickAction`
   gained one new optional field, `badge?: string`, rendered as a small
   `Badge` in the action's icon row — used only by this entry, so it can
   never be mistaken for a finished feature. This is "integrate naturally
   into the existing dashboard" read literally: reuse the grid that
   already exists rather than building a second one.
4. **`useOpenAiAssistant()`** — a small new export from `ai-assistant.tsx`
   for call sites that already manage their own clickable element (like
   the Quick Actions array, which builds a plain `onClick`) rather than
   wrapping a child with `<AiAssistantTrigger asChild>`. Both call
   patterns open the exact same shared dialog via the same
   `AiAssistantOpenContext` from Prompt 48 — no new state, no new dialog
   instance.

## Why this still isn't "real AI," and why nothing is fabricated

The provider is unchanged — `getAiAssistantProvider()` still returns
`devPlaceholderProvider`, replying with the same fixed, audience-labeled
sentence regardless of what's typed. The "Development preview" badge now
appears in three places for a teacher: the dialog itself, the header
trigger's existing behavior, and this new dashboard card. The brief
explicitly warns against inventing lesson plans, qualifications,
achievements, research, religious content, or curriculum claims — nothing
in `TeacherHomeSections` generates any of that; it only ever surfaces real
counts of the teacher's own actual resource records and real links to
real pages. If a real provider is connected later, resource *creation*
still goes through the existing `TeacherResourceForm` /
`addLocalTeacherResource` flow (Prompt 42) — a teacher explicitly saves
draft or submits for review — so an AI suggestion could never become a
published resource without a human still doing that same real step.

## Permissions

- `TeacherHomeSections` reads `useTeacherProfile()` and
  `useTeacherResources()` — the same hooks the Teacher Dashboard itself
  already uses. Because a browser holds at most one local teacher account
  (`src/lib/accounts/local-teacher.ts`) and that teacher's resources are
  the only resources ever present in `local-teacher-resources.ts`, there
  is no "another teacher's" data this could structurally ever show — the
  same guarantee `getTeacherResourceKnowledge` already documents.
- Nothing about a child, a parent, or an admin is read anywhere in this
  file's teacher path. The assistant continues to gate on
  `AI_AUDIENCE_PERMISSIONS[audience].mayAccessAssistant` from Prompt 46,
  unchanged.

## SEO/AEO

No route, metadata, canonical, or robots rule changed. `/teachers/dashboard`
was already `robots: { index: false, follow: false }` and still is — the
assistant is a dialog with no URL of its own, exactly as in Prompts 46–48.
The public teacher profile route (`/teachers/p/[slug]`) and its existing
structured-data/allowlist architecture (`docs/TEACHER_ARCHITECTURE.md`,
`docs/TEACHER_DIRECTORY_ARCHITECTURE.md`) are untouched.

## Testing notes

Verified live: teacher registration → profile → expertise → dashboard →
resources → opening the assistant from the new Quick Actions card → real
age-group/learning-area links and a real resource-status line → back to
the dashboard, plus the existing public teacher profile page, all working
unchanged. Confirmed the assistant correctly shows teacher-specific
content only on teacher routes, the search-vs-assistant trigger
independence fixed in Prompt 48 still holds, and no console errors appear
on any step of the journey.
