/**
 * The membership data model — contracts only, exactly like every other
 * domain's types.ts in this codebase (offerings, payments, accounts).
 * Introduced in Prompt 62 to prepare a scalable future membership system
 * "without forcing existing users into memberships" or creating fake
 * subscription plans. No membership is active anywhere in this codebase
 * today — see docs/MEMBERSHIP_ARCHITECTURE.md for the full reasoning.
 *
 * A `Membership` is distinct from both `Offering` (src/lib/offerings/types.ts,
 * the catalog listing) and `Order` (src/lib/payments/types.ts, the purchase
 * record): an `Order` for a `membership`-type `Offering` is what would
 * eventually create a `Membership` — the ongoing grant that actually
 * controls access over time, including its own start/end dates and
 * renewal, independent of the one-time purchase that started it.
 */

/**
 * Exactly the types the brief names as future possibilities, no more.
 * "free" is included for completeness with `OfferingType`
 * (src/lib/offerings/types.ts) but no code path ever creates a `Membership`
 * record of type "free" — free access is already the default, granted by
 * `canAccessOffering()` without needing a Membership row at all. A real
 * `Membership` record only ever exists to grant something beyond that
 * default.
 */
export const MEMBERSHIP_TYPES = ["free", "premium", "family", "teacher", "resource", "learning-program"] as const;
export type MembershipType = (typeof MEMBERSHIP_TYPES)[number];

export const MEMBERSHIP_TYPE_LABELS: Record<MembershipType, string> = {
  free: "Free",
  premium: "Premium",
  family: "Family Membership",
  teacher: "Teacher Membership",
  resource: "Resource Membership",
  "learning-program": "Learning Program",
};

/**
 * A short, honest description of what each type is *for* — shown on the
 * public catalog (src/app/offerings/page.tsx) so a visitor understands the
 * shape of what's planned without it ever implying a price, a start date,
 * or that any of this can be bought today.
 */
export const MEMBERSHIP_TYPE_DESCRIPTIONS: Record<MembershipType, string> = {
  free: "What every visitor already has — no membership needed.",
  premium: "Broader access to premium resources and games for one learner.",
  family: "One membership, meant to extend access to every child profile in a family.",
  teacher: "A separate membership for a teacher's own tools and resources — never assumed just from having a teacher profile.",
  resource: "Access scoped to a specific bundle of resources, rather than everything premium.",
  "learning-program": "Access tied to a specific structured learning program, once one exists.",
};

/**
 * The lifecycle a membership record moves through. `"pending"` covers a
 * membership whose payment hasn't resolved yet (mirrors `OrderStatus`,
 * src/lib/payments/types.ts); `"active"` is the only status that should
 * ever grant access; `"expired"` is a natural end (end date passed);
 * `"cancelled"` is an early, deliberate end.
 */
export const MEMBERSHIP_STATUSES = ["pending", "active", "expired", "cancelled"] as const;
export type MembershipStatus = (typeof MEMBERSHIP_STATUSES)[number];

export const MEMBERSHIP_STATUS_LABELS: Record<MembershipStatus, string> = {
  pending: "Pending",
  active: "Active",
  expired: "Expired",
  cancelled: "Cancelled",
};

/**
 * No code path in this codebase can create a Membership at all — the same
 * "prepared, none reachable" position `docs/PAYMENT_ARCHITECTURE.md`
 * documents for `Order`. Every status here is prepared, none is reachable
 * today.
 */
export const UNREACHABLE_MEMBERSHIP_STATUSES: readonly MembershipStatus[] = MEMBERSHIP_STATUSES;

/** A real, recorded transition — same honesty pattern as `OrderStatusEvent` (src/lib/payments/types.ts) and `ApplicationStatusEvent` (src/lib/admissions/types.ts). */
export interface MembershipStatusEvent {
  status: MembershipStatus;
  occurredAt: string;
}

/**
 * This platform's own permanent membership record — never persisted to
 * localStorage, for exactly the reason `Order` isn't
 * (docs/PAYMENT_ARCHITECTURE.md, "Why orders are never stored in
 * localStorage"): a client-writable membership would let anyone grant
 * themselves active premium access by editing browser storage. No
 * `local-memberships.ts` file exists anywhere in this codebase.
 */
export interface Membership {
  id: string;
  /** References Account.id (src/lib/accounts/types.ts) — the account that holds this membership. For a `"family"` membership, this is the parent account, never a child (a child has no account of its own — see docs/ACCOUNTS_ARCHITECTURE.md). */
  accountId: string;
  type: MembershipType;
  status: MembershipStatus;
  /** Undefined until the membership actually starts (e.g. still `"pending"`). */
  startDate?: string;
  /** Undefined for a membership with no fixed end (ongoing, auto-renewing) or one that hasn't started. */
  endDate?: string;
  /** Whether this membership would renew automatically at `endDate` — meaningless (and always `false`) unless `status === "active"`. */
  autoRenew: boolean;
  /** The next renewal date, only meaningful when `autoRenew` is true and the membership is active. */
  renewsAt?: string;
  /** References Order.id (src/lib/payments/types.ts) — the purchase that established this membership. Every real membership should trace back to a real, paid order; see isMembershipGrantValid() below. */
  sourceOrderId?: string;
  /**
   * For a `"family"` membership only: real ChildProfile ids
   * (src/lib/accounts/types.ts) this membership extends access to.
   * Meaningless for any other membership type. Listing a child id here is
   * necessary but not sufficient for access — see
   * hasAuthorizedChildAccess() in access.ts, which also verifies the
   * child actually belongs to this membership's own `accountId` before
   * granting anything, so a membership can never be edited (however it's
   * eventually created) to reach into an unrelated family.
   */
  authorizedChildIds?: string[];
  statusHistory: MembershipStatusEvent[];
  createdAt: string;
  updatedAt: string;
}

/** True only for a membership that is both marked active and, if it has an end date, not yet past it — the single condition real premium access should ever depend on. */
export function isMembershipActive(membership: Membership, now: Date = new Date()): boolean {
  if (membership.status !== "active") return false;
  if (!membership.endDate) return true;
  return new Date(membership.endDate).getTime() > now.getTime();
}

/** A pending or active membership can still be cancelled; an already-expired or already-cancelled one cannot be cancelled again. */
export function canCancelMembership(membership: Membership): boolean {
  return membership.status === "pending" || membership.status === "active";
}

