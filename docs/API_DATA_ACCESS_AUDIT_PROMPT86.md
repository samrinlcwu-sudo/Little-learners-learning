# API & Data Access Security (Prompt 86)

## Endpoint inventory

A full repo search (`find src/app -name route.ts`, a grep for `"use server"`
across `src/`) confirms what every prior audit in this arc has already
established: **there is exactly one real server-side entry point in this
codebase.** No `route.ts` file exists anywhere under `src/app`. No `fetch()`
call anywhere targets a relative `/api/*` path. There is nothing else to
inventory as an "endpoint" in the conventional sense.

| Endpoint | Purpose | Public/Private | AuthN | AuthZ | Input | Returns | Tables | Sensitive data |
|---|---|---|---|---|---|---|---|---|
| `adminLoginAction` (Server Action, `src/lib/admin/actions.ts`) | Exchange the shared admin passphrase for a signed session cookie | Public (must be reachable by a logged-out admin) | None required to *call* it — the passphrase itself is the credential being checked | N/A (no roles; a single shared admin identity) | One `FormData` field, `passphrase` (string) | `{ error? }` or `{ success: true }` — never the passphrase, never the token value, in the response body (the token only ever leaves as an `httpOnly` cookie) | None — no database exists | The admin passphrase, in transit only (never logged, never stored) |
| `adminLogoutAction` (Server Action, `src/lib/admin/actions.ts`) | Delete the admin session cookie | Effectively private (only linked from the authenticated admin UI) but safe to call unauthenticated — deleting a cookie that may not exist is a no-op | None enforced, and none needed: it has no side effect beyond this browser's own cookie | N/A | None | `void` | None | None |

Everything else that might look like a "data access layer" — parent
accounts, child profiles, teacher profiles/resources, applications, orders,
memberships — is **client-only, per-browser `localStorage`**, read and
written entirely inside Client Components (`src/lib/accounts/local-*.ts`,
`src/lib/admissions/local-applications.ts`, `src/lib/resources/local-*.ts`,
etc.). None of it is a network endpoint: it never crosses a request
boundary, so it has no "authentication requirement" or "returned payload"
to inventory the way a real API would. This is the same zero-backend
architecture every prior audit (Prompts 84, 85) documented and confirmed
unchanged — re-verified here specifically for what it means for *this*
prompt's checklist, below.

## Why most of this checklist doesn't apply the way it would to a real API

A large fraction of Prompt 86's checklist — IDOR, missing authorization
between users, unsafe query construction, SQL/NoSQL injection, rate
limiting on data endpoints, excessive data returned over the wire — assumes
a shared backend that serves different users different data from a common
store. This app has no such thing yet:

- There is no database, so there is no query construction to make unsafe
  and no injection surface.
- There is no cross-browser data store, so one user's browser can never
  fetch another user's record by guessing an id — there is no network
  request that could carry that id to a server that has both records. A
  child's id in a URL (`/dashboard/children/[childId]`,
  `/admin/users/children/[childId]`) only ever resolves against **this
  browser's own `localStorage`**; it cannot resolve to any other browser's
  data because that data was never sent anywhere.
- "Returned data" for these routes is never a server response — it's
  whatever the Client Component reads out of `localStorage` after the page
  loads, so there's no server-side over-fetching to trim.

This isn't a loophole being used to skip the audit — it's the same
structural point Prompt 84 already made about IDOR, re-confirmed here by
actually reading the id-based routes end to end (below) rather than
re-asserting it.

## What was actually checked

**Every dynamic route that takes an id or slug** (`find src/app -type d
-name "[*]"`) was read to confirm the pattern holds and that each one
fails safely on a bad id:

- `/dashboard/children/[childId]`, `/dashboard/applications/[applicationId]`
  — thin Server Component wrappers (`ChildExperience`, `ApplicationDetail`)
  with `robots: { index: false, follow: false }` metadata; the id never
  appears in any exposed metadata, matching the doc comment's own reasoning
  ("the server never sees it").
