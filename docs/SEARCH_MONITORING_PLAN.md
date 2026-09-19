# Search Monitoring Plan

How this platform's post-launch search visibility and site usage will be
measured, and what's already in place versus what's a real next step.
Written from direct inspection of the current codebase — every claim
below about what exists today was verified against source, not assumed.

This document does not claim the site is verified with Google today. It
isn't — no Search Console property has been created, because that
requires a live, real production domain and an account action only the
site's actual owner can take. What follows is what's already built to
make that verification and monitoring straightforward once launch
happens, and the concrete steps to take at that point.

## What Already Exists (verified this pass)

- **Sitemap**: `src/app/sitemap.ts` generates `/sitemap.xml` dynamically
  from real, published content only (nav pages, published learning
  categories, resources, games, offerings, and blog articles) — no
  private, admin, or account page appears in it.
- **Robots**: `src/app/robots.ts` generates `/robots.txt`, allows
  everything except `/admin`, and points crawlers at the real sitemap
  URL.
- **Canonical URLs**: nearly every public page sets
  `alternates: { canonical: ... }` with a real, absolute URL built from
  `siteConfig.url` (e.g. `src/app/learn/[category]/page.tsx`,
  `src/app/resources/[resource]/page.tsx`, `src/app/games/[game]/
  page.tsx`, and the static pages — about, parents, teachers,
  admissions, faq, support, offerings, blog). `NEXT_PUBLIC_SITE_URL`
  drives all of it (`src/config/site.ts`), so setting it to the real
  production domain at deploy time is what makes every canonical URL,
  sitemap entry, and Open Graph tag correct — already documented in
  `docs/PRODUCTION_SETUP.md`.
- **Indexability**: every genuinely public page (home, learn, learning
  categories, resources, games, life skills, Qur'an Nazra, blog, about,
  parents, teachers, admissions, FAQ, support, offerings) carries no
  `noindex` directive and is reachable from the sitemap. The pages that
  *do* set `robots: { index: false }` are deliberate, and each one for a
  stated reason, not an oversight:
  - Every account/dashboard/admin/auth page (33 files) — private,
    per-browser data with nothing for a search result to usefully show.
  - `/privacy` and `/terms` — both pages' own copy says their content
    "is not yet written or finalized"; indexing a legal page before its
    real content exists would be actively misleading in search results.
    `follow: true` is still set on both, so link equity still passes
    through them.
  - `/teachers/p/[slug]` — always noindex today because
    `generateMetadata` runs server-side and has no way to check a given
    slug's real visibility/moderation status (everything lives in that
    visitor's own browser). Documented in the page's own comment as a
    real limitation to close once a backend exists.
  - `/search` — a dynamic search-results page; standard practice to
    keep these out of an index to avoid thin/duplicate content.
- **Structured data**: JSON-LD (`Organization`, `WebSite`, `Article`,
  `LearningResource`/`Game`, `FAQPage`, `BreadcrumbList`, `Person` for
  teacher profiles) is present across the site via one shared, XSS-safe
  helper (`src/lib/seo/json-ld.ts`) — real schema.org markup Search
  Console's Enhancements reports can pick up once verified.

## What This Pass Added

- `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` (`.env.example`,
  `src/app/layout.tsx`): once a Search Console property's verification
  code is set here, every page renders the real
  `<meta name="google-site-verification">` tag Google's "HTML tag"
  verification method checks for. Unset today — no tag renders, and no
  false claim of verification exists anywhere in this codebase.
- A small, provider-agnostic analytics scaffold
  (`src/lib/analytics/`) — see "Analytics" below.

## 1. Search Console Setup (post-launch, once a real domain exists)

