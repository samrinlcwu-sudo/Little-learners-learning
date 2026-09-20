# Production Deployment Readiness

Final pre-launch infrastructure check. Every claim below was verified
directly against this repository and a real local production build
performed for this document — nothing is restated from memory, and no
hosting provider, domain, repository, analytics ID, or credential was
invented. This document supersedes nothing — `docs/FINAL_DEPLOYMENT_GUIDE.md`
(Prompt 98-era) remains for its own deeper detail on rollback and DNS
mechanics, but predates the real Supabase backend (Prompt 110), the
completed learning content (Prompt 111), the real Terms/Privacy pages
(Prompts 108/112), and the Content Security Policy (Prompt 113) — this
document reflects the **current** state as of this pass.

## 1. Current Deployment Platform

**COMPLETED (as much as this repo can be):** No hosting platform is
connected to this repository. Verified this pass:

- No `.vercel/` directory (would exist after `vercel link`).
- No `vercel.json`, `netlify.toml`, `Dockerfile`, or any other
  platform-specific config file.
- No `.github/workflows/` directory — no CI/CD pipeline exists. Every
  check in this document (build, lint, typecheck, test) was run
  manually, exactly as every prior audit in this project has done.
- `next.config.ts` uses the framework's default server output (no
  `output: "export"` or `"standalone"` override) — required because
  this app has a real server-side gate (`src/proxy.ts`) and Server
  Actions (admin login/logout, and now Supabase auth calls), neither of
  which a static export can serve.

**REQUIRES OWNER ACTION:** Choose and connect a hosting platform. A
stock Next.js 16 App Router project needs zero project-specific
configuration on Vercel (auto-detects the framework, build command, and
the proxy/middleware runtime) — this remains the path of least
resistance, per `docs/FINAL_DEPLOYMENT_GUIDE.md`'s "Deployment Process."
Any other Next.js-aware host works equally well; there is no
framework-specific file in this repo to translate for a different
platform.

## 2. Production URL

**REQUIRES OWNER ACTION.** `NEXT_PUBLIC_SITE_URL` is set to
`http://localhost:3000` in the local `.env.local` (the same fallback
`src/config/site.ts` uses when the variable is unset at all). No real
production URL exists anywhere in this codebase — verified by a
repo-wide search for hardcoded `localhost` or domain strings; the only
match is the one intentional fallback in `src/config/site.ts:10`. Every
one of the 31 files that build a canonical URL, sitemap entry, or Open
Graph tag reads from `siteConfig.url`, which reads from
`process.env.NEXT_PUBLIC_SITE_URL` — so setting this one variable
correctly in the hosting platform's environment settings is the entire
fix, with no code change required.

## 3. GitHub Repository / Branch Configuration

**COMPLETED.** Real, currently in use:

- Repository: `samrinlcwu-sudo/Little-learners-learning`
  (`https://github.com/samrinlcwu-sudo/Little-learners-learning.git`).
- Production branch: `master` — current `HEAD` is `cf11c02` ("security:
  finalize production security headers"), pushed and confirmed present
  on `origin/master`.
- Working tree is clean at the time of this audit (before this
  document and any fixes were added).

**REQUIRES OWNER ACTION:** connecting this repository to whichever
hosting platform is chosen (Step 1 of "Deployment Process" in
`docs/FINAL_DEPLOYMENT_GUIDE.md`), and deciding whether `master` should
be the platform's production branch (it is the only real branch with
completed work; a stray local worktree branch,
`claude/epic-ardinghelli-bda26f`, exists only as an in-progress local
artifact and is not part of this readiness assessment).

## 4. Build Command

**COMPLETED.** `package.json` scripts, verified against what was
actually run for this document:

