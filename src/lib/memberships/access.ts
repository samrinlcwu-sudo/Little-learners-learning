import { isMembershipActive, type Membership, type MembershipType } from "./types";
import type { ChildProfile } from "@/lib/accounts/types";

/**
 * The membership-based half of "User → Verified Membership/Entitlement →
 * Authorized Content." Mirrors `hasValidEntitlement()`
 * (src/lib/payments/entitlements.ts) exactly: real, tested logic that
 * only ever answers `true` for a genuinely active membership belonging to
 * the account asking. `memberships` must come from a trusted,
 * server-verified source once one exists — never from localStorage or a
 * client-supplied prop with no server check behind it (see
 * docs/MEMBERSHIP_ARCHITECTURE.md, "Security"). Every real caller today
 * can only ever pass `[]` (`getAllMemberships()`,
 * src/lib/memberships/memberships.ts), so this correctly returns `false`
 * for every account, every time.
 */
export function hasActiveMembership(
  accountId: string,
  memberships: Membership[],
  type?: MembershipType,
): boolean {
  return memberships.some(
    (membership) =>
      membership.accountId === accountId && isMembershipActive(membership) && (type === undefined || membership.type === type),
  );
}

/**
 * The parent-to-child half of "PARENT & CHILD": whether a specific child
 * profile is covered by an active family membership. Deliberately takes
 * the real `ChildProfile` (not just an id) so it can check
 * `child.parentAccountId` against the membership's own `accountId` —
 * listing a child's id in `membership.authorizedChildIds` is necessary
 * but never sufficient. This is what stops a family membership from ever
 * being usable to "automatically grant access to unrelated users": even
 * a corrupted or malicious `authorizedChildIds` list can't grant access
 * to a child who doesn't actually belong to that membership's own
 * account.
 */
export function hasAuthorizedChildAccess(child: ChildProfile, memberships: Membership[]): boolean {
  return memberships.some(
    (membership) =>
      membership.type === "family" &&
      membership.accountId === child.parentAccountId &&
      isMembershipActive(membership) &&
      (membership.authorizedChildIds?.includes(child.id) ?? false),
  );
}
