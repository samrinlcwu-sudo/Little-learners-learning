# Admin Architecture

Introduced in Prompt 56 (teacher management) and given real server-side
authentication and extended to user management in Prompt 57. Read
`docs/ACCOUNTS_ARCHITECTURE.md` (roles), `docs/TEACHER_ARCHITECTURE.md`
(the profile model), `docs/TEACHER_DIRECTORY_ARCHITECTURE.md` (the two
moderation gates), and `docs/NOTIFICATIONS_ARCHITECTURE.md` (the local
audit-log pattern this reuses) first — this doc only covers what's
specific to the admin surface itself.

## Why this doesn't rebuild anything

`AccountRole` (`src/lib/accounts/types.ts`) has carried `"admin"` since
Prompt 21, and `TeacherProfile.moderationStatus` / `TeacherProfile.verified`
/ `Resource.reviewStatus` have all existed since Prompts 27–29 and 42 as
fields explicitly documented as "prepared architecture — no reviewer tool
exists yet." Prompt 56 built that reviewer tool. Prompt 57 doesn't touch
teacher registration, the profile editor, the public directory, resource
creation, or the parent/child dashboard — it adds a real login gate in
front of the admin area that already existed, and one new read/manage
surface (`/admin/users`) over the same real records those other features
already write.

## Real server-side authentication (Prompt 57)

Prompt 56's admin pages had **no** access control at all beyond an
honesty banner — anyone with the URL could reach them. Prompt 57 replaces
that with a genuine, unbypassable server-side gate:

- **`src/proxy.ts`** — Next.js 16 renamed the `middleware.ts` file
  convention to `proxy.ts` (see
  `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`);
  this is that file, and the first one in this codebase. It matches every
  `/admin/*` request, reads a signed session cookie, and verifies it
  *before* any admin page component, any moderation button, or any
  teacher/child data is ever sent to the browser. A visitor without a
  valid session is redirected to `/admin/login` — they never receive the
  page "with buttons hidden," they never receive the page at all.
- **`src/lib/admin/session.ts`** — the token itself: `{ exp }` (an expiry
  timestamp, nothing else — there's no multi-admin table to reference an
  id in) signed with HMAC-SHA256 via the Web Crypto API (`crypto.subtle`),
  which is available in both the Node.js runtime Server Actions use and
  the Edge/Node runtime Proxy uses, so the exact same signing and
  verification code runs in both places. The passphrase check
  (`verifyAdminPassphrase`) compares fixed-length SHA-256 digests
  byte-by-byte without short-circuiting — a real, if lightweight,
  timing-safe comparison, not a plain `===`.
- **`src/lib/admin/actions.ts`** — `adminLoginAction` and
  `adminLogoutAction`, real Next.js Server Actions. The passphrase check
  and the `Set-Cookie` both happen here, server-side — never in client
  code a browser's dev tools could bypass. Neither redirects itself; each
  returns a plain result so the client form/button
  (`admin-login-form.tsx`, `admin-sign-out-button.tsx`) can record a real
  audit event (see below) and then navigate.
- **`ADMIN_PASSPHRASE`** and **`ADMIN_SESSION_SECRET`** — two server-only
  environment variables (never `NEXT_PUBLIC_`-prefixed; see
  `.env.example`). `isAdminAuthConfigured()`
  (`src/lib/admin/config.ts`) mirrors `isSupabaseConfigured()`'s honesty
  pattern exactly. **Fails closed**: if either is missing,
  `verifyAdminSessionToken()` always returns `false` — there is no branch
  anywhere that says "not configured, so let everyone through." An
  unconfigured deployment blocks `/admin` entirely; `/admin/login` itself
  shows an honest "admin login isn't configured on this deployment yet"
  message instead of a broken form.
- **This is a single shared admin passphrase, not a multi-admin user
  table** — because no such table exists anywhere in this codebase to
  check a role against. The session token deliberately carries no admin
  identity. This is the one honest scope limit: real, enforceable,
  unbypassable authentication for "the admin," not yet "which admin."
  Migrating to real multi-admin accounts means replacing this cookie with
  a real session tied to `account.role === "admin"`, checked the same way
  in the same file — nothing about the pages behind the gate would change.

### Why `/admin/login` is exempt from the gate

Someone with no session has to be able to reach the sign-in page, or
nobody could ever sign in. `src/proxy.ts` special-cases exactly that one
path; every other `/admin/*` path is checked.

## User management (Prompt 57)

`/admin/users` (`AdminUserList`) unifies the two real, persisted
account-like records this app actually has:

| Field the brief asks for | Teacher row | Child row |
|---|---|---|
| Name | `TeacherProfile.name` | `ChildProfile.name` |
| Role | "Teacher" | "Child" |
| Account status | `TeacherProfile.accountStatus` | `ChildProfile.accountStatus` |
| Registration date | `TeacherProfile.createdAt` | `ChildProfile.createdAt` |
| Relevant account info | email | age |

