import { describe, expect, it } from "vitest";
import { canCancelOrder, isOrderPaid, type Order } from "./types";

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

describe("isOrderPaid", () => {
  it("is true only when both status and paymentStatus are their paid/completed values", () => {
    expect(isOrderPaid(makeOrder({ status: "completed", paymentStatus: "paid" }))).toBe(true);
  });

  it("is false when the order is completed but the payment was refunded", () => {
    expect(isOrderPaid(makeOrder({ status: "completed", paymentStatus: "refunded" }))).toBe(false);
  });

  it("is false when the payment is marked paid but the order itself never completed", () => {
    expect(isOrderPaid(makeOrder({ status: "pending", paymentStatus: "paid" }))).toBe(false);
  });

  it("is false for every other combination", () => {
    expect(isOrderPaid(makeOrder({ status: "cancelled", paymentStatus: "failed" }))).toBe(false);
    expect(isOrderPaid(makeOrder())).toBe(false);
  });
});

describe("canCancelOrder", () => {
  it("is true only for a pending order", () => {
    expect(canCancelOrder(makeOrder({ status: "pending" }))).toBe(true);
  });

  it("is false for a completed or already-cancelled order", () => {
    expect(canCancelOrder(makeOrder({ status: "completed" }))).toBe(false);
    expect(canCancelOrder(makeOrder({ status: "cancelled" }))).toBe(false);
  });
});