- `/admin/users/children/[childId]`, `/admin/users/parents/[parentId]` —
  `AdminChildDetail`/`AdminParentDetail` look the id up against
  `useChildProfiles()`'s live snapshot and render an explicit "we couldn't
  find that child profile" empty state (not a crash, not a blank page, not
  a fallback to the first record) when the id doesn't match anything.
  `AdminChildDetail` in particular is deliberately minimal per
  `docs/ADMIN_ARCHITECTURE.md`'s "Child privacy" section: name, age,
  avatar, favorite subject, registration date, account status — never a
  parent's name/email (none is stored) and never anything from
  `src/lib/progress` (a child's learning history is explicitly excluded
  from the admin suspension-decision view).
- `/resources/[resource]` — looks the slug up via `findPublishedResource()`,
  which filters through `isResourcePublished()` before anything renders,
  and calls `notFound()` for anything else — a resource stuck in `draft`,
  `pending` teacher review, or missing required religious verification is
  unreachable by its slug even if guessed exactly (verified by tracing
  `isResourcePublished()`'s three real gates: `publicationStatus`,
  teacher `reviewStatus`, and `religiousReview` for the categories that
  require it).
- `/admin/content/[resourceId]`, `/admin/content/[resourceId]/edit`,
  `/admin/teachers/[teacherId]` — same wrapper pattern, gated by `proxy.ts`
  before the component ever runs (see below).
