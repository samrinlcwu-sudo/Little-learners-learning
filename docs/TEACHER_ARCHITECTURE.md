# Teacher Registration Architecture

Introduced in Prompt 26, on top of the account foundation from Prompt 21
(`docs/ACCOUNTS_ARCHITECTURE.md`). Read that doc first — this one only
covers what's specific to teachers.

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
   every field optional (photo, bio, education, certifications, years of
   experience, age groups taught, subjects, languages, teaching
   interests). Also the page a teacher returns to later to edit their
   profile — one form, not two.
4. **Teacher Dashboard** (`/teachers/dashboard`) — profile completion,
   professional information, teaching expertise, real links into the
   Resource Library, and an honest "what's ahead" list.

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
admin-only. There is still no `/admin` route anywhere in this codebase.

## Data model

`TeacherProfile` (`src/lib/accounts/types.ts`) now carries every field
this flow collects: `name`, `email`, `countryRegion` (required at
creation), plus optional `photo`, `bio`, `education`, `certifications`,
`yearsExperience`, `ageGroupsTaught`, `subjects`, `languages`, and
`teachingInterests`. `subjects` reuses learning-category slugs from
`src/config/learning-categories.ts` — the same list `/learn` and the
Resource Library already use — rather than inventing a second list of
subjects that could drift from the real ones. `ageGroupsTaught` and
`languages` are short fixed lists (`TEACHER_AGE_GROUPS`,
`TEACHER_LANGUAGES`) rather than free text, so profiles stay comparable.

## Profile completion is a real calculation

`src/lib/accounts/teacher-profile-completion.ts` counts exactly which of
nine profile fields are actually filled in and reports a real percentage
— never an estimate, never rounded up "for encouragement." Required
account fields (name, email, country) are excluded from the count on
purpose: they exist the instant an account is created, so counting them
would inflate everyone's starting percentage before they've touched their
profile at all.

## Validation

`src/lib/validations/teacher.ts` — `teacherAccountSchema` (name, email,
country, password, all required) and `teacherProfileSchema` (everything
optional). Reuses `emailSchema`/`nameSchema` from `common.ts` and
`passwordSchema` from `auth.ts`, so the rules stay identical to every
other form on the site — an invalid email or a too-short password shows
the same error message everywhere, not a slightly different one here.
Every error is a plain sentence; no raw Zod issue codes or stack traces
ever reach the UI.

## Privacy

Email, country, and every profile field never leave the browser they were
entered in — there is no API call, no database row. The same
belt-and-suspenders pattern as child profiles applies:

- Every route in this flow sets `robots: { index: false, follow: false }`.
- No page's metadata is generated from the teacher's own data (title/
  description are generic, e.g. "Teacher Dashboard," never the teacher's
  name), so nothing private can leak through a `<title>` tag or a shared
  link preview.
- Only the fields a teacher fills in on the dashboard are ever shown, and
  only to that same browser — there's no page anywhere that lists or
  exposes another teacher's data, because there's no mechanism (no
  backend) that could.

## SEO / AEO

`/teachers` — the public landing page — remains the one discoverable,
indexable page for "teacher" search intent: it explains what the platform
offers educators, links to registration, and is the page
`src/app/sitemap.ts` lists. Every page in this prompt
(`/teachers/register`, `/teachers/register/verify`,
`/teachers/register/profile`, `/teachers/dashboard`) is a private,
`noindex` account surface, exactly like `/sign-up`, `/dashboard`, and the
rest of the account system — none of them are written for AEO, none are
added to the sitemap, and none carry structured data. This is the same
distinction `docs/ACCOUNTS_ARCHITECTURE.md` already draws between a
public landing page and its private account surfaces.
