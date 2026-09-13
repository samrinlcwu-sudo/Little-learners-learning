import { describe, expect, it } from "vitest";
import { generateOrderReference, getAllOrders, getOrderByReference } from "./orders";

describe("getAllOrders", () => {
  it("returns an empty array — no checkout flow exists to create an order", () => {
    expect(getAllOrders()).toEqual([]);
  });
});

describe("getOrderByReference", () => {
  it("returns undefined for any reference, against an always-empty catalog", () => {
    expect(getOrderByReference("LLO-ANYONE")).toBeUndefined();
  });
});

describe("generateOrderReference", () => {
  it("produces an LLO- prefixed, 6-character uppercase-alphanumeric reference", () => {
    expect(generateOrderReference()).toMatch(/^LLO-[A-Z0-9]{6}$/);
  });

  it("never collides across a large sample (astronomically unlikely, not structurally guaranteed)", () => {
    const seen = new Set(Array.from({ length: 500 }, () => generateOrderReference()));
    expect(seen.size).toBe(500);
  });
});