Search (name + the relevant-info line) and two filters (role,
account status) are real, tested logic
(`src/lib/accounts/admin-user-filters.ts`) over whatever rows
`useAdminUserRows()` (`src/lib/accounts/admin-user-rows.ts`) actually
returns — no unsupported filter (no fake "last login," no invented
"engagement score") was added.

### "Parent" and "Administrator" are deliberately absent as rows

Neither has a persisted account record anywhere in this codebase:

- **Parent** — `/sign-up` validates and discards everything
  (`docs/ACCOUNTS_ARCHITECTURE.md`: "the password is validated for format
  and then discarded"). Only a fixed placeholder id
  (`local-browser-only`) links a `ChildProfile` to "its parent" — there is
  no real parent name, email, or registration date stored anywhere to
  show. A child's own row already shows that placeholder id (`admin-child-detail.tsx`,
  "Parent (this device)") so the relationship is visible without
  inventing a parent record.
- **Administrator** — there's a single shared admin passphrase (see
  above), not a multi-admin table. There is no "administrator account" to
  list.

Inventing rows for either would be exactly the fake user data the brief
forbids. This is the same "prepared, not fabricated" rule the rest of
this codebase already follows everywhere a real record doesn't exist yet.

### Future membership visibility (Prompt 62)

`docs/MEMBERSHIP_ARCHITECTURE.md` prepares a `Membership` model but adds
no admin page for it — an always-empty table would either sit unused or
invite seeding fake data to look populated. The natural future
integration point is this same `/admin/users` area: a membership status
badge on a real account's detail view, reading `hasActiveMembership()`
for that account, rather than a separate membership-management screen.

## Account status: a new, real, functioning control

`AccountStatus` (`"active" | "deactivated"`, `src/lib/accounts/types.ts`)
is genuinely new in Prompt 57 — nothing like it existed before. It's
deliberately **separate** from `TeacherModerationStatus`: moderation only
ever gated *public directory visibility*; account status gates the
account itself.

- `setLocalTeacherAccountStatus()` (`local-teacher.ts`) — a deactivated
  teacher is blocked from **both** their own dashboard
  (`TeacherDashboard` shows a real "This account has been deactivated"
  screen, mirroring its existing "No teacher account yet" state) **and**
  their public profile (`canViewTeacherProfile()` now checks
  `accountStatus` first, before visibility or moderation).
- `setLocalChildAccountStatus()` (`local-children.ts`) — a deactivated
  child's own learning view (`/dashboard/children/[childId]`) shows a
  real blocked state instead of the learning experience; the parent
  dashboard's `ChildOverviewCard` shows a "Deactivated" badge so the
  parent understands why, without hiding or deleting the profile or its
  progress.
- Only admin pages ever call either setter — a teacher's own profile
  editor (`TeacherProfileUpdates`) and a parent's own child-profile form
  (`NewChildProfile`) both structurally exclude this field from what they
  can write, the same exclusion pattern `moderationStatus`/`verified`
  already established in Prompt 56.
