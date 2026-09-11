# Admissions & Application Architecture

Introduced in Prompt 51. Prepares a scalable application model and a real,
working (if backend-less) UI for a future Admissions system — not a
finished enrollment pipeline. Read `docs/ACCOUNTS_ARCHITECTURE.md` first;
this reuses that model rather than replacing any part of it.

## No invented programs

The brief is explicit: don't assume Little Learners Learning offers
specific admissions programs, tuition, dates, locations, or accreditation
unless the project already contains them. It doesn't. So instead of a
"Program" entity, an application records one or more real
learning-category slugs (`src/config/learning-categories.ts`) as
"learning interests" — the same 16 subjects every other part of the site
already uses. Nothing new was invented to fill the gap the brief warned
about; the public `/admissions` page says as much directly ("doesn't run
a formal enrollment process yet").

## No duplicate user system

An `Application` (`src/lib/admissions/types.ts`) belongs to this
browser's one local parent and references an existing `ChildProfile.id`
(`src/lib/accounts/types.ts`) — it never creates a new "applicant"
identity or a second child record. This mirrors exactly how teacher
resources reference `teacherId` rather than modeling a separate author
system (`docs/TEACHER_ARCHITECTURE.md`).

Prompt 52's "Applicant information" step does collect a name, email, and
optional phone number (`ApplicantInfo`) — but these are stored as content
*on the application itself*, not a new account or profile record. There's
nowhere else in this codebase to pull them from: sign-in/sign-up create
nothing real yet (`docs/ACCOUNTS_ARCHITECTURE.md`), so there is no
persistent parent profile to reuse. The three fields reuse
`nameSchema`/`emailSchema`/`phoneSchema` from
`src/lib/validations/common.ts`, written back in Prompt 51 for exactly
this ("future forms — contact, registration, admissions, teacher
applications").

## Storage

`src/lib/admissions/local-applications.ts` — same
`useSyncExternalStore`-backed localStorage pattern as every other
local-first store in this app (`local-children.ts`,
`local-teacher-resources.ts`). Storage key:
`little-learners-learning:applications`. A browser holds at most one
local parent, so "this browser's applications" already means "this
family's applications" — ownership by construction, not a runtime check.

## Application status: what's real vs. prepared

```ts
export const APPLICATION_STATUSES = [
  "draft", "submitted", "under-review", "info-requested",
  "accepted", "declined", "withdrawn",
] as const;
```

Only three of these seven are ever actually reachable by any code path in
this repository:

| Status | Who sets it | Reachable today? |
|---|---|---|
| `draft` | The family, on creating an application | Yes |
| `submitted` | The family, via "Submit application" | Yes |
| `withdrawn` | The family, via "Withdraw" | Yes |
| `under-review`, `info-requested`, `accepted`, `declined` | Would require a real human admissions reviewer | **No** — nothing in this codebase ever sets these |

`UNREACHABLE_APPLICATION_STATUSES` names the last four explicitly. This is
the identical rule `TeacherModerationStatus` already follows for teacher
profiles and `Resource.reviewStatus` follows for teacher-authored
resources: a status can exist in the type system and the UI can describe
what it means, without any code path being able to set it before a real
review process exists. The application detail page's status timeline
(`getApplicationTimeline`) renders each of those four as visibly locked
("Not available until a real review process is connected") rather than
omitting them — so a family can see the whole intended process without
ever being shown a fake advancement through it.

## The "Communication/Notification" relationship, honestly

The brief's relationship chain includes
`Application → ... → Communication/Notification`. No backend exists to
send an email, SMS, or push notification, so none was faked. Instead,
`Application.statusHistory` is a real, locally-recorded log of every
actual status change this family has made (draft created, submitted,
withdrawn) — a genuine timeline, not a substitute for real notifications.
The application detail page and `/admissions` both say plainly that
status updates (the real notification feature) are "coming later."

## UI

- **`/admissions`** (`src/app/admissions/page.tsx`) — public, indexable.
  Same `PageHeader` + `CapabilityList` "Today / Ahead" pattern as
  `/parents` and `/teachers`, so the honesty format is consistent
  site-wide. Links to `/dashboard/applications`.
- **`/dashboard/applications`** (`ApplicationsDashboard`) — this family's
  own application list, an empty state prompting a child profile first if
  none exists yet, and a "Start an application" link into the wizard.
  Private, `robots: { index: false, follow: false }`.
- **`/dashboard/applications/new`** (`ApplicationWizard`, Prompt 52) — the
  full multi-step application experience. See "The premium application
  wizard," below.
- **`/dashboard/applications/[applicationId]`** (`ApplicationDetail`) —
  one application's real status timeline, details, and the actions that
  actually apply to its current status (`canEditApplication`,
  `canSubmitApplication`, `canWithdrawApplication`). Private, noindex,
  same opaque-id-in-URL pattern as `/dashboard/children/[childId]` so the
  server-rendered metadata can never leak what's inside.
- A new "Applications" card in the Parent Dashboard's existing quick-links
  grid, and a new "Admissions" entry in `primaryNav`/`footerNav`
  (`src/config/nav.ts`) — `sitemap.ts` already maps every `primaryNav`
  entry automatically, so `/admissions` needed no separate sitemap edit.

## The premium application wizard (Prompt 52)

`src/components/patterns/application-wizard.tsx` replaced Prompt 51's
single-page modal form (`ApplicationForm`, now deleted — fully superseded,
not left behind as dead code) with a five-step flow: Applicant
information, Learner information, Learning interest, Additional
information, and Review & submit. The brief's example structure named six
steps including a standalone "Submit" step; here, submitting is the
action taken *from* the Review step rather than a further empty page —
there's no real content a seventh screen would add, and inventing one
just to match a step count would be padding, not a better experience.

**One form, five views.** A single `react-hook-form` instance (validated
by `applicationWizardSchema`, `src/lib/validations/application.ts`) backs
every step; advancing calls `trigger()` on only the current step's fields
(`APPLICATION_STEP_FIELDS`), so a family sees inline errors for what
they're looking at, never for a field three steps away.

**A draft exists from the first click.** The wizard calls
`createDraftApplication()` the moment it mounts with no `?id=`, then
`router.replace`s the URL to include the new id — so "Save & exit" (real,
available on every step) always has something concrete to persist, even
if a family closes the tab after typing only their name. `Application`'s
`applicant`, `childId`, and `learningInterests` are all optional for
exactly this reason: a draft can be genuinely partial.
`isApplicationComplete()` gates real submission, not saving.

**Review, then submit — never a fabricated wait.** The Review step reads
the live form values (`getValues()`) into four plain summary sections,
each with a real "Edit" link that jumps back to that step without losing
anything. Submitting calls `submit()` (which generates the real reference
number) and shows an in-page confirmation — reference number, and a
sentence stating plainly that nothing is reviewed automatically, with no
invented "we'll be in touch within X days" promise, per the brief's own
explicit warning against that.

**Validation today is client-side only, honestly.** There is no backend
(`src/lib/supabase/is-configured.ts`) and therefore no server to validate
against — the "validate on the server too" brief instruction can't yet be
implemented without inventing one. `applicationWizardSchema` is a plain
zod schema with no dependency on the browser, so the exact same schema
can run unchanged inside a future Route Handler once one exists; nothing
about this form's structure would need to change for that.

**Privacy is unchanged from Prompt 51:** a browser holds one family's
applications only, so there's no cross-family access to prevent at
runtime — it's already structurally impossible, the same guarantee every
other local-first store in this app relies on.

## Privacy

- `ApplicationsDashboard` and `ApplicationDetail` read `useChildProfiles()`
  and `useApplications()` — the same per-browser scoping every other
  parent-facing view already relies on. There is no cross-family data to
  leak by construction, the same guarantee documented for progress and
  teacher resources.
- Both dashboard routes are `robots: { index: false, follow: false }`.
  `/admissions` itself contains no personal data — it's a static
  description of the process — so it stays indexable.
- Nothing here is sent to the Prompt 46 AI assistant or any external
  service; the assistant's parent/teacher knowledge views are unrelated
  to this feature and were not modified.

## Testing

Verified live, end to end: opening the wizard fresh (a draft is created
and the URL updates), per-step validation blocking "Next" with real
inline errors, "Save & exit" persisting a genuinely partial draft and
showing it honestly in the list ("Not started yet"), resuming that draft,
jumping back via a Review-step "Edit" link without losing data, and
submitting (real reference number, honest confirmation screen, correct
detail-page timeline afterward). Confirmed the wizard, `/dashboard/applications`,
and the detail route stay noindex while `/admissions` carries real
canonical/social metadata. Confirmed existing parent, child, teacher, and
AI assistant journeys are unaffected, and mobile layout is comfortable
end to end.
