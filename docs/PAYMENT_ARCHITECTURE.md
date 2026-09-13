# Payment Architecture

Introduced in Prompt 61: preparing Little Learners Learning to eventually
support secure payments **without implementing live payment processing**.
No payment gateway is connected. No card information is collected or
requested anywhere. No environment variable in this codebase holds a real
secret. This document describes an architecture, not a feature.

Read `docs/BUSINESS_ARCHITECTURE.md` first — that document establishes
`Offering`, the catalog-level concept this payment layer sits behind — and
`docs/ARCHITECTURE.md` §18 ("Future payment architecture"), which this
document supersedes with real detail.

## The intended flow

```
Product (Offering) → Checkout → Payment → Order → Access → Receipt
```

- **Product** — an `Offering` (`src/lib/offerings/types.ts`, Prompt 59/60).
  Unchanged by this prompt.
- **Checkout** — a short-lived `CheckoutSession`
  (`src/lib/payments/types.ts`) a real provider would create per payment
  attempt. No route, form, or button creates one anywhere in this
  codebase.
- **Payment** — handled entirely by a real provider once one exists, via
  `PaymentProviderAdapter` (below). This platform never sees or stores raw
  card details at any point in this flow.
- **Order** — this platform's own permanent record (`Order`,
  `src/lib/payments/types.ts`) of what was bought, for how much, and its
  current `status`/`paymentStatus`.
- **Access** — `hasValidEntitlement()` (`src/lib/payments/entitlements.ts`)
  — the one function a real access check calls, built only from a
  genuinely completed, genuinely paid `Order`. For a `membership`-type
  offering specifically, an `Order` is also what would establish an
  ongoing `Membership` (`src/lib/memberships/types.ts`, Prompt 62) —
  `hasActiveMembership()` is the membership-scoped counterpart to
  `hasValidEntitlement()`; see `docs/MEMBERSHIP_ARCHITECTURE.md`.
- **Receipt** — not modeled in this prompt. A receipt is a presentation of
  a real completed `Order`; since no code path can create one yet, there
  is nothing honest to render. The `Order` fields already captured
  (`amountMinorUnits`, `currency`, `reference`, `createdAt`) are exactly
  what a receipt view would read from once a real order exists — no
  additional model is needed to add one later.

## Payment abstraction

The platform is never coupled to one payment provider. Five concerns are
kept structurally separate, each in its own type or function:

| Concern | Where | Notes |
|---|---|---|
| Product/catalog | `src/lib/offerings/` | Unchanged — Prompt 59/60. |
| Checkout | `CheckoutSession` (`src/lib/payments/types.ts`) | Ephemeral, provider-side; not `Order`. |
| Payment provider | `PaymentProviderAdapter` (`src/lib/payments/types.ts`) | The seam a real Stripe/PayPal/JazzCash/Easypaisa integration would implement. |
| Payment status | `PaymentStatus` (`src/lib/payments/types.ts`) | Pending / Paid / Failed / Cancelled / Refunded — exactly these five. |
| Order | `Order`, `OrderStatus` (`src/lib/payments/types.ts`) | This platform's own record; distinct lifecycle from `PaymentStatus`. |
| Entitlement/access | `hasValidEntitlement()` (`src/lib/payments/entitlements.ts`) | The only function that should ever gate premium access. |

`PaymentProviderAdapter` is intentionally minimal and provider-agnostic:

```ts
export interface PaymentProviderAdapter {
  readonly id: PaymentProviderId; // a plain string — never a fixed union naming one provider
  createCheckoutSession(params: {
    orderReference: string;
    amountMinorUnits: number;
    currency: string;
  }): Promise<{ redirectUrl: string; providerReference: string }>;
  verifyWebhookSignature(rawBody: string, signature: string, secret: string): boolean;
}
```

No class implements this interface anywhere in this codebase. A real
integration (Stripe Checkout, PayPal, JazzCash, Easypaisa, or anything
else) would implement it once actually instructed; nothing else in the
commerce flow — `Order`, `PaymentStatus`, `hasValidEntitlement()` — would
need to change when it does.

## Order model

```ts
export interface Order {
  id: string;
  reference: string;        // e.g. "LLO-A1B2C3" — see generateOrderReference()
  accountId: string;        // references Account.id (src/lib/accounts/types.ts)
  offeringId: string;       // references Offering.id (src/lib/offerings/types.ts)
  amountMinorUnits: number; // integer cents — never a floating-point decimal
  currency: string;         // ISO 4217, e.g. "USD"
  status: OrderStatus;          // "pending" | "completed" | "cancelled"
  paymentStatus: PaymentStatus; // "pending" | "paid" | "failed" | "cancelled" | "refunded"
  providerId?: PaymentProviderId;
  providerReference?: string;   // the provider's own transaction id — opaque, never parsed
  statusHistory: OrderStatusEvent[];
  createdAt: string;
  updatedAt: string;
}
```