| Script | Command |
|---|---|
| `npm run build` | `next build` |
| `npm run start` | `next start` (serves the build from `npm run build`) |
| `npm run lint` | `eslint .` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test` | `vitest run` |

No build command override is needed on any standard Next.js-aware
host — `next build` is the framework default and is what this pass
verified end-to-end.

## 5. Environment Variables Required (names only)

Every variable this codebase actually reads, verified against
`.env.example` (the git-tracked, authoritative list — confirmed via
`git ls-files | grep -i env`, which returns only `.env.example`; no
real value has ever been committed, confirmed via `git log --all
--full-history -- .env.local`, which returns nothing):

| Variable | Required for launch? | Exposed to browser? |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | **Yes** | Yes (public by design) |
| `NEXT_PUBLIC_SUPABASE_URL` | **Yes** — real accounts depend on it (Prompt 110) | Yes (safe; RLS protects data, not secrecy) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Yes** — same reason | Yes (safe; same reason) |
| `SUPABASE_SERVICE_ROLE_KEY` | No — not required by any code path today | No, and must never be `NEXT_PUBLIC_`-prefixed if ever set |
| `ADMIN_PASSPHRASE` | **Yes**, for `/admin` to work | No (server-only) |
| `ADMIN_SESSION_SECRET` | **Yes**, for `/admin` to work | No (server-only) |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | No | Yes (meant to be public) |
| `NEXT_PUBLIC_ANALYTICS_ID` | No | Yes |
| `PAYMENT_PROVIDER_ID` | No — no payment feature exists | No (server-only) |
| `PAYMENT_PROVIDER_SECRET_KEY` | No — same reason | No (server-only) |

This table's biggest change since `docs/FINAL_DEPLOYMENT_GUIDE.md`
(Prompt 98): `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY`
moved from "dormant, leave unset" to **required for launch** — real
parent and teacher accounts (Prompt 110) depend on them, and the
Content Security Policy's `connect-src` (Prompt 113) also reads
`NEXT_PUBLIC_SUPABASE_URL` directly.

## 6. Environment Variable / Secret Separation

**PASS.** Verified this pass, without printing any real value:

- `.gitignore` contains `.env*` with a `!.env.example` exception —
  every real env file is ignored, only the template is tracked.
- `git ls-files | grep -i env` → only `.env.example`.
- `git log --all --full-history -- .env.local` → empty; `.env.local`
  has never been committed at any point in this repository's history.
- No `.pem`, `.key`, credential, or service-account file is tracked
  (`git ls-files | grep -iE "\.pem$|\.key$|credentials|service.?account"`
  → empty).
- Every secret this codebase uses is read via `process.env`, never
  hardcoded (verified by repo-wide search) — confirmed again this pass
  for the two new Supabase variables added since Prompt 110.
- `.env.local`'s six set variables were checked for **presence and
  length only**, never displayed: `NEXT_PUBLIC_SITE_URL` (a public,
  non-secret value — confirmed set to the localhost default),
  `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `ADMIN_PASSPHRASE`, and `ADMIN_SESSION_SECRET` are all set locally;
  `SUPABASE_SERVICE_ROLE_KEY` is declared but empty (consistent with
  `docs/AUTHENTICATION_BACKEND_AUDIT.md`'s finding that no server-side
  code path has ever needed or used it).

**REQUIRES OWNER ACTION:** none of this local `.env.local` file's
values automatically reach a production deployment — each variable
above must be set independently in the hosting platform's own
environment-variable settings before the first production deploy.

## 7. Can the Application Build Successfully for Production?

**PASS.** A fresh, clean build was run for this document
(`rm -rf .next && npx next build`, no dev/preview server occupying port
3000 beforehand):

- Compiled successfully.
- TypeScript check passed within the build.
- All **77 routes** generated (static, SSG, and dynamic mixed
  correctly — proxy/middleware present for the admin gate and the
  Supabase session-refresh gate).
- Zero errors, zero warnings.
- `npm audit` → 0 vulnerabilities.

## Custom Domain

**NOT CONFIGURED.** No domain string (real or placeholder) appears
anywhere in this codebase — verified by search. `NEXT_PUBLIC_SITE_URL`
remains at its `http://localhost:3000` default locally.

**REQUIRES OWNER ACTION** once a domain is chosen (no domain was
purchased, configured, or guessed for this document, per this prompt's
explicit instruction):

1. Set `NEXT_PUBLIC_SITE_URL` to `https://<the real domain>` (no
   trailing slash) in the hosting platform's production environment
   variables.
2. Add the domain in the hosting platform's own domain settings and
   follow its generated DNS instructions for the specific registrar in
   use (see `docs/FINAL_DEPLOYMENT_GUIDE.md`, "DNS Requirements," for
   the generic record types to expect — this document does not repeat
   that detail here since nothing about it has changed).
3. Redeploy so canonical URLs, the sitemap, `robots.txt`, and Open
   Graph previews stop pointing at `localhost`.
