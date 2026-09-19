# Final Deployment Guide

The single, current reference for taking this repository to production.
Written from direct inspection of the live codebase and a real local
production run performed for this document (`next build` → `next start`
→ `curl` against the running server) — not restated from memory.
Consolidates and supersedes the deployment-relevant parts of
`docs/PRODUCTION_SETUP.md` (Prompt 98), `docs/SECURITY_FINAL_CHECK.md`
(Prompt 104), and `docs/SEARCH_MONITORING_PLAN.md` (Prompt 105); those
documents remain for their own fuller detail (production headers
reasoning, the full security review, and search/analytics setup,
respectively).

## Current Architecture

Determined by direct inspection this pass, not assumed:

- **Source control**: GitHub, `samrinlcwu-sudo/Little-learners-learning`,
  deployed from the `master` branch. No CI/CD workflow exists
  (`.github/workflows` is absent) — every check in this document was run
  manually, as it has been for every prior audit in this project.
- **Framework**: Next.js 16.3.4 (App Router, Turbopack build), React 19,
  TypeScript, Tailwind CSS v4. `package.json` declares
  `"engines": { "node": ">=20.9.0" }`.
- **Deployment configuration**: none committed — no `vercel.json`,
  `netlify.toml`, `Dockerfile`, or `.vercel/` directory exists in this
  repository, and none was added by this pass. This is deliberate: a
  stock Next.js App Router project needs no hand-written config on
  Vercel (or any other Next.js-aware host) — a competing, hand-written
  config file would only be a second source of truth for settings the
  platform already infers correctly.
- **Frontend hosting**: not yet deployed anywhere as of this pass — no
  hosting platform has been connected to this repository. See
  "Deployment Process" below for what connecting one involves.
- **Backend hosting**: not applicable. `find src/app -name route.ts`
  returns zero results — there are no API routes anywhere in this
  codebase. The only real server-side code is the admin authentication
  Server Action (`src/lib/admin/actions.ts`) and the request gate in
  `src/proxy.ts`, both of which run as part of the same Next.js
  deployment — there is no separate backend service to host.
- **Database hosting**: none. Every parent/child/teacher/application
  record lives in that visitor's own browser `localStorage` — there is
  nothing to provision, connect, migrate, or back up on a server. A
  Supabase client exists in scaffold form (`src/lib/supabase/`) but has
  zero real usage; see "Database" below.
- **Domain configuration**: none. No custom domain is referenced
  anywhere in this codebase; see "Domain Configuration" below for
  exactly what's needed once one is chosen.
- **Environment variables**: read only via `process.env`, never
  hardcoded (verified by a repo-wide search); see "Required Environment
  Variables" below for the full list.

## Required Environment Variables

Every variable this codebase reads, verified against `.env.example`
(the authoritative, git-tracked list of names — no real values are
ever committed):

| Variable | Required for launch? | Exposed to browser? | Purpose |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | **Yes** | Yes (a public URL, by design) | Base URL for canonical links, sitemap, robots.txt, and Open Graph tags (`src/config/site.ts`). Defaults to `http://localhost:3000` if unset — **must** be set to the real production domain before launch. |
| `ADMIN_PASSPHRASE` | **Yes**, for `/admin` to work | No (server-only) | The shared passphrase checked at `/admin/login`. Without it, `/admin` fails closed — blocks everyone rather than opening to everyone. |
| `ADMIN_SESSION_SECRET` | **Yes**, for `/admin` to work | No (server-only) | Signs the admin session cookie (HMAC-SHA256). Generate with `openssl rand -base64 32` or equivalent; treat exactly like a password, never reuse across environments. |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | No | Yes (meant to be public) | Renders the Search Console ownership meta tag once a real property exists. See `docs/SEARCH_MONITORING_PLAN.md`. |
| `NEXT_PUBLIC_ANALYTICS_ID` | No | Yes | Turns on the analytics scaffold (`src/lib/analytics/`) once a real, chosen provider is connected. Leaving unset keeps it a genuine no-op. |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No | Yes (by design if ever used) | Dormant — the Supabase client exists but is imported by zero real app logic today. Leave unset. |
| `SUPABASE_SERVICE_ROLE_KEY` | No | **No — never** | Dormant, unused. If ever filled in, must never be `NEXT_PUBLIC_`-prefixed. |
| `PAYMENT_PROVIDER_ID` / `PAYMENT_PROVIDER_SECRET_KEY` | No | No (server-only) | Dormant — no payment provider is integrated. Leaving unset keeps `isPaymentProviderConfigured()` correctly `false`. |

