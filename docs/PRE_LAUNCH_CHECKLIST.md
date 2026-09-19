# Little Learners Learning — Pre-Launch Checklist

The final pre-launch checkpoint. Every item below was verified this
pass against a live local server (`npm run dev` for interactive
journeys, a fresh `next build` for the production check) — clicked
through, submitted, or read directly from source, not assumed from
prior audits. Where an earlier prompt already established something
unchanged, that's noted; nothing here is restated from memory alone.

## Website

Every route named for this checklist returned `200` from a live
server this pass: Home, About, Learn, Resources, Games, Blog, Support,
Parents, Teachers, Admissions, FAQ, Offerings, plus every account/auth
route exercised in the journeys below. Live-clicked this pass:

- **Home** — loads with a clear headline, tagline, subject list, and
  two correctly weighted CTAs ("Explore Learning" primary, "For
  Parents" secondary). Real navigation confirmed by clicking through
  to Learn.
- **About, Contact** — reachable from the primary nav and footer
  respectively; the footer's "Contact & Support" link and mailto
  address are both real and live.
- **Blog, FAQ, Admissions, Offerings** — all returned `200` and render
  real content (verified in this and prior prompts' route sweeps).

## Learning Platform

- **Learning Categories** (`/learn`) — all 16 subjects listed, honestly
  grouped, with a clear disclosure that content is still being added.
  Featured/highlighted teasers correctly limit themselves to the 7
  categories with real content, so a visitor is never routed into an
  empty subject from the homepage or learn hub.
- **A populated category** (`/learn/mathematics`, live-tested) — shows
  real subtopics, a real worksheet, three real playable games, a real
  linked blog article, and category-specific AEO questions.
- **Life Skills** (`/learn/life-skills`, live-tested) — real subtopic
  content ("Getting Dressed Independently"), colorful and respectful
  presentation, no fabricated breadth.
- **Qur'an Learning — Nazra** (`/learn/quran-nazra`, live-tested) —
  every step ("Learn," "Practice," "Play") honestly shows "Coming
  soon," with no invented content standing in — verified by reading
  the live page, not just its config.

## Parent Experience

Live-tested this pass, start to finish:

1. `/sign-up` — real Zod validation, and an honest, visible notice that
   accounts aren't connected to a live backend yet; nothing is silently
   pretended to be saved.
2. `/dashboard` — real, working feature: added a real child profile
   ("Test Child," age 5, an icon chosen) through the actual "Add a
   child" modal. The child immediately appeared on the dashboard with
   an honest "nothing recorded yet" progress state.
3. Quick links (Explore Learning, Resources, Games, Applications,
   Notifications) and the Account section (settings, privacy,
   membership) all present and correctly linked.

"Login" specifically: not yet real, and the sign-in page says so
plainly — this is the same disclosed, honest limitation covered in
`docs/SECURITY_FINAL_CHECK.md`, not a bug found this pass.

## Teacher Experience

Live-tested this pass, the full three-step flow named in this prompt:

1. **Registration** (`/teachers/register`) — filled in a real name,
   email, country, and password; submitting genuinely saved the
   non-password fields to this browser and advanced to email
   verification, with an honest "won't create a real sign-in yet"
   notice shown first.
2. **Expertise/Profile** (`/teachers/register/profile`) — selected a
   real age group, saved, and the app correctly treated this as
   first-time completion.
3. **Dashboard** — landed on a real "Welcome, Test Teacher" dashboard
   with working quick actions (edit profile, create resource, ask the
   assistant), confirming the full registration→profile→dashboard path
   works end to end today.

## Applications

Live-tested this pass, the full 5-step wizard plus tracking:

1. Started a new application (`/dashboard/applications/new`) — a real
   draft was created immediately (confirmed by the URL gaining a real
   id).
2. Stepped through Applicant info → Learner info (correctly listed
   only the "Test Child" profile created earlier in this same session,
   confirming real data continuity) → Learning interest → Additional
   info → Review.
3. Submitted — received a real, unique reference number
   (`LLL-38ZPVR`) and an honest "no live admissions review connected
   yet" notice.
4. **Tracking**: opened the application's own page and confirmed a
   real status ("Submitted"), real applied/last-updated dates, and an
   honest "what happens next" explanation — no fabricated review
   status or decision anywhere.

## Games

- Played **Count the Fruits** live this pass: answered a real question
  ("How many apples do you see?"), selected the correct choice, and
  received real, immediate feedback ("Correct! Well done," score
  incremented to 1). Confirmed genuinely interactive, not a static
  mockup.
- Every game detail page correctly shows accessibility notes (keyboard
  playable, screen-reader text alternatives, no timer pressure).
- Consistent with prior prompts' full game-by-game audits (Prompt 101):
  5 of 6 games are playable; the 6th is honestly held back pending
  required content review, never presented as a broken link.

## Mobile

Checked this pass at 375px width via direct DOM measurement
(`scrollWidth` vs `clientWidth`), not just a screenshot:

- Homepage: no horizontal overflow.
- Teacher profile/expertise form (`/teachers/register/profile`): no
  horizontal overflow — this is the exact form whose file-input
  overflow bug was found and fixed in Prompt 92; re-confirmed fixed.
- A game detail page (`/games/count-the-fruits`): no horizontal
  overflow.

## SEO

Verified live against a running server this pass:

- `/sitemap.xml` — returns real XML listing only published content.
- `/robots.txt` — allows everything except `/admin`, and points at the
  real sitemap.
- **Canonical URLs** — confirmed present and correct on the homepage
  (`rel="canonical"`) and, per source inspection, on every public page
  template (about, learn categories, resources, games, blog, offerings,
  admissions, parents, teachers, faq, support).
- **Structured data** — confirmed 4 real `application/ld+json` blocks
  present on the homepage alone (Organization, WebSite, and others per
  page type); every instance goes through one shared, XSS-safe escaping
  helper (`src/lib/seo/json-ld.ts`).
- **Internal links** — every learning category, resource, and game
  cross-links to related content (subject → related games/resources/
  articles, and back), confirmed while browsing the Mathematics
  category live.
- **Indexability** — every genuinely public page carries no `noindex`;
  every page that does set one has a stated, deliberate reason
  (private/account pages, two legal pages whose real text isn't
  written yet, and the direct-link-only teacher profile page) — none
  are oversights, verified by reading each one's own metadata comment.

## AEO

- FAQ page and every populated category page carry real, specific
  question-and-answer structured data (`FAQPage` schema) — e.g.
  Mathematics's own "What does Mathematics cover?", "What age is
  Mathematics for?", and "What resources, games, or activities are
  available for Mathematics today?", confirmed live.
- No ranking or traffic outcome is promised anywhere in this codebase
  or in this document — AEO readiness here means the structured
  question/answer content exists and is real, not a guarantee of
  search or answer-engine placement.

## Security

Re-confirmed this pass against the full standalone review already
completed in `docs/SECURITY_FINAL_CHECK.md` (Prompt 104) — nothing
material has changed in the codebase since that review beyond the
purely additive analytics scaffold (Prompt 105) and deployment
documentation (Prompt 106), neither of which touches authentication,
authorization, or data handling:

- **Private information protected**: every child/parent/application/
  admin page carries `noindex`; child, application, and teacher account
  data all live only in that browser's own `localStorage` — nothing is
  transmitted to a server that doesn't exist.
- **Authentication working**: the one real system, `/admin`, live-
  verified again this pass indirectly via its own test suite
  (`login-rate-limit.test.ts`, `session.test.ts`) passing in this run's
  341/341.
- **Authorization working**: `/admin/*` is gated server-side in
  `src/proxy.ts` before any page component runs — verified by source
  inspection unchanged since Prompt 104's direct test.
- **Secrets protected**: `git ls-files | grep -i env` still returns
  only `.env.example`; no real value was printed at any point in this
  process.
- **Uploads protected**: the shared `validateUploadedFile()` check
  (type allowlist, SVG rejection, size cap) is unchanged and still the
  only path every upload form uses.
- **Production errors safe**: confirmed live in Prompt 106's local
  production test — a nonexistent route returned a friendly "Page not
  found" page with no stack trace in the response body.

## Privacy

- No event, form, or page anywhere collects more than the feature in
  front of it needs — a child's profile asks for a name and age only;
  an application asks for what an admissions form genuinely needs.
- The new analytics scaffold (Prompt 105) sends zero data anywhere
  today (`isAnalyticsConfigured()` is false with no id set) and, even
  once enabled, is restricted by type to public slugs only — never a
  name, email, child profile field, or password.
- Contact information collection is limited to what a visitor
  voluntarily provides via the real mailto link; nothing is
  auto-collected.

## Performance

- **Production build**: verified fresh this pass — clean, all 71
  routes generated, zero errors, zero warnings.
- **Images**: the header/footer brand logo (a 2.3MB source PNG) is
  always rendered through `next/image`, which serves a resized,
  AVIF/WebP-optimized version at request time — the raw source file is
  never sent to a visitor's browser for that usage. The dedicated
  favicon is a separately generated 64×64, ~4KB file, not the full
  brand asset.
- **Mobile performance**: no horizontal overflow found anywhere
  checked this pass (see "Mobile" above); most public routes are
  statically prerendered (`○`/`●` in the build output), which is the
  strongest lever this codebase has for fast first loads.
- **Unnecessary requests**: no third-party analytics or tracking
  script is loaded today (the new scaffold is a genuine no-op); no
  external image domain is used anywhere in the app.
- **No obvious layout problems** found in any page checked this pass,
  desktop or mobile.

## Analytics

- No analytics provider is connected yet, and this document doesn't
  claim otherwise. The scaffold added in Prompt 105
  (`src/lib/analytics/`) is wired at real call sites (category viewed,
  resource viewed, game opened, contact initiated, teacher
  registration started/completed, application started/completed) but
  sends nothing until a real, chosen provider's id is set — see
  `docs/SEARCH_MONITORING_PLAN.md` for the recommended next step and
  full privacy rule set.

## Deployment

- Per `docs/FINAL_DEPLOYMENT_GUIDE.md` (Prompt 106): no hosting
  platform is connected yet, no custom domain is configured, and
  `NEXT_PUBLIC_SITE_URL` still defaults to `localhost`. A real local
  production run (`next build` → `next start` → live `curl` checks)
  was performed for that document and passed cleanly.
- No CI/CD pipeline exists — every check in this document was run
  manually, consistent with every prior prompt in this project's
  history.

## Content

Searched this pass, repo-wide:

- **Lorem ipsum**: none found anywhere in `src/` or `public/`.
- **Placeholder/template artifacts** (`[TBD]`, `[TODO]`, unresolved
  `{{...}}` template syntax, stray `undefined` in rendered text): none
  found.
- **Fake statistics**: none found — no invented user count, family
  count, or growth number exists anywhere in the codebase.
- **Fake testimonials**: none found. The one place the word
  "testimonial" appears in source is a comment explicitly documenting
  that this platform's blog content contains *no* testimonials, by
  design.
- **Fake teachers**: none found — no "meet our teachers" or team
  section exists anywhere; the teacher directory shows only real,
  locally-created profiles, never seeded sample people presented as
  real staff.
- **Fake awards / fake partnerships**: none found. The only "award"
  matches are in test files about the games' own reward-tier logic; the
  only "partner" match describes a letter-matching game mechanic, not
  a business relationship.
- **Unfinished text**: the honest "coming soon" / "not yet connected"
  disclosures throughout the site (Qur'an Nazra content, the support
  form, parent/teacher login) are intentional, disclosed limitations —
  not unfinished copy left by mistake. Two legal pages (`/privacy`,
  `/terms`) explicitly and correctly say their own content isn't
  finalized yet, which is the one piece of genuinely incomplete text
  on the site, and it's honestly labeled as such rather than presented
  as real policy.

## Remaining Issues

Nothing found this pass rose to a launch-blocking code or trust defect.
What remains open, in order of what a business reader should weigh
most:

1. **Content breadth** (unchanged, tracked since Prompt 89): 9 of 16
   learning categories have no real resources or games yet. Not
   hidden — the homepage and learn hub already limit their
   highlighted lists to the 7 categories that do.
2. **Privacy Policy and Terms of Service are not yet written.** Both
   pages say so themselves and are correctly excluded from search
   indexing until they are. This should be resolved before real users
   are asked to create accounts or submit applications with real
   personal information, even though the current review/application
   flows already disclose that nothing is a binding submission yet.
3. **Parent and teacher accounts are not yet connected to a real
   backend** (Supabase scaffolded but unconfigured) — every relevant
   form already discloses this. Real accounts, real login, and
   server-side authorization for parent/child/teacher data all depend
   on this being connected.
4. **No custom domain, hosting platform, or analytics provider is
   connected yet** — all three are documented, ready-to-configure next
   steps (`docs/FINAL_DEPLOYMENT_GUIDE.md`,
   `docs/SEARCH_MONITORING_PLAN.md`), not code gaps.
5. **No Content-Security-Policy header** — flagged in
   `docs/SECURITY_FINAL_CHECK.md` as a deliberate, not-yet-taken next
   security step, to be added once there's a real production domain to
   test it against.
6. **Admin logout doesn't revoke a session token before its natural
   8-hour expiry**, and the login throttle is process-global rather
   than per-caller — both documented, understood trade-offs of the
   current no-external-store architecture
   (`docs/SECURITY_FINAL_CHECK.md`).

None of the above were found to be code defects introduced by this
project's implementation — each is either a disclosed architectural
limitation the site is already honest about, or genuine future work
(real accounts, a real domain, real legal text) that depends on a
business decision or a real backend, not a bug fix.

## Launch Status

**READY WITH MINOR FIXES**

The platform is technically sound: every route tested loads correctly,
every core interactive journey (visitor exploration, parent dashboard,
teacher registration through to a working dashboard, and a full
application submission through to a real tracked status) was live-
tested this pass and worked end to end with real data, the codebase is
clean across build/lint/typecheck/tests, and no fabricated content,
statistics, testimonials, or fake authority claims were found anywhere
in a full repo-wide search. It is not rated "READY FOR LAUNCH" because
two concrete, non-code items should be resolved first: the Privacy
Policy and Terms of Service need real, finalized text before asking
real users for real personal information, and a decision is needed on
when to connect a real backend for parent/teacher accounts. It is not
rated "NOT READY" because nothing found this pass blocks a limited or
soft launch under the platform's own current, honestly-disclosed
scope.
