import { describe, expect, it } from "vitest";
import { hasValidEntitlement } from "./entitlements";
import type { Order } from "./types";

function makeOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: "o1",
    reference: "LLO-TEST01",
    accountId: "acc1",
    offeringId: "offering1",
    amountMinorUnits: 999,
    currency: "USD",
    status: "pending",
    paymentStatus: "pending",
    statusHistory: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("hasValidEntitlement", () => {
  it("is false against an empty order list — the only real input any caller has today", () => {
    expect(hasValidEntitlement("offering1", [])).toBe(false);
  });

  it("is true when a completed, paid order exists for the offering", () => {
    const orders = [makeOrder({ offeringId: "offering1", status: "completed", paymentStatus: "paid" })];
    expect(hasValidEntitlement("offering1", orders)).toBe(true);
  });

  it("is false when the paid order is for a different offering", () => {
    const orders = [makeOrder({ offeringId: "offering2", status: "completed", paymentStatus: "paid" })];
    expect(hasValidEntitlement("offering1", orders)).toBe(false);
  });

  it("is false for a pending, failed, cancelled, or refunded order even for the right offering", () => {
    const orders = [
      makeOrder({ offeringId: "offering1", status: "pending", paymentStatus: "pending" }),
      makeOrder({ offeringId: "offering1", status: "cancelled", paymentStatus: "failed" }),
      makeOrder({ offeringId: "offering1", status: "cancelled", paymentStatus: "cancelled" }),
      makeOrder({ offeringId: "offering1", status: "completed", paymentStatus: "refunded" }),
    ];
    expect(hasValidEntitlement("offering1", orders)).toBe(false);
  });
});
