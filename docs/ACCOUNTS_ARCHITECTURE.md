# Accounts & Authentication Architecture

Introduced in Prompt 21: the foundation for user accounts, not accounts
themselves. No Supabase project is connected (`NEXT_PUBLIC_SUPABASE_URL`/
`NEXT_PUBLIC_SUPABASE_ANON_KEY` are blank in `.env.local` — see
`src/lib/supabase/is-configured.ts`), so nothing in this system creates,
stores, or authenticates a real user yet. Every screen says so plainly.

## Why no accounts exist yet, deliberately

Building a fake backend (an in-memory "signed in" state, a cookie that
just says `loggedIn: true`) would be worse than not building one — it
would look real without any of the guarantees a real auth system has to
provide (password hashing, session security, email verification). The
brief for this prompt is explicit about the same tradeoff the Games Hub's
`noopGameProgressStore` (`src/lib/games/progress.ts`) already made: define
the contract now, connect a real implementation later, never simulate one
in between.

## Roles

`src/lib/accounts/types.ts` defines `AccountRole = "parent" | "teacher" |
"admin"`.

- **Parent** and **Teacher** are the two roles someone can actually sign
  up as today (see the role picker on `/sign-up`).
- **Admin** exists in the type so the system doesn't need a breaking
  change to add it later, but there is no `/admin` route, no admin UI, and
  no admin sign-up path anywhere in this codebase. When admin
  functionality is built, it must live behind real server-side role
  checks, never a client-side flag — "don't expose admin functionality
  publicly" means the route shouldn't exist for anyone without the role,
  not just that it's unlinked.
- **Child** is intentionally not a role. A child doesn't hold their own
  credentials — a child is a profile a parent account manages (see
  `ChildProfile`). This matches how every mainstream product handles
  young children, and avoids the real safety and legal complexity (COPPA
  and equivalents) of giving a young child their own login.

## Data model (contracts only — no table exists yet)

- `Account` — id, email, name, role, createdAt. Maps to Supabase Auth's
  `auth.users` plus a `profiles` table for the fields Supabase Auth
  doesn't hold (name, role) once a project exists.
- `ChildProfile` — id, parentAccountId, name, ageYears, avatar,
  favoriteCategory (optional), createdAt. One parent, many children
  (`parentAccountId` is a foreign key, not an array on `Account`, so a
  `child_profiles` table can grow independently). `avatar` is one of six
  fixed emoji choices (`CHILD_AVATAR_IDS`) — never a photo upload, which
  sidesteps needing to secure a real image of a child rather than adding a
  policy on top of collecting one.
- `TeacherProfile` — id, accountId, bio, subjects, yearsExperience,
  verified, createdAt. Separate from `Account` so a teacher's
  public-facing profile (what `/teachers` describes as "coming later")
  doesn't mix with private account fields like email. `verified` is
  set by a human review step, never automatically — same rule the
  religious-content review gate already follows elsewhere.

When Supabase is connected, each of these becomes a table with Row Level
Security: a parent account can read/write its own `child_profiles` rows
and nothing else's; a teacher can read/write its own `teacher_profiles`
row; `admin` bypasses both policies via a server-side check, never a
client-visible one.

## Auth screens (real UI, real validation, no live backend)

Six screens, all under `src/app/{sign-up,sign-in,forgot-password,
reset-password,account}` plus the "sign out" concept described below:

| Screen | Route | Fields |
|---|---|---|
| Sign Up | `/sign-up` | Name, Email, Role (Parent/Teacher), Password |
| Sign In | `/sign-in` | Email, Password |
| Forgot Password | `/forgot-password` | Email |
| Reset Password | `/reset-password` | New password |
| Account | `/account` | — (always shows the signed-out state today) |

Each form (`src/components/patterns/*-form.tsx`) validates with the same
Zod + React Hook Form pattern the README already documented as the plan
for "every future form" (`src/lib/validations/auth.ts`) — this is real,
functional validation: an invalid email, a short password, or a missing
role selection shows a real inline error. No "confirm password" field
exists; a show/hide toggle (`src/components/ui/password-input.tsx`) does
the same job with one fewer field to fill in.

What happens on submit: every form calls `isSupabaseConfigured` (see
above) and, since it's always `false` today, shows an honest "this isn't
connected yet, nothing was created" message instead of the real Supabase
call. The comment at each `onSubmit` names the exact Supabase Auth method
that call becomes once a project exists (`auth.signUp`,
`auth.signInWithPassword`, `auth.resetPasswordForEmail`,
`auth.updateUser`) — connecting a project and removing the
`isSupabaseConfigured` branch is the entire migration, not a rewrite.

**Sign out** has no dedicated page — it's a button that will call
`supabase.auth.signOut()` and redirect home. It isn't built yet because
there's no session to sign out of; adding it is a single header change
once sessions exist.

