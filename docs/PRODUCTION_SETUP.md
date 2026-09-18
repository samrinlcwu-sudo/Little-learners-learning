# Production Setup

What this project actually is, what it needs to run in production, and how
to deploy and roll it back. Written from direct inspection of the current
codebase (Prompt 98), not assumptions — every claim here was verified
against the real config files, `package.json`, and a live production
build.

## What this application is

- **Framework**: Next.js 16.3.4 (App Router, Turbopack), React 19,
  TypeScript, Tailwind CSS v4.
- **Backend**: none. `find src/app -name route.ts` is empty — there are no
  API routes anywhere. The only real server-side code is the admin
  authentication Server Action (`src/lib/admin/actions.ts`) and the route
  gate in `src/proxy.ts`.
- **Database**: none. All parent/child/teacher/application data lives in
  each visitor's own browser `localStorage` — there is nothing to
  provision, migrate, or back up on a server. This is a deliberate,
  disclosed architecture choice (see `docs/ADMIN_ARCHITECTURE.md` and the
  various `*_ARCHITECTURE.md` docs), not an oversight.
- **File storage**: none. Uploaded images/files are read client-side into
  base64 `data:` URIs and stored in the same browser's `localStorage` —
  there is no server filesystem write and no object-storage bucket to
  configure.
- **The one real server-verified system**: admin authentication — a
  shared passphrase, an HMAC-signed session cookie, and a Server-Action
  rate limiter (`src/lib/admin/login-rate-limit.ts`). See
  `docs/ADMIN_ARCHITECTURE.md` for the full design.

## Environment variables

None of these are hardcoded anywhere in the source — grep confirms every
secret is read only via `process.env`. `.env.example` (tracked in git,
contains no real values) is the authoritative list; `.env.local` (real
values, gitignored) is what a developer or the hosting platform actually
supplies. **This project does not use separate `.env.staging` /
`.env.production` files** — Next.js and Vercel both work by supplying the
*same* variable names with different *values* per environment (local
`.env.local` for development; the hosting platform's own environment
variable settings, scoped per environment — e.g. Vercel's Development /
Preview / Production — for everything else). There is nothing in this
codebase that behaves differently based on an environment *name*, only on
whether a given variable is set.