- Every profile stored before Prompt 57 is read as `"active"` (see each
  store's own normalization) — nothing existing changes behavior by
  default.

## Auditability (Prompt 57)

`src/lib/admin/audit-log.ts` — a real, locally-recorded trail of
administrative actions, the identical honesty pattern
`Application.statusHistory` already established
(`docs/ADMISSIONS_ARCHITECTURE.md`): every entry is written at the moment
the real action it describes actually happens, never seeded or backdated.
Recorded events today: `admin.login`, `admin.logout`,
`teacher.moderation_status_changed`, `teacher.verified_changed`,
`teacher.account_status_changed`, `child.account_status_changed`. Shown
on `/admin` via `AdminAuditPanel` (newest first, capped at a recent-
activity preview).

This is client-side localStorage, for the same reason every other
local-first record in this app is: there is still no database to write a
real audit row into. `recordAdminAuditEvent()`'s own doc comment names
exactly what changes once one exists — each entry becomes a row scoped by
the signed-in admin's real account id; the shape otherwise already
matches. Login/logout are recorded by the client form/button right after
the server confirms success (the Server Actions themselves don't redirect,
specifically so this can happen first) — a real event, recorded honestly
close to when it happened, not claimed to be a server-side audit row.

## Resource ownership, protected

The admin resource table (inside `/admin/teachers/[teacherId]`) is
strictly read + review-status-only: title, type, submission state, and an
Approve/Reject action. There is no edit or delete control — admin can
moderate a resource's visibility decision, never rewrite or remove its
content. Ownership is already structural everywhere in this app (a
browser holds one teacher's resources, each carrying `author.teacherId`),
so there is no "another teacher's resource" this view could even
accidentally expose.

## Child privacy

`AdminChildDetail` is deliberately minimal: name, age, avatar, favorite
subject, the parent placeholder id, registration date, and account
status. Nothing from `src/lib/progress` (activity history, games
completed, topics explored) is shown here — a child's learning history
isn't "relevant account information" for an account-status decision, and
surfacing it would be exactly the unnecessary child-data exposure the
brief warns against. The admin `/admin/users` list itself shows only
name, age, and account status for a child row — never a bio-style summary.

Structurally, a parent can never see another family's child (each browser
holds one family's data — `docs/ACCOUNTS_ARCHITECTURE.md`), and a teacher
has no path into `/admin` at all beyond knowing the shared admin
passphrase, which has nothing to do with any teacher account.

## UI

- **`/admin`** — the shared index, now behind the real login gate. Links
  to Teacher management and User management, plus the real activity
  panel. The `(protected)` route group's `layout.tsx` renders the admin
  top bar (Teachers / Users nav, Sign out) — reaching any page inside it
  already proves a valid session exists (Proxy runs first), so the layout
  itself performs no additional check; duplicating one would be exactly
  the redundant, easy-to-drift client-side check the brief warns against.
- **`/admin/login`** — outside the `(protected)` group on purpose (see
  above). Shows the real form when configured, an honest "not configured"
  message otherwise.
- **`/admin/teachers`** / **`/admin/teachers/[teacherId]`** — unchanged
  from Prompt 56 except: the stale "not protected by real authentication"
  banners are gone (no longer true), the moderation-status filter is
  relabeled "Directory status" (to disambiguate from the new Account
  status), an "Account" column was added to the list, and the detail page
  gained its own "Account status" card with Deactivate/Reactivate.
- **`/admin/users`** / **`/admin/users/children/[childId]`** — new this
  prompt, described above.
- Visual language matches the rest of the site — the same `Card`,
  `Badge`, `Button`, `Alert`, and table styling `TeacherResourceList` and
  `ApplicationDetail` already use, just denser, per the brief's "efficient
  and professional" instruction. The public teacher experience
  (`/teachers`, `/teachers/p/[slug]`) and the parent/child dashboards are
  otherwise unchanged — deactivation only adds a guard clause, not a
  redesign.
- **`SiteHeader` doesn't render on `/admin/*` routes** (Prompt 58
  checkpoint fix) — every route in this app shares one root layout, so
  before this fix the public header's "Sign in / Create account" rendered
  directly above the admin bar's real "Sign out," showing two
  contradictory identity states on the same authenticated page. Real
  authentication (Prompt 57) made this visible in a way Prompt 56's
  unauthenticated version never surfaced. `SiteHeader` now checks
  `usePathname()` and returns `null` for `/admin*` — the admin
  `(protected)` layout's own bar is the only navigation shown there. The
  public footer is untouched (it carries no identity state, so it isn't
  contradictory the same way).

## SEO / AEO

Every `/admin` route (including the new `/admin/login` and
`/admin/users*`) sets `robots: { index: false, follow: false }` and is
never linked from `primaryNav`/`footerNav`/`sitemap.ts`. Public teacher
pages (`/teachers`, `/teachers/p/[slug]`) are completely untouched by
this prompt.

## Security

- **Real server-side authorization now exists** — see "Real server-side
  authentication" above. This closes the one gap Prompt 56 could only
  disclose.
- **No API route exists anywhere in this codebase** (confirmed: `find
  src/app -name route.ts` returns nothing), so there is no separate API
  surface to protect beyond the page load itself — the moderation/account-
  status/review buttons are plain client JS, but a non-admin visitor can
  never load the page (or its JS bundle) that contains them, because
  Proxy blocks the request first.
- **Fails closed**, not open, when unconfigured — see above. This was a
  deliberate design choice: an admin area that's silently wide open
  because an env var was forgotten would be worse than one that's
  entirely unreachable.
- **No client-side "pretend" authorization check** (e.g. a fake
  `isAdmin = true` flag) exists anywhere — the real check lives in one
  place, `src/proxy.ts`, run by the framework before any component code.
- **Remaining, disclosed scope limit**: a single shared passphrase
  authenticates "the admin," not a specific admin identity — there is no
  per-admin audit trail (`details` describes the action, not who
  performed it) until real multi-admin accounts exist. This is stated
  plainly here, not hidden.

## Testing

Verified live: unauthenticated requests to every `/admin/*` route
(confirmed via `curl`, not just the browser) return a `307` to
`/admin/login?from=...`; an incorrect passphrase shows an inline error
and sets no cookie; the correct passphrase signs in, records a real
`admin.login` audit event, and unlocks every admin page; signing out
clears the cookie and immediately re-blocks access (`curl` again). Created
a real teacher and a real child profile and confirmed `/admin/users`
lists both with correct role/status/registration-date/summary, and that
the role and account-status filters narrow correctly. Deactivated a real
child from `/admin/users/children/[childId]` and confirmed
`/dashboard/children/[childId]` immediately shows the honest blocked
state and the parent dashboard shows a "Deactivated" badge. Deactivated a
real teacher from `/admin/teachers/[teacherId]` and confirmed
`/teachers/dashboard` immediately shows the honest blocked state.
Confirmed the audit panel on `/admin` lists all of the above, newest
first, with real timestamps. Confirmed existing teacher registration,
profile editing, the public directory, resource authoring, admissions,
notifications, and the parent/child dashboards are all unaffected. Ran
typecheck, lint, the full Vitest suite (including new tests for
`filterAdminUsers` and a dedicated `session.test.ts` covering passphrase
verification, token round-tripping, tampering, wrong-secret, and expiry),
and a production build.
