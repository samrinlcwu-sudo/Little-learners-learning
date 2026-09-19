# Production Security & Privacy Final Check

A final, code-level security and privacy review before launch. Every
claim below was verified directly against the current source (file
paths and line-level behavior cited throughout), not restated from
earlier audits without re-checking — though several conclusions
corroborate them (`docs/SECURITY_AUDIT_PROMPT84.md`,
`docs/SECURITY_PRIVACY_CHECKPOINT_PROMPT88.md`,
`docs/API_DATA_ACCESS_AUDIT_PROMPT86.md`,
`docs/DATABASE_UPLOAD_PRIVACY_AUDIT_PROMPT87.md`).

The single fact that shapes almost every section below: **this
platform has no database and no API routes** (`find src/app -name
route.ts` returns nothing). The only real server-side system is admin
authentication (`src/proxy.ts`, `src/lib/admin/*`). Everything a
parent, child, or teacher does — registration, sign-in, child
profiles, applications — lives in that browser's own `localStorage`,
which is honestly disclosed on-page (e.g. the parent dashboard's own
banner: "This dashboard works in your browser only right now"). That
architecture is not a shortcut taken to pass this review; it's the
actual, disclosed state of the product, and it changes what
"authorization" and "API security" even mean here — noted explicitly
in each section rather than glossed over.

## 1. Authentication

**Admin (`/admin/*`) — real, and the only genuine authentication in
this codebase:**

- Passphrase check (`src/lib/admin/session.ts`,
  `verifyAdminPassphrase`) hashes both sides with SHA-256 and compares
  them with a fixed-length, branchless XOR loop — not a short-circuit
  `===`, so it doesn't leak timing information about how many leading
  characters matched.
- Session tokens (`createAdminSessionToken` /
  `verifyAdminSessionToken`) are HMAC-SHA256-signed via the Web Crypto
  API, carry only `{ exp }` (no identity to leak), and are verified
  with `crypto.subtle.verify` — never a manual byte comparison of the
  signature itself. Malformed input fails closed through a `catch`,
  never throws into a caller that might treat an exception as "let
  them through."
- The cookie (`ADMIN_SESSION_COOKIE`, set in
  `src/lib/admin/actions.ts`) is `httpOnly`, `sameSite: "lax"`, and
  `secure` whenever `NODE_ENV === "production"` — never readable from
  page JavaScript, never sent cross-site, never sent over plain HTTP
  in production.
- Login is throttled (`src/lib/admin/login-rate-limit.ts`): 5 failed
  attempts locks out further attempts for 5 minutes. Real, tested
  (`login-rate-limit.test.ts`), and honestly scoped — it's an
  in-memory, process-global throttle (resets on restart, locks out
  everyone rather than a specific caller), not a durable per-IP
  system, because there's no external store (Redis, a database) in
  this project to make it more than that.
- Logout (`adminLogoutAction`) deletes the browser's cookie. It does
  not revoke the token server-side before its natural 8-hour
  expiry — verified empirically in an earlier prompt that an in-memory
  revocation list doesn't work here because `proxy.ts` and the Server
  Action bundle are compiled as separate isolated bundles with their
  own copies of any module-level state. This is a real, disclosed
  limitation, not an oversight (`src/lib/admin/session.ts`'s own
  top-of-file comment).
- Fails closed: `isAdminAuthConfigured()` requires both
  `ADMIN_PASSPHRASE` and `ADMIN_SESSION_SECRET` to be set. If either is
  missing, `verifyAdminSessionToken` always returns `false` and
  `/admin/*` is blocked entirely — there is no "auth not configured,
  let everyone in" branch anywhere in `proxy.ts`.

**Parent / teacher accounts — deliberately not yet real, and this is
disclosed to the user, not hidden:**