| Variable | Required? | Exposed to browser? | Purpose |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Yes, for correct production SEO | Yes (by design — it's a public URL) | Base URL used in canonical links, sitemap, robots.txt, and Open Graph tags. **Defaults to `http://localhost:3000` if unset** — this must be set to the real production domain in the hosting platform's environment settings, or every canonical URL/sitemap entry/social preview will point at localhost. |
| `ADMIN_PASSPHRASE` | Yes, for `/admin` to work at all | No (server-only) | The shared passphrase checked at `/admin/login`. Without it, `/admin` fails closed (blocks everyone) rather than failing open — this is intentional. |
| `ADMIN_SESSION_SECRET` | Yes, for `/admin` to work at all | No (server-only) | Signs the admin session cookie (HMAC-SHA256). Generate with `openssl rand -base64 32` or equivalent; treat it exactly like a password. |
| `NEXT_PUBLIC_SUPABASE_URL` | No | Yes (by design if ever used) | Dormant — `src/lib/supabase/client.ts`/`server.ts` exist but have zero imports anywhere in the app. Leave unset. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No | Yes (by design if ever used) | Same as above — dormant, safe to leave unset. |
| `SUPABASE_SERVICE_ROLE_KEY` | No | No (server-only) | Dormant, unused. **Never** prefix this with `NEXT_PUBLIC_` if it's ever filled in later. |
| `PAYMENT_PROVIDER_ID` / `PAYMENT_PROVIDER_SECRET_KEY` | No | No (server-only) | Dormant — no payment provider is integrated. Leaving these unset is what keeps `isPaymentProviderConfigured()` correctly `false`. |

**Verified this pass, without printing any real value**: `.env.local` is
listed in `.gitignore` (`.env*` with a `!.env.example` exception), and
`git ls-files` confirms only `.env.example` is tracked — no real secret
has ever been committed to this repository.

**No API key is exposed to the frontend unnecessarily** — the only
`NEXT_PUBLIC_`-prefixed variables in this codebase are the site URL and
the (unused) Supabase URL/anon key, both of which are meant to be public
by their own nature (Supabase's anon key is explicitly designed to be
client-safe). `ADMIN_PASSPHRASE`, `ADMIN_SESSION_SECRET`,
`SUPABASE_SERVICE_ROLE_KEY`, and both payment variables are all read only
in server-side code (`src/lib/admin/*.ts`, never imported by anything
with `"use client"`).

## Development setup

```bash
npm install
cp .env.example .env.local
# fill in ADMIN_PASSPHRASE and ADMIN_SESSION_SECRET in .env.local
npm run dev
```

## Production build & start

```bash
npm run build   # runs `next build` — this is what a host should run
npm run start   # runs `next start` — this is what a host should run to serve it
```

Both commands were re-run fresh this pass (`rm -rf .next && npx next
build`) and completed cleanly, all 71 routes generated, exit code 0.
`package.json` also declares `"engines": { "node": ">=20.9.0" }` — use a
Node runtime at or above that version.

## Deployment

**No deployment configuration file (`vercel.json`, `netlify.toml`,
`Dockerfile`) exists in this repository, and none was added by this
audit.** This is a deliberate choice, not an oversight: a stock Next.js
16 App Router project needs zero extra configuration on Vercel — it
auto-detects the framework, runs `next build`, and serves it correctly,
including the Node-runtime `src/proxy.ts` gate. Adding a hand-written
config file here would only introduce a second, competing source of
truth for settings Vercel already infers correctly. If a different host
is chosen instead of Vercel, that host's own Next.js adapter/build
instructions apply — there is nothing project-specific to configure
beyond the environment variables above.

**To deploy on Vercel**: connect this GitHub repository
(`samrinlcwu-sudo/Little-learners-learning`, branch `master`), set the
environment variables above in the project's Environment Variables
settings (scoped to Production, and to Preview/Development as needed),
and deploy. No build command override, output directory override, or
routing/rewrite rules are needed.

**Domain**: no custom domain is configured anywhere in this repository
today — `NEXT_PUBLIC_SITE_URL` still defaults to `http://localhost:3000`.
Before a real launch, set `NEXT_PUBLIC_SITE_URL` to the real production
domain in the hosting platform's environment settings; otherwise every
canonical link, sitemap entry, and social preview will silently point at
localhost.

**No CI/CD pipeline exists** (`.github/workflows` is empty/absent) — this
audit did not add one, since doing so would be a genuinely new process
this project has not asked for. Until one exists, run `npm run build`,
`npm run lint`, `npm run typecheck`, and `npm run test` manually before
each deploy (exactly as this audit did).

## Rollback considerations

Because there is no database and no server-side file storage, a rollback
here is unusually simple and carries no data-loss risk: every user's real
data (child profiles, applications, teacher registrations) lives in that
user's own browser, entirely independent of which build of the code is
currently deployed. Rolling back means either:

1. On Vercel: promoting a previous deployment from the deployments list
   (each push creates its own immutable deployment) — instant, no
   rebuild needed.
2. Via git: `git revert` the offending commit(s) and push, triggering a
   fresh deploy of the reverted code.

There are no database migrations to reverse and no stored files to
reconcile either way.

## Security review of the production configuration (Prompt 98)

- **Fixed this pass**: added a `Strict-Transport-Security` header
  (`max-age=63072000; includeSubDomains`, deliberately without
  `preload` — submitting to browsers' built-in preload list is close to
  irreversible and should be a deliberate choice made by whoever controls
  the real production domain, not something this codebase opts into by
  default). Also set `poweredByHeader: false` to stop sending
  `X-Powered-By: Next.js` — a small, standard hardening step with no
  functional effect.
- **Already correct, re-verified**: `X-Content-Type-Options`,
  `X-Frame-Options`, `Referrer-Policy`, and `Permissions-Policy` were
  already set in `next.config.ts` and are unchanged. The admin session
  cookie is `httpOnly`, `sameSite: "lax"`, and `secure` specifically when
  `NODE_ENV === "production"` (verified in `src/lib/admin/actions.ts`) —
  correct behavior for both a plain-HTTP local server and a real HTTPS
  production deployment.
- **No exposed secrets, no debug mode, no development-only endpoint**: no
  API routes exist to gate; no debug flag or verbose-logging toggle
  exists anywhere in the codebase; every error boundary shows a generic,
  user-facing message (re-confirmed by reading `src/app/error.tsx` and
  `src/app/admin/(protected)/error.tsx` again this pass).
- **No CORS policy exists because no API exists to need one.** If a real
  API is ever added, CORS should be scoped to this site's own origin(s)
  only.
- **Not implemented, and deliberately left for a deliberate future
  decision rather than rushed here**: a Content-Security-Policy header.
  Building one correctly requires enumerating every real external
  resource this app loads (Google Fonts, `next/image` optimizer paths,
  any third-party script) and testing it against a live deployment — a
  misconfigured CSP can silently break hydration or block a legitimate
  resource. Recommended as the next concrete security improvement once
  there's a real production domain to test it against.

## Verification performed for this document

- `npx vitest run` — 333/333 tests passing, 52 files.
- `npx tsc --noEmit` — clean.
- `npx eslint .` — clean.
- `rm -rf .next && npx next build` — clean, all 71 routes generated.
- `npm audit` — 0 vulnerabilities.
- Live response headers checked directly against a running production
  server (`curl -I`) before and after this prompt's `next.config.ts`
  changes.
- `git ls-files | grep env` — confirmed only `.env.example` is tracked.