**How this project handles environments**: there are no
`.env.staging`/`.env.production` files, and nothing in this codebase
branches on an environment *name* — only on whether a given variable is
*set*. `.env.local` (gitignored, real values) is what a developer's
machine supplies; a hosting platform's own environment-variable
settings (scoped per environment, e.g. Vercel's Production/Preview/
Development) are what production and preview deployments supply. Never
create a committed `.env.production` file as a substitute for this.

**Verified this pass, without printing any real value**: `git ls-files
| grep -i env` returns only `.env.example`; `git log --all
--full-history -- .env.local` returns nothing — no real secret has ever
been committed. `.gitignore` covers every env variant (`.env*` with a
`!.env.example` exception).

## Production Build

```bash
npm run build   # runs `next build`
npm run start   # runs `next start` — serves the build from `npm run build`
```

- **Output**: the default Next.js server output (no `output: "export"`
  or `"standalone"` override in `next.config.ts`) — required because
  this app has a real server-side gate (`src/proxy.ts`) and Server
  Actions (admin login/logout), neither of which a static export can
  serve.
- **Verified fresh this pass** (`rm -rf .next && npx next build`):
  compiled successfully, all 71 routes generated, zero errors, zero
  warnings.
- **Production-like local test performed for this document**: after
  the clean build above, ran `next start` on a local port and hit it
  with real HTTP requests:
  - `/` → 200, `/learn` → 200, `/sitemap.xml` → 200, `/robots.txt` → 200
  - `/admin` (no session cookie) → 307 redirect to
    `/admin/login?from=%2Fadmin` — the real server-side gate working
    exactly as designed, not bypassable from the client
  - `/admin/login` itself → 200 (correctly exempt from the redirect)
  - A nonexistent path → 404, with a friendly "Page not found" heading
    and no stack trace or internal detail in the response body
  - Response headers confirmed present exactly as configured:
    `X-Content-Type-Options`, `X-Frame-Options: DENY`,
    `Referrer-Policy`, `Permissions-Policy`,
    `Strict-Transport-Security` — and `X-Powered-By` confirmed **absent**
    (`poweredByHeader: false`).

## Deployment Process

No hosting platform is connected to this repository today. To deploy
(recommended: Vercel, since a stock Next.js App Router project needs
zero extra configuration there and it auto-detects the framework, the
build command, and the Node-runtime `src/proxy.ts` gate):

1. Connect the GitHub repository
   (`samrinlcwu-sudo/Little-learners-learning`) to the hosting
   platform, with `master` as the production branch.
2. Set every environment variable from the table above in the
   platform's own environment-variable settings, scoped to Production
   (and to Preview/Development if those environments are used too).
   Set `NEXT_PUBLIC_SITE_URL` to the real production domain from the
   start — every canonical URL, sitemap entry, and social preview reads
   from it at request time.
3. Deploy. No build command override, output directory override, or
   routing/rewrite rule is needed — `next build` and the platform's
   default Next.js runtime are sufficient.
4. After the first deploy, run through "Production Build"'s local
   verification steps again against the *real* deployed URL (the
   `curl` checks above, or a browser) before considering launch
   complete.
5. If a platform other than Vercel is chosen instead, that platform's
   own Next.js adapter/build documentation applies — there is nothing
   project-specific to configure beyond the environment variables
   above, since no framework-specific deployment file exists in this
   repository to translate.

**No CI/CD pipeline exists.** Until one is added, run `npm run build`,
`npm run lint`, `npm run typecheck`, and `npm run test` manually before
every deploy — exactly the sequence this document's own verification
followed.

## Domain Configuration

**No domain is configured anywhere in this repository today, and none
was purchased or invented for this document.** `NEXT_PUBLIC_SITE_URL`
still defaults to `http://localhost:3000`, and no domain string appears
hardcoded in any source file (verified by search).

Once the real Little Learners Learning production domain is chosen:

1. Set `NEXT_PUBLIC_SITE_URL` to `https://<the real domain>` (no
   trailing slash) in the hosting platform's environment variables.
2. Add the domain to the hosting platform's own domain settings (e.g.
   Vercel's Project → Settings → Domains) and follow the DNS
   instructions it generates for that specific domain and registrar —
   see "DNS Requirements" below for what those instructions will
   generally ask for.
