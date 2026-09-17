# Security & Privacy Checkpoint (Prompt 88)

Mandatory checkpoint re-auditing Prompts 84–87 (platform security audit,
authentication/session hardening, API & data access, database/upload/
privacy) as a single pass, plus a full regression test of the live
production build.

## 1. Security findings

Every fix from Prompts 84–87 was re-verified in place, not assumed:

- **JSON-LD escaping** (`toJsonLdHtml()`): still used at all 17 call
  sites; no raw `JSON.stringify()` inside `dangerouslySetInnerHTML`
  anywhere in `src`.
- **Admin login rate-limiting**: `MAX_ATTEMPTS = 5`, `LOCKOUT_MS = 5 min`
  unchanged in `src/lib/admin/login-rate-limit.ts`.
- **SVG upload rejection**: `REJECTED_IMAGE_SUBTYPES = ["image/svg+xml"]`
  unchanged in `src/lib/utils/file-validation.ts`.
- **Admin route gate**: `src/proxy.ts` matcher is still exactly
  `["/admin/:path*"]`, fails closed, `/admin/login` the only exemption.
- **No `NEXT_PUBLIC_`-prefixed secret** anywhere (`ADMIN_PASSPHRASE`,
  `ADMIN_SESSION_SECRET` both server-only); no `.env.local` tracked in
  git (only `.env.example`).
- **No console logging of passwords/tokens/secrets** anywhere in `src`.
- **Live end-to-end auth test** (production server, real local
  passphrase): wrong passphrase → generic "Incorrect passphrase." with no
  cookie set; correct passphrase → dashboard loads, a real audit-log entry
  is recorded ("Signed in to the admin area"); sign out via the account
  menu → `/admin` immediately bounces back to `/admin/login`. Full cycle
  confirmed working exactly as designed.

No new vulnerability was found in this pass — this checkpoint's job was
confirming Prompts 84–87 actually hold under fresh, independent testing,
and they do.

## 2. Privacy findings

- Sitemap (`src/app/sitemap.ts`), robots (`src/app/robots.ts`), and every
  private dashboard's `robots: { index: false, follow: false }` metadata
  re-confirmed unchanged and correct.
- Re-checked public pages live (homepage, about, resources, games, blog,
  support, teacher directory, a public teacher profile) for any
  email/phone/child-data exposure — none found, consistent with Prompt
  87's findings.
- No regression in the `local-applications.ts` → `local-children.ts`
  `LOCAL_PARENT_ID` ownership fix from Prompt 87 (build/typecheck confirm
  the import resolves correctly).

## 3. Fixes completed

No new fixes were required this checkpoint — Prompts 84–87 already closed
every real issue found across authentication, API/data access, and
database/upload/privacy. This prompt's own scope is verification, and
verification is what was done: re-reading every fix in place, re-running
the full automated suite, and live-testing the auth cycle end to end
against a real running server.

## 4. Remaining risks (disclosed, not fixed — by design)

These are the same honestly-documented architectural limits Prompts 84–87
already recorded, re-confirmed still accurate and still the right call
for this project's current stage:

- **No real server-side session revocation on logout** — `session.ts`
  documents why (Next.js compiles `proxy.ts` into an isolated bundle from
  the Server Action bundle; Prompt 85's real attempt at this was reverted
  after live-testing broke login). Closing this needs an external shared
  store (Redis/database) this project doesn't have yet.
- **No database** — the entire data layer is per-browser `localStorage`;
  "backups" and "database access control" apply to that layer, not a real
  DB, and are documented as such.
- **Login rate limiting is process-global, not per-caller** — a
  deliberate trade-off of a single shared admin passphrase with no
  per-admin identity to throttle separately.

## 5. Test status

- **Automated tests**: `npx vitest run` → **333/333 passing**, 52 files.
- **Type check**: `npx tsc --noEmit` → clean.
- **Lint**: `npx eslint .` → clean, 0 findings.
- **Production build**: `rm -rf .next && npx next build` → clean, all 71
  routes generated, exit code 0.
- **Live regression** (production server, `npm run start`): homepage,
  about, a learning category, resources, games, blog, support, teacher
  directory, a public teacher profile, parent dashboard, teacher
  dashboard, teacher registration, and `/admin` (unauthenticated redirect)
  all loaded with no console errors and matching expected titles/content.
  Full admin login → dashboard → audit-log entry → sign-out → re-lock
  cycle verified live with the real local passphrase.
- **One test-tooling artifact investigated and resolved, not a real bug**:
  during automated browser testing, `/search` intermittently rendered as
  a stuck loading skeleton in the Claude Browser pane after repeated
  navigations in the same tab. Investigated by hitting the route directly
  over HTTP (bypassing the browser pane entirely): `curl` against
  `/search` and `/search?q=counting` returned complete, correct,
  fully-rendered HTML in 50–340ms on every one of several repeated
  requests, with identical byte size each time. `/search` and
  `/admin/(protected)` are the only two routes in the app using a
  `loading.tsx` Suspense boundary (everything else renders synchronously,
  with no swap step) — that's the one structural thing they share, and
  the swap step is exactly what appeared to stall in the automation
  harness on a reused tab. Since the server-rendered response is
  independently verified correct and fast on every request, this is
  assessed as a browser-automation-pane artifact around Suspense-boundary
  script execution on a reused tab, not an application defect. Flagging
  it here rather than silently discarding it, since it's the kind of
  thing worth knowing about even though it isn't a code fix.

## 6. Overall security readiness

The real security surface of this application — the admin passphrase/
session system — is sound: server-verified, fails closed, rate-limited,
audited, and now covered by both unit tests (`session.test.ts`,
`login-rate-limit.test.ts`, `actions.test.ts`) and a live end-to-end test
in this checkpoint. Every other "security" concern in a typical app
(API authorization, database access control, cross-user data isolation)
is structurally minimized by this project's zero-backend, per-browser
architecture, which has been independently verified rather than assumed
across four consecutive audits (84–87) and re-confirmed here. Nothing
found in this checkpoint required a code change. The platform's security
posture is stable and consistent with its actual architecture — not
overstated, and not silently regressed since Prompt 87.
