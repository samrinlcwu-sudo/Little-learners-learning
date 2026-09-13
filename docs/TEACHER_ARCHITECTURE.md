# Teacher Registration & Profile Architecture

Introduced in Prompt 26 (registration) and extended in Prompt 27 (the
profile editor, profile completion, and public/private profile
architecture), Prompt 28 (the shared expertise/resource taxonomy),
Prompt 29 (the searchable teacher directory), and Prompt 41 (the
consolidated dashboard), on top of the account foundation from Prompt 21
(`docs/ACCOUNTS_ARCHITECTURE.md`). Read that doc first — this one only
covers what's specific to teachers. Where a category list comes from and
how it stays consistent across the rest of the site is covered
separately in `docs/TAXONOMY_ARCHITECTURE.md`; the public directory,
search, filters, and moderation states are covered in
`docs/TEACHER_DIRECTORY_ARCHITECTURE.md`; teacher-authored resource
creation and its own review lifecycle is covered below, in "Resource
creation (Prompt 42)."

## Why a dedicated flow, not a role picker

`/sign-up` (parent accounts) asks for four fields and nothing more. A
teacher's professional identity needs more — country, and eventually a
bio, subjects, experience — and forcing that onto the same generic form
either bloats it for parents or hides fields behind a role picker that
feels like an afterthought. So teacher registration is its own flow,
starting at `/teachers/register`, reusing the same design system and
validation pattern (`AuthFormShell`, `Input`, `PasswordInput`, Zod +
React Hook Form) rather than inventing new ones. `signUpSchema` no longer
has a `role` field — it's parent-only now; a teacher is pointed to the
dedicated flow from `/sign-up`'s footer link.

## The flow

```
Create Teacher Account  →  Verify Account  →  Complete Professional Profile  →  Teacher Dashboard
   /teachers/register       /teachers/register/verify   /teachers/register/profile      /teachers/dashboard
```

Each step is its own route, all under `/teachers/` (alongside the public
`/teachers` landing page) and all `robots: { index: false, follow: false }`
— see "SEO & AEO" below for why that split matters.

1. **Create Teacher Account** (`/teachers/register`) — Full Name, Email,
   Country/Region, Password. The only required fields, matching the brief:
   "do not force a huge form before creating an account."
2. **Verify Account** (`/teachers/register/verify`) — honestly explains
   that no email service is connected, so no real verification link was
   sent, and lets the teacher continue. Never fakes a "verified!" state.
3. **Complete Professional Profile** (`/teachers/register/profile`) —
   every field optional, organized into clear sections (Identity, About,
   Education, Certifications, Experience, Teaching) rather than one long
   form: photo, headline, bio, education, certifications, years of
   experience, age groups taught, subjects, languages, areas of
   expertise, teaching interests. Also the page a teacher returns to
   later to edit their profile — one form, not two, with Cancel, Preview,
   and Save all in one place (Prompt 27, Part 2).
4. **Teacher Dashboard** (`/teachers/dashboard`) — a grouped profile
   completion breakdown, professional information, teaching expertise,
   the profile visibility control, real links into the Resource Library,
   and an honest "what's ahead" list.

## What's real vs. what isn't (and why that split is safe)

Exactly the same split Prompt 22 established for parents and child
profiles, applied to teachers:

- **Account creation itself is not real.** No Supabase project is
  connected (`src/lib/supabase/is-configured.ts`), so there is no actual
  sign-up, no session, and — critically — **the password is validated for
  format and then discarded**. It never reaches `localStorage`, a
  variable outside the submit handler, or anywhere else. This matches the
  existing rule that passwords are never touched by this codebase's own
  code (`docs/ACCOUNTS_ARCHITECTURE.md`).
- **The profile is real.** Name, email, country, and every
  profile-completion field are written to this browser's `localStorage`
  (`src/lib/accounts/local-teacher.ts`) the moment they're submitted —
  because a teacher typing their own bio isn't a problem that needs a
  backend to be safe or useful, the same reasoning that made child
  profiles real in Prompt 22. Nothing here is ever sent anywhere.