3. Redeploy (or wait for the platform to pick up the new environment
   variable, depending on the platform) so every canonical URL, the
   sitemap, `robots.txt`, and Open Graph previews stop pointing at
   `localhost`.
4. Only after the domain resolves and serves the real site should
   Google Search Console verification begin (`docs/
   SEARCH_MONITORING_PLAN.md`, "Search Console Setup") — verification
   and sitemap submission both depend on the production domain already
   being live.

## DNS Requirements

The exact records depend on which hosting platform and registrar are
chosen — this section documents what will generically be needed so
whoever controls the domain's DNS can act on it later, without this
document guessing at or inventing specific values:

- **A root domain** (e.g. `littlelearnerslearning.com`) typically needs
  either an `A` record pointing at the host's provided IP address, or
  an `ALIAS`/`ANAME` record where the DNS provider supports one (root
  domains can't use a `CNAME`).
- **A `www` or other subdomain** typically needs a `CNAME` record
  pointing at the hostname the platform provides (e.g.
  `cname.vercel-dns.com` for Vercel — the platform's own domain
  settings screen gives the exact, current value to use; this document
  doesn't invent one since it changes per platform and can change over
  time).
- **Verification records**: some platforms require a one-time `TXT`
  record to prove domain ownership before activating it — again, the
  platform's own UI generates the exact value at the time a domain is
  added.
- **Propagation**: DNS changes can take anywhere from minutes to 48
  hours to fully propagate; don't treat an immediate failure to resolve
  as a misconfiguration.
- **Registrar access required**: whoever adds these records needs
  access to the domain's DNS management panel at its registrar (or
  wherever its nameservers are managed) — this is an account-level
  action outside this codebase and outside what any deployment
  automation here can do.

## HTTPS

- **Production should use HTTPS exclusively.** Nothing in this
  codebase introduces or requires plain HTTP — there is no hardcoded
  `http://` URL in any source file except the intentional localhost
  development default (`NEXT_PUBLIC_SITE_URL`'s fallback), which is
  never used once the real production URL is set.
- **`Strict-Transport-Security: max-age=63072000; includeSubDomains`**
  is already set for every route (`next.config.ts`) — confirmed present
  on the local production test above. It only takes effect once
  requests actually arrive over real HTTPS (browsers ignore it on plain
  HTTP), so it's inert during local development and becomes active
  the moment the real domain serves over HTTPS.
- **No `preload` directive** is set on that header deliberately —
  submitting a domain to browsers' built-in HSTS preload list is close
  to irreversible and is a decision for whoever controls the real
  production domain to make explicitly later, not something this
  codebase opts into by default.
- **Certificate provisioning**: standard hosting platforms (Vercel and
  equivalents) provision and renew a TLS certificate automatically once
  a custom domain's DNS is correctly pointed at them — no certificate
  file or key is managed in this repository, and none should be.
- **The admin session cookie** is already `secure` specifically when
  `NODE_ENV === "production"` (`src/lib/admin/actions.ts`) — it will
  only ever be sent over HTTPS in production, and works correctly over
  plain HTTP in local development, which is the correct behavior for
  both environments.

## Database

**There is no database in this project, and none needs to be
provisioned for launch.** Every parent, child, teacher, and application
record is created and read entirely client-side, stored in that
visitor's own browser via `localStorage`
(`src/lib/accounts/local-children.ts`,
`src/lib/accounts/local-teacher.ts`,
`src/lib/admissions/local-applications.ts`). This is a disclosed,
deliberate architecture — every relevant page tells the visitor
plainly that their data lives on that device only — not a placeholder
waiting to be filled in silently.

A Supabase client scaffold exists (`src/lib/supabase/client.ts`,
`server.ts`) but is unconfigured and unused by any real feature today
(`NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` are unset
everywhere, and `isSupabaseConfigured` gates every auth form to show an
honest "not connected yet" notice instead of attempting a request). If
a real backend is connected in the future, this document's "no database
to provision" claim — and most of `docs/SECURITY_FINAL_CHECK.md`'s
authorization section, which depends on there being nothing sensitive
server-side to protect — will need a full re-review at that point.

## Authentication

- **Admin (`/admin/*`)**: the one real, server-enforced authentication
  system in this codebase. A shared passphrase
  (`ADMIN_PASSPHRASE`) checked with a timing-safe comparison, an
  HMAC-SHA256-signed session cookie (`ADMIN_SESSION_SECRET`), a
  request-time gate in `src/proxy.ts` that runs before any admin page
  component, and a 5-attempt login throttle
  (`src/lib/admin/login-rate-limit.ts`). Fails closed: if either
  environment variable is missing, `/admin` blocks everyone rather than
  admitting everyone. Full detail in `docs/SECURITY_FINAL_CHECK.md`,
  "Authentication."
- **Parent / teacher accounts**: not yet real, and every relevant form
  says so on-page. Sign-in, sign-up, and teacher registration forms
  check `isSupabaseConfigured` and show an explicit "not connected to a
  live backend yet" notice; no password is ever transmitted or stored
  anywhere. Connecting a real Supabase project later (filling in the
  three Supabase environment variables above) is what activates this —
  no code change is needed at that point, only configuration.
- **Callback URLs**: none exist yet, since no OAuth or magic-link
  provider is connected. Once Supabase auth is enabled, its own
  dashboard will require the production domain's callback URL(s) to be
  registered — a step to perform at that time, not before.

## Rollback

Because there is no database and no server-side file storage, rollback
here carries no data-loss risk: every real user record lives in that
user's own browser, entirely independent of which code build is
currently deployed. To roll back:

1. **On Vercel (or an equivalent platform)**: promote a previous
   deployment from the deployments list — each push creates its own
   immutable deployment, so this is instant and needs no rebuild.
2. **Via git**: `git revert` the offending commit(s) and push, which
   triggers a fresh deploy of the reverted code on any platform without
   an instant-promote feature.

There are no database migrations to reverse and no stored files to
reconcile in either case.

## Troubleshooting

- **Canonical URLs / sitemap / Open Graph previews point at
  `localhost`**: `NEXT_PUBLIC_SITE_URL` isn't set (or isn't set
  correctly) in the hosting platform's production environment
  variables. Fix the variable and redeploy — there's no code path that
  needs to change.
