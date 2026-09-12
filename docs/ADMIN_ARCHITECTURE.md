# Admin Architecture

Introduced in Prompt 56: the first `/admin` route anywhere in this
codebase, scoped to exactly one real area — teacher management. Read
`docs/ACCOUNTS_ARCHITECTURE.md` (roles), `docs/TEACHER_ARCHITECTURE.md`
(the profile model), and `docs/TEACHER_DIRECTORY_ARCHITECTURE.md` (the
two moderation gates) first — this doc only covers what's specific to the
admin surface itself.

## Why this doesn't rebuild anything

`AccountRole` (`src/lib/accounts/types.ts`) has carried `"admin"` since
Prompt 21, and `TeacherProfile.moderationStatus` /
`TeacherProfile.verified` / `Resource.reviewStatus` have all existed since
Prompts 27–29 and 42 as fields explicitly documented as "prepared
architecture — no reviewer tool exists yet." This prompt builds exactly
that missing reviewer tool. It doesn't touch teacher registration, the
profile editor, the public directory, or resource creation — it adds a
new, separate read/moderate surface over the exact same records those
already write.

## The one real limitation: no shared backend

There is still no Supabase project connected
(`src/lib/supabase/is-configured.ts`). Every teacher profile lives only
in the browser that created it (`src/lib/accounts/local-teacher.ts` — a
browser holds at most one). That means:

- **The admin "teacher list" can only ever show this browser's own one
  teacher account** — never another browser's, never a real multi-teacher
  roster. `useAdminTeacherAccounts()` (`src/lib/accounts/admin-teacher-directory.ts`)
  says so in its own doc comment and returns `[]` or a one-item array,
  honestly, exactly the same shape a real
  `supabase.from("teacher_profiles").select("*")` query (no RLS
  visibility filter — an admin bypasses both moderation gates) would
  return once one exists.
- **Search and filtering are real, tested logic** (`filterAdminTeachers()`,
  `src/lib/accounts/admin-teacher-filters.ts` — mirrors
  `filterTeacherDirectory()`'s shape, plus a `moderationStatus` filter the
  public directory never exposes), operating correctly on whatever result
  set exists today. Nothing was padded with fake extra teachers to make
  the list look populated — Prompt 56 explicitly forbids that.
- **No fake teacher, qualification, award, review, rating, or
  verification badge was invented anywhere.** Every field the admin
  detail page shows (name, photo, bio, education, certifications,
  experience, age groups, subjects, languages, expertise, teaching
  interests, resources) is read straight from the same `TeacherProfile` /
  `Resource` records the teacher's own dashboard already writes.

## Honesty about authentication — the one real caveat

There is no session system (`docs/ACCOUNTS_ARCHITECTURE.md`), so there is
no way to actually check "is this visitor an admin" today. Every `/admin`
page carries a prominent, honest disclosure banner saying exactly that:
this area is reachable by anyone with the URL, the same as `/dashboard`
or `/teachers/dashboard` are today. This is not a bug being swept under
the rug — it's the same disclosed gap every other unauthenticated area of
this site already states plainly. Once real accounts and sessions exist,
every `/admin` route requires a real server-side check
(`getServerSession()` or equivalent → `account.role === "admin"`),
enforced before any data is read or written — never a client-side flag,
and never inferred from the URL alone.

## What the new moderation controls actually do

Two fields that existed since Prompts 27–29/42 but had no real setter
anywhere finally have one, added specifically for this admin area and
kept separate from the teacher's own edit paths (the same separation
`setLocalTeacherVisibility` already established for the teacher's own
visibility toggle):

- **`setLocalTeacherModerationStatus()`** (`src/lib/accounts/local-teacher.ts`)
  — sets `pending | approved | rejected | hidden`. Approving makes
  `canListTeacherInDirectory()` return `true` (real, tested logic — see
  `docs/TEACHER_DIRECTORY_ARCHITECTURE.md` for why the directory itself
  still shows nothing, even so). Rejecting or hiding makes
  `canViewTeacherProfile()` return `false` immediately, which really does
  block `/teachers/p/[slug]` in this browser right away.
- **`setLocalTeacherVerified()`** — sets the `verified` boolean. A real
  human decision, recorded honestly the moment an admin clicks it — never
  automatic, and nothing before Prompt 56 could ever set it to `true`.