- `/teachers/p/[slug]` (public teacher profile) — re-checked for
  accidental private-field exposure: no email, phone, or any contact
  field is rendered anywhere on the page; the one `dangerouslySetInnerHTML`
  call (the `Person` JSON-LD block) already goes through `toJsonLdHtml()`
  (Prompt 84's escaping fix), so a teacher-supplied bio or name can't break
  out of the script tag.

**The one real authorization boundary — `src/proxy.ts`** — re-read in full
and confirmed unchanged since before this performance/security arc began
(`git log --oneline -- src/proxy.ts` still shows `84e1b36` as the last
real change). It gates `/admin/:path*` unconditionally except
`/admin/login`, fails closed if the admin env vars aren't configured
(`verifyAdminSessionToken` returns `false` with no secret to check
against), and a route group like `(protected)` doesn't change any of this
— Next.js strips the parenthesized segment from the actual URL, so
`/admin/content/[resourceId]/edit` is still `/admin/content/xyz/edit` on
the wire, still matched by `/admin/:path*`.

**Entitlement/access functions re-verified fail-closed** (`src/lib/payments/entitlements.ts`,
`src/lib/memberships/access.ts`): `hasValidEntitlement`, `hasActiveMembership`,
and `hasAuthorizedChildAccess` all take the caller's real orders/memberships
as an explicit argument rather than trusting anything ambient, and every
real call site today can only pass `[]` (no orders or memberships table
exists yet), so every one of these correctly returns `false` for every
account — the same honest "always locked until the real thing exists"
pattern as `canDownload()`. `hasAuthorizedChildAccess` in particular checks
`membership.accountId === child.parentAccountId` in addition to the id
appearing in `authorizedChildIds`, specifically so a corrupted or
maliciously-edited `authorizedChildIds` list on one account's membership
can never grant access to a child belonging to a different account — this
was already correct, and is now covered by a dedicated test (see below).

**Public search/browse pagination and filtering** (`/search`,
`/resources`, `src/lib/resources/filters.ts`,
`src/lib/games/filters.ts`, `src/lib/blog/filters.ts`) — this is the one
place a member of the public directly controls a query (`?q=`, `?page=`,
`?age=`, etc.) against real content lists, so it got the closest look:

- `q` is only ever used for in-memory, case-insensitive substring matching
  (`rankBySearchMatch`/`scoreSearchMatch`) and rendered back into the page
  as plain text/attribute values, which JSX escapes automatically — no
  reflected-XSS path.
- `filterResources()`/`filterArticles()`/`filterGames()` all run
  `isResourcePublished()`/`isArticlePublished()`/`isGamePublished()` as
  their first check, before any of the caller's own filters are applied —
  a malformed or unexpected filter combination can narrow the published
  set further, but can never surface an unpublished item.
- **Real gap found and fixed**: `paginateResources()`, `paginateGames()`,
  and `paginateArticles()` all clamp an out-of-range page number
  (`Math.min(Math.max(1, page), pageCount)`), but none of them guarded
  against a **non-finite** `page` value (`NaN`, `Infinity`) — `Math.max(1, NaN)`
  is `NaN`, so a raw `NaN` would have produced `{ page: NaN, ... }`. In
  practice this was never reachable today: both real call sites
  (`src/app/search/page.tsx`, `src/app/resources/page.tsx`) already guard
  with `Number(getParam("page")) || 1` before calling these functions. But
  a shared pagination utility that only behaves correctly because every
  current caller happens to pre-sanitize its input is exactly the kind of
  latent gap this prompt's "reject malformed requests safely" instruction
  exists to catch — a future caller (a different page, a future API route)
  could easily skip that guard. Fixed by adding `Number.isFinite(page) ? page : 1`
  inside all three functions themselves, so the guarantee holds regardless
  of what any caller does. Covered by new tests in
  `src/lib/resources/filters.test.ts`, `src/lib/games/filters.test.ts`,
  and `src/lib/blog/filters.test.ts`.

**Error handling** — `src/app/error.tsx`, `src/app/search/error.tsx`, and
`src/app/admin/(protected)/error.tsx` all render the same generic
"Something went wrong" UI regardless of the real error; none of them
render `error.message` or `error.stack` to the user. `console.error(error)`
runs client-side only (inside a `useEffect`), logging to the visitor's own
browser devtools console, never to a server log a wider audience could
read. A repo-wide search for `console.*` calls near
`password`/`passphrase`/`token`/`secret`/`session` (already done in Prompt
84/85, re-run here) is still clean.

**File validation, JSON-LD escaping, login rate-limiting** — all confirmed
unchanged and still in place from Prompt 84 (`src/lib/utils/file-validation.ts`
still rejects `image/svg+xml`; all 17 structured-data call sites still use
`toJsonLdHtml()`; `src/lib/admin/login-rate-limit.ts` still locks out after
5 failed attempts).

## Real gap #2 found and fixed: no test coverage for `adminLoginAction`/`adminLogoutAction` themselves

`src/lib/admin/session.ts` (the token signing/verification) and
`src/lib/admin/login-rate-limit.ts` (the lockout counter) each already had
their own unit tests, but the Server Action that actually orchestrates
them — checking `isAdminAuthConfigured()`, checking `isLoginLocked()`,
calling `verifyAdminPassphrase()`, calling `recordFailedLoginAttempt()`/
`recordSuccessfulLogin()`, and setting the real cookie with the real
options (`httpOnly`, `sameSite: "lax"`, `path: "/"`) — had no test of its
own. This is precisely the "unauthorized request / authorized request /
admin access / malformed request" coverage this prompt's TEST section asks
for. Added `src/lib/admin/actions.test.ts` (7 tests, mocking `next/headers`):
unconfigured deployment fails closed; wrong passphrase is rejected with no
cookie set; correct passphrase sets a real `httpOnly` cookie; a missing
`passphrase` field is treated as a wrong attempt rather than throwing; five
wrong attempts lock out a subsequent *correct* attempt too (proving the
lockout check runs before the passphrase check, not after); a successful
login clears a prior partial failure count; and logout deletes the cookie.

## New tests added

- `src/lib/admin/actions.test.ts` — 7 tests (new file, see above).
- `src/lib/resources/filters.test.ts` — 17 tests (new file; `filterResources`
  had no test file at all before this prompt, despite being the function
  that gates every public resource listing and the public resource detail
  page). Covers: draft exclusion, teacher pending/rejected-review exclusion
  (the "never a fake review" property), category/type/difficulty/tier/age
  filtering, text query matching, religious-review gating,
  sort stability/non-mutation, and pagination clamping including the
  `NaN` fix above.
- `src/lib/games/filters.test.ts`, `src/lib/blog/filters.test.ts` — one new
  test each for the same `NaN`-clamping fix.

## Not changed

No API route was added or removed — none exist, and none were needed for
this prompt's scope. No authentication provider was touched.
`adminLoginAction`/`adminLogoutAction`'s real behavior is unchanged; they
are now simply tested. `session.ts`, `login-rate-limit.ts`, and the
JSON-LD/file-upload fixes from Prompt 84 are untouched. The pagination fix
is additive and backward compatible: every existing valid call (a real
finite page number, in or out of range) behaves exactly as before; only a
non-finite input's behavior changed, from `NaN` propagating into the
result to a safe fallback to page 1.
