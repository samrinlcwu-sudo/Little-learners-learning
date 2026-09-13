# Membership Architecture

Introduced in Prompt 62: preparing a scalable future membership system
"without forcing existing users into memberships" or creating fake
subscription plans, prices, or active memberships. No membership can be
created by any code path in this codebase today.

Read `docs/BUSINESS_ARCHITECTURE.md` (the `Offering` catalog concept) and
`docs/PAYMENT_ARCHITECTURE.md` (`Order`, `PaymentStatus`,
`hasValidEntitlement()`) first — this document is the layer above both.

## Where a `Membership` sits

```
Offering (type: "membership") → Order → Membership → Access
```

An `Offering` with `type: "membership"` (`src/lib/offerings/types.ts`,
Prompt 59) is the catalog listing — what a family would browse and
eventually buy. An `Order` (`src/lib/payments/types.ts`, Prompt 61) is the
one-time purchase record. A `Membership` (`src/lib/memberships/types.ts`,
this prompt) is what that purchase would actually grant: an *ongoing*
state with its own start/end dates and renewal, independent of the
purchase that started it — closer to a subscription's status than a
receipt.

No code path connects these three today. `getAllOfferings()` returns
`[]`, `getAllOrders()` returns `[]`, and `getAllMemberships()`
(`src/lib/memberships/memberships.ts`) returns `[]` too — for the same
reason as the other two: there is no checkout flow anywhere in this
codebase to create any of them.

## Membership types

Exactly the six the brief names, no more — `MembershipType`
(`src/lib/memberships/types.ts`):

| Type | What it's for |
|---|---|
| Free | What every visitor already has. No `Membership` row is ever created for this — free access is already the default `canAccessOffering()` grants. |
| Premium | Broader access to premium resources and games, for one learner. |
| Family Membership | One membership, meant to extend access to every child profile in a family — see "Parent & child" below. |
| Teacher Membership | A separate product for a teacher's own tools/resources — see "Teacher" below for why this is never assumed. |
| Resource Membership | Access scoped to one bundle of resources, narrower than "Premium." |
| Learning Program | Access tied to a specific structured program, once one exists. |

Only these six are modeled because they're the only ones "appropriate to
the actual business model" the brief describes — no membership type was
invented beyond what was asked for.

## Membership model

```ts
export interface Membership {
  id: string;
  accountId: string;      // references Account.id — the holder
  type: MembershipType;
  status: MembershipStatus; // "pending" | "active" | "expired" | "cancelled"
  startDate?: string;
  endDate?: string;
  autoRenew: boolean;
  renewsAt?: string;
  sourceOrderId?: string;      // references Order.id — the purchase that created it
  authorizedChildIds?: string[]; // "family" only — see "Parent & child"
  statusHistory: MembershipStatusEvent[];
  createdAt: string;
  updatedAt: string;
}
```

`UNREACHABLE_MEMBERSHIP_STATUSES` (`src/lib/memberships/types.ts`) equals
the full status list — the same "prepared, none reachable" position
`docs/PAYMENT_ARCHITECTURE.md` documents for `Order`. No fake active
membership was created to exercise this model; every test uses synthetic
fixtures (`makeMembership()` helpers in the `*.test.ts` files), never a
seeded "real" record.

### Why memberships are never stored in localStorage