- **`/admin` blocks everyone, including the real admin**: check that
  both `ADMIN_PASSPHRASE` and `ADMIN_SESSION_SECRET` are set in the
  platform's environment variables for the environment being tested —
  `isAdminAuthConfigured()` requires both, and the system fails closed
  by design if either is missing.
- **Locked out of `/admin/login` after repeated wrong guesses**: the
  in-memory throttle (`src/lib/admin/login-rate-limit.ts`) locks out
  *everyone* for 5 minutes after 5 failed attempts from anyone — this
  is the documented trade-off of a single-shared-passphrase system with
  no per-caller identity to throttle separately. Wait 5 minutes, or
  redeploy/restart the server to reset the in-memory counter
  immediately (a real limitation of not having an external store —
  see `docs/SECURITY_FINAL_CHECK.md`, "Remaining Risks").
- **A user reports "my data disappeared"**: expected if they cleared
  their browser's site data, switched browsers, or switched devices —
  there is no server-side backup, by design, since nothing is ever sent
  to a server. This should be communicated to users plainly, not
  treated as a bug to fix in code.
- **Build fails with a stale/incorrect TypeScript error that doesn't
  reproduce on a fresh checkout**: stop any locally running dev server
  before running `rm -rf .next && npx next build` — running both
  against the same `.next` directory concurrently has corrupted the
  dev-mode type cache in this project before (documented across this
  project's own prompt history) and produces a false build failure.
- **A page shows a generic "Something went wrong" instead of the real
  error**: this is intentional (`src/app/error.tsx`,
  `src/app/admin/(protected)/error.tsx`) — the real error is logged
  only to that visitor's own browser console via `console.error`, never
  shown in the page or sent to another user. To diagnose a real
  production issue, ask the reporting user to open their browser's
  developer console, or add real server-side error monitoring (e.g.
  Sentry) — none is connected today, and the `error.tsx` files already
  have a comment marking where that integration would go.

## Verification Performed for This Document

- `npx vitest run` — 341/341 tests passing, 55 files.
- `npx tsc --noEmit` — clean, no errors.
- `npx eslint .` — clean, no errors or warnings.
- `rm -rf .next && npx next build` — clean, all 71 routes generated,
  zero errors, zero warnings.
- `npm audit` — 0 vulnerabilities.
- A real local production run: `npx next start` against that build,
  verified via direct HTTP requests (`curl`) as detailed under
  "Production Build" above — real status codes, real redirect
  behavior, real response headers, and a real friendly 404 page,
  checked live rather than assumed from source alone.
- `git ls-files | grep -i env` — confirmed only `.env.example` is
  tracked; no real secret value was printed or displayed at any point
  in this process.
