# Privacy Policy Implementation

How the real Privacy Policy at `/privacy` (`src/app/privacy/page.tsx`)
was built — a direct, source-by-source inspection of what this
codebase actually collects, stores, and connects to, done before a
single sentence of the policy was written. Every claim in the policy
traces back to something verified here, not assumed from an earlier
prompt's summary.

## Decision: `/privacy`, not a new `/privacy-policy` route

The prompt that requested this work named `/privacy-policy` as the
target path. This codebase already has a real, linked, previously-
`noindex`ed "Privacy Policy" page at `/privacy`
(`src/config/nav.ts`'s footer link, `src/app/sitemap.ts`'s exclusion
list, and every prior audit's references all point at `/privacy`).
Creating a second page at a different URL would have duplicated an
existing feature and split the site's one real privacy page into two —
directly against this prompt's own "do not create new features" and
"preserve all existing work" instructions. The existing `/privacy`
page was updated in place instead; its route, canonical URL, and
footer link are unchanged.

## What the current platform actually collects, and where

Verified by reading the relevant source file directly, not by
description:

| Data | Where it's entered | Where it's stored | Fields |
|---|---|---|---|
| Child profile | Parent dashboard "Add a child" form | Browser `localStorage`, key `little-learners-learning:child-profiles` (`src/lib/accounts/local-children.ts`) | `name`, `ageYears`, `avatar`, optional `favoriteCategory` — never a photo or contact detail |
| Teacher profile | Teacher registration + profile forms | Browser `localStorage`, key `little-learners-learning:teacher-profile` (`src/lib/accounts/local-teacher.ts`) | `name`, `email`, `countryRegion`, optional `photo` (a data URL), `headline`, `bio`, `education`, `certifications`, `yearsExperience`, `ageGroupsTaught`, `subjects`, `languages`, `teachingInterests`, `expertise`, `visibility`, `moderationStatus` |
| Application | Admissions wizard (`/dashboard/applications/new`) | Browser `localStorage`, key `little-learners-learning:applications` (`src/lib/admissions/local-applications.ts`) | `applicant.name`, `applicant.email`, `applicant.phone` (optional), `childId` (a reference, not a copy), `learningInterests`, optional `message`, `referenceNumber`, `status`, `statusHistory` |
| Learning activity / progress | Automatic, when a child's profile is active and a game/resource/category page is visited | Browser `localStorage`, key `little-learners-learning:progress-events` (`src/lib/progress/local-progress.ts`) | `childId`, event `type`, optional `topic`, `activityLabel`, `activityHref`, optional `score` — never fabricated, only real recorded outcomes |
| Notifications | Generated automatically from real events (e.g. an application's own status) | Browser `localStorage`, key `little-learners-learning:notifications` (`src/lib/notifications/local-notifications.ts`) | References an existing record (`NotificationRelatedEntity`), never a duplicate copy of personal data |
| Admin audit log | Real admin actions in `/admin` | Browser `localStorage` (the admin's own browser), key `little-learners-learning:admin-audit-log`, capped at 200 entries (`src/lib/admin/audit-log.ts`) | `action`, `targetType`, optional `targetId`, `details`, timestamp |
| Uploaded files (teacher photo, teacher/admin resource files) | Respective upload forms | Read client-side via `FileReader.readAsDataURL()` and stored as a data URL inside the relevant `localStorage` record above — never uploaded to a server (`teacher-profile-form.tsx`, `teacher-resource-form.tsx`, `admin-resource-form.tsx`) | The file's contents, base64-encoded, plus filename/type |
| Admin session | `/admin/login` | An HTTP-only cookie (`llad_session`, `src/lib/admin/session.ts`) — the one real, server-verified credential in this codebase | A signed `{ exp }` payload only; carries no identity, no personal data |
| A message sent to the site's email address | The footer's real `mailto:` link | Not received or stored by this application at all — it goes through the visitor's own email client and provider | Whatever the sender chooses to write |

**Nothing above is transmitted to a server this project operates.**
Every one of these except the admin session cookie lives entirely in
`localStorage`, meaning it never leaves the visitor's own browser and
is not retrievable by anyone else, including the platform's own
operators, from anywhere but that same browser/device.

## Forms that collect information but currently discard or never
transmit it

- The generic parent sign-up/sign-in forms (`/sign-up`, `/sign-in`)
  collect a name, email, and password via real Zod validation
  (`src/lib/validations/auth.ts`), but submitting them does nothing
  beyond validation — no request is sent, nothing is stored, because
  `isSupabaseConfigured` is false. Every one of these forms displays an
  explicit notice saying so before the visitor submits anything.
- The teacher registration password is validated for format and then
  discarded in the same function that handles the real, local save of
  name/email/country (`teacher-register-form.tsx`'s own comment: "never
  the password ... it never reaches localStorage or any variable
  outside this function").
- The `/support` page's contact form is rendered but its submit button
  is `disabled`, with its own on-page notice: "nothing you type here is
  saved or sent anywhere." No data is collected from it today.

## What the "Ask about learning" assistant does with data

Checked directly for network calls (`grep -rn "fetch(" src`) — none
exist anywhere in `src/lib/ai/` or the assistant's UI components. The
assistant (`src/components/patterns/ai-assistant-panel.tsx`) builds its
answers entirely client-side from locally available data (a child's
own recorded progress, a teacher's own resources, and the site's own
public content config) and never sends a conversation, a question, or
any of that underlying data to an external AI service or to us. Its
own disclosure text (`AI_DISCLOSURE_TEXT`,
`src/lib/ai/guardrails.ts`) already states it doesn't save the
conversation and will never ask for personal information.

## Third-party services actually detected

A direct check of `package.json`, `next.config.ts`, and every
`process.env` read in `src/` found:

- **None currently connected or sending data.** No analytics SDK, no
  payment SDK, and no active database/auth connection exists in the
  running application.
- **Supabase** (`src/lib/supabase/client.ts`, `server.ts`): present in
  the codebase as unconfigured scaffolding.
  `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` are
  unset everywhere, and `isSupabaseConfigured` gates every real call
  site to a no-op. Not mentioned by name as "in use" in the policy,
  because it isn't — the policy instead says a backend connection
  "exists in scaffold form only" and commits to updating this section
  once (if) that changes.
- **The analytics scaffold** (`src/lib/analytics/`, added Prompt 105):
  present, wired to real UI call sites, but a genuine no-op —
  `isAnalyticsConfigured()` requires `NEXT_PUBLIC_ANALYTICS_ID`, which
  is unset. No analytics vendor is named in the policy because none is
  actually running.
- **Payments**: `src/lib/payments/is-configured.ts` exists;
  `PAYMENT_PROVIDER_ID` / `PAYMENT_PROVIDER_SECRET_KEY` are unset. No
  payment feature exists anywhere in the UI. Not mentioned in the
  policy as a current practice.
- **Fonts**: `next/font/google` (Fraunces, Inter) — verified this is
  Next.js's own build-time font self-hosting mechanism, not a runtime
  request to Google's font CDN. The policy describes this accurately
  rather than either ignoring it or overstating it as a third-party
  data flow.
- **Hosting**: no hosting platform is connected yet
  (`docs/FINAL_DEPLOYMENT_GUIDE.md`), so no hosting-specific data
  practice (e.g. a specific host's own log retention) could be
  described accurately — the policy speaks only generally about
  standard web server logging, which is true of any host.

## Cookies — the full, real inventory

A repo-wide search for `cookies()`/`cookieStore.set` found exactly two
call sites:

1. `src/lib/admin/actions.ts` — sets the real `llad_session` cookie
   only when someone successfully signs in at `/admin/login`.
   `httpOnly`, `sameSite: "lax"`, `secure` in production. This is the
   only cookie an ordinary visitor's session ever involves, and only if
   they never touch `/admin`.
2. `src/lib/supabase/server.ts` — cookie-handling code that is part of
   the unused Supabase server client; it never executes because
   nothing calls this client (Supabase is unconfigured).

No analytics cookie, no advertising cookie, and no cross-site tracking
cookie exists anywhere in this codebase. The policy states this
plainly rather than listing a generic cookie table with categories
that don't apply here.

## Children's privacy — specific implementation notes

- `ChildProfile` (`src/lib/accounts/types.ts`) is deliberately narrow:
  `id`, `parentAccountId`, `name`, `ageYears`, `avatar`,
  `favoriteCategory?`, `createdAt`, `accountStatus`. No field for a
  photo, address, school, or any other identifier exists on this type
  at all — it isn't just unused, it isn't part of the data model.
  `favoriteCategory` was checked and is not required to be truthful,
  but it's used only to bias what's suggested first.
- Progress events (`ProgressEvent`) reference a `childId` and record
  real activity only when a child profile is the "active" one in that
  browser — verified in `TrackPageView`
  (`src/components/patterns/track-page-view.tsx`): "If no child is
  active, recording is a no-op, so a parent browsing on their own never
  generates fake activity for a child who wasn't actually using the
  site."
- No page anywhere in `src/app` publicly lists or displays a child's
  name, profile, or activity — confirmed by checking every route under
  `/dashboard` for `robots: { index: false, follow: false }` (all of
  them have it) and confirming none of these routes appear in
  `sitemap.ts`.
- No form on this site asks a child to enter their own information —
  every child-related form (add/edit a child profile) is part of the
  parent dashboard, filled in by whoever is using that dashboard.

This documentation deliberately avoids using "COPPA-compliant,"
"GDPR-compliant," or any similar label — those are legal
determinations, not something this project can accurately claim
without an actual legal review, and the prompt that requested this
work explicitly said not to make that claim.

## Items requiring future legal review

Recorded here plainly, per this prompt's own instruction not to claim
a legal review has occurred:

1. The policy as a whole has not been reviewed by a lawyer. It
   describes real, current technical behavior, not a vetted legal
   position.
2. Jurisdiction-specific requirements (e.g. what a specific country or
   state requires for a children's product, or for handling an email
   address collected via an application form) have not been evaluated.
3. If this platform ever operates in a jurisdiction with a specific
   children's-data law (COPPA in the US, GDPR-K provisions in the EU,
   or similar), a qualified legal review is the correct way to
   determine what's actually required — this document does not attempt
   that determination.
4. The "Your Rights and Choices" section describes only what's
   genuinely available today (self-service via browser storage, plus a
   manual email request). If a jurisdiction requires a specific formal
   process (e.g. a verifiable parental consent mechanism, or a
   statutory response deadline), that would need to be designed and
   built — it is not implemented today, and the policy does not claim
   otherwise.

## Items that will need updating when new services are connected

Each of these was written into the policy as a stated commitment to
update, not a guess about what will happen:

1. **A real backend (e.g. Supabase) is connected**: "Account and
   Application Information," "Third-Party Services," "How We Protect
   Information," and "When Information May Be Shared" all need a real
   rewrite — the entire "it stays on your device" framing that
   currently applies to most of this policy stops being true the
   moment real user data starts living on a server.
2. **An analytics provider is connected**: "Information Collected
   Automatically," "Third-Party Services," and "Cookies and Similar
   Technologies" need the specific provider named, along with an
   accurate description of what it collects (per
   `docs/SEARCH_MONITORING_PLAN.md`'s existing privacy constraints on
   that system).
3. **A payment processor is connected**: an entirely new section
   describing payment data handling would be needed — today's policy
   correctly states none exists.
4. **A real domain and hosting platform are chosen**: "Information
   Collected Automatically" currently speaks generically about
   standard web server logging; once a specific host is chosen, that
   host's own log retention and access practices could be named
   specifically if relevant.
5. **Teacher email verification or parent login become real**: several
   "this isn't connected yet" statements throughout the policy will
   need to flip to describing the real flow once it exists.

## Testing performed

- Read the live page at `/privacy` end to end (`get_page_text`) and
  confirmed every section renders with the correct heading order and
  content.
- Verified visually via screenshot: consistent with the site's design
  system (same header/footer, same heading scale, same `Alert`
  component used elsewhere on the site for the "About this policy"
  note).
- Checked mobile at 375px width via `scrollWidth`/`clientWidth`: no
  horizontal overflow.
- Clicked the existing footer "Privacy Policy" link from the homepage
  and confirmed it lands on the updated page — this link already
  existed (`src/config/nav.ts`) and required no change.
- Confirmed the page is reachable by direct URL
  (`http://localhost:3000/privacy`).
- `npx vitest run` — 341/341 tests passing, 55 files (unchanged — no
  test needed updating for a content-only page).
- `npx tsc --noEmit` — clean.
- `npx eslint .` — clean.
- `rm -rf .next && npx next build` — clean production build (see this
  document's companion commit for the exact route count).