4. Only then begin Google Search Console verification and sitemap
   submission (`docs/SEARCH_MONITORING_PLAN.md`) — both depend on the
   real domain already resolving.

Once a domain **is** configured, `sitemap.ts` and `robots.ts` (both
verified this pass to read `siteConfig.url`, never a hardcoded value)
and every canonical/Open Graph tag will automatically reflect it with
no code change — this was confirmed by direct reading of both files,
not assumed.

## HTTPS

**READY.** Nothing in this codebase introduces or requires plain HTTP.
`Strict-Transport-Security: max-age=63072000; includeSubDomains` is
already set for every route (`next.config.ts`, confirmed present via
`curl -I` in Prompt 113's testing) — it only takes effect once real
requests arrive over HTTPS, so it is inert in local development and
becomes active the moment a real domain serves over HTTPS. No
certificate is managed in this repository, which is correct — standard
hosting platforms (Vercel and equivalents) provision and renew TLS
certificates automatically once a custom domain's DNS points at them.

## 8. Analytics

**NOT CONFIGURED — by design, not by omission.** Verified by reading
`src/lib/analytics/track.ts` and `src/lib/analytics/is-configured.ts`
directly:

- `isAnalyticsConfigured()` returns `Boolean(process.env.NEXT_PUBLIC_ANALYTICS_ID)`
  — currently `false` everywhere, since that variable is unset.
- `trackEvent()` is a genuine no-op while unconfigured: no network
  request, no third-party script tag, no data ever sent to anyone.
- This does not conflict with the new Content Security Policy
  (Prompt 113) in any way — an unconfigured analytics scaffold makes
  zero network calls, so there is nothing for `connect-src` to block or
  need to allow. If a provider is connected in the future, its domain
  **must** be added to `connect-src` in `next.config.ts` at the same
  time, or its requests will be silently blocked by CSP — a real
  functional dependency to remember at that point, not a security bug.
- No tracking ID of any kind exists anywhere in this repository — none
  was invented for this document.

**REQUIRES OWNER ACTION:** select a privacy-conscious analytics
provider (Plausible, Fathom, and Vercel Analytics were all evaluated as
suitable candidates in `docs/SEARCH_MONITORING_PLAN.md`) and set
`NEXT_PUBLIC_ANALYTICS_ID`, either before or after launch — nothing
about launching without analytics blocks the site from working
correctly.

## SEO / Production URL Configuration

**READY**, pending only the domain being set (see "Custom Domain"
above):

- **Sitemap** (`src/app/sitemap.ts`): every entry — homepage, all 16
  learning categories, all published resources/games/offerings/blog
  articles — builds its URL from `siteConfig.url`. Verified by reading
  the full file this pass.
- **Robots** (`src/app/robots.ts`): allows `/`, disallows `/admin`
  (defense in depth on top of `/admin`'s own per-page `noindex` meta
  tags and the real server-side gate in `src/proxy.ts`), and points its
  `sitemap` field at `${siteConfig.url}/sitemap.xml`. Verified by
  reading the full file this pass.
- **Canonical URLs**: every page that sets `alternates.canonical` does
  so from `siteConfig.url`, confirmed for the two most recently added
  pages (`/terms`, `/privacy`) plus a repo-wide count of 31 files
  referencing `siteConfig.url` in total.
- **Structured data (JSON-LD)**: generated by `src/lib/seo/json-ld.ts`,
  rendered via `dangerouslySetInnerHTML` in roughly 16 files — already
  verified compatible with the new CSP in Prompt 113 (browsers apply
  `script-src` to every `<script>` tag regardless of `type`, which is
  why `script-src` carries `'unsafe-inline'`; see
  `docs/SECURITY_HEADERS_IMPLEMENTATION.md`).
- **Open Graph / social metadata**: generated through the shared
  `buildSocialMetadata()` helper (`src/lib/seo/social-metadata.ts`),
  used consistently across every page — no page builds its own,
  divergent Open Graph tags.
- **No development/local URL is accidentally hardcoded as a production
  value anywhere** — the only `localhost:3000` reference in the entire
  `src/` tree is the intentional, documented fallback in
  `src/config/site.ts:10`, confirmed by direct search this pass.

**REQUIRES OWNER ACTION:** none beyond setting `NEXT_PUBLIC_SITE_URL`
to the real domain (see "Custom Domain") — no guessed domain was
inserted anywhere in this pass.

## Remaining Manual Setup (Owner Action Required)

In the order they need to happen:

1. **Choose a hosting platform** and connect this GitHub repository
   (`samrinlcwu-sudo/Little-learners-learning`, branch `master`).
2. **Set every "Yes" environment variable from Section 5** in that
   platform's production environment settings — most critically
   `NEXT_PUBLIC_SITE_URL` (still localhost), and the two Supabase
   variables (real values already exist in the local `.env.local`;
   these need to be copied into the hosting platform separately — they
   don't transfer automatically).
3. **Choose and configure a custom domain** once decided (see "Custom
   Domain" above) — not done in this pass, and none was guessed.
4. **Select and connect an analytics provider** (see "Analytics"
   above) — optional for launch, but a real product decision to make
   at some point.
5. **Re-run the verification steps in `docs/FINAL_DEPLOYMENT_GUIDE.md`,
   "Production Build,"** against the real deployed URL once the first
   deploy happens — this document's checks were all run locally, and a
   real deployed environment should be spot-checked the same way before
   calling launch complete.
6. **Register Supabase's own production callback/redirect URLs** (its
   dashboard's Auth settings) once the real production domain is live —
   not needed while testing against `localhost`.

## Exact Launch Actions Still Required

- [ ] Connect repository to a hosting platform.
- [ ] Set `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`,
      `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `ADMIN_PASSPHRASE`, and
      `ADMIN_SESSION_SECRET` in that platform's environment settings.
- [ ] Point a real domain at the deployment (optional for a first
      launch on the platform's own subdomain, required for the final
      public URL).
- [ ] Decide on and connect an analytics provider (optional).
- [ ] Verify the live deployment with the same curl/browser checks
      already documented in `docs/FINAL_DEPLOYMENT_GUIDE.md`.
- [ ] Submit the sitemap to Google Search Console once the real domain
      is live (`docs/SEARCH_MONITORING_PLAN.md`).

## Summary by Status

**COMPLETED:**
- GitHub repository configured and up to date on `master`.
- `.gitignore` correctly protects all real env files; no secret has
  ever been committed.
- Production build, lint, typecheck, and test suite all verified
  clean this pass.
- Security headers and CSP already finalized (Prompt 113).
- SEO plumbing (sitemap, robots, canonical URLs, structured data, Open
  Graph) all correctly wired to a single `siteConfig.url` source of
  truth.

**READY (works correctly, contingent only on an owner decision
elsewhere):**
- HTTPS/HSTS configuration.
- SEO output once the real domain is set.
- Analytics integration point (no provider chosen yet, but wiring it
  in later needs no code change).

**REQUIRES OWNER ACTION:**
- Choosing and connecting a hosting platform.
- Setting the real production environment variables on that platform.
- Choosing and configuring a custom domain.
- Choosing and connecting an analytics provider.
- Post-deploy live verification and Search Console submission.

## Verification Performed for This Document

- Inspected `package.json`, `next.config.ts`, `.gitignore`,
  `.env.example`, `.env.local` (names/lengths only, no values
  displayed), `src/config/site.ts`, `src/app/sitemap.ts`,
  `src/app/robots.ts`, `src/lib/analytics/track.ts`,
  `src/lib/analytics/is-configured.ts`, and `README.md` directly.
- Confirmed no `.vercel/`, `vercel.json`, `netlify.toml`, `Dockerfile`,
  or `.github/workflows/` exists.
- Confirmed `git ls-files | grep -i env` returns only `.env.example`.
- Confirmed `git log --all --full-history -- .env.local` returns
  nothing.
- Confirmed no `.pem`/`.key`/credential/service-account file is
  tracked in git.
- Confirmed the only `localhost:3000` reference in `src/` is the
  intentional fallback in `src/config/site.ts`.
- `npx tsc --noEmit` — clean.
- `npx eslint .` — clean, zero errors or warnings.
- `npx vitest run` — 341/341 tests passing, 55 files.
- `rm -rf .next && npx next build` — clean, all 77 routes generated,
  zero errors, zero warnings.
- `npm audit` — 0 vulnerabilities.

No code was changed as part of this pass — every check above passed
against the existing, already-verified codebase from Prompt 113
(`cf11c02`), so no configuration or deployment issue required fixing.
