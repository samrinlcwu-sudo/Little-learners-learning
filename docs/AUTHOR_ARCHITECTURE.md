# Author & Content Credibility Architecture

Prompt 70. Read `docs/TEACHER_ARCHITECTURE.md` first — the real "author
profile" this system needs almost entirely already existed there. This
doc covers what Prompt 70 actually added: connecting content (resources,
blog articles) to that real profile honestly, fixing structured data that
was quietly wrong, and an extensible-but-unused reviewer field.

## The author profile already existed — this prompt connects to it

A `TeacherProfile` (`src/lib/accounts/types.ts`) already carries every
field the brief's "AUTHOR PROFILE SHOULD SUPPORT" list asks for: name,
`photo`, `bio`, `headline` (the brief's "role"), `education`,
`certifications`, `yearsExperience`, `expertise`, and — via
`TeacherPublicProfileContent`'s existing "Resources" section — published
resources. It already has a real, working public page
(`/teachers/p/[slug]`), gated by the teacher's own `visibility` choice and
by `canViewTeacherProfile()` (moderation/account-status checks). Building
a second, parallel "author profile" system would have duplicated all of
this. What was missing was the *connection* from a piece of content back
to that real profile — that connection is what this prompt builds.

## Resolving "does this author have a real page," honestly

`src/lib/accounts/author-profile-link.ts` — `resolveAuthorProfileHref()`
is the one place this is decided, and it's deliberately conservative:

- A platform-authored piece (`author.role === "platform"`) always
  resolves to `/about` — the organization's own real page. Little
  Learners Learning is not a person, so it never gets a fabricated
  "author" bio.
- A teacher-authored piece only resolves to a link when the *browser
  actually holds that same teacher's own profile* (there is at most one
  local teacher profile per browser — see `local-teacher.ts`) **and**
  `canViewTeacherProfile()` says it's genuinely public. A different or
  unknown `teacherId`, or a private/rejected/deactivated profile, all
  correctly resolve to *no link* — plain text, never a broken, wrong, or
  unauthorized one. This is the same "this browser can only ever know
  about its own one teacher" limitation already disclosed everywhere else
  in the account system (docs/TEACHER_ARCHITECTURE.md), applied here to a
  new problem instead of being worked around.

`useAuthorProfileHref()` (`use-author-profile-link.ts`) is a thin reactive
wrapper, and `<AuthorLink author={...} />`
(`src/components/patterns/author-link.tsx`) is the one small client
component every author byline now renders through — a real link when one
exists, plain text otherwise. It's used in `ResourceCard`, the resource
detail page's "Creator" field, and the blog article detail page's byline,
so a name is never linked two different ways in two different places.

## Reviewer: an extensible field, deliberately never populated

`BlogArticle.reviewer?: ContentAuthor` (Prompt 70) exists so a genuine
future reviewer role can be recorded without a schema change — but it is
**unset everywhere in this codebase today**, on purpose. There is no named
human reviewer identity anywhere to honestly attach: admin authentication
is a single shared passphrase with no per-admin identity
(`docs/ADMIN_ARCHITECTURE.md` — "a single shared admin passphrase
authenticates 'the admin,' not a specific admin identity"). The brief is
explicit: "only implement reviewer functionality if the architecture
supports genuine human review." It doesn't yet, for a *named* reviewer —
so every UI that reads `article.reviewer` (the blog article byline) only
ever renders the "Reviewed by ..." line when it's actually present, which
today means it never renders. This is the same pattern `Resource.reviewer`-style
fields have followed elsewhere in this codebase (e.g. `verified` on a
teacher, `reviewStatus` on a resource before Prompt 56's admin tool
existed): the field is real and ready, the data is honestly absent until
a real process can fill it in.

(`Resource` does not get a `reviewer` field — the brief's "each article
should be able to reference... an optional reviewer" is scoped to
articles specifically, and resources already have their own real
moderation concept, `reviewStatus`, for teacher-authored ones.)

## Structured data: Person vs. Organization, and a real Person schema for teachers

Before this prompt, every resource and blog article's structured data
emitted `author: { "@type": "Organization", name: ... } ` unconditionally
— quietly wrong the moment a teacher-authored piece exists, since a
person isn't an organization. `src/lib/seo/author-schema.ts` fixes this:
`buildAuthorSchema(author)` returns `Person` for a teacher, `Organization`
for the platform, with no fabricated fields either way (no invented `url`
for a `Person` — see below for why).

Separately, `buildTeacherPersonSchema()` gives the teacher's own public
profile page (`/teachers/p/[slug]`) a *real*, full `Person` schema for the
first time — name, url, a description from their own headline/bio, and
`knowsAbout` built from their own real subjects and expertise (never a
fabricated specialty). Two things are deliberately excluded:

- **`image`**: a teacher's photo is stored as a base64 data URL
  (`docs/TEACHER_ARCHITECTURE.md`). Inlining that into a JSON-LD block
  would duplicate the photo's full byte size a second time on the page —
  a real performance cost for no real benefit, since the visible `<img>`
  tag (with real `alt` text) already serves the same purpose for both
  users and accessibility tooling.
- **`alumniOf` / `hasCredential`**: `education` and `certifications` are
  free-text fields a teacher typed themselves in whatever form they chose
  — not necessarily a clean institution/credential name schema.org's
  structured properties expect. Forcing free text into a structured shape
  it doesn't cleanly fit would be less honest than leaving it as plain,
  readable page content, which it already is.

This schema is rendered from `TeacherPublicProfilePage` (the real route
wrapper), not from `TeacherPublicProfileContent` (which is also reused by
the profile editor's "Preview" modal) — a preview must never emit the
same structured-data script tag a live page does, since it isn't one.

## Privacy

`PublicTeacherProfile` (`src/lib/accounts/teacher-public-profile.ts`,
unchanged by this prompt) already excludes email, `accountId`,
moderation/account-status, and every other private field from anything
public-facing — confirmed still true: no component this prompt touched
renders `.email`, `.accountId`, or a raw `teacherId`. `AuthorLink` only
ever renders `author.name`, never the underlying `teacherId`.

## Accessibility

No new heading levels were introduced; `AuthorLink` renders a real
`<a>` (via `next/link`), fully keyboard-operable, and is visually
distinguished by underline rather than color alone. The teacher photo's
`alt={profile.name}` (pre-existing) is unchanged. Verified via
`eslint` (which includes `eslint-plugin-jsx-a11y`'s recommended rule set)
with zero new warnings.

## Testing

`author-profile-link.test.ts` (7 cases): platform always links to
`/about`; a teacher links to their real profile only when this browser
holds the matching, viewable profile; every failure mode (no profile, a
different teacher, private/rejected/hidden/deactivated) correctly
resolves to no link. `author-schema.test.ts` (5 cases): `Person` vs.
`Organization` selection, and `buildTeacherPersonSchema` including only
real provided fields and never a fabricated `image`.

Live-verified: registered a real teacher ("Amina Yusuf"), set their
profile public, added a headline and a subject, and confirmed their real
public profile page now emits a correct `Person` JSON-LD block (name,
url, description from headline, `knowsAbout: ["Mathematics"]`) with no
`image`/`alumniOf` fields. Confirmed a platform-authored resource's
"Creator" field and a blog article's byline both render "Little Learners
Learning" as a real link to `/about`, and that the corresponding
structured data now correctly asserts `Organization` for that author (not
a fabricated `Person`). Ran typecheck, lint, the full Vitest suite, and a
production build — all clean.