- **`verified` is never set automatically.** It stays `false` until a
  real human review process exists to set it — shown honestly on the
  dashboard as "Not yet verified," never faked as a trust signal.

### The profile photo, specifically

A teacher's own photo (unlike a child's) isn't the same privacy problem —
an adult voluntarily sharing their own professional photo is normal and
low-risk. There's still no file-storage backend, so instead of skipping
the field, it's read client-side as a data URL (`FileReader`, capped at
2MB) and stored in the same local profile record. It never leaves the
browser, exactly like every other field here — this is a real, working
feature, not a preview, with the same "stored on this device only"
disclosure shown right on the form.

## Role assignment and authorization

`Account.role` (`src/lib/accounts/types.ts`) already includes `"teacher"`
as a value distinct from `"parent"` and `"admin"` — nothing about this
prompt changes that type. A teacher account created through this flow is
conceptually a `role: "teacher"` account; it never gains parent-dashboard
access or admin access, and nothing in this codebase grants elevated
permissions client-side. Once Supabase is connected, the real rule is
server-side: a `teacher_profiles` row is scoped by Row Level Security to
its own `accountId`, and no route or query lets a teacher account read or
write another account's data, a parent's child profiles, or anything
admin-only. `/admin/teachers` (Prompt 56, `docs/ADMIN_ARCHITECTURE.md`) is
now the first real `/admin` route in this codebase — see that doc for why
it isn't yet protected by a real server-side role check either, and what
changes once one exists.

## Data model

