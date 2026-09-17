# Database, Upload & Privacy Protection (Prompt 87)

## Database audit

A full search for anything database-shaped (`find . -iname "*migration*"`,
`find . -iname "*.sql"`, `find . -iname "schema.prisma"`, `find . -iname
supabase -type d`) confirms what every prior audit in this arc has already
established and this prompt asked to be re-verified rather than assumed:
**there is no database anywhere in this project.** `src/lib/supabase/client.ts`
and `server.ts` exist but are dormant — zero imports anywhere in `src/app`
or `src/components` (re-confirmed this prompt). There is no schema, no
migration, no foreign key, no index, and no server-side query to audit for
injection or unsafe construction, because none of that exists yet.

What this project has instead is a **per-browser `localStorage` data
layer** (`src/lib/accounts/local-*.ts`, `src/lib/admissions/local-applications.ts`,
`src/lib/resources/local-teacher-resources.ts`, `src/lib/admin/audit-log.ts`)
standing in for that future database. This audit treats that layer as the
real subject of "database access," "data ownership," and "orphaned
records" below, since that's what actually exists to check.

### Relationships and ownership — checked, not just asserted

Every local store models its ownership relationship explicitly through an
id field, not through implicit trust:

- **Parent → child profile**: `ChildProfile.parentAccountId` — always
  `LOCAL_PARENT_ID` (`src/lib/accounts/local-children.ts`), the single
  canonical constant for "this browser's one parent."
- **Parent → application**: `Application.parentAccountId` — see "real fix"
  below; now imports the same canonical `LOCAL_PARENT_ID` instead of a
  second, independently-declared copy of the literal.