- **`setLocalTeacherResourceReviewStatus()`** (`src/lib/resources/local-teacher-resources.ts`)
  — sets one resource's `reviewStatus` to `approved | rejected`.
  Approving a `published` teacher-authored resource makes
  `isResourcePublished()` return `true` for it, which really does make it
  appear on that teacher's own public profile (`TeacherPublicProfilePage`
  filters `resources` through this exact function) — a genuine, testable
  end-to-end effect, not a cosmetic status change.

All three are exposed through the same hooks the rest of the app already
uses (`useTeacherProfile()`, `useTeacherResources()`) — no parallel "admin
data layer" was built, because there's only ever one real data layer to
read from.

## Resource ownership, protected

The admin resource table (inside `/admin/teachers/[teacherId]`) is
strictly read + review-status-only: title, type, submission state, and an
Approve/Reject action. There is no edit or delete control — admin can
moderate a resource's visibility decision, never rewrite or remove its
content. Ownership is already structural everywhere in this app (a
browser holds one teacher's resources, each carrying `author.teacherId`),
so there is no "another teacher's resource" this view could even
accidentally expose.

## UI

- **`/admin`** — a minimal index linking into the one real admin area
  today (teacher management). Not linked from any public navigation
  (`src/config/nav.ts` is untouched) — admin functionality is never
  exposed publicly, per `docs/ACCOUNTS_ARCHITECTURE.md`.
- **`/admin/teachers`** (`AdminTeacherList`) — search, subject/age-group/
  moderation-status filters, expertise search, and a dense table (name,
  subjects, age groups, moderation status, verified, visibility, resource
  count, a "Review" link). Honest empty states for "no teacher account on
  this device" vs. "no teacher matches your filters."
- **`/admin/teachers/[teacherId]`** (`AdminTeacherDetail`) — full profile
  (the same fields the teacher's own dashboard shows itself), the
  moderation/verification controls described above, and the resource
  ownership table. An unmatched id shows the same honest "we couldn't
  find that teacher account" state the admissions detail page already
  established for a bad application id.
- Visual language matches the rest of the site — the same `Card`,
  `Badge`, `Button`, `Alert`, and table styling `TeacherResourceList` and
  `ApplicationDetail` already use, just denser, per the brief's "efficient
  and professional" instruction. The public teacher experience
  (`/teachers`, `/teachers/p/[slug]`) is completely unchanged.

## SEO / AEO

Every `/admin` route sets `robots: { index: false, follow: false }` and
is never linked from `primaryNav`/`footerNav`/`sitemap.ts` — the same
"noindex and unlinked, not just noindex" standard every other private
surface in this app already meets. Public teacher pages
(`/teachers`, `/teachers/p/[slug]`) are completely untouched by this
prompt and remain exactly as SEO/AEO-ready as `docs/TEACHER_ARCHITECTURE.md`
already documents.

## Security

- No server-side role check exists yet, because there's no server to
  check against — disclosed prominently on every `/admin` page rather
  than silently assumed away. This is the one honest limitation this
  prompt cannot close.
- What *is* enforced today: every moderation action operates only on the
  one real record this browser can see — there is no id-based lookup that
  could reach another browser's data, because no such data is reachable
  from here at all (no API route exists anywhere in this codebase —
  confirmed via `find src/app -name route.ts`, zero results).
- No client-side "pretend" authorization check (e.g. a fake
  `isAdmin = true` flag) was added anywhere — that would be exactly the
  kind of fabricated security the project's honesty rules already forbid
  for every other feature. The gap is stated, not hidden.

## Testing

Verified live: `/admin/teachers` lists a real local teacher account (or
shows the honest empty state with none), search/expertise/moderation
filters narrow it correctly; `/admin/teachers/[teacherId]` shows every
real profile field, approving/rejecting/hiding actually changes
`canViewTeacherProfile()`'s real result on `/teachers/p/[slug]` in the
same browser; verifying flips the dashboard's own "Not yet verified"
badge to "Verified"; approving a submitted resource makes it actually
appear on the public profile page. Verified a mismatched `teacherId`
shows the honest not-found state, and that `/admin/teachers` is reachable
without any sign-in (the disclosed, expected gap). Confirmed existing
teacher registration, profile editing, the public directory, and resource
authoring are all unaffected. Ran typecheck, lint, the full Vitest suite,
and a production build.
