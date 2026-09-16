# Authentication & Session Security Hardening (Prompt 85)

A dedicated audit of authentication and session handling, following
directly on from Prompt 84's platform-wide security audit (which already
fixed the JSON-LD XSS vector, added admin login rate-limiting, and
tightened file-upload validation — all still in place, unaffected by this
prompt). This prompt covers the parts of the checklist Prompt 84 didn't
already close: registration/login/logout messaging, password-reset
architecture, role security, and — the one real attempt at a genuine
improvement — server-side session revocation on logout.

## What was tried, and honestly reverted: real session revocation on logout

**The gap**: `adminLogoutAction` deletes the browser's session cookie,
but the signed token itself has no server-side revocation — a copy of it
captured before logout (a synced browser profile, a shared machine, a
proxy/access log) would still pass `verifyAdminSessionToken` for the rest
of its 8-hour life. This is real gap #1 on this prompt's own session
checklist ("session invalidation on logout").

**What was built**: every token would carry an `epoch` value alongside
its `exp`; a module-level `currentEpoch` variable in `session.ts` would
be advanced on every logout; verification would require the token's
epoch to match the current one. Standard technique for revoking
stateless tokens without a database.

**Why it was reverted**: it doesn't work in this framework, and this was
confirmed empirically, not assumed. Next.js 16 compiles `src/proxy.ts`
into its own isolated bundle, separate from the Server Action bundle
`adminLoginAction`/`adminLogoutAction` execute in — even though both
technically run under the Node.js runtime (Proxy's new default in
v16, per `node_modules/next/dist/docs/.../proxy.md`). A module-level
variable in `session.ts` is not the same value in both bundles. After
implementing the epoch check, a real login (correct passphrase, valid
signature, unexpired token) was rejected by `proxy.ts` on the very next
page load, in the same single dev-server process — proving the two
bundles never see the same `currentEpoch`. This wasn't a subtle edge
case; it broke 100% of admin logins.

**What this means, honestly**: real server-side session revocation would
need state shared between those two bundles from *outside* either of
them — a database row, a Redis key, some external store this project
doesn't have. Building that store just to close this one gap would be
exactly the "unnecessary security complexity" this prompt's own
instructions warn against, for a project with no other use for a
database yet. The gap is now documented plainly in
`docs/ADMIN_ARCHITECTURE.md` ("Security" section) and in `session.ts`'s
own header comment, so it's a known, disclosed limitation rather than a
silent one — consistent with how every other "not built yet" capability
in this codebase is handled.

**Net effect on the codebase**: the attempt was fully reverted — `session.ts`,
`actions.ts`, and `session.test.ts` are functionally identical to their
Prompt 84 state (diffed to confirm), with added comments explaining what
was tried and why. No working functionality was left broken.

## Everything else audited (confirmed already correct)

- **Registration** (`sign-up-form.tsx`, `teacher-register` flow): real
  `zod` validation, but never fakes account creation or a "this email is
  already taken" check — since no account backend exists, there's
  nothing to check against, and the form says so plainly rather than
  simulating a duplicate-account error that couldn't be real. This is
  itself the correct anti-enumeration behavior (never reveal whether an
  account exists), just for an honest reason rather than a deliberately
  engineered one.
- **Login** (`sign-in-form.tsx`): same pattern — a single generic
  "passed every check" success state regardless of input, never a
  distinct "wrong password" vs. "no such account" message. No credential
  is ever logged (confirmed via a repo-wide search for
  `console.*` calls near "password"/"token"/"secret"/"session" —
  Prompt 84 — still clean).
- **Logout**: verified live, end-to-end, after the revert above — sign
  in with the real local passphrase, confirm `/admin` loads, sign out via
  the account menu, confirm `/admin` immediately bounces back to
  `/admin/login`.
- **Password reset** (`forgot-password-form.tsx`, `reset-password-form.tsx`):
  already exactly matches this prompt's own instruction to "prepare
  architecture without inventing functionality" — both forms show
  precisely what a real Supabase integration would call
  (`resetPasswordForEmail`, `updateUser`) in a comment, validate real
  input, and never fake sending an email or accepting a reset token that
  doesn't exist.
- **Role security**: confirmed there is no client-supplied "role" value
  anywhere that grants real privilege. The only real authorization
  boundary in the app — `/admin/*` — is decided exclusively by
  `verifyAdminSessionToken()` against the signed cookie; a repo-wide
  search for role-like checks outside `src/lib/admin/` turned up only
  cosmetic UI decisions (hiding the public header on admin routes,
  highlighting the active admin nav item), never an authorization
  decision. A parent cannot become a teacher or an admin by editing a
  request, because "becoming a teacher" is just writing to this
  browser's own localStorage (by design, already disclosed everywhere
  else in this codebase) and "becoming an admin" requires a passphrase
  only the server can verify.
- **Session fixation**: not possible by construction — `createAdminSessionToken()`
  generates a brand-new token only after a successful passphrase check;
  no pre-authentication session identifier is ever issued or reused, so
  there's nothing for an attacker to "fix" in advance.
- **Open redirect on login**: re-confirmed `sanitizeRedirect()` in
  `admin/login/page.tsx` still correctly restricts the post-login
  destination to same-origin `/admin` paths.
- **Protected routes**: `src/proxy.ts` — unchanged, still the single real
  gate in front of every `/admin/*` request.
- **Password handling**: no plaintext password is stored anywhere in this
  codebase. The one real credential (the admin passphrase) is never
  persisted at all — it's compared via a constant-time SHA-256 digest
  comparison against an environment variable on every login attempt.

## Testing performed

- `npx tsc --noEmit` — clean.
- `npx vitest run` — 49 files, 300 tests, all passing (back to exactly
  Prompt 84's count — the epoch attempt's 3 extra tests were removed with
  the revert).
- `npx eslint .` — clean.
- `npx next build` — clean, all 71 routes generated, identical topology.
- Live, against a running server: real admin login with the actual local
  passphrase, confirmed dashboard access, confirmed the audit log
  recorded the sign-in, signed out via the account menu, confirmed
  `/admin` immediately requires signing in again.

## Not changed

No authentication provider was replaced. No working account or session
behavior was removed — the one attempted change was tried, found to
break login, and fully reverted before being shipped. Every fix from
Prompt 84 (JSON-LD escaping, login rate-limiting, upload validation)
remains exactly as it was.
