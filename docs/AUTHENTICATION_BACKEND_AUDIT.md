# Authentication Backend Audit

An audit-only pass — no backend was implemented, no provider was
installed, and no existing code was changed as part of this document.
Every claim below was verified directly against the current source
this pass (file paths cited throughout), not restated from memory or
from prior prompts' summaries.

## Current Authentication

Answering this prompt's exact checklist, in order:

| Question | Answer |
|---|---|
| Is registration implemented? | **Only for `/admin` (real, single shared passphrase). Parent and teacher registration are UI-only** — forms validate input with real Zod schemas and, for teachers, save non-sensitive fields to `localStorage`, but no account is created anywhere a server or database could recognize later. |
| Is login implemented? | **Only for `/admin`.** `/sign-in` runs real client-side validation and then does nothing — `onSubmit` sets a local `submitted` state and stops (`src/components/patterns/sign-in-form.tsx`). No credential is ever checked against anything. |
| Is logout implemented? | **Only for `/admin`** (`adminLogoutAction`, `src/lib/admin/actions.ts` — deletes the session cookie). There is no logout UI anywhere in the parent or teacher dashboard, because there is no login state to log out of. |
| Is password hashing implemented? | **No user password is ever hashed or stored, anywhere, for any role.** The admin system doesn't hash a user password either — it hashes the *shared passphrase candidate* with SHA-256 for a constant-time comparison against `process.env.ADMIN_PASSPHRASE` (itself hashed the same way) — this is a passphrase-verification technique, not a stored-credential hashing scheme, because there is no stored admin credential beyond the one environment variable. A parent/teacher's password, entered at sign-up or teacher registration, is validated for format only and explicitly discarded in the same function (`teacher-register-form.tsx`'s own comment: "never the password ... it never reaches localStorage or any variable outside this function"). |
| Is session management implemented? | **Only for `/admin`** — an HMAC-SHA256-signed cookie (`llad_session`, `src/lib/admin/session.ts`) with an 8-hour expiry, verified on every request to `/admin/*` in `src/proxy.ts` before any page component runs. No session of any kind exists for a parent or teacher, because there is no login to establish one. |
| Is authentication backed by a real database? | **No.** There is no database anywhere in this project (`find src/app -name route.ts` is empty, and no database client is connected — see "Current Database" below). |
| Are parent accounts stored persistently? | **No, not as accounts.** A parent has no account record at all — only whatever child profiles they've added exist, in that one browser's `localStorage`, under a hardcoded placeholder id (`LOCAL_PARENT_ID = "local-browser-only"`, `src/lib/accounts/local-children.ts`). This is *device-persistent* (survives a page reload or browser restart on the same device) but not *account-persistent* — it doesn't survive a different browser, a cleared cache, or a different device. |
| Are teacher accounts stored persistently? | Same architecture as parent data: a `TeacherProfile` is saved to `localStorage` (`src/lib/accounts/local-teacher.ts`) the moment registration's Step 1 completes, and is genuinely there on return visits to the *same browser* — but it is not a server-recognized account. |
| Are child profiles stored persistently? | Same as above — real, working, device-local persistence via `localStorage`, not account-linked, server-side persistence. |
| Are teacher profiles stored persistently? | Same as above. |
| Are applications linked to real users? | **No.** Every application's `parentAccountId` is the exact same hardcoded constant every child profile uses (`LOCAL_PARENT_ID`) — confirmed by reading `src/lib/admissions/local-applications.ts` directly. See "Application Ownership" below for the full implication. |
| Is authorization enforced server-side? | **Only for `/admin/*`**, via `src/proxy.ts`, which runs before any admin page component and checks the signed session cookie. Nothing else has server-side authorization, because nothing else has server-side data to protect — every parent/child/teacher/application record lives only in the requesting browser's own storage. |
| Is the current system only frontend/demo authentication? | **Yes, for every role except admin.** Admin authentication is real, tested, and server-enforced. Parent and teacher "authentication" today is entirely a client-side, honestly-disclosed simulation of the eventual real flow — every relevant form tells the visitor this directly before they submit anything (e.g. "Accounts aren't connected to a live backend yet"). |

## Current Database

**There is no database connected to this project.** Specifically, verified this pass:

- No API routes exist (`find src/app -name route.ts` → zero results), so there's no server-side data-access layer to have a database behind in the first place.
- No database client is imported or invoked anywhere except the dormant Supabase scaffold described below.
- No schema file, migration file, or `supabase/` CLI directory exists anywhere in this repository (`find . -iname "*.sql"`, `find . -iname "supabase"`, `find . -iname "*migration*"` all return nothing).
- **A database *client* is already a project dependency, unconfigured**: `package.json` lists `@supabase/supabase-js` and `@supabase/ssr` as real dependencies, and `src/lib/supabase/client.ts` / `server.ts` already contain correctly-structured browser and server Supabase client factories (using the current `@supabase/ssr` cookie-based session pattern). Both read `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`, which are unset everywhere (`.env.example` lists them with empty values; `.env.local` does not set them either). `isSupabaseConfigured` (`src/lib/supabase/is-configured.ts`) is `false` today, and every auth-related form checks it before attempting anything.

There is no users table, no parent/teacher/child/application table, and no sessions/authentication table anywhere, because there is no database at all — not because a database exists with an incomplete schema.

## Parent Accounts

- **What's real**: the parent dashboard (`/dashboard`) is a genuinely working feature reading and writing `ChildProfile[]` to `localStorage` (`src/lib/accounts/use-child-profiles.ts` → `local-children.ts`). Adding, editing, and viewing a child's own recorded progress (`src/lib/progress/`) all work correctly, live-tested again in Prompt 107.
- **What's not real**: there is no `Account` record for the parent themselves. Every child profile's `parentAccountId` is the literal string `"local-browser-only"` — not a real, unique identifier for "this specific parent," but a placeholder meaning "whichever browser is looking at this." Two different real parents using two different browsers each see only their own data (because `localStorage` is origin-and-browser-scoped), but that isolation is a property of the browser platform, not of an application-level authorization check — there is no check being performed, because there is nothing to check against.
- **Application information**: same story — an application is only ever visible from the same browser that created it, for the same reason.

## Teacher Accounts

- **Registration → Expertise → Profile → Dashboard all genuinely work** as a self-contained local flow, live-tested end to end in Prompt 107: creating an account saves name/email/country to `localStorage` (password discarded), completing the profile form saves the rest of `TeacherProfile`, and the flow correctly lands on a real, working teacher dashboard.
- **Visibility is real, but locally scoped**: `canViewTeacherProfile()` / `canListTeacherInDirectory()` (`src/lib/accounts/teacher-visibility.ts`) are genuine, tested gating functions — a profile is only shown publicly once the teacher's own `visibility` field is `"public"` and (for directory listing) `moderationStatus === "approved"`. But because there is no database, the admin's own "Teachers" list (`/admin/teachers`) only ever shows teacher profiles that exist in *the admin's own browser's* `localStorage` — not a real, cross-device view of every teacher who has ever registered. A profile made on a different device is invisible to the admin today, and the admin panel does not pretend otherwise (its own code comments say this plainly).
- **No teacher password is ever stored**, so there is no credential to protect and no login to secure — the same situation as parent accounts.

## Admin Authentication

The one genuinely production-grade piece of this codebase:

- Single shared passphrase (`ADMIN_PASSPHRASE`), compared using SHA-256 hashing on both sides plus a constant-time XOR comparison loop — resistant to timing attacks on the comparison itself.
- Session token: `{ exp }` payload, HMAC-SHA256-signed with `ADMIN_SESSION_SECRET`, verified via `crypto.subtle.verify` (never a manual byte comparison of the signature).
- Cookie: `httpOnly`, `sameSite: "lax"`, `secure` in production.
- Server-side gate in `src/proxy.ts`, matched to `/admin/:path*`, runs before any admin page component, Server Action, or JS bundle is served.
- Login throttle: 5 failed attempts locks out further attempts for 5 minutes (`src/lib/admin/login-rate-limit.ts`) — in-memory and process-global (not per-caller, not durable across a restart), a disclosed, deliberate trade-off given no external store exists.
- Fails closed: if either environment variable is missing, `/admin` blocks every request rather than admitting them.
- **What it is not**: a multi-admin system. There is no admin "users table" — `AccountRole` includes `"admin"` in the type system (`src/lib/accounts/types.ts`), but no `Account` object of any role is ever actually constructed anywhere in this codebase; it's a forward-looking type, not a working feature yet.

## Application Ownership

- Every `Application` record's `parentAccountId` is hardcoded to the same hardcoded local placeholder used by every `ChildProfile` (`LOCAL_PARENT_ID`), imported from the same source file specifically so the two literals can never drift apart — this is architecturally deliberate today, not an accidental duplicate value.
- **Applications use a reference number, not authenticated ownership.** The reference number (e.g. `LLL-38ZPVR`, generated in `local-applications.ts`) is a human-readable label for a record that already only exists in one specific browser's storage — it is not a lookup key against a shared table, because no shared table exists. Typing that reference number into a different browser today would find nothing, because the applications list is read straight from that browser's own `localStorage`, never by any kind of number lookup against a server.
- The existing application tracking experience (view status, status history, dates) is real and worked correctly when live-tested (Prompt 107) — this audit does not recommend changing that user-facing behavior, only clarifying what "ownership" currently means underneath it.

## Security Findings

- **No plain-text password is ever stored** — because no password is stored at all, for any role but admin (and the admin system has no user password to store either, only a shared passphrase). This is a genuinely secure state, not a vulnerability, though it's secure by virtue of not persisting anything rather than by a hashing scheme protecting a stored credential.
- **No authentication token is exposed unnecessarily.** The one real token (the admin session cookie) is `httpOnly` (unreadable by page JavaScript) and never appears in a URL, a log, or a client-visible variable.
- **No client-side-only protection is currently relied upon for anything that has real, shared data to protect** — `/admin` is the one place real protection is needed, and it's enforced server-side. Every other "protected route" (`/dashboard`, `/teachers/dashboard`) has no route guard at all, which is *currently* safe only because there is nothing sensitive on the server for an unguarded request to expose — visiting `/dashboard` in an incognito window shows an empty state, not another parent's data.
- **The real risk this audit surfaces**: this safety property is entirely a side effect of there being no shared backend yet. The moment any of these routes are backed by a real, shared database, the current lack of any server-side check on `/dashboard`, `/teachers/dashboard`, or an application-lookup path would become a real, exploitable gap — not a hypothetical one. Any production backend work must add real server-side authorization to these routes at the same time real data moves behind them, not afterward.

## Missing Components

For genuine, persistent, secure Parent/Teacher/Admin accounts in production, all of the following are currently absent:

1. A real database (users/accounts, child profiles, teacher profiles, applications, and a link between them).
2. Real password storage (hashed, e.g. via bcrypt/argon2, or delegated entirely to an auth provider that handles this — see recommendation below).
3. Real session issuance and verification for parent/teacher sign-in (today only admin has this).
4. Server-side route protection for `/dashboard`, `/teachers/dashboard`, `/dashboard/applications*`, and any future account-scoped route — today only `/admin/*` has this.
5. Server-side authorization checks that scope every read/write to the authenticated user's own records (e.g. "this child profile belongs to this signed-in parent") — today this is enforced only "by construction" (one browser, one implicit local parent), which does not generalize to real, multi-device accounts.
6. Data migration/import path for a returning visitor's existing `localStorage` data, if preserving it during the transition is desired (not required, but worth deciding explicitly rather than silently discarding it).
7. A real multi-admin model, if more than one admin identity is ever needed (today's single shared passphrase is a deliberate, disclosed limitation, not a bug, but it doesn't extend to "several named admins" without new work).

## Recommended Production Architecture

**Recommendation: activate the Supabase scaffolding already present in this codebase, rather than introducing a new provider.**

This is the smallest real change available, for concrete reasons specific to this codebase, not a default preference for Supabase in general:

1. `@supabase/supabase-js` and `@supabase/ssr` are already installed dependencies — no new package needs to be added or evaluated.
2. `src/lib/supabase/client.ts` and `server.ts` already exist, are already correctly structured for the current `@supabase/ssr` cookie-based pattern, and are already imported (in dormant form) by every auth-related form.
3. Every parent/teacher-facing form (`sign-in`, `sign-up`, `forgot-password`, `reset-password`, `teacher-register-form`) already has an `isSupabaseConfigured` branch and a code comment describing exactly which real Supabase call replaces today's no-op (e.g. `supabase.auth.signInWithPassword(...)`) — the integration points were already designed for this, not something this audit is proposing fresh.
4. Supabase provides both authentication (with real password hashing handled by the provider, never by this codebase) and a real Postgres database in one product, which directly covers "no database" and "no real session/password handling" with one connected service rather than two separate ones.
5. `AccountRole` (`"parent" | "teacher" | "admin"`) already exists in the type system and maps cleanly onto Supabase's own row-level-security model (a `role` column plus RLS policies), rather than needing a new role concept invented for this migration.

**What this involves, at a high level (not being implemented in this prompt):**

- A real Supabase project, with `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` set in the hosting platform's environment (all three variable names already exist in `.env.example`, unset).
- A real schema: at minimum, tables for accounts (or reliance on Supabase Auth's own `auth.users`), child profiles, teacher profiles, and applications, each with a foreign key to the owning account and Row Level Security policies scoping every query to `auth.uid()`.
- Wiring the already-commented call sites in each auth form to real `supabase.auth.*` calls.
- Adding real server-side checks (in Server Components or a proxy/middleware extension) to `/dashboard`, `/teachers/dashboard`, and application routes, mirroring the pattern `src/proxy.ts` already establishes for `/admin`.
- A decision on the admin system: keep the existing shared-passphrase system as-is (it works, and rebuilding it isn't necessary just because a database now exists), or migrate it onto the same Supabase Auth system with a `role = 'admin'` check — either is technically valid, and this audit takes no position on which, since it's a product decision independent of the parent/teacher migration.
- A decision on existing local data: whether to offer a one-time "claim your local data" import step when a visitor with existing `localStorage` records first signs up for real, or to treat it as a clean cutover. Not required for a correct migration, but worth deciding rather than defaulting silently.

**Alternative considered and not recommended**: building a fully custom auth system (a new `/api/auth/*` route set, bcrypt, a hand-rolled session store, and a hand-picked database like Postgres/SQLite via Prisma or Drizzle). This is a viable, more portable option in principle, but it requires building password hashing, session issuance, and a database connection completely from scratch, none of which this codebase has any scaffolding for today — it would be substantially more new code than activating the Supabase path already half-built into this project.

## Migration Risks

- **Existing local data has no home in a fresh Supabase schema unless a migration path is built.** A parent or teacher who created a local profile before the switch will not see it appear automatically after signing up for a real account — this needs an explicit decision (see above), or it should be clearly communicated that local-only data does not carry over.
- **The admin system's current design does not use Supabase Auth.** If it stays as-is, this project will have two independent authentication mechanisms (the shared passphrase for admin, Supabase Auth for parent/teacher) rather than one unified system — a real, disclosed trade-off, not necessarily a problem, but worth deciding on deliberately rather than by default.
- **Every "protected route" that currently has no guard needs one added at the same time real data moves behind it** — adding the database without also adding server-side authorization would turn today's harmless "no guard, no shared data" state into a real vulnerability (see "Security Findings" above).
- **RLS policy mistakes are the most common real-world Supabase security failure mode.** A misconfigured policy (e.g. one that's too permissive) can expose every user's data at once — this needs careful, tested policy design, not a rushed default.
- **The teacher public-profile page's `generateMetadata` currently can't determine a given slug's real visibility server-side** (documented in the page's own code comment) precisely because there's no database to query — this becomes fixable, not harder, once a real backend exists, but it is a concrete piece of follow-up work the migration unlocks rather than completes automatically.

## Required Environment Variables

Already present as empty placeholders in `.env.example` — no new variable names need to be invented:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | The Supabase project's API URL. Public by design. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase's public anon key, safe for the browser, used for user-scoped requests under RLS. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only, bypasses RLS — needed only for genuinely administrative server-side operations, never sent to the browser, never used in a Client Component. |

No other new environment variable is required for the recommended path. (`ADMIN_PASSPHRASE` / `ADMIN_SESSION_SECRET` remain as they are if the admin system is kept independent, per the open decision above.)

## Estimated Implementation Steps

For visibility only — not authorization to begin, per this prompt's own instruction:

1. Create a real Supabase project; set the three environment variables above in both local `.env.local` and the hosting platform.
2. Design and apply a schema: accounts (or rely on `auth.users`), `child_profiles`, `teacher_profiles`, `applications`, each with an owner reference and RLS policies scoped to `auth.uid()`.
3. Wire the already-commented real calls into `sign-in-form.tsx`, `sign-up-form.tsx`, `forgot-password-form.tsx`, `reset-password-form.tsx`, and `teacher-register-form.tsx`.
4. Replace each `local-*.ts` data-access module's `localStorage` read/write with real Supabase queries scoped to the authenticated user — the existing hooks (`use-child-profiles.ts`, `use-teacher-profile.ts`, `use-applications.ts`) are the natural seam, since UI components already consume them through a stable interface.
5. Add real server-side authorization to `/dashboard`, `/teachers/dashboard`, and application routes (extending the pattern already proven in `src/proxy.ts`, or via Server Component session checks).
6. Decide and implement (or explicitly decline) a local-data-to-account migration/import step.
7. Decide and implement (or explicitly decline) unifying admin auth onto the same Supabase Auth system.
8. Re-run this project's full verification suite (build/lint/typecheck/tests) and a live end-to-end re-test of every journey this project has repeatedly verified locally (Prompts 90, 92, 100, 107) against the new, real backend.
9. Update `docs/SECURITY_FINAL_CHECK.md`, `docs/PRIVACY_POLICY_IMPLEMENTATION.md`, and the live Privacy Policy page itself — large parts of both currently describe "nothing leaves your browser," which stops being true the moment this migration ships.

## Testing Performed For This Audit

- `npx vitest run` — 341/341 tests passing, 55 files. No test was added, removed, or modified — this was a pure inspection pass.
- `npx tsc --noEmit` — clean.
- `npx eslint .` — clean.
- `rm -rf .next && npx next build` — clean production build, confirming this audit made no code changes that could affect the build.
- No source file under `src/` was modified as part of this audit — only this document was created.
