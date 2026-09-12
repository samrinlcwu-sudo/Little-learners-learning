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

## SEO / AEO

No new public route was added by this prompt (there is no real offering
to give a page to yet — adding an `/offerings` catalog page that would
necessarily show nothing would be premature UI, not architecture). The
moment a real, published offering exists, its public page would follow
the exact same pattern `/resources/[slug]` and `/teachers/p/[slug]`
already establish: a real canonical URL, `Product`/`Course`-appropriate
structured data built from the same public fields the page renders (never
describing something the page doesn't show), and `robots: { index: true
}` only when `isOfferingPubliclyVisible()` says so. Nothing about
existing SEO — the Resource Library, the Learning Hub, the teacher
directory, `sitemap.ts`, `robots.ts` — was touched.

## Design

No public-facing UI was added by this prompt. When a real offering
catalog page is eventually built, it must reuse the existing design
system (`Card`, `Badge`, `Button`, the same warm/colorful/playful visual
language the Resource Library and Games Hub already use) — never a
generic e-commerce template. The brief's own words: *"Little Learners
should still feel primarily like an educational platform."*

## Testing

`src/lib/offerings/types.test.ts` — `isOfferingPubliclyVisible()` and
`canAccessOffering()` against synthetic fixtures covering draft/archived/
unavailable/coming-soon/every access level. `src/lib/offerings/filters.test.ts`
— `filterOfferings()` covering type/access-level/learning-area/query
filters, combinations, and an empty catalog. `src/lib/games/types.test.ts`
updated for the new required `accessTier` field. Confirmed via `grep` that
no other file in this codebase constructs a `Game` object literal that
needed updating. Ran typecheck, lint, the full Vitest suite, and a
production build; confirmed every existing route still resolves and no
existing resource, game, or teacher content changed visibility or
behavior.
