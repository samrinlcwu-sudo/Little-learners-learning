/**
 * The payment/order data model — contracts only, exactly like every other
 * domain's types.ts in this codebase (offerings, accounts, admissions).
 * Introduced in Prompt 61 to prepare Little Learners Learning for secure
 * future payments "without implementing live payment processing." No
 * payment provider is connected, no checkout flow exists, and no code
 * path anywhere in this codebase can create or transition an Order — see
 * docs/PAYMENT_ARCHITECTURE.md for the full reasoning.
 *
 * Deliberately provider-independent: nothing here names a specific
 * provider (no "stripe", "paypal", "jazzcash", or "easypaisa" literal
 * exists in this file). `PaymentProviderAdapter` is the seam a real
 * provider integration would implement later without requiring any other
 * part of this model to change.
 */

/**
 * A real provider's own identifier (e.g. what a future Stripe, PayPal,
 * JazzCash, or Easypaisa adapter would call itself) — deliberately a
 * plain string, not a fixed union, so integrating a real provider later
 * never means editing this file. No adapter implementing
 * `PaymentProviderAdapter` exists anywhere in this codebase today.
 */
export type PaymentProviderId = string;

/**
 * The abstraction boundary between this platform and any real payment
 * provider. A real integration (Stripe Checkout, PayPal, JazzCash,
 * Easypaisa, or anything else) would implement this interface; nothing
 * else in the commerce flow — Order, PaymentStatus, entitlement checks —
 * would need to change when it does. This is what keeps the platform from
 * being "tightly coupled to one payment provider," per
 * docs/PAYMENT_ARCHITECTURE.md.
 *
 * Deliberately provider-agnostic in its parameters and return shape: it
 * never assumes a specific provider's session model, field names, or
 * webhook format.
 */
export interface PaymentProviderAdapter {
  readonly id: PaymentProviderId;
  /** Starts a real payment attempt for one order; returns where a family would be redirected to actually pay and the provider's own reference for that attempt. */
  createCheckoutSession(params: {
    orderReference: string;
    amountMinorUnits: number;
    currency: string;
  }): Promise<{ redirectUrl: string; providerReference: string }>;
  /** Verifies a webhook actually came from this provider before any payment status is ever trusted or changed — see docs/PAYMENT_ARCHITECTURE.md, "Security." */
  verifyWebhookSignature(rawBody: string, signature: string, secret: string): boolean;
}

/**
 * Every payment state the architecture is prepared for — exactly the five
 * named in the brief, no more. Unlike `ApplicationStatus`
 * (src/lib/admissions/types.ts), where three of seven states are already
 * reachable, **none** of these are reachable by any code path in this
 * codebase today: there is no checkout flow anywhere to create a payment
 * attempt in the first place. See `UNREACHABLE_PAYMENT_STATUSES` below.
 */
export const PAYMENT_STATUSES = ["pending", "paid", "failed", "cancelled", "refunded"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "Pending",
  paid: "Paid",
  failed: "Failed",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

/** Every payment status is unreachable today — see the doc comment on PaymentStatus above. */
export const UNREACHABLE_PAYMENT_STATUSES: readonly PaymentStatus[] = PAYMENT_STATUSES;

/**
 * The order's own lifecycle — distinct from `PaymentStatus`, which tracks
 * money moving (or not). An order can exist in `"pending"` while a payment
 * is retried, then resolve to `"completed"` (payment succeeded, access
 * granted) or `"cancelled"` (payment never succeeded, or the family backed
 * out). No refund-specific order status exists — a refund is recorded as
 * `paymentStatus: "refunded"` on an order whose own lifecycle already
 * reached `"completed"`, never a fourth order status.
 */
export const ORDER_STATUSES = ["pending", "completed", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  completed: "Completed",
  cancelled: "Cancelled",
};

/** No code path in this codebase can create an Order, so every order status is unreachable too — see the doc comment on PaymentStatus above and docs/PAYMENT_ARCHITECTURE.md. */
export const UNREACHABLE_ORDER_STATUSES: readonly OrderStatus[] = ORDER_STATUSES;

/**
 * A real, recorded transition — the same honesty pattern as
 * `ApplicationStatusEvent` (src/lib/admissions/types.ts): nothing here is
 * ever backdated or fabricated to make a timeline look complete.
 */
export interface OrderStatusEvent {
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  occurredAt: string;
}

/**
 * This platform's own permanent commerce record — never persisted to
 * localStorage the way every other local-first domain in this app is
 * (accounts, applications, teacher-authored resources). A client-writable
 * order would let anyone grant themselves `"paid"` access by editing
 * browser storage; see docs/PAYMENT_ARCHITECTURE.md, "Access control." The
 * planned real schema (Postgres, via Supabase — docs/ARCHITECTURE.md §3)
 * is documented in full in docs/PAYMENT_ARCHITECTURE.md.
 */
export interface Order {
  id: string;
  /** A short, human-readable reference a family could quote back — see generateOrderReference() in orders.ts. */
  reference: string;
  /** References Account.id (src/lib/accounts/types.ts) — never a duplicate identity. */
  accountId: string;
  /** References Offering.id (src/lib/offerings/types.ts) — never a duplicated copy of its name, description, or price. */
  offeringId: string;
  /**
   * Integer minor units (e.g. cents for USD), never a floating-point
   * decimal — real money can't tolerate rounding drift. Deliberately
   * distinct from `OfferingPrice.amount` (src/lib/offerings/types.ts),
   * which is a display-only decimal for the catalog listing; an order's
   * amount is the value a real payment provider would actually be told to
   * charge.
   */
  amountMinorUnits: number;
  /** ISO 4217 currency code, e.g. "USD" — same convention as `OfferingPrice.currency`. */
  currency: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  /** Which real provider processed this order, once one exists. Undefined for every order in this codebase today, since none does. */
  providerId?: PaymentProviderId;
  /** The provider's own reference for this transaction (e.g. a real payment intent id) — opaque to this codebase, used only to match an incoming webhook to this order, never parsed or trusted for anything else. */
  providerReference?: string;
  statusHistory: OrderStatusEvent[];
  createdAt: string;
  updatedAt: string;
}

/** True only for a genuinely completed, genuinely paid order — the single condition real premium access should ever depend on. See hasValidEntitlement() in entitlements.ts, the function that actually uses this. */
export function isOrderPaid(order: Order): boolean {
  return order.status === "completed" && order.paymentStatus === "paid";
}

/** A pending order can still be cancelled by the family or the provider; a completed or already-cancelled order cannot be cancelled again. */
export function canCancelOrder(order: Order): boolean {
  return order.status === "pending";
}

/**
 * A checkout session is a short-lived, provider-side construct —
 * deliberately modeled separately from `Order` (this platform's own
 * permanent record). A real provider would create one of these per
 * payment attempt; a single Order could have several CheckoutSessions if
 * a family retries after a failed one. No code anywhere in this codebase
 * creates a CheckoutSession — there is no checkout route, form, or
 * button (see docs/PAYMENT_ARCHITECTURE.md, "Design").
 */
export interface CheckoutSession {
  id: string;
  orderId: string;
  providerId: PaymentProviderId;
  /** Where a family would be redirected to actually pay — always a real provider-hosted page, never a card form this platform renders itself (see docs/PAYMENT_ARCHITECTURE.md, "Security"). */
  redirectUrl: string;
  expiresAt: string;
  createdAt: string;
}
