import type { Membership } from "./types";

/**
 * Always empty today — not because no membership was seeded, but because
 * no code path anywhere in this codebase can create a Membership in the
 * first place (no checkout, no order-fulfillment step exists to grant
 * one). Same reasoning as `getAllOrders()`
 * (src/lib/payments/orders.ts): memberships are deliberately never
 * persisted to localStorage, because a client-writable membership would
 * let anyone grant themselves active premium access by editing browser
 * storage. Takes no parameter today for the same reason `getAllOrders()`
 * and `getAllOfferings()` don't — the day a real database exists, this
 * becomes a real server-side query scoped to the caller's own
 * authenticated account, which is a concern of the caller (a Server
 * Component or Route Handler that already knows who's asking), not of
 * this function's signature.
 */
export function getAllMemberships(): Membership[] {
  return [];
}