- **Teacher → teacher profile**: `src/lib/accounts/local-teacher.ts` uses
  its own `LOCAL_TEACHER_ACCOUNT_ID` (deliberately distinct from the parent
  id — a browser's local teacher and local parent are different roles).
- **Teacher → teacher resource**: `Resource.author.teacherId`, set once at
  creation (`addLocalTeacherResource`) and never reassignable by any update
  path.
- **User → order/entitlement**: `hasValidEntitlement(offeringId, orders)`
  and `hasActiveMembership(accountId, memberships)` both take the caller's
  real records as an explicit argument — re-verified (Prompt 86 already
  checked this) that `hasAuthorizedChildAccess()` specifically guards
  against a membership whose `authorizedChildIds` lists a child it
  shouldn't be able to reach, by also requiring
  `membership.accountId === child.parentAccountId`.
- **Admin → platform management**: the one real, server-verified boundary
  in the app — `src/proxy.ts` gates every `/admin/*` request against a
  signed session cookie, unchanged and re-confirmed this prompt.

### Real fix: a duplicated ownership constant

`src/lib/admissions/local-applications.ts` declared its own private
`const LOCAL_PARENT_ID = "local-browser-only"` — the exact same string
already exported as the canonical `LOCAL_PARENT_ID` from
`src/lib/accounts/local-children.ts` and used by three other files
(`admin-parent-detail.tsx`, `parent-dashboard.tsx`,
`src/lib/accounts/admin-user-rows.ts`). Two independently-typed string
literals that happen to match today have no mechanism keeping them in
sync — if the canonical value in `local-children.ts` ever changed, an
application's `parentAccountId` would silently stop matching "this
browser's one parent" everywhere else in the app, breaking exactly the
ownership link this prompt's "Data Ownership" section asks to keep clear.
This is the "duplicate data structures" finding the prompt's checklist
explicitly asks to look for. Fixed by having `local-applications.ts`
import the real constant instead of re-declaring it — no behavior change
today (the values were identical), just removing the latent drift risk.

### Orphaned records — checked, none possible today

A record becomes "orphaned" when it references another record's id after
that record is gone. Checked every deletion path that exists:

- `local-children.ts` has no delete function at all — only `addLocalChild`,
  `updateLocalChild`, and `setLocalChildAccountStatus` (deactivate, never
  remove). A child id referenced by an `Application.childId` or a
  membership's `authorizedChildIds` can therefore never dangle, because
  nothing can ever delete the child profile it points to.
- `local-teacher-resources.ts` does have `deleteLocalTeacherResource(id)`,
  but nothing else references a resource's own id by foreign key — the
  resource *is* the record, not a reference to one.
- `deleteDraftApplication` only ever removes a `draft`-status application
  (checked in the function itself), and nothing else references an
  application's id, so there's nothing left dangling either.

No unnecessary sensitive fields were found on any local record type:
`ChildProfile` carries only `id`, `parentAccountId`, `name`, `ageYears`,
`avatar`, an optional `favoriteCategory`, `createdAt`, and
`accountStatus` — no address, no date of birth (only a coarse age in
years), no photo, nothing beyond what the child-experience UI and the
admin suspension view actually use.

## File storage & upload audit

Every upload path in the app (`teacher-resource-form.tsx`,
`teacher-profile-form.tsx`, `admin-resource-form.tsx`) was re-read in full.
**There is still no server-side file storage anywhere** — an "uploaded"
file is read client-side with `FileReader.readAsDataURL()` and stored as a
base64 `data:` URI inside the same `localStorage` record it belongs to
(the resource, or the teacher profile). This has real, checkable
consequences for this section's checklist:

- **File types are validated**: `validateUploadedFile()`
  (`src/lib/utils/file-validation.ts`) checks the browser-reported MIME
  type against an allowlist prefix (`image/`, `application/pdf`) before
  anything is read into memory, and separately rejects `image/svg+xml`
  even though it matches the `image/` prefix (an SVG can carry a
  `<script>` — fixed in Prompt 84, re-confirmed unchanged here). No upload
  path anywhere accepts an executable, a script, or an unconstrained MIME
  type.
- **File size is limited**: every call site passes a real `maxBytes` cap
  (2MB for thumbnails/photos, 5MB for the admin PDF upload) and the check
  runs before the file is read.
- **Filenames are never used as a storage path, so there is no path to
  escape**: `file.name` is read exactly once, in `admin-resource-form.tsx`,
  purely to display a filename label back to the admin
  (`setDownloadFileName(file.name)`), rendered as ordinary JSX text
  (`{downloadFileName}`) — React escapes it automatically. It is never
  concatenated into a URL, a file path, or a `dangerouslySetInnerHTML`
  call anywhere. Added a test proving this structurally: a path-traversal-
  style name (`"../../../../etc/passwd.png"`) and a script-tag-style name
  (`"<script>alert(1)</script>.png"`) both pass or fail
  `validateUploadedFile()` purely based on their real MIME type and size —
  the name has no effect on the decision either way, because the function
  never reads it.
- **No arbitrary executable upload is possible**: the allowlist is a
  closed set (`image/*` minus SVG, or `application/pdf`), never a
  blocklist, so there's no executable MIME type or extension to
  accidentally miss.
- **"Private files require authorization"**: doesn't apply the way it
  would to a real file store — there is no private file storage bucket to
  authorize access to yet. What functions as "the private-file check"
  today is `canDownload()` (below), which decides whether a *link* to a
  file is ever rendered at all.

## Download security — re-verified, one real property newly tested

**Verify that protected resources cannot be downloaded merely by guessing
a URL.** `canDownload()` (`src/lib/resources/types.ts`) is the single real
gate: `isResourcePublished(resource) && resource.accessTier === "free" &&
Boolean(resource.downloadFile)`. A premium or membership-tier resource's
download link is never rendered by `/resources/[resource]/page.tsx` — the
page renders an `<Alert>` explaining premium access isn't available yet
instead of a working link, and because this is a Server Component, a
`downloadFile` value that isn't reachable through `canDownload()`'s branch
is simply never included in the rendered HTML at all — there is no hidden
link, no disabled-but-present anchor, and no client-side prop carrying the
file for a determined visitor to extract from the page source. A resource
stuck in `draft` or pending teacher review is unreachable by its slug at
all (`findPublishedResource()` calls `notFound()` for anything
`isResourcePublished()` rejects), so guessing a slug doesn't help either.
Added two tests to `src/lib/resources/types.test.ts` that were missing
before this prompt: a draft resource's `canDownload()` is `false` even
with a real file attached (the "unpublished download can't be reached by
URL" case), and a `membership`-tier resource is denied the same way
`premium` already was tested to be.

## Privacy — public-page audit

Checked every public-facing component that touches personal data for
accidental exposure:

- **Public teacher profile** (`/teachers/p/[slug]`,
  `teacher-public-profile-page.tsx`): no email, phone, or contact field
  anywhere in the rendered output — re-confirmed by direct text search of
  the component, not just recalled from a prior prompt. Its one
  `dangerouslySetInnerHTML` (the `Person` JSON-LD block) already goes
  through `toJsonLdHtml()` (Prompt 84's escaping fix).
- **Public teacher directory** (`teacher-directory-card.tsx`,
  `teacher-directory-structured-data.tsx`): no email/phone field present
  anywhere in either file.
- **Every component that does reference `.email`/`.phone`**
  (`admin-teacher-detail.tsx`, `admin-teacher-list.tsx`,
  `application-detail.tsx`, `teacher-register-form.tsx`,
  `teacher-verify-notice.tsx`) is either behind the admin proxy gate, is
  the parent's own application view, or is the registration form's own
  input field — none are public pages.
- **Applications have no "internal notes" field at all** — checked
  `src/lib/admissions/types.ts` directly; there is nothing modeled here
  that an admin could accidentally leave visible to the applicant, because
  the feature doesn't exist yet. Nothing to fix, but confirmed rather than
  assumed.
- **Child data**: `ChildProfile.name`/`ageYears` are the most identifying
  fields that exist, and neither ever reaches a public page, the sitemap,
  search, or a URL slug (child routes use an opaque `crypto.randomUUID()`
  id, and both `/dashboard/children/[childId]` and
  `/admin/users/children/[childId]` set `robots: { index: false, follow:
  false }`).

## Search privacy — re-verified

`src/lib/search/index.ts` (the global `Cmd+K`-style search) builds its
index once, at module load, purely from `STATIC_PAGES` and
`isPubliclyVisible`/`isResourcePublished`/`isGamePublished`/`isArticlePublished`-
filtered sample content — there is no code path by which a child profile,
an application, a parent account, or a teacher's private profile fields
could ever enter this index, because the index-building function
(`buildSearchIndex()`) never reads any of those local stores at all. The
full `/search` page (`src/app/search/page.tsx`) is built the same way,
filtering `SAMPLE_RESOURCES`/`SAMPLE_GAMES`/`SAMPLE_ARTICLES` through their
publication gates before any of the page's own filters run.

## SEO privacy — re-verified, with a new regression test

- `src/app/robots.ts` disallows `/admin` as defense in depth on top of
  `proxy.ts`'s real access control — unchanged.
- `src/app/sitemap.ts` was read in full: it lists only the homepage, a
  fixed set of public marketing pages, `primaryNav` links (all public —
  `/learn`, `/resources`, `/games`, `/blog`, `/parents`, `/teachers`,
  `/admissions`, `/about`), published learning categories, and
  publication-gate-filtered resources/games/offerings/articles. No
  `/admin`, `/dashboard`, `/account`, `/teachers/dashboard`, or
  `/teachers/register/*` path is ever included.
- **Real gap found and fixed**: there was no test enforcing this. The
  sitemap being privacy-correct today relied entirely on nobody adding a
  private route to it by mistake in the future. Added
  `src/app/sitemap.test.ts` (4 tests): every entry's URL sits on the
  site's own origin, no entry ever starts with a known private path
  prefix (`/admin`, `/dashboard`, `/account`, `/teachers/dashboard`,
  `/teachers/register`), the sitemap is non-empty and includes the
  homepage, and there are no duplicate URLs.
- Every private/dashboard page (`/dashboard`, `/dashboard/applications`,
  `/dashboard/children/[childId]`, `/dashboard/notifications`,
  `/account`, `/teachers/dashboard`, every `/admin/*` page) sets `robots:
  { index: false, follow: false }` — spot-checked across all of them via a
  repo-wide grep, unchanged from Prompt 78.
- Structured data (`toJsonLdHtml()`-escaped, Prompt 84) is only ever built
  from the same publication-gated public content the pages themselves
  render — no admin, parent, or child data feeds any JSON-LD block
  anywhere in the app.

## Backups

Checked whether any backup architecture exists: no database, no backup
script, no scheduled job, and no mention of "backup" anywhere in `docs/`.
There is nothing to back up yet — the entire data layer is per-browser
`localStorage`, which has no server-side representation to snapshot. No
third-party backup service was added; per this prompt's own instruction
not to introduce one before it's actually needed, this is documented as an
honest gap (the same pattern every other "not built yet" capability in
this codebase already follows) rather than implemented as a placeholder.

## New tests added

- `src/lib/utils/file-validation.test.ts` — 1 new test: a malicious
  (path-traversal or script-tag) filename has no effect on the
  accept/reject decision.
- `src/lib/resources/types.test.ts` — 2 new tests: `canDownload()` is
  `false` for a draft resource even with a file attached, and `false` for
  a `membership`-tier resource.
- `src/app/sitemap.test.ts` — new file, 4 tests: origin check, no private
  path prefixes, non-empty with the homepage present, no duplicate URLs.

(`adminLoginAction`/`adminLogoutAction` — the "API access,"
"unauthorized/authorized request" cases this prompt's TEST section also
asks for — were already covered by `src/lib/admin/actions.test.ts`, added
in Prompt 86 immediately prior to this one.)

## Not changed

No database was created or rebuilt — none exists, and none was needed for
this prompt's scope. No existing record, field, or store was removed;
`local-applications.ts`'s behavior is identical before and after its fix
(the constant's value didn't change, only where it's declared). No
third-party backup service was added. File upload size limits, type
allowlists, and the SVG rejection from Prompt 84 are untouched.
