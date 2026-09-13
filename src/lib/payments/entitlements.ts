import { isOrderPaid, type Order } from "./types";

/**
 * The single function a real premium-access check should call once orders
 * exist — mirrors the "one function that needs to grow" pattern
 * `canDownload()` (src/lib/resources/types.ts) and `canAccessOffering()`
 * (src/lib/offerings/types.ts) already establish. Real, tested logic: an
 * account has access to an offering only if a genuinely completed,
 * genuinely paid order for it exists — never because a button was
 * clicked, a query param was set, a localStorage value was edited, or any
 * other client-supplied signal.
 *
 * `orders` must come from a trusted, server-verified source once one
 * exists (see docs/PAYMENT_ARCHITECTURE.md, "Security") — never from
 * localStorage or another client-writable store, which is exactly why no
 * such store exists anywhere in this codebase (see getAllOrders() in
 * orders.ts). Today, every real caller can only ever pass `[]` (there is
 * nothing else to pass), so this function correctly returns `false` for
 * every offering, every time — the same honest "always empty, correctly"
 * outcome `canAccessOffering()` already produces for anything above
 * `"free"`.
 *
 * The eventual real access check for an offering is the composition of
 * both functions: `canAccessOffering(offering) || hasValidEntitlement(offering.id, orders)`
 * — free offerings stay accessible exactly as they are today, and a real
 * paid order becomes the only other path to access. Nothing about
 * `canAccessOffering()` itself needed to change to make that true.
 */
export function hasValidEntitlement(offeringId: string, orders: Order[]): boolean {
  return orders.some((order) => order.offeringId === offeringId && isOrderPaid(order));
}