`amountMinorUnits` is deliberately integer minor units (cents), not the
decimal `OfferingPrice.amount` an offering displays in the catalog — real
money can't tolerate floating-point rounding drift, and every real
payment provider's API operates in minor units. Converting a catalog
price to `amountMinorUnits` at order-creation time is a real provider
integration's job, not something this prompt needs to implement since no
order-creation path exists.

### Why no order can exist today

`getAllOrders()` (`src/lib/payments/orders.ts`) returns `[]` — not
because no order was seeded, but because **no checkout flow anywhere in
this codebase can create an Order**. This is stronger than the
"prepared, not yet reachable" pattern `ApplicationStatus` already uses
(`docs/ADMISSIONS_ARCHITECTURE.md`): an application can at least reach
`draft`/`submitted`/`withdrawn` today. An order cannot reach any status
at all, because there is no button, form, or route that starts a
checkout. `UNREACHABLE_ORDER_STATUSES` and `UNREACHABLE_PAYMENT_STATUSES`
(`src/lib/payments/types.ts`) both equal their full status list for
exactly this reason.

### Why orders are never stored in localStorage

Every other local-first domain in this app (`ChildProfile`,
`TeacherProfile`, `Application`, teacher-authored `Resource`s) is
deliberately stored in the browser's own `localStorage`, because there is
no backend and nothing about those records grants access to anything a
user couldn't already see. An `Order` is different: its whole purpose is
to prove money changed hands. A client-writable order record would let
anyone open dev tools and set `paymentStatus: "paid"` on a fabricated
order, then use it to unlock premium content — exactly what "ACCESS
CONTROL" (below) forbids. So, on purpose, **no `local-orders.ts` file
exists anywhere in this codebase**, and `getAllOrders()` has no
localStorage-backed counterpart the way `getLocalApplicationsSnapshot()`
does for applications.

### The planned real schema (not applied — no Supabase project exists)

`docs/ARCHITECTURE.md` §3 already establishes Postgres via Supabase as
the intended database, with "no project ... provisioned yet." The
following is the real schema an `orders` table would use the day a
project exists. It is documented here, not applied anywhere — there is no
`supabase/` directory, no migration runner, and no live database in this
repository.

```sql
create type order_status as enum ('pending', 'completed', 'cancelled');
create type payment_status as enum ('pending', 'paid', 'failed', 'cancelled', 'refunded');

create table orders (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  account_id uuid not null references auth.users (id),
  offering_id text not null,
  amount_minor_units integer not null check (amount_minor_units >= 0),
  currency text not null,
  status order_status not null default 'pending',
  payment_status payment_status not null default 'pending',
  provider_id text,
  provider_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Every real transition is appended, never overwritten in place —
-- the same append-only audit trail Application.statusHistory already
-- keeps client-side; here it is server-side and tamper-evident.
create table order_status_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id),
  status order_status not null,
  payment_status payment_status not null,
  occurred_at timestamptz not null default now()
);

-- A raw provider webhook event, kept for audit purposes even after being
-- processed — never trusted until its signature is verified
-- (PaymentProviderAdapter.verifyWebhookSignature), and never the source
-- an entitlement check reads from directly.
create table payment_webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider_id text not null,
  provider_event_id text not null,
  order_id uuid references orders (id),
  payload jsonb not null,
  received_at timestamptz not null default now(),
  unique (provider_id, provider_event_id)
);

alter table orders enable row level security;
alter table order_status_events enable row level security;
alter table payment_webhook_events enable row level security;

-- A family can see only their own orders; they can never insert or
-- update one directly — only a server-side webhook handler (using the
-- service role key, which bypasses RLS) may ever set payment_status.
create policy "orders_select_own" on orders
  for select using (auth.uid() = account_id);

-- No insert/update/delete policy is defined for any authenticated role on
-- any of these three tables — by Postgres RLS default, that means no
-- client request can ever write to them at all. Only the service-role
-- key, used solely from a webhook Route Handler after signature
-- verification, may write. This is the same "fails closed unless
-- explicitly opened" posture src/lib/admin/session.ts already uses for
-- admin auth.
```

## Payment status

Exactly the five states the brief names — no more:

| Status | Meaning |
|---|---|
| Pending | Payment attempted, not yet resolved. |
| Paid | Payment succeeded. |
| Failed | Payment attempt failed (declined, error). |
| Cancelled | The attempt was abandoned before resolving. |
| Refunded | A previously paid order was later refunded. |

All five are modeled in `PaymentStatus` (`src/lib/payments/types.ts`).
None is reachable by any code path today — see "Why no order can exist
today" above. No sixth status (e.g. "disputed," "partially refunded") was
added; the brief's instruction to "only use states that are actually
implemented" is read as a ceiling on invented states, not a requirement
that the five actually run in production yet.

