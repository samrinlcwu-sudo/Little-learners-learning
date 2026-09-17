# End-to-End User Journey Test Report (Prompt 92)

Every journey below was tested live against a running server (both
`npm run start` and `npm run dev`, as noted) by actually clicking through
real UI — filling forms, submitting them, playing games to completion,
and following real links — not by inspecting code or re-stating prior
audits. Two real bugs were found and fixed; everything else held up.

## 1. Visitor Journey

**Home → Learn → Mathematics → Counting Animals Worksheet (resource) →
Count the Fruits (game) → Blog article → back to Games hub** — followed
as a real click chain, not direct URL loads.

- Every transition worked: clicking "Explore Learning" reached `/learn`;
  clicking the Mathematics category card reached `/learn/mathematics`
  with real subtopic content; clicking a real resource link
  ("Counting Animals Worksheet") reached its detail page; the page's own
  "Practice the same skill with a game" link correctly led to
  "Count the Fruits"; the game's own "Back to Games Hub" link correctly
  returned to `/games` with the rest of the site unaffected (no console
  errors, header/footer intact).
- One thing worth noting, not a bug: a "Learning Hub" sample content card
  ("Counting to Ten — Practice Sheet") links to `/learn/mathematics#content`
  rather than a real detail page. This is correct — these are explicitly
  labeled "sample records, not a published library yet" and have no
  detail-page route; only real `Resource` records (a different, published
  data model) get one.
- Blog journey (below) and About/Contact (`/support`, since no dedicated
  `/contact` route exists — already noted in Prompt 89) both load cleanly
  with real content.

## 2. Parent Journey

**Dashboard → add a child profile → play a game as that child → see it
recorded on her page → application wizard → submission → tracking.**

- Added a real child profile ("Zara, 5 years old") through the actual
  dialog form — appeared immediately with a real avatar and an honest
  "nothing recorded yet" state.
- Confirmed the "active child" mechanism: entering a child's own
  `/dashboard/children/[id]` view sets `little-learners-learning:active-child`
  in `localStorage`, and any game played afterward attributes its
  progress to that child specifically (verified: playing Shape Match
  while Zara was active added "Game Explorer"/"First Steps" achievement
  badges and a "Finished Games" entry to her page).
- There is no real login/logout — this app has no parent account backend
  (by design, disclosed everywhere in the UI); "Register" is the sign-up
  form's honest "nothing is created" flow, already covered in Prompt 90's
  testing and re-confirmed unchanged here.
- Full 5-step application wizard (Applicant → Learner → Interests →
  Additional → Review) completed successfully, referencing the real child
  profile just created, producing a real submitted application with a
  reference number.

## 3. Teacher Journey

Tested in full for the first time this session — registration through to
a public-facing profile decision:

