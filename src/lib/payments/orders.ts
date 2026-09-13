import type { Order } from "./types";

/**
 * Always empty today — not because no order was seeded, but because no
 * checkout flow anywhere in this codebase can create an Order in the
 * first place, and orders are deliberately never persisted to
 * localStorage the way every other local-first domain in this app is
 * (accounts, applications, teacher-authored resources — see
 * docs/PAYMENT_ARCHITECTURE.md, "Access control," for why). The same
 * honest pattern `getAllOfferings()` (src/lib/offerings/offerings.ts) and
 * `getApprovedTeacherDirectoryEntries()` already establish: an empty
 * result is correct behavior, not an unfinished stub. The day a real
 * database exists, this becomes a real server-side query scoped to the
 * caller's own account — nothing calling it needs to change, because it
 * already returns `Order[]`.
 */
export function getAllOrders(): Order[] {
  return [];
}

export function getOrderByReference(reference: string): Order | undefined {
  return getAllOrders().find((order) => order.reference === reference);
}

/**
 * A short, human-readable reference a family could quote back — same
 * convention as `generateReferenceNumber()` in
 * src/lib/admissions/local-applications.ts (`LLL-` prefix there; `LLO-`
 * here so an order reference is never mistaken for an application
 * reference). Not called anywhere in this codebase yet: no checkout flow
 * exists to call it. Exported and tested so it's real, ready code, not a
 * placeholder.
 */
export function generateOrderReference(): string {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `LLO-${random}`;
}
