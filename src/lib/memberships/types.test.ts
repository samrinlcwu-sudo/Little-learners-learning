import { describe, expect, it } from "vitest";
import { canCancelMembership, isMembershipActive, type Membership } from "./types";

function makeMembership(overrides: Partial<Membership> = {}): Membership {
  return {
    id: "m1",
    accountId: "acc1",
    type: "premium",
    status: "pending",
    autoRenew: false,
    statusHistory: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("isMembershipActive", () => {
  const now = new Date("2026-06-01T00:00:00.000Z");

  it("is false for anything other than status \"active\"", () => {
    expect(isMembershipActive(makeMembership({ status: "pending" }), now)).toBe(false);
    expect(isMembershipActive(makeMembership({ status: "expired" }), now)).toBe(false);
    expect(isMembershipActive(makeMembership({ status: "cancelled" }), now)).toBe(false);
  });

  it("is true for an active membership with no end date", () => {
    expect(isMembershipActive(makeMembership({ status: "active", endDate: undefined }), now)).toBe(true);
  });

  it("is true for an active membership whose end date hasn't passed yet", () => {
    expect(isMembershipActive(makeMembership({ status: "active", endDate: "2026-12-31T00:00:00.000Z" }), now)).toBe(true);
  });

  it("is false for an active membership whose end date already passed", () => {
    expect(isMembershipActive(makeMembership({ status: "active", endDate: "2026-01-01T00:00:00.000Z" }), now)).toBe(false);
  });
});

describe("canCancelMembership", () => {
  it("is true for a pending or active membership", () => {
    expect(canCancelMembership(makeMembership({ status: "pending" }))).toBe(true);
    expect(canCancelMembership(makeMembership({ status: "active" }))).toBe(true);
  });

  it("is false for an expired or already-cancelled membership", () => {
    expect(canCancelMembership(makeMembership({ status: "expired" }))).toBe(false);
    expect(canCancelMembership(makeMembership({ status: "cancelled" }))).toBe(false);
  });
});