- `sign-in-form.tsx`, `sign-up-form.tsx`, `forgot-password-form.tsx`,
  `reset-password-form.tsx`, and `teacher-register-form.tsx` all import
  `isSupabaseConfigured` and show an explicit banner ("Accounts aren't
  connected to a live backend yet") whenever it's false — which it
  always is today, since no `NEXT_PUBLIC_SUPABASE_URL` /
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set anywhere in this repository.
  Submitting these forms only runs client-side Zod validation
  (`src/lib/validations/auth.ts`) and never stores a password anywhere
  — not in `localStorage`, not in a request body, because no request is
  ever sent. There is no password to protect yet because no password
  is ever persisted.
- **Session handling** for parents/teachers: there is no session,
  because there is no server account to hold one. "Being on the
  dashboard" simply means the browser has local child-profile or
  teacher-profile data — the browser's own storage isolation is what
  separates one visitor's data from another's, not an app-level login
  check.
- **Protected routes / unauthorized access**: `/dashboard`,
  `/teachers/dashboard`, `/account`, and every admissions/applications
  page carry no route guard (confirmed by reading each `page.tsx`
  directly — none check a cookie or session). This is safe today
  specifically *because* there is nothing sensitive to protect there
  server-side: each page only ever renders whatever is in the
  visiting browser's own `localStorage`. Visiting `/dashboard` in an
  incognito window shows an empty "no children added yet" state, not
  another visitor's data — verified by the architecture (per-browser
  `localStorage` under a fixed key,
  `src/lib/accounts/local-children.ts`), not by assumption.

## 2. Authorization

- **Admin functions**: enforced server-side, not just hidden in the
  UI. `src/proxy.ts` matches `/admin/:path*`, checks the signed session
  cookie before any page component runs, and redirects to
  `/admin/login` otherwise. Confirmed every real admin page
  (`content`, `teachers`, `users`, and their nested detail routes)
  lives under the `(protected)` route group, with only `/admin/login`
  outside it and explicitly exempted in `proxy.ts` (route groups don't
  add to the URL, so the matcher still covers every one of them).
- **Child profiles / parent accounts**: scoped to the browser's own
  `localStorage` under a fixed key
  (`src/lib/accounts/local-children.ts`). No mechanism anywhere reads
  another origin's or another device's storage — that isolation is a
  browser platform guarantee, not application code, and it only
  protects against other *websites* or *visitors*, not against another
  person using the same physical browser profile (an honest limit of
  a no-backend architecture, not a bug).
- **Teacher visibility**: a real two-gate function
  (`src/lib/accounts/teacher-visibility.ts`) — `canViewTeacherProfile`
  (requires the teacher's own opt-in `visibility === "public"` and not
  moderation-rejected/hidden) is deliberately narrower than nothing,
  and `canListTeacherInDirectory` is narrower still (also requires
  `moderationStatus === "approved"`). Both are pure functions consumed
  by every public-facing call site — there is exactly one
  implementation of "should this be visible," not one per page that
  could silently drift.
- **Admin's own "Users" list**: reads from the *admin's own browser's*
  `localStorage` (`admin-user-rows.ts` is `"use client"`), not a real
  cross-user database — because none exists. This means the admin
  panel today shows only test/local data created on that same device,
  never another real visitor's data. Worth stating plainly for a
  business reader: this is not yet a live, all-users admin view, and
  it doesn't pretend to be one (no fabricated user rows anywhere in
  this file).
- Frontend-only hiding was specifically checked for and not relied on
  for the one place it would actually matter (admin): the redirect in
  `proxy.ts` happens before any admin page component, JS bundle, or
  data fetch — a request without a valid cookie never receives the
  page at all.

## 3. API Security

- There are no API routes in this codebase (`src/app/**/route.ts` —
  zero matches). Nothing here to secure with request auth, rate
  limiting, or CORS, because nothing here accepts an external request.
