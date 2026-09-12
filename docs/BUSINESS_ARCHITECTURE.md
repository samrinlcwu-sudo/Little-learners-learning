# Business & Offering Architecture

Introduced in Prompt 59: preparing Little Learners Learning for a
professional commercial model "without forcing payments or subscriptions
into the platform yet." Read `docs/RESOURCE_LIBRARY_ARCHITECTURE.md`
("Future business model") and `docs/ARCHITECTURE.md` (§18, "Future
payment architecture") first — this doc is the general business-layer
architecture; those two remain the resource-specific and
payments-infrastructure-specific pieces respectively, and this doc doesn't
duplicate either.

## What already existed before this prompt

Little Learners Learning already had one real, working piece of business
architecture: `AccessTier` (`"free" | "premium" | "membership"`,
`src/lib/resources/types.ts`) on every `Resource`, and `canDownload()` —
the single, deliberately conservative gate that only ever allows a
download for a published, free-tier resource with a real file attached.
The FAQ (`/faq`) already tells visitors plainly: *"everything available on
the site today is free... no payment system exists yet."* This prompt
doesn't replace any of that — it adds the catalog-level layer above it.

## `AccessTier` vs. `Offering` — two different layers, on purpose

- **`AccessTier`** (existing, unchanged) is a flag on one piece of content
  (a `Resource`, and now a `Game` — see below): "what tier does *this
  item* belong to."
- **`Offering`** (`src/lib/offerings/types.ts`, new) is a catalog-level
  concept: a thing Little Learners could market or sell — a bundle, a
  program, a membership plan — that may *reference* several resources by
  id (`includedResourceIds`) without duplicating their content. An
  `Offering`'s `accessLevel` field reuses the exact same `AccessTier`
  type (imported, never redeclared), so "free/premium/membership" means
  one thing everywhere in this codebase.

Both layers exist because they answer different questions: "is this one
worksheet free?" (`AccessTier`) vs. "is there a real bundle, program, or
membership a family could buy?" (`Offering`).

## The offering model

```ts
export const OFFERING_TYPES = [
  "free", "premium", "digital-product", "learning-program",
  "membership", "future-service",
] as const;

export interface Offering {
  id: string;
  slug: string;
  name: string;
  description: string;
  type: OfferingType;
  learningAreas: string[];        // LearningCategory slugs — never a second taxonomy
  ageRange?: AgeRange;             // reused from src/lib/content/types.ts
  includedResourceIds?: string[]; // real Resource ids — never duplicated content
  accessLevel: AccessTier;         // reused from src/lib/resources/types.ts
  availability: "available" | "coming-soon" | "unavailable";
  price?: OfferingPrice;           // undefined until real pricing exists
  status: "draft" | "published" | "archived"; // reused PublicationStatus
  createdAt: string;
  updatedAt: string;
}
```

Every relationship reuses something that already exists rather than
inventing a parallel system: learning areas are the same 16
`LearningCategory` slugs `/learn`, the Resource Library, admissions
("learning interests"), and teacher profiles ("subjects") already all
use; included resources point at real `Resource.id`s; `status` reuses
`PublicationStatus`. Nothing about this model duplicates content — an
`Offering` is a pointer and a wrapper, never a second copy.

## Why `getAllOfferings()` returns `[]`

`src/lib/offerings/offerings.ts` — there is no real commercial product,
bundle, program, or membership anywhere in this business today. Seeding a
`SAMPLE_OFFERINGS` array the way `SAMPLE_RESOURCES`/`SAMPLE_GAMES` exist
would mean fabricating products this business doesn't actually sell —
exactly what Prompt 59 forbids ("If actual commercial products do not
exist yet, create the architecture without fake products"). This is the
identical pattern `getApprovedTeacherDirectoryEntries()`
(`src/lib/accounts/teacher-directory.ts`) already established: an
honestly empty result is correct behavior, not an unfinished stub. The
moment a real offering exists (a real decision to sell a real worksheet
bundle, say), this becomes a real query — nothing calling it needs to
change, because it already returns `Offering[]`.

`filterOfferings()` (`src/lib/offerings/filters.ts`) and
`canAccessOffering()`/`isOfferingPubliclyVisible()`
(`src/lib/offerings/types.ts`) are real, unit-tested logic that already
works correctly against whatever the catalog eventually contains — tested
against synthetic fixtures the same way `filterTeacherDirectory.test.ts`
and `filterAdminTeachers.test.ts` already are, never against invented
"real" products.

## Extending tiering to games (a real gap, closed honestly)

Before this prompt, `AccessTier` existed only on `Resource` — `Game`
(`src/lib/games/types.ts`) had no tiering field at all, even though the
business model should apply consistently across content types. `Game`
now carries `accessTier: AccessTier` (imported from
`src/lib/resources/types.ts`, not redeclared), and every real game in
`SAMPLE_GAMES` is explicitly `"free"` — because every real game *is*
free today. No premium game was invented to give the field something to
show. A visible tier badge (the same treatment `ResourceCard` already
gives resources) is intentionally **not** added to the games UI yet:
every real game would show an identical green "Free" badge today, which
is honest but adds visual noise without new information — the same
badge component and styling can be wired in the moment a real non-free
game exists, exactly the way `ResourceCard`'s badge already works.

## User access — what's real today vs. prepared for later

| Who | Access today | What's prepared |
|---|---|---|
| **Public visitor** | Free resources/games, all `/learn` content, `/admissions` | `canAccessOffering()` already models "free, available" as the only accessible state |
| **Registered parent** | Same as public, plus their own children's profiles/progress (`docs/ACCOUNTS_ARCHITECTURE.md` — structural, one browser per family) | No offering-specific parent entitlement exists — nothing to prepare beyond what already exists |
| **Future purchaser/member** | **Nothing today** — no purchase flow, no entitlement record, no membership account state exists anywhere in this codebase | `Offering.accessLevel`/`price`/`availability` model exactly what a real purchase/membership system would check once built (see "Security" below) |
| **Teacher** | Their own resources, scoped by `author.teacherId` (`docs/TEACHER_ARCHITECTURE.md`) — structural, one browser per teacher | Teacher-authored resources are still hardcoded to `accessTier: "free"` (`local-teacher-resources.ts`) — a teacher pricing their own resource is a real future capability this prompt doesn't add, since no payment system exists to make it meaningful yet |
| **Admin** | Teacher/user account moderation (`docs/ADMIN_ARCHITECTURE.md`) | "Manage offerings" is the natural next admin section the moment a real offering exists — not built now, the same reasoning `/admin/teachers` and `/admin/users` were only built once real teacher/child data existed. Building an admin CRUD screen for an always-empty catalog would either sit permanently unused or invite seeding fake data to make it look populated; neither is honest |

**No payment access is implemented.** This table describes an intended
shape, not a working purchase flow — consistent with the brief's explicit
"Do not implement payment access yet."

## Free vs. premium, honestly

- No existing content was moved behind a paywall by this prompt — every
  resource and game that was accessible before this prompt remains
  exactly as accessible after it.
- No fake "Premium" badge was added anywhere new. The one real premium
  resource that already existed (`first-shapes-ebook`,
  `SAMPLE_RESOURCES`) is untouched; its existing honest "not available
  yet" messaging (`docs/RESOURCE_LIBRARY_ARCHITECTURE.md`) is unchanged.
- No price was added anywhere real pricing doesn't exist. `OfferingPrice`
  is a real, typed shape with zero live instances — `price` stays
  `undefined` on every code path in this codebase today.

## Security

`canAccessOffering()`'s own doc comment states this plainly: it is a
plain, pure, client-evaluable function today because there is nothing
server-side to check against (no accounts backend, no payment provider —
`src/lib/supabase/is-configured.ts`). **This must move server-side the
moment real entitlements exist** — a real purchase/membership check
belongs in a Server Component or Route Handler that verifies a real
database row before ever serving premium content or a download link,
exactly the migration path `canDownload()` already documents for
resources. No client-side "I purchased this" flag should ever be trusted,
now or later — the same rule this codebase already applies to
`isAdmin`-style checks (`docs/ADMIN_ARCHITECTURE.md`).

The planned payment integration point remains exactly what
`docs/ARCHITECTURE.md` §18 already names — Stripe Checkout/Billing, a
webhook Route Handler at `src/app/api/webhooks/stripe/route.ts` — this
prompt doesn't change that plan, only prepares the catalog model that
would sit in front of it.

## SEO / AEO (superseded by Prompt 60 below)

Prompt 59 shipped no public route, reasoning that a catalog page showing
nothing would be premature UI. Prompt 60 revisits that: the brief asked
explicitly for the public catalog experience, and an honest empty state
(see below) is not the same as premature UI. See "Prompt 60: the public
catalog UI" for what actually shipped.

## Design (superseded by Prompt 60 below)

Prompt 59 added no public-facing UI. Prompt 60 does — see below.

## Prompt 60: the public catalog UI

Prompt 59 deliberately deferred the public-facing catalog page. Prompt 60
builds it, without changing anything about the model, the empty-catalog
decision, or the security posture documented above — `getAllOfferings()`
still returns `[]`, `canAccessOffering()` is unchanged, and no price,
product, or program was invented to make the new page look populated.

### `/offerings` — the catalog page

`src/app/offerings/page.tsx`. Reuses the exact filter-form pattern
`/resources` and `/teachers` already use (`OfferingFilters`, real query
params, `filterOfferings()`), rendering real `Offering[]` results through
the new `OfferingCard` (`src/components/patterns/offering-card.tsx` —
same visual language as `ResourceCard`/`GameCard`: a real thumbnail when
one exists, a plain type icon otherwise, real badges only for fields that
are actually set, an action gated by `canAccessOffering()`).

Because the catalog is genuinely empty today, the page does two more
things rather than just show a blank list:

1. **An honest empty state** (`EmptyState`) — one message when no filters
   are active ("The catalog is just getting started"), a distinct message
   when filters are active and still match nothing ("No products match
   your filters"), each with an appropriate action. Never a generic "no
   results," and never a fake product to fill the space.
2. **A bridge into real content** — "Explore what's free today" reuses
   the existing `ResourceCard`/`GameCard` components against the existing
   `SAMPLE_RESOURCES`/`SAMPLE_GAMES` data (filtered to `accessTier ===
   "free"` and `featured`), linking out to the real `/resources` and
   `/games` pages. This is the "connect offerings with existing resources"
   requirement satisfied without copying a single resource's content into
   a second place — the same `Resource`/`Game` objects render through
   their own established cards.

`CapabilityList` (already used on `/parents`/`/teachers`) closes the page
with the same "Today / Ahead" honesty framing used everywhere else on the
site.

### `/offerings/[slug]` — the detail page

`src/app/offerings/[slug]/page.tsx`, following `/resources/[resource]`'s
established pattern exactly: `generateStaticParams()` over
`getAllOfferings()` (empty today, so no static paths are generated —
correct, not a bug), `generateMetadata()` returning `{}` when a slug
doesn't resolve, and `notFound()` otherwise. Since every slug fails to
resolve today, every `/offerings/*` URL correctly 404s — verified live.
The render path (title, description, learning benefits pulled from the
real `learningObjective` of each linked `includedResourceIds` resource —
never an invented benefit, age group, learning-area badges linking to
`/learn/[category]`, a facts `dl` for format/access/price, a real "what's
included" list linking to each `/resources/[slug]`, and a `canAccessOffering()`-gated
action area with an `Alert` explaining honestly why an inaccessible
offering can't be unlocked yet) is real, tested code — ready the moment a
real offering exists, exercising nothing invented in the meantime.

Structured data uses schema.org `Product`/`Offer` (chosen over `Course`
since `OfferingType` spans more than instructional programs), built only
from fields the page actually renders.

### Discoverability

`/offerings` was added to `footerNav` (`src/config/nav.ts`) under
"Explore" as "Catalog" — footer, not the primary header nav, matching
this session's established precedent of keeping the header uncluttered
while still making every real route reachable. `src/app/sitemap.ts` gained
a static `/offerings` entry plus a mapped entry per
`isOfferingPubliclyVisible()`-passing offering (empty today, same pattern
`SAMPLE_RESOURCES`/`SAMPLE_GAMES` already use there).

### What did not change

No resource, game, or ebook was duplicated into the offerings layer —
`includedResourceIds` are references, never copies. No existing route,
component, or piece of content changed behavior; `/resources`, `/games`,
`/learn`, and every existing page were regression-tested live and remain
exactly as they were.

## Testing

`src/lib/offerings/types.test.ts` — `isOfferingPubliclyVisible()` and
`canAccessOffering()` against synthetic fixtures covering draft/archived/
unavailable/coming-soon/every access level. `src/lib/offerings/filters.test.ts`
— `filterOfferings()` covering type/access-level/learning-area/query/
availability/age filters, combinations, and an empty catalog (extended in
Prompt 60 with availability and age-range cases). `src/lib/games/types.test.ts`
updated for the new required `accessTier` field. Confirmed via `grep` that
no other file in this codebase constructs a `Game` object literal that
needed updating. Ran typecheck, lint, the full Vitest suite (154 tests),
and a production build for both Prompt 59 and Prompt 60; for Prompt 60,
additionally live-tested in-browser: the catalog's filter form, both empty
states, the resource/game bridge cards linking correctly to
`/resources`/`/games`, a real `/offerings/[slug]` URL 404ing correctly,
mobile viewport rendering, and a full regression pass over `/resources`,
`/resources/[resource]`, `/games`, and `/learn` confirming no existing
route, component, or content changed.