## Navigation

`src/components/layout/site-header.tsx`'s `HeaderActions` always renders
"Sign in" / "Create account" — real links to the real pages above — because
every visitor is signed out today (no session system exists to be
otherwise). The comment there marks exactly where a real session check
replaces this with Account/Dashboard/Sign out for a signed-in visitor.
`/account` itself already reflects the same honesty: it never invents a
name or dashboard, it explains plainly that nothing is connected yet — it
does point to `/dashboard`, though, since that one works today without an
account (see below).

## Parent Dashboard & Child Profiles (Prompt 22)

`/dashboard` and `/dashboard/children/[childId]` are a deliberate exception
to "nothing works until accounts exist": child profiles don't need a
backend to be useful or safe, because a parent typing in their own child's
name and age isn't the same problem as authenticating a user. So this one
piece is real today, not a preview:

- **Storage**: `src/lib/accounts/local-children.ts` reads/writes a plain
  array of `ChildProfile` rows to this browser's `localStorage`
  (key `little-learners-learning:child-profiles`), keyed by a fixed
  placeholder `parentAccountId` since there's no real parent account to
  attach them to. `src/lib/accounts/use-child-profiles.ts` is the hook
  every component uses — it loads from storage in `useEffect`, never in
  the initial render, so server and client agree on an empty list at
  first paint (the same hydration-safety pattern documented in
  `docs/GAMES_HUB_ARCHITECTURE.md`).
- **Add / edit**: `src/components/patterns/child-profile-form.tsx` — real
  Zod + React Hook Form validation (`src/lib/validations/child-profile.ts`),
  same pattern as the auth forms, except saving here actually works.
- **View child-specific learning**: `/dashboard/children/[childId]`
  (`src/components/patterns/child-experience.tsx`) looks up the id from
  the same local storage and renders a deliberately different, much
  simpler screen for a young child to use — three large buttons to
  `/learn`, `/games`, `/resources`, almost no text. This is the one screen
  on the site allowed to look "more playful" than the rest, per an
  explicit exception in the brief.
- **Progress**: shown nowhere as real numbers. The dashboard's "Learning
  progress" section and the child view both state plainly that nothing is
  tracked yet — this is the same honesty rule the Games Hub's
  `noopGameProgressStore` already follows (`src/lib/games/progress.ts`):
  don't invent a completed activity or a star count that no system
  actually recorded.
- **Migrating later**: once a real parent account exists, the same
  `ChildProfile` rows move into a `child_profiles` table scoped by the
  signed-in account's real id (RLS: a parent reads/writes only their own
  rows) — `local-children.ts` is replaced, nothing else changes shape.

### Why this doesn't violate the privacy requirements

A child's name, age, and avatar choice never leave the browser they were
entered in — there is no API call, no database row, no analytics event.
That means "don't expose child information publicly," "don't put private
information in a public URL," and "don't expose it via page metadata" are
satisfied by the architecture itself, not by a policy layered on top of a
server that actually has the data:

- The URL `/dashboard/children/[childId]` uses an opaque, randomly
  generated id (`crypto.randomUUID()`) — never the child's name — so even
  the URL itself reveals nothing if shared or logged.
- `generateMetadata` isn't used on the child route precisely because the
  server has no way to know the child's name — it's never sent there. The
  page's `<title>` is the generic "Learning Time," not the child's name.
- Both `/dashboard` and `/dashboard/children/[childId]` set
  `robots: { index: false, follow: false }`, same as every auth page —
  belt-and-suspenders on top of an architecture that has nothing to leak.

## Security

- Passwords are never touched by this codebase's own code — Supabase Auth
  hashes and stores them (bcrypt) once connected. No password ever should
  reach a custom table or log line.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` is safe for the browser by design;
  `SUPABASE_SERVICE_ROLE_KEY` (server-only, see `.env.example`) must never
  be imported into a Client Component or `NEXT_PUBLIC_`-prefixed.
- `isSupabaseConfigured` reads only `NEXT_PUBLIC_*` values — safe to
  evaluate in the browser, and it's the only thing gating every form's
  real submission path.

## SEO / AEO

Every auth page sets `robots: { index: false, follow: false }` in its
`metadata` export — the standard way to keep a page out of search results
without blocking it from being crawled at all (a `robots.txt` disallow
would be the wrong tool here: it can leave a linked, empty listing in
search results instead of just omitting the page). `src/app/robots.ts` and
`src/app/sitemap.ts` are both unchanged and untouched by this prompt —
the sitemap is hand-curated from `primaryNav` plus explicit entries, so
auth routes were never at risk of being added to it. No FAQ content or
structured data (`application/ld+json`) exists on any auth page.
