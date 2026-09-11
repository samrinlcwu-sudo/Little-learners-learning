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
  none exists yet, and a "Start an application" modal
  (`ApplicationForm`). Private, `robots: { index: false, follow: false }`.
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

Verified live: adding a child, starting a draft application, editing it,
submitting it (real reference number generated, timeline updates),
withdrawing it, and the honest empty states for zero children and zero
applications. Confirmed `/dashboard/applications` and its detail route
stay noindex while `/admissions` carries real canonical/social metadata.
Confirmed existing parent, child, and teacher journeys are unaffected.