`TeacherProfile` (`src/lib/accounts/types.ts`) now carries every field
this flow collects: `name`, `email`, `countryRegion`, `slug` (required —
`slug` is generated, never typed), plus optional `photo`, `headline`,
`bio`, `education`, `certifications`, `yearsExperience`,
`ageGroupsTaught`, `subjects`, `languages`, `teachingInterests`, and
`expertise`, plus `visibility` (Prompt 27 — see "Privacy & visibility"
below). `subjects` reuses learning-category slugs from
`src/config/learning-categories.ts` — the same list `/learn` and the
Resource Library already use — rather than inventing a second list of
subjects that could drift from the real ones. `ageGroupsTaught` and
`languages` are short fixed lists (`TEACHER_AGE_GROUPS`,
`TEACHER_LANGUAGES`) rather than free text, so profiles stay comparable.
`expertise` is deliberately the opposite — free-text tags ("Special
needs support," "Bilingual education") entered as one comma-separated
field, because a teacher's specialties aren't a closed set the way
subjects are.

A profile saved before Prompt 27 won't have `slug`, `visibility`, or
`expertise` yet — `local-teacher.ts`'s `normalize()` backfills them on
read (a missing slug is generated and immediately persisted, so it never
changes on a later reload and silently break a shared link).

## Profile completion is a real calculation, grouped into sections

`src/lib/accounts/teacher-profile-completion.ts` counts exactly which
profile fields are actually filled in and reports a real percentage —
never an estimate, never rounded up "for encouragement." It's grouped
into the same three named sections the editor and dashboard use —
**Basic Information** (photo, headline), **Professional Information**
(bio, education, certifications, years of experience), **Teaching
Expertise** (age groups, subjects, languages, expertise, teaching
interests) — per Prompt 27 Part 3's request for a breakdown, not just one
flat number. Required account fields (name, email, country) are excluded
from the count on purpose: they exist the instant an account is created,
so counting them would inflate everyone's starting percentage before
they've touched their profile at all. **Resources** is shown as its own
section everywhere (editor's absence, dashboard, public profile) but is
never scored — resource authoring isn't built yet, so there's nothing a
teacher could fill in there; scoring it would unfairly cap everyone below
100% for a feature that isn't theirs to complete.

## Validation

`src/lib/validations/teacher.ts` — `teacherAccountSchema` (name, email,
country, password, all required) and `teacherProfileSchema` (everything
optional). Reuses `emailSchema`/`nameSchema` from `common.ts` and
`passwordSchema` from `auth.ts`, so the rules stay identical to every
other form on the site — an invalid email or a too-short password shows
the same error message everywhere, not a slightly different one here.
Every error is a plain sentence; no raw Zod issue codes or stack traces
ever reach the UI.

## The profile editor (Prompt 27, Part 2)

`src/components/patterns/teacher-profile-form.tsx` is the one form used
for first-time completion and every later edit, in clear labeled
`<section>`s rather than one long wall of fields. Three actions, shown
based on context:

- **Save** — "Save and continue" on first-time completion (redirects to
  the dashboard, which is itself the confirmation); "Save changes" on
  every later edit, which instead shows an inline "Profile updated."
  banner and stays on the page — redirecting someone away right after
  they asked to save a small change would read as if it hadn't worked.
- **Cancel** — edit mode only (first-time gets "Skip for now" instead,
  which is the same idea: leave without saving). Discards in-progress
  changes and returns to the dashboard.
- **Preview** — opens a modal rendering the exact same
  `TeacherPublicProfileContent` component the real public page uses, fed
  with the form's *current, unsaved* values (validated through the real
  `teacherProfileSchema` so a preview can never diverge from what Save
  would actually produce). If visibility is still Private, the modal says
  so plainly — a preview is not the same as being visible to anyone.

## Public profile architecture (Prompt 27, Part 4)

`/teachers/p/[slug]` is a real route with real access-control logic, not
a mockup. What it can't be — yet — is a page that looks up a specific
teacher from a shared database, because there isn't one
(`src/lib/supabase/is-configured.ts`). So today it can only ever find and
show the *browser's own* profile:

1. Read the local teacher record.
2. Compare its `slug` to the route param — no match (wrong device, wrong
   link, no local account at all) shows an honest "we couldn't find this
   profile" state that explains the device-bound limitation, never a
   generic 404.
3. Check `visibility` — `"private"` shows "this profile is private,"
   never the data underneath it.
4. Only then render `TeacherPublicProfileContent`, fed through
   `toPublicTeacherProfile()` (`src/lib/accounts/teacher-public-profile.ts`).

**The public field allowlist is deliberately narrower than "everything
that isn't obviously sensitive."** `toPublicTeacherProfile()` passes
through exactly: name, photo, headline, bio, education, certifications,
years of experience, country/region, age groups, subjects, languages,
expertise, and verification status. Email, teaching interests, and every
other private-dashboard field are never passed to it. Country and
languages were added in Prompt 29 specifically because its directory
search (Part 2) asks to search by language and "region where
appropriate" — both are low-sensitivity, unlike an exact address — see
`docs/TEACHER_DIRECTORY_ARCHITECTURE.md` for the full reasoning. The same
function backs the real route, the directory card, and the editor's
Preview modal, so none of them can ever show more than the others would.

### Privacy & visibility (Prompt 27, Part 5)

`TeacherProfile.visibility` is `"private" | "public"`, defaulting to
`"private"` on every new account — a profile is never public just
because it exists, and nothing in this codebase flips it automatically.
Only the teacher's own toggle on the dashboard
(`setLocalTeacherVisibility`, `src/lib/accounts/local-teacher.ts`)
changes it. This is kept as a dedicated function, separate from the
general profile-update path, so the editor's Save can never accidentally
publish a profile as a side effect of saving unrelated content changes.

Prompt 29 added the moderation half of this: `TeacherProfile.moderationStatus`
(`"pending" | "approved" | "rejected" | "hidden"`, defaulting to
`"pending"`) is the platform's independent gate alongside the teacher's
own `visibility` toggle. See `docs/TEACHER_DIRECTORY_ARCHITECTURE.md`,
"Two gates," for exactly how they combine
(`src/lib/accounts/teacher-visibility.ts`) and why no profile can reach
`"approved"` automatically.

## SEO / AEO

`/teachers` — the public landing page — remains the one discoverable,
indexable page for "teacher" search intent: it explains what the platform
offers educators, links to registration, and is the page
`src/app/sitemap.ts` lists. Every account-flow page
(`/teachers/register`, `/teachers/register/verify`,
`/teachers/register/profile`, `/teachers/dashboard`) is a private,
`noindex` surface, exactly like `/sign-up`, `/dashboard`, and the rest of
the account system.

### SEO for the public profile, specifically

`/teachers/p/[slug]` sets `robots: { index: false, follow: false }`
**unconditionally today, even for a profile a teacher has set to
Public.** This isn't a placeholder oversight — it's the honest
consequence of the same backend gap described above: Next's
`generateMetadata` runs server-side, before any browser-local data is
readable, so it has no way to know whether the profile behind a given
slug is public, private, or real at all. Indexing a page whose content
the server can't verify — including whether it's actually private — is
exactly the risk Part 7 warns against ("private profiles must not be
indexed"), so the safe default is noindex for all of them until a real
backend can answer that question server-side.

Once Supabase exists, this becomes a real `generateMetadata({ params })`
that:

- Looks up the row by slug, builds a unique title (`"{name} — Teacher
  Profile"`) and description from the real headline/bio, and sets a
  canonical URL — the same `buildSocialMetadata()` helper every other
  page uses (`src/lib/seo/social-metadata.ts`).
- Sets `robots: { index: true, follow: true }` **only** when
  `canViewTeacherProfile()` (`src/lib/accounts/teacher-visibility.ts`)
  says so — never unconditionally.
- Adds `Person`/`ProfilePage` structured data built from exactly the same
  public-field allowlist `toPublicTeacherProfile()` already defines, so
  structured data can never describe something the visible page doesn't
  — the same anti-drift principle `docs/SEO_ARCHITECTURE.md` already
  applies to `BreadcrumbList`.

### AEO labeling (Prompt 27, Part 8)

`TeacherPublicProfileContent` uses one plain, literal heading per
section — About, Education, Certifications, Experience, Age Groups,
Subjects, Expertise, Resources — matching exactly what Part 8 asked for.
Nothing is padded with keyword variations or restated for search
engines; a section simply doesn't render if the teacher hasn't filled in
that field; there's nothing there to over-explain.

## Privacy

Email, country, password, and every profile field never leave the
browser they were entered in — there is no API call, no database row.
The same belt-and-suspenders pattern as child profiles applies:

- Every account-flow route sets `robots: { index: false, follow: false }`,
  and the public profile route does too until visibility can be verified
  server-side (see above).
- No account-flow page's metadata is generated from the teacher's own
  data (title/description are generic, e.g. "Teacher Dashboard," never
  the teacher's name), so nothing private can leak through a `<title>`
  tag or a shared link preview.
- The public profile page only ever renders fields from the explicit
  allowlist, and only when `visibility === "public"` — there's no page
  anywhere that lists or exposes another teacher's data, because there's
  no mechanism (no backend) that could.

## Resource creation (Prompt 42)

Prompt 28's `getAllTeacherResourceTypeOptions()` (`src/config/teacher-resource-types.ts`)
was explicitly built ahead of this — "the moment a real 'create a
resource' form is built, its type picker reads from
`getAllTeacherResourceTypeOptions()` below instead of inventing its own
list." This prompt is that form.

### The model: no new content type

A teacher-created resource is an ordinary `Resource`
(`src/lib/resources/types.ts`) — the exact same shape `SAMPLE_RESOURCES`
uses, with `author: { role: "teacher", teacherId }`. Nothing new was
declared except one additive, optional field:

```ts
reviewStatus?: "pending" | "approved" | "rejected";
```

`isResourcePublished()` now also requires `reviewStatus === "approved"`
whenever `author.role === "teacher"`. A teacher-authored resource is set
to `publicationStatus: "published"` (via "Submit for review" in the
dashboard) but stays invisible everywhere that gate is checked until a
real admin decision sets `reviewStatus` to `"approved"` in
`/admin/teachers/[teacherId]` — see `docs/ADMIN_ARCHITECTURE.md`
(Prompt 56). Before that admin area existed, this was "prepared
architecture, not simulated" with no way to ever actually reach
`"approved"`; now the lifecycle genuinely works end to end, exactly the
same way a teacher profile can now actually reach
`moderationStatus: "approved"` too (`docs/TEACHER_DIRECTORY_ARCHITECTURE.md`).

### Storage: the same tiny external store pattern

`src/lib/resources/local-teacher-resources.ts` mirrors
`local-children.ts` exactly — an array in this browser's `localStorage`,
read via `useSyncExternalStore`
(`src/lib/resources/use-teacher-resources.ts`). A browser holds at most
one local teacher account, so this is simply "this browser's teacher's
resources," though every resource still carries `author.teacherId` for
when a real multi-tenant table exists.

### No file upload, on purpose

The create/edit form (`teacher-resource-form.tsx`) has no file or
download field. This codebase has never had real file storage — every
`SAMPLE_RESOURCES` entry already ships with no `downloadFile` for the
same reason — so offering an upload that couldn't actually store
anything would be exactly the fabricated capability the project's
honesty rules forbid. A teacher fills in the same descriptive fields
(title, description, type, subject, age range, difficulty, learning
objective, an optional thumbnail) that already exist on `Resource`.

### Where teachers manage their own resources

The dashboard's "Your resources" section
(`teacher-dashboard.tsx` + `teacher-resource-list.tsx`) is a real table —
title, subject, type, status, created date, edit/delete — never the
`ResourceCard` browsing grid, since managing your own list and
discovering the library are different tasks. Ownership is structural:
a browser can only ever hold one teacher's resources, so there is no
"another teacher's private resource" this device could read or edit.

### Where they integrate publicly

`TeacherPublicProfileContent` — already shared by the real public route
and the profile editor's "Preview" modal — gained an optional
`resources` prop, filtered through the same `isResourcePublished()`
gate and rendered with the same `ResourceCard` component `/resources`
uses. This satisfies "don't build a second, disconnected library"
without inventing a live public feed: since no resource can pass the
gate yet, this section honestly shows "hasn't published any resources
yet" for every real visitor, same as the teacher directory being
honestly empty today.

### A known, disclosed limit

`ResourceCard`'s action links to `/resources/[slug]`, a page whose
`generateStaticParams()` only knows about `SAMPLE_RESOURCES` — a
server-rendered page has no way to read one browser's `localStorage`.
A teacher-authored resource's own detail page can only exist once a
real backend serves it, exactly the same limitation the public profile
route already has ("a public profile link only works in the browser it
was created in"). Not a bug introduced here — the inherent shape of
"real backend-free architecture" this entire codebase already commits to.

## Teacher Membership is a separate future product (Prompt 62)

`docs/MEMBERSHIP_ARCHITECTURE.md` models a `"teacher"` membership type,
kept structurally independent from everything documented above. Having a
`TeacherProfile` — even a fully `verified`, `moderationStatus: "approved"`
one — implies nothing about premium access. `Membership.accountId` for a
teacher membership references the teacher's own `Account.id`; no code
path derives it from `TeacherProfile`, and no code path treats "is a
teacher" as "has Teacher Membership." A teacher who wanted it would need
a real order and a real membership, exactly like a parent would.

## Registration & expertise management (Prompt 66)

Prompt 66 asked for "a professional teacher registration and
administration system" naming a long list of professional-information
fields, a five-status review workflow, and admin review tooling. The
finding, after inspecting the existing architecture first (per the
prompt's own instruction): **almost everything named already existed**,
built across Prompts 27–29, 42, and 56. This section documents exactly
what was genuinely new versus what was simply confirmed and left alone —
"do not rebuild" applied literally.

### What already covered the brief, unchanged

| Brief asks for | Already exists as |
|---|---|
| Full name, profile photo, professional bio | `TeacherProfile.name`/`.photo`/`.bio` — registration + profile editor |
| Education, qualifications, certifications, professional training | `.education` and `.certifications` (the latter's own field label already reads "Certifications, teacher training, or workshops") |
| Years of experience, teaching experience, age groups taught | `.yearsExperience`, `.ageGroupsTaught` |
| Languages | `.languages` |
| Region/location at an appropriate privacy level | `.countryRegion` — always a coarse region, never a street address, and already included in `PublicTeacherProfile` |
| Teaching interests | `.teachingInterests` |
| Resources created | Already shown on the Teacher Dashboard, the public profile, and `AdminTeacherDetail` |
| Extensible expertise categories | `subjects` (from `src/config/learning-categories.ts`, already config-driven and extensible) plus the free-text `expertise` field |

None of these needed a new field, a new form section, or a new taxonomy —
adding one would have been exactly the duplicate system the brief warns
against.

### The "Expertise" list: mapped, not duplicated

The brief's 16-item expertise list is, on inspection, almost identical to
what `subjects` (13 of the 16 items, verbatim) and `ageGroupsTaught`
already cover:

- "Preschool" and "Kindergarten" are not new — `TEACHER_AGE_GROUP_OPTIONS`
  (`src/config/teacher-options.ts`) already displays the `"preschool"` and
  `"early-primary"` age bands under exactly those labels ("Preschool
  (3–5)", "Kindergarten (5–6)").
- "Early Childhood Education" has no single existing checkbox because it
  isn't a distinct selectable category anywhere in early-years
  education — it's the umbrella term for the whole 2–8 age range this
  platform already covers; a teacher communicates it by selecting age
  groups, not by a 17th redundant checkbox.
- The remaining 13 items (English & Early Literacy, Mathematics, Early
  Writing, Science & Discovery, World Around Us, Life Skills,
  Social & Emotional Learning, Creativity, Quran Learning — Nazra, Arabic
  Letters, Foundational Quran Reading, Educational Activities, Learning
  Games) are exactly 13 of the 16 real `learning-categories.ts` slugs
  already selectable under "Subjects / learning areas" — the three
  excluded (Puzzles, Mazes, Coloring) are resource *formats*, not subject
  expertise, so the brief's own list correctly excludes them too.

Given that, creating a second, parallel "expertise taxonomy" duplicating
13 of 16 entries from an existing one — just to also cover two labels
that already exist under different field names — would be the "duplicate
system" the brief explicitly forbids. The only change made was a
one-line, zero-risk clarification: the profile form's "Teaching" section
now opens with "Your expertise — the age groups and subjects you're
equipped to teach, plus languages and approach," so the connection to the
brief's terminology is explicit without moving or renaming any field.

### The one genuinely new thing: "Needs Changes"

The brief's workflow (`Pending → Under Review → Approved / Rejected /
Needs Changes`) doesn't fully fit this codebase's architecture, and the
brief itself says to "only implement statuses that fit the existing
architecture" — so only part of it was built:

- **"Needs Changes" was added** — a real, admin-triggerable
  `TeacherModerationStatus` value with its own real effect: it behaves
  like `"pending"` for visibility (still viewable via direct link,
  `docs/TEACHER_DIRECTORY_ARCHITECTURE.md`) but is never directory-listed,
  and the Teacher Dashboard shows a clear, specific message ("An admin
  has asked for changes...") distinct from the generic pending message.
  `TEACHER_MODERATION_STATUSES` (`src/lib/accounts/types.ts`) is the one
  place it's declared; `AdminTeacherDetail`'s moderation buttons already
  iterate that array generically, so no new button-specific code was
  needed there.
- **"Under Review" was deliberately not added.** This codebase has no
  reviewer-assignment system, no multi-admin identity, and no queue — a
  single shared admin passphrase either has or hasn't acted on a profile
  (`docs/ADMIN_ARCHITECTURE.md`). A status meaning "an admin is looking
  at this right now" would carry no real, distinguishable information
  beyond "pending" — nothing in this codebase could ever set it honestly.
  Adding it would be exactly the kind of status the brief's own qualifier
  ("only implement statuses that fit the existing architecture") warns
  against.

### Consolidation triggered by the new status

Adding a fifth status revealed that `MODERATION_BADGE_VARIANT` had been
independently reinvented, identically, in three separate files
(`admin-teacher-list.tsx`, `admin-teacher-detail.tsx`,
`teacher-dashboard.tsx`) — each would have needed the same one-line
addition. Rather than editing three copies, all three now import one
shared `TEACHER_MODERATION_BADGE_VARIANT` from `src/lib/accounts/types.ts`,
alongside the `TEACHER_MODERATION_STATUS_LABELS` map that already
existed for exactly this "never let the wording drift" reason.
`teacher-dashboard.tsx` also had its own duplicate copy of
`TEACHER_MODERATION_STATUS_LABELS` itself (never actually importing the
shared one) — that's now consolidated too.

### Security and privacy, reconfirmed rather than rebuilt

- **"Approval must happen server-side"** — read literally, this can't be
  true today: no API route exists anywhere in this codebase
  (`docs/ADMIN_ARCHITECTURE.md`, "Security"), so there is no server-side
  mutation endpoint for anything, including this. What *is* server-side,
  and unchanged by this prompt, is the only real security boundary that
  exists: Proxy (`src/proxy.ts`) blocks the request for the entire
  `/admin/*` page — HTML and JS bundle both — before it ever reaches an
  unauthenticated browser. The moderation buttons are plain client code,
  but no one who isn't already authenticated can ever load the page that
  contains them. Adding "needs-changes" changes nothing about this
  boundary.
- **Never allow a teacher to access unrelated private parent
  information** — already structurally impossible: teacher
  authentication and admin authentication are two entirely separate
  systems (`docs/ADMIN_ARCHITECTURE.md`, "Parent management," Prompt 65);
  a teacher session grants zero path into `/admin/*`.
- **A teacher can only edit their own permitted profile** —
  `updateLocalTeacherProfile()`'s own type (`TeacherProfileUpdates`,
  `src/lib/accounts/local-teacher.ts`) structurally excludes
  `moderationStatus`, `verified`, and `accountStatus` — a teacher's own
  form cannot construct a request that touches them, regardless of what
  values it might contain.
- **Public directory exposure** — `toPublicTeacherProfile()`
  (`src/lib/accounts/teacher-public-profile.ts`) already excludes email,
  `accountId`, `moderationStatus`, `visibility`, and `accountStatus` from
  every public-facing view; adding `"needs-changes"` to the
  `moderationStatus` union changes nothing about that exclusion — it was
  never a value on the allowlist to begin with.

### What was not built

- No "future services offered" field — that's what the `Offering`/
  `Membership` architecture (`docs/BUSINESS_ARCHITECTURE.md`,
  `docs/MEMBERSHIP_ARCHITECTURE.md`) already models at the platform
  level; a teacher-specific "service" would be a real future `Offering`
  or `"teacher"`-type `Membership`, not a free-text profile field
  inviting an unfulfillable promise.
- No admin "review notes" field — the brief's PRIVACY section only says
  such notes must never be public if they exist; none were added, since
  the plain moderation-status change plus its existing audit-log entry
  (`recordAdminAuditEvent`, unchanged) already gives the admin side a
  real record without inventing a new sensitive-data field to then have
  to protect.
- No teacher self-service resubmission button or status-change
  confirmation flow — editing and saving the profile (already fully
  working) is the entire "resubmit" action; a separate button would just
  call the same save path.