1. At [search.google.com/search-console](https://search.google.com/search-console),
   add the production domain as a property (Domain property, if DNS
   access is available — it covers `http`/`https` and all subdomains
   in one verification, which is preferable to a URL-prefix property).
2. Verify ownership. The **HTML tag** method is the one this codebase
   is already prepared for: generate the code in Search Console, set it
   as `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` in the hosting platform's
   environment variables, and redeploy — the tag appears automatically
   on every page via `src/app/layout.tsx`. (A DNS TXT record works too
   and needs no code change at all, if that's simpler for whoever
   controls the domain's DNS.)
3. Confirm `NEXT_PUBLIC_SITE_URL` is set to the real production domain
   in the hosting platform's environment settings *before* verifying —
   otherwise the sitemap and canonical URLs Search Console reads will
   still point at `localhost`.

## 2. Sitemap Submission

1. In Search Console → Sitemaps, submit `sitemap.xml` (resolves to
   `https://<production-domain>/sitemap.xml`).
2. Since `src/app/sitemap.ts` is generated dynamically from the same
   published-content flags every page already uses
   (`isResourcePublished`, `isGamePublished`, `isArticlePublished`,
   `isOfferingPubliclyVisible`), it never needs manual editing —
   publishing new content in the admin panel is the only action needed
   to add it to the sitemap on the next crawl.
3. Re-submission is not needed after every deploy; Google recrawls a
   submitted sitemap periodically on its own. Re-submit only if the
   sitemap URL itself changes.

## 3. Indexing Monitoring

1. Search Console → Pages (Indexing report): check weekly right after
   launch, then monthly once stable. Watch specifically for:
   - Pages "Discovered, not indexed" or "Crawled, not indexed" —
     usually a sign of thin content or a page not linked from anywhere
     else on the site.
   - Any real content page (a resource, game, or category) appearing
     under "Excluded by noindex tag" — since only the pages listed
     above should ever carry that tag, this would mean a real bug, not
     an expected exclusion.
2. Cross-check the Indexing report's page count roughly matches the
   sitemap's real entry count for published content — a large gap is
   the first signal something's wrong.

## 4. Search Query Monitoring

1. Search Console → Performance report, reviewed monthly: which
   queries actually bring visitors to which pages, average position,
   and click-through rate per query.
2. Look specifically for queries with high impressions but low CTR —
   the page is being shown but the title/meta description isn't
   winning the click; both are real, editable fields already
   established per page (`buildCategoryMetaDescription()` in
   `src/config/learning-categories.ts` is exactly this kind of lever
   for category pages).
3. Look for queries with a decent position (top 20) but zero clicks —
   often a sign the matching page doesn't exist yet and is the clearest
   signal for what content to build next, tying directly into the
   content-breadth gap already tracked in
   `docs/BUSINESS_PRESENTATION_REVIEW.md`.

## 5. Page Performance Monitoring

1. Search Console → Experience → Page Experience / Core Web Vitals
   report, reviewed monthly (field data needs real traffic to
   populate, so this stays empty until launch has real visitors).
2. Until then, use Lighthouse (Chrome DevTools → Lighthouse tab) or
   [PageSpeed Insights](https://pagespeed.web.dev) against the
   production URL right after launch as a lab-data baseline, on both
   the homepage and one representative learning-category page (the two
   page types most first-time visitors land on).
3. Re-run after any change that adds a new script, font, or large
   image, since those are the changes most likely to regress Largest
   Contentful Paint or Cumulative Layout Shift.

## 6. Broken-Page Monitoring

1. Search Console → Indexing → Pages report's "Not found (404)" and
   "Server error (5xx)" buckets, checked monthly — these surface real
   broken links Google has actually tried to crawl.
2. `src/app/robots.ts` already keeps crawlers out of `/admin`, so a
   404 on an admin path in this report would indicate a crawler
   ignoring `robots.txt` (or a real accidental internal link into
   `/admin` from a public page) — worth a one-off check if it ever
   appears, not expected.
3. Internally, `notFound()` is already used consistently for missing
   dynamic routes (categories, resources, games, articles, offerings) —
   verified during this platform's own end-to-end testing
   (`docs/END_TO_END_TEST_REPORT.md`) — so a genuine 404 report from
   Search Console most likely means an old/removed slug still linked
   from somewhere, not a code defect.

## 7. Core Web Vitals Monitoring

Same report as "Page Performance" above (Google folded Core Web Vitals
into the Page Experience report) — called out separately here because
it's the one metric set that can silently regress without anyone
noticing until Search Console's field data catches it weeks later:

1. Treat a lab-data Lighthouse run (see section 5) as a pre-launch and
   post-major-change gate, not a one-time check.
2. Once real field data exists (Search Console needs meaningful traffic
   volume before it reports per-URL data), review it monthly for any
   URL group dropping from "Good" to "Needs improvement" or "Poor."
3. This codebase's own architecture already favors good Core Web
   Vitals by default — static generation for most routes (`○` and `●`
   markers in the build output for the majority of pages), `next/image`
   with AVIF/WebP (`next.config.ts`), and no client-side analytics
   script shipped today (see "Analytics" below) — so a future
   regression is more likely to come from added content (a large
   unoptimized image, an embedded third-party widget) than from the
   framework itself.

## 8. Content Improvement Process

A repeatable loop connecting the reports above to real action, not just
observation:

1. **Monthly**: pull the Performance report's top 20 queries by
   impressions. For each one already ranking (position ≤ 20) with a
   real, relevant page on this site, check click-through rate — a low
   CTR against a reasonable position means the title/description is
   the lever to pull, not new content.
2. **Monthly**: pull queries with meaningful impressions and *no*
   matching page on the site — this is the direct signal for which of
   the still-unpopulated learning categories (`docs/
   BUSINESS_PRESENTATION_REVIEW.md`'s tracked content-breadth gap) to
   prioritize first, replacing guesswork with real demand data.
3. **After publishing new content**: verify it appears in `/sitemap.xml`
   (automatic, per section 2) and request indexing for that specific
   URL via Search Console's URL Inspection tool if faster indexing
   matters for a launch or time-sensitive piece.
4. **Quarterly**: re-run the Lighthouse/PageSpeed baseline (section 5)
   and compare against the previous quarter's, independent of whether
   Search Console has flagged anything — catching a slow regression
   before it shows up in field data is cheaper than fixing it after.

## Analytics

Separate from search monitoring, but prepared in this same pass since
both exist to answer "is this working, and for whom":

- **What existed before this pass**: nothing. No analytics package, no
  tracking script, no `gtag`/`dataLayer`/similar anywhere in this
  codebase (verified by a repo-wide search). The only existing
  "tracking" system, `src/lib/progress/` (via `TrackPageView`), is a
  real, separate, per-child *learning progress* feature — attributed to
  one specific child profile so the platform can suggest "what to try
  next" — not site analytics, and it was left untouched.
- **What this pass added**: `src/lib/analytics/` — `types.ts` (the
  fixed event vocabulary below), `is-configured.ts` (an
  `isAnalyticsConfigured()` check against a new, generic
  `NEXT_PUBLIC_ANALYTICS_ID` variable, false today), and `track.ts`
  (`trackEvent()`, a genuine no-op until that variable is set — no
  network request, no third-party script, no data sent anywhere until
  a provider is deliberately connected). This mirrors the same
  honest-scaffolding pattern already used for Supabase
  (`isSupabaseConfigured`) and payments (`isPaymentProviderConfigured`)
  elsewhere in this codebase.
- **Events wired at real call sites** (fires only once a provider is
  connected; today every call is a no-op):
  - `learning_category_viewed` — `src/app/learn/[category]/page.tsx`
  - `resource_viewed` — `src/app/resources/[resource]/page.tsx`
  - `game_opened` — `src/app/games/[game]/page.tsx`, only when the game
    is actually playable (not on the "coming soon" placeholder)
  - `contact_initiated` — the footer's real mailto link
    (`src/components/patterns/contact-mailto-link.tsx`). **Not**
    "contact form submitted": the support page's own form is
    intentionally disabled today (`src/app/support/page.tsx` — "sending
    is disabled for now"), so there is no real submission to measure
    yet without fabricating one. This is the one real, working contact
    action that exists in its place.
  - `teacher_registration_started` —
    `src/components/patterns/teacher-register-form.tsx`, on real
    account creation (step 1)
  - `teacher_registration_completed` —
    `src/components/patterns/teacher-profile-page.tsx`, on first-time
    profile completion (step 2, the real end of the flow)
  - `application_started` —
    `src/components/patterns/application-wizard.tsx`, when a real
    application draft is created
  - `application_completed` — same file, once a submission genuinely
    succeeds
- **Recommended next step, not decided here**: a real provider needs an
  actual choice by whoever owns this business, since it's a product
  decision, not a code one. [Vercel Analytics](https://vercel.com/analytics)
  is the most natural zero-config fit if this deploys on Vercel (per
  `docs/PRODUCTION_SETUP.md`) — no cookies, aggregated data, nothing to
  self-host. [Plausible](https://plausible.io) and
  [Fathom](https://usefathom.com) are both real, paid, privacy-first
  alternatives if a non-Vercel host or a specific compliance need makes
  more sense. Whichever is chosen, only `src/lib/analytics/track.ts`
  needs a real implementation — every call site above stays unchanged.

### Privacy

What analytics on this platform will never do, by construction:

- **No sensitive child information.** No event anywhere passes a
  child's name, age, profile id, or any field from
  `src/lib/accounts/local-children.ts`. The `AnalyticsEventProperties`
  type (`src/lib/analytics/types.ts`) only ever carries public content
  identifiers (a category or resource slug) — nothing from a form
  field a person typed.
- **No passwords, tokens, or auth state.** No password field is ever
  read by an analytics call (most aren't even persisted anywhere at
  all — see `docs/SECURITY_FINAL_CHECK.md`, "Authentication"), and the
  admin session cookie/token is never touched by anything in
  `src/lib/analytics/`.
- **No private application content.** `application_started` /
  `application_completed` fire with zero properties — not the
  applicant's name, email, child, learning interests, or message.
- **No teacher private information.** `teacher_registration_started` /
  `_completed` carry zero properties — not name, email, bio, or any
  profile field.
- **Collect only what's needed.** Every event above carries either no
  properties at all, or only a public slug that's already visible in
  that page's own URL — nothing beyond what answers "which page/action"
  for the aggregate counts this exists to produce.