- The only server-invocable code is Next.js Server Actions
  (`"use server"` — `adminLoginAction`, `adminLogoutAction`), which are
  authenticated and rate-limited as described in section 1, and never
  echo back internal error text (they return typed
  `{ error: string }` values written by this code, never a caught
  exception's own message).
- **CORS**: not configured anywhere (`next.config.ts`, and no
  `Access-Control-*` header anywhere in source) — correctly absent,
  since there's no API surface for a cross-origin caller to reach.
- **Error handling**: `src/app/error.tsx` and
  `src/app/admin/(protected)/error.tsx` both show a generic, friendly
  message and log the real error only to that visitor's own browser
  console (`console.error`) — never to another user, never rendered
  into the page. Next.js itself strips server-side error messages and
  stack traces from what's sent to the client in production builds by
  default; nothing in this codebase overrides that behavior.
- **Sensitive responses**: nothing here returns another user's data in
  a response, because nothing here has a data store to query across
  users from.

## 4. File Uploads

- Every upload (teacher profile photo, teacher resource file, admin
  content thumbnail/file) is validated through one shared function,
  `validateUploadedFile` (`src/lib/utils/file-validation.ts`):
  rejects any file whose MIME type doesn't match an explicit allowlist
  prefix, separately rejects `image/svg+xml` even where "any image" is
  otherwise accepted (an SVG is XML and can carry an inline `<script>`
  or event-handler attribute), and rejects anything over the caller's
  byte limit — all checked before the file is ever read into memory.
- **Storage / unauthorized access / executable file risk**: none of
  these apply today, and the code's own comments say so plainly —
  there is no server-side file storage anywhere in this codebase, so
  an uploaded file is never written to a server filesystem, never
  served back from one, and never executed by anything. "Protect
  private files" and "prevent path traversal" are not yet applicable
  problems, not problems that were solved and are being claimed as
  solved.
- The one real, present-day risk (a malicious filename or MIME
  spoofing) is covered by the type/size allowlist above; a genuinely
  malicious file's *contents* can't do anything today because nothing
  server-side ever opens, executes, or stores it.

## 5. Secrets

- `git ls-files | grep -i env` returns only `.env.example` — `.env.local`
  has never been tracked or committed (`git log --all --full-history --
  .env.local` returns nothing).
- `.gitignore` covers every env variant (`.env*` with `!.env.example`
  as the sole exception), so a future `.env.production` or similar
  would also be ignored by default.
- `.env.example` contains only empty placeholder keys and explanatory
  comments — no real values, and its own comments correctly instruct
  that the Supabase service-role key and both admin variables must
  never be `NEXT_PUBLIC_`-prefixed.
- A repo-wide scan for hardcoded secret-like literals
  (`api[_-]?key|secret|passphrase|password` assigned to a long
  alphanumeric string) in tracked source found none.
- Every real secret this project defines (`ADMIN_PASSPHRASE`,
  `ADMIN_SESSION_SECRET`, and the not-yet-used
  `SUPABASE_SERVICE_ROLE_KEY` / `PAYMENT_PROVIDER_SECRET_KEY`) is read
  only via `process.env` in server-only files
  (`src/lib/admin/*`, `src/lib/supabase/server.ts`,
  `src/lib/payments/is-configured.ts`) — none of them are ever
  `NEXT_PUBLIC_`-prefixed, so none are ever bundled into client
  JavaScript. (No actual secret value was printed or inspected as part
  of this check — only variable names and configuration state.)

## 6. Privacy

- Every private/account-scoped page sets
  `robots: { index: false, follow: false }` in its own metadata —
  verified directly on `/dashboard`, `/teachers/dashboard`, `/account`,
  every `/admin/(protected)/*` page, both `/dashboard/applications*`
  routes, `/dashboard/notifications`, `/dashboard/children/[childId]`,
  and the auth pages (`/sign-in`, `/sign-up`, `/forgot-password`,
  `/reset-password`) — 33 files carry this meta in total.
- `src/app/sitemap.ts` only ever lists genuinely public content (nav
  pages, published learning categories, published resources/games/
  offerings/articles) — no dashboard, account, admin, or auth URL
  appears anywhere in it.
- `src/app/robots.ts` disallows `/admin` outright as defense in depth,
  on top of (not instead of) both the per-page `noindex` meta and
  `proxy.ts`'s real access control.
- **Data collected**: child profiles collect a name and age/birth
  year — nothing more (`src/lib/validations/child-profile.ts`).
  Applications collect what an admissions form genuinely needs. No
  page collects a field it doesn't use.
- **Contact information**: the `/support` page's real mailto link is
  the only place an email address is collected *from* a visitor
  (nothing is auto-collected); no visitor's browsing or usage data is
  transmitted to any third-party endpoint (no analytics/tracking
  script was found calling out to an external domain from any
  first-party page).

## 7. Security Headers

Configured in `next.config.ts`, applied to every route
(`source: "/:path*"`):

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY` — this site can never be framed by another
  origin (clickjacking protection).
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()` —
  explicitly denies APIs this platform never needs.
- `Strict-Transport-Security: max-age=63072000; includeSubDomains` —
  only takes effect over real HTTPS (added Prompt 98); deliberately no
  `preload` directive, since submitting to browsers' built-in preload
  list is close to irreversible and is a decision for whoever controls
  the real production domain to make, not one to default into.
- `poweredByHeader: false` — the `X-Powered-By: Next.js` header is
  removed.
- **Secure cookies**: the one real cookie (admin session) is
  `httpOnly`, `sameSite: "lax"`, and `secure` in production (section
  1).
- **HTTPS**: enforced by HSTS once deployed behind a real HTTPS
  domain; this repository doesn't (and shouldn't) hardcode a redirect
  from HTTP, since that's the hosting platform's job in production.