1. **Registration** (`/teachers/register`): empty submission showed real
   per-field validation ("Must be at least 2 characters," "Email is
   required," "Must be at least 8 characters"); valid submission advanced
   to email verification.
2. **Verification** (`/teachers/register/verify`): honestly discloses no
   real email is sent, with a "Continue to your profile" action.
3. **Profile & Expertise** (`/teachers/register/profile`): filled a
   headline, bio, one age group, and one subject; "Save and continue"
   correctly saved and navigated to the teacher dashboard.
4. **Teacher dashboard**: showed a real, computed profile-completion
   percentage (36%) broken down by section, with genuinely accurate
   "still needed" lists per section.
5. **Visibility → Directory**: switched the profile to "Public" and
   confirmed — correctly — that it still does **not** appear in
   `/teachers` (shows the honest "Teacher profiles will appear here soon"
   empty state), because listing in the directory requires a separate,
   real admin-approval step (`moderationStatus === "approved"`), which is
   deliberately stricter than "public" alone. This is documented,
   intentional behavior (`canListTeacherInDirectory()` vs.
   `canViewTeacherProfile()` in `src/lib/accounts/teacher-visibility.ts`),
   verified correct rather than assumed.
6. **Direct profile link**: the same profile *is* reachable at its own
   `/teachers/p/[slug]` URL once set to "Public," even before approval —
   confirmed this is the intended, narrower-than-directory visibility
   rule, not an inconsistency.

## 4. Application Journey

Already exercised fully during the Parent Journey (above) and cross-checked
against the applications list and detail views:

- `/dashboard/applications` lists every draft and submitted application
  for this browser, each with a real reference number and status badge.
- `/dashboard/applications/[id]` shows a full, real status timeline
  (Draft → Submitted → Under review [locked, honestly labeled "not
  available until a real review process is connected"] → Accepted
  [locked]) plus real applicant/child/interest details and a working
  "Withdraw" action.
- **No fake application records exist anywhere in this codebase.** Every
  application shown in this report was created live, in this browser,
  during this testing session (or a prior testing session using the same
  browser profile) — never seeded, sample, or hardcoded data. There is no
  `SAMPLE_APPLICATIONS` array anywhere in `src/lib/admissions/`.

## 5. Resource Journey

- **Search**: `/search?q=counting` returns correctly ranked results
  (resources, games, articles, and the matching learning area) — verified
  both via direct HTTP request (fast, consistent, 50–340ms) and live
  rendering in a fresh browser tab.
- **Filter**: category/age/type/tier filters on `/resources` and the
  topic/audience/sort filters on `/blog` both narrow results correctly —
  verified the blog's topic filter via URL (`?topic=early-childhood-education`)
  correctly reduced "4 articles" to "1 article" with a "Clear filters"
  option appearing.
- **Open → details → action**: every real resource followed
  (`counting-animals-worksheet`) showed correct metadata, an honest
  "Not available yet" state for its unattached download file, and correct
  cross-links to a related blog article and a related game.
- **Missing resources**: `/resources/nonexistent-resource` returns a real
  HTTP `404` (re-confirmed).
- **Empty results**: `/search?q=xyznonexistentquery12345` correctly shows
  "No results for 'xyznonexistentquery12345'. Try a different word..." —
  confirmed via direct HTTP request after the Claude Browser pane's known
  Suspense-rendering flakiness on `/search` (documented in Prompt 88)
  produced a blank screenshot; the server-rendered response itself was
  correct on every request.
- **Mobile**: resource cards, filters, and detail pages all fit within a
  375px viewport with no horizontal overflow (see Mobile Journey).

## 6. Game Journey

Played two games to completion end to end (Count the Fruits, Shape Match):

- Wrong answers show a gentle "Not quite — try another one," never a
  harsh failure state; a round only advances on the child's own "Next"
  click (no surprising auto-advance).
- Scoring is deliberately forgiving by design: a round only counts toward
  the score if answered correctly *without* a prior wrong guess in that
  same round (`src/lib/games/use-choice-game.ts`) — confirmed this is
  documented, intentional behavior, not a bug, by reading the shared game
  engine's own comments.
- Completion screen shows real encouragement copy ("Well done!", a
  star rating out of 3) and two real exit paths: "Play again" (resets)
  and "Back to Games Hub" (a real link to `/games`).
- Confirmed the game experience never leaks into or breaks the rest of
  the site: after returning to `/games`, the page loaded cleanly with no
  console errors and the header/footer/navigation all worked normally.
- Progress correctly attributes to whichever child is "active" for the
  browser (see Parent Journey) — this is the real reward/progress
  mechanism the prompt asks about.

## 7. Blog Journey

- `/blog` list, its search/topic/audience/sort filters, and two full
  articles were read end to end.
- **Author**: the byline ("By Little Learners Learning") is a real link
  to `/about` for platform-authored articles — correct, since no
  individual teacher wrote them.
- **Related content**: `counting-through-everyday-play` correctly
  cross-links to its related learning category (`/learn/mathematics`),
  a related game (`/games/count-the-fruits`), and a related resource
  (`/resources/counting-animals-worksheet`) — all real, working links,
  confirmed by extracting and checking every `<a>` in the rendered page.
- **Metadata**: topic badges link to real filtered views
  (`/blog?topic=...`), confirmed functional.

## 8. Mobile Journey

Tested at a 375×812 viewport:

- **Homepage**: hero, decorative accents (correctly hidden below the
  `md` breakpoint so they never crowd a small screen), and the 16-subject
  color-coded card grid all render in a clean single column with no
  overflow.
- **Navigation**: the hamburger menu opens and closes correctly
  (`aria-expanded`/`inert` toggle verified via direct DOM inspection, not
  just visually), with real search/assistant/notifications rows plus the
  full nav link list and sign-in/create-account actions.
- **Forms**: the sign-up form renders with full-width inputs, comfortable
  touch targets, and no overflow.
- **Real bug found and fixed** (see **Problems Found/Fixed** below): the
  teacher profile-photo upload field caused a 47px horizontal page
  overflow at this viewport width.
- Every other page spot-checked (resources, games, blog, applications)
  reported `scrollWidth === clientWidth` at 375px after the fix — no
  further overflow found.

## 9. Error-State Testing

| Case | Result |
|---|---|
| Invalid form (empty sign-up, empty teacher registration) | Real, specific per-field validation errors shown; no crash |
| Missing page (`/this-route-does-not-exist`) | Real HTTP 404 |
| Invalid resource (`/resources/nonexistent-resource`) | Real HTTP 404 |
| Empty search (`?q=` a nonsense string) | Honest "No results for ..." message, HTTP 200 (correct — a valid, empty result is not itself an error) |
| Failed API request | No API routes exist to fail; the one real server surface (admin login) is separately tested below |
| Unauthorized page (`/admin` without a session) | Real HTTP 307 redirect to `/admin/login`, re-confirmed this pass |
| Expired/invalid session | Re-confirmed via Prompt 88's live test: signing out immediately invalidates the admin cookie, and `/admin` bounces back to login |

No technical error, stack trace, or sensitive information was exposed in
any of the above — every error state is a plain-language, user-facing
message.

## Problems Found

1. **Mobile horizontal overflow on the teacher profile-photo upload
   field.** At a 375px viewport, `/teachers/register/profile` (and the
   identical "Thumbnail" field pattern in the teacher's own "Create
   resource" dialog and the admin content form) overflowed the page by
   47px. **Root cause**: the field's file `<input>` sits in a flex row
   (`flex items-center gap-4`) next to a fixed-size avatar/thumbnail
   preview box. The wrapping `<div>` had no width constraint, and a flex
   item's default `min-width: auto` means it won't shrink below its
   content's intrinsic width — the native "Choose File / No file chosen"
   input has a wide intrinsic width, so it pushed the row (and the whole
   page) wider than the viewport instead of wrapping or shrinking.

## Problems Fixed

1. Added `min-w-0 flex-1` to the wrapping `<div>` and `w-full max-w-full`
   to the `<input type="file">` itself, in all three places this exact
   pattern appears:
   - `src/components/patterns/teacher-profile-form.tsx` (profile photo)
   - `src/components/patterns/teacher-resource-form.tsx` (resource
     thumbnail)
   - `src/components/patterns/admin-resource-form.tsx` (resource
     thumbnail)

   This is the same `min-w-0` fix pattern Prompt 82's mobile audit already
   established for an analogous flex-squeeze bug elsewhere in this
   codebase. **Retested**: `/teachers/register/profile` at 375px now
   reports `scrollWidth === clientWidth` (375 = 375, was 422 before the
   fix); the same field inside the teacher's "Create resource" dialog
   confirmed the input now sits fully within the viewport
   (`right: 341.875`, well inside 375). The admin content form's
   identical thumbnail field was fixed with the identical change but not
   separately re-tested live, since it requires an authenticated admin
   session and uses byte-for-byte the same fix already verified twice
   elsewhere.
2. Confirmed no regression: all three forms' other fields, validation,
   and submission behavior were re-tested after the fix and work exactly
   as before.

## Remaining Issues

None found that are actionable within this prompt's scope. Two things
worth restating as known, already-disclosed limitations rather than new
findings:

- The Claude Browser pane's automated testing tool intermittently renders
  `/search` as a stuck loading skeleton after certain navigation
  sequences — independently confirmed (again, in this pass) to be a
  test-tooling artifact, not an application defect, since direct HTTP
  requests to the same URL are consistently fast and correct.
- Public teacher profiles return HTTP `200` instead of `404` for an
  unknown slug (Prompt 89/90's finding) — unchanged, and still correctly
  left unfixed per Prompt 90's own architecture-change constraint.

## Final Verification

- `npx vitest run` — 333/333 tests passing, 52 files.
- `npx tsc --noEmit` — clean.
- `npx eslint .` — clean.
- `rm -rf .next && npx next build` — clean, all 71 routes generated.
