import { describe, expect, it } from "vitest";
import { hasActiveMembership, hasAuthorizedChildAccess } from "./access";
import type { Membership } from "./types";
import type { ChildProfile } from "@/lib/accounts/types";

function makeMembership(overrides: Partial<Membership> = {}): Membership {
  return {
    id: "m1",
    accountId: "parent1",
    type: "premium",
    status: "active",
    autoRenew: false,
    statusHistory: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function makeChild(overrides: Partial<ChildProfile> = {}): ChildProfile {
  return {
    id: "child1",
    parentAccountId: "parent1",
    name: "Test Child",
    ageYears: 5,
    avatar: "sun",
    createdAt: "2026-01-01T00:00:00.000Z",
    accountStatus: "active",
    ...overrides,
  };
}

describe("hasActiveMembership", () => {
  it("is false against an empty membership list — the only real input any caller has today", () => {
    expect(hasActiveMembership("parent1", [])).toBe(false);
  });

  it("is true when the account has a matching active membership", () => {
    const memberships = [makeMembership({ accountId: "parent1", status: "active" })];
    expect(hasActiveMembership("parent1", memberships)).toBe(true);
  });

  it("is false when the active membership belongs to a different account", () => {
    const memberships = [makeMembership({ accountId: "someone-else", status: "active" })];
    expect(hasActiveMembership("parent1", memberships)).toBe(false);
  });

  it("is false when the account's membership exists but isn't active", () => {
    const memberships = [makeMembership({ accountId: "parent1", status: "pending" })];
    expect(hasActiveMembership("parent1", memberships)).toBe(false);
  });

  it("filters by membership type when one is given", () => {
    const memberships = [makeMembership({ accountId: "parent1", status: "active", type: "family" })];
    expect(hasActiveMembership("parent1", memberships, "premium")).toBe(false);
    expect(hasActiveMembership("parent1", memberships, "family")).toBe(true);
  });
});

describe("hasAuthorizedChildAccess", () => {
  it("is false against an empty membership list", () => {
    expect(hasAuthorizedChildAccess(makeChild(), [])).toBe(false);
  });

  it("is true for a child explicitly authorized by their own parent's active family membership", () => {
    const child = makeChild({ id: "child1", parentAccountId: "parent1" });
    const memberships = [
      makeMembership({ accountId: "parent1", type: "family", status: "active", authorizedChildIds: ["child1"] }),
    ];
    expect(hasAuthorizedChildAccess(child, memberships)).toBe(true);
  });

  it("is false when the membership belongs to a different account than the child's own parent, even if the child id is listed", () => {
    const child = makeChild({ id: "child1", parentAccountId: "parent1" });
    const memberships = [
      makeMembership({ accountId: "someone-else", type: "family", status: "active", authorizedChildIds: ["child1"] }),
    ];
    expect(hasAuthorizedChildAccess(child, memberships)).toBe(false);
  });

  it("is false when the child's own parent has an active family membership that doesn't list this child", () => {
    const child = makeChild({ id: "child1", parentAccountId: "parent1" });
    const memberships = [
      makeMembership({ accountId: "parent1", type: "family", status: "active", authorizedChildIds: ["some-other-child"] }),
    ];
    expect(hasAuthorizedChildAccess(child, memberships)).toBe(false);
  });

  it("is false for a non-family membership even if it somehow lists the child", () => {
    const child = makeChild({ id: "child1", parentAccountId: "parent1" });
    const memberships = [
      makeMembership({ accountId: "parent1", type: "premium", status: "active", authorizedChildIds: ["child1"] }),
    ];
    expect(hasAuthorizedChildAccess(child, memberships)).toBe(false);
  });

  it("is false when the family membership is not active", () => {
    const child = makeChild({ id: "child1", parentAccountId: "parent1" });
    const memberships = [
      makeMembership({ accountId: "parent1", type: "family", status: "pending", authorizedChildIds: ["child1"] }),
    ];
    expect(hasAuthorizedChildAccess(child, memberships)).toBe(false);
  });
});