**Not configured, and honestly flagged rather than silently
skipped — Content-Security-Policy.** No `Content-Security-Policy`
header exists today. Adding one safely requires enumerating every
script/style/font/image source this app actually uses (including
Google Fonts, `next/image` optimization paths, and inline JSON-LD
`<script>` tags, all of which are genuinely used across this site) and
testing every page against it — a real change with real risk of
silently breaking a page in production if rushed, which is exactly
what this prompt's own instruction ("do not add configurations that
break the application") says not to do without that verification. It
is not added in this pass; it's recorded below as the one concrete
follow-up.

## 8. Verification Run This Pass

- `npm audit` (full, including dev dependencies): **0 vulnerabilities**.
- `npx vitest run`: full suite passing (see commit for the exact count
  this pass; unchanged from the previous checkpoint's 335/335 across
  53 files — no test was modified as part of this review).
- `npx tsc --noEmit`: clean, no errors.
- `npx eslint .`: clean, no errors or warnings.
- `rm -rf .next && npx next build`: clean production build, zero
  errors or warnings, all routes compiled successfully.
- No source code changed as part of this review — every check above
  passed against the codebase as it already stood; this document
  itself is the only diff.

## Remaining Risks

Stated plainly, not minimized:

1. **No Content-Security-Policy header.** The current headers
   (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`) provide
   real, meaningful protection, but a CSP would add defense-in-depth
   against injected-script attacks specifically. Not added this pass
   for the reason given in section 7 — it needs deliberate,
   page-by-page verification to add without breaking something.
2. **Admin logout doesn't revoke the token before its 8-hour
   expiry** — a copied/leaked admin cookie remains valid until it
   naturally expires, even after the legitimate admin logs out. A real
   fix needs an external store (Redis, a database) this project
   doesn't have; documented in `src/lib/admin/session.ts` itself, not
   hidden.
3. **The admin login throttle is process-global, not per-caller.**
   Five wrong guesses from anyone locks out the real admin too, and the
   counter resets on a server restart or serverless cold start. A
   correct trade-off for a single-shared-passphrase system with no
   per-admin identity table, but worth knowing before treating it as a
   durable brute-force defense.
4. **Parent/teacher accounts have no real authentication yet** — by
   design and disclosed on every relevant form, not a gap that was
   missed. Once a real backend (Supabase, per the existing
   scaffolding in `src/lib/supabase/`) is connected, this entire
   authorization model changes, and this document will need a full
   re-review at that point — most of what's written above about
   "there's nothing to protect server-side" stops being true the
   moment real user data starts living on a server.
5. **The admin "Users" list is not yet a real cross-user view** — it
   reflects only the browser it's opened in, for the reason in section
   2. Not a security bug (no other user's real data is exposed), but
   worth knowing so it's never mistaken for a live admin capability it
   doesn't yet have.

This platform's security posture is honest about what it has and
hasn't built: real, tested, server-enforced protection where a server
exists to enforce anything (admin), and a deliberately transparent
"nothing sensitive lives on a server yet" model everywhere else. No
claim of absolute security is made — only what was specifically
checked, and what specifically remains.