## Security

- **No raw card details are stored.** No field anywhere in this codebase
  (`Order`, `CheckoutSession`, or otherwise) holds a card number,
  expiry, or CVC. A real integration would use a provider's own hosted
  checkout/payment element, which never sends card data to this
  platform's own servers at all.
- **No secret is exposed to the frontend.** `PAYMENT_PROVIDER_SECRET_KEY`
  (`.env.example`) is server-only, never `NEXT_PUBLIC_`-prefixed, and is
  never read for its value anywhere in this codebase today — only checked
  for presence, by `isPaymentProviderConfigured()`
  (`src/lib/payments/is-configured.ts`).
- **Fails closed.** `isPaymentProviderConfigured()` mirrors
  `isSupabaseConfigured` (`src/lib/supabase/is-configured.ts`) and the
  admin session's own reasoning (`src/lib/admin/session.ts`,
  `docs/ADMIN_ARCHITECTURE.md`): when a required variable is missing, the
  answer is `false`, never "not configured, so let it through."
- **Webhooks are verified, not trusted.** `PaymentProviderAdapter.verifyWebhookSignature()`
  is part of the interface itself — any real webhook Route Handler
  (planned at `src/app/api/webhooks/payments/route.ts`, following
  `docs/ARCHITECTURE.md` §18's existing placement decision) must call it
  before ever changing an order's `paymentStatus`. No webhook handler
  exists yet.
- **No credentials in source code.** Every value in `.env.example` for
  this feature is blank; nothing in this codebase reads an env var whose
  name suggests a real provider (no `STRIPE_...`, `PAYPAL_...`, etc.
  anywhere).

## Access control

Real premium access must be based on a verified `Order`/`PaymentStatus`,
never a frontend signal. Concretely:

- `hasValidEntitlement(offeringId, orders)`
  (`src/lib/payments/entitlements.ts`) is the one function this or any
  future check should call. It returns `true` only when a real order for
  that offering has both `status: "completed"` and
  `paymentStatus: "paid"` (`isOrderPaid()`, `src/lib/payments/types.ts`).
- `orders` must come from a trusted, server-verified source once one
  exists — never `localStorage`, never a client-supplied prop with no
  server check behind it.
- The eventual real check for whether an offering is accessible is a pure
  composition of what already exists and what this prompt adds:
  `canAccessOffering(offering) || hasValidEntitlement(offering.id, orders)`.
  `canAccessOffering()` itself (`src/lib/offerings/types.ts`) was **not**
  changed by this prompt — free offerings remain accessible exactly as
  they were, and nothing about how `OfferingCard` or the offering detail
  page calls it needed to change.
- No UI in this codebase calls `hasValidEntitlement()` yet, because there
  is no `Order` to ever pass it besides `[]`. Wiring it into
  `/offerings/[slug]` is future work, gated on a real checkout existing.

## Design

No checkout interface was added. There is no `/checkout` route, no
payment form, no "Buy now" or "Subscribe" button anywhere in this
codebase. `CheckoutSession` (`src/lib/payments/types.ts`) is a type
only — nothing instantiates it. The public site does not look like an
e-commerce site: `/offerings` (Prompt 60) still shows real, honest empty
states and free content, not a storefront.

## What this prompt explicitly does NOT do

- Does not connect Stripe, PayPal, JazzCash, Easypaisa, a bank API, or any
  other payment provider.
- Does not collect, request, or store any real payment credential.
- Does not create a single real `Order` — `getAllOrders()` returns `[]`,
  the same way it will until a real checkout flow exists.
- Does not add a checkout page, payment form, or "Buy" button.
- Does not change `canAccessOffering()`, `canDownload()`, or any existing
  free-content access path.

## Testing

`src/lib/payments/types.test.ts` — `isOrderPaid()` and `canCancelOrder()`
against synthetic fixtures covering every status/paymentStatus
combination that matters. `src/lib/payments/entitlements.test.ts` —
`hasValidEntitlement()` against an empty order list (the only real input
any caller has today) and synthetic fixtures for matching/non-matching
offering ids and every non-paid status. `src/lib/payments/orders.test.ts`
— `getAllOrders()` returns `[]`, `getOrderByReference()` resolves nothing
against it, `generateOrderReference()` produces the expected format.
`src/lib/payments/is-configured.test.ts` — `isPaymentProviderConfigured()`
against every combination of the two env vars being set/unset. Ran
typecheck, lint, the full Vitest suite, and a production build; confirmed
free resources, learning, games, the parent dashboard, child learning,
the teacher platform, admissions, AI, and admin all remain unaffected —
this prompt added new files and touched no existing route or component.