Same reasoning as `Order` (`docs/PAYMENT_ARCHITECTURE.md`, "Why orders
are never stored in localStorage"): a client-writable membership would
let anyone grant themselves active premium access by editing browser
storage. No `local-memberships.ts` file exists anywhere in this codebase,
unlike every other local-first domain (`ChildProfile`, `TeacherProfile`,
`Application`).

## Access control

The full chain the brief asks for:

```
User → Verified Membership/Entitlement → Authorized Content
```

`src/lib/memberships/access.ts` implements the membership half of this
(the payment/order half is `hasValidEntitlement()`,
`docs/PAYMENT_ARCHITECTURE.md`):

- **`hasActiveMembership(accountId, memberships, type?)`** — true only for
  a genuinely active membership belonging to the account asking, optionally
  narrowed to one membership type. `memberships` must come from a trusted,
  server-verified source once one exists — never `localStorage`, never a
  client-supplied prop with no server check behind it. Every real caller
  today can only pass `[]` (`getAllMemberships()`), so this is `false` for
  every account, always — never a frontend-only check, per the brief's
  explicit instruction.
- **`hasAuthorizedChildAccess(child, memberships)`** — the parent-to-child
  half; see below.

Neither function is wired into any real UI gate yet (there's nothing to
gate — every resource and game accessible today is free). The eventual
real check for an offering composes all three layers built across
Prompts 60–62 without changing any of them:

```ts
canAccessOffering(offering) ||
  hasValidEntitlement(offering.id, orders) ||
  hasActiveMembership(accountId, memberships)
```

Public and free content is never touched by this: `canAccessOffering()`
(`src/lib/offerings/types.ts`) and `canDownload()`
(`src/lib/resources/types.ts`) were **not** modified by this prompt.

## Parent & child

A future family membership is meant to extend access to a parent's own
child profiles — never to anyone else's. This is enforced by
`hasAuthorizedChildAccess()`, not by convention:

```ts
export function hasAuthorizedChildAccess(child: ChildProfile, memberships: Membership[]): boolean {
  return memberships.some(
    (membership) =>
      membership.type === "family" &&
      membership.accountId === child.parentAccountId &&
      isMembershipActive(membership) &&
      (membership.authorizedChildIds?.includes(child.id) ?? false),
  );
}
```

Listing a child's id in `authorizedChildIds` is **necessary but not
sufficient** — the function also requires `membership.accountId ===
child.parentAccountId`. This is what makes "do not automatically grant
access to unrelated users" a real, tested guarantee rather than a policy
statement: even a corrupted or mishandled `authorizedChildIds` list can
never grant access to a child who doesn't actually belong to that
membership's own account. See
`src/lib/memberships/access.test.ts` for the specific case this guards
against (a membership on a different account that happens to list the
right child id).

No child information is exposed by any of this. `Membership` never holds
a child's name, age, or any other profile field — only an id, the same
opaque reference `Application.childId`
(`src/lib/admissions/types.ts`) already uses.

## Teacher

Teacher permissions (`docs/TEACHER_ARCHITECTURE.md`,
`docs/ADMIN_ARCHITECTURE.md`) and parent memberships are kept
structurally separate:

- `Membership.accountId` for a `"teacher"`-type membership would
  reference a teacher's own `Account.id` — never derived from or implied
  by their `TeacherProfile`.
- Nothing in this codebase treats "has a `TeacherProfile`" as "has
  premium access." A teacher who wants Teacher Membership would need
  their own real order and membership, exactly like a parent would — no
  code path shortcuts this.
- `TeacherModerationStatus` and `AccountStatus`
  (`src/lib/accounts/types.ts`) already gate what a teacher can do
  (public listing, account access at all); membership is a fourth,
  independent axis, not layered into either.

## Admin

`docs/ADMIN_ARCHITECTURE.md` covers real admin authentication and user
management (Prompts 56–58). This prompt doesn't add an admin membership
page, for the same reason Prompt 59 didn't add one for `Offering`: a CRUD
screen over an always-empty table would either sit permanently unused or
invite seeding fake data to make it look populated — neither is honest.

The natural future integration point is `/admin/users` (Prompt 57) and
its per-account detail views, which already show account-level state
(role, `AccountStatus`) without exposing anything unnecessary — a future
membership status badge belongs there, reading `hasActiveMembership()`
for that account, not a separate membership-management surface. No fake
membership data was created to preview what that would look like.

## Design

The one real public-facing addition: `/offerings`
(`src/app/offerings/page.tsx`) now includes a "Membership types we're
preparing for" section — cards for the five non-free `MembershipType`
values, each with its honest one-line description
(`MEMBERSHIP_TYPE_DESCRIPTIONS`) and a plain "Not available yet" badge.
Built from the same design system components already used across the
catalog (`Card`, `Badge`, the primary-tint icon treatment `OfferingCard`
already uses) — colorful and welcoming without becoming a storefront.

No aggressive sales language, and no fake urgency: no countdown, no
"X spots left," no discount percentage. Nothing on this page implies a
price, a sign-up flow, or a deadline, because none exists.

## SEO / AEO

`/offerings` is already indexed with real, accurate metadata (Prompt 60);
adding the membership-types section changes nothing about its
canonical URL, its structured data (still built only from real
`Offering[]` items — the membership-types preview is presentational, not
part of the `ItemList` structured data), or its indexability. Every
private, account-specific surface this prompt touches — the parent
dashboard's new membership card — lives on `/dashboard`, which already
carries `robots: { index: false, follow: false }` (unchanged, Prompt-1-era
convention). No new private route was added.

## What this prompt explicitly does NOT do

- Does not create a single real `Membership` — `getAllMemberships()`
  returns `[]`.
- Does not lock any existing free resource, game, or learning content.
- Does not force an existing user into anything — the dashboard's new
  membership card is read-only information, not a prompt to sign up.
- Does not invent a price, discount, or subscription term for any
  membership type.
- Does not connect a payment provider (unchanged from Prompt 61).
- Does not assume a teacher receives premium access from their
  `TeacherProfile` alone.
- Does not add an admin membership-management page.

## Testing

`src/lib/memberships/types.test.ts` — `isMembershipActive()` (status
gate, no-end-date, unexpired, expired) and `canCancelMembership()`.
`src/lib/memberships/access.test.ts` — `hasActiveMembership()` (empty
list, matching account, wrong account, inactive status, type filter) and
`hasAuthorizedChildAccess()` (empty list, correctly authorized, wrong
account despite matching child id, right account but child not listed,
non-family membership type, inactive membership). `src/lib/memberships/memberships.test.ts`
— `getAllMemberships()` returns `[]`. Ran typecheck, lint, the full
Vitest suite, and a production build; live-tested access separation
across public, free-user, parent, child, teacher, future-premium-user,
and admin surfaces (see the commit's test notes) — confirmed no existing
route or free-content path was locked or altered.
