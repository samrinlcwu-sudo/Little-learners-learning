import { describe, expect, it } from "vitest";
import { canAccessOffering, isOfferingPubliclyVisible, type Offering } from "./types";

function makeOffering(overrides: Partial<Offering> = {}): Offering {
  return {
    id: "o1",
    slug: "test-offering",
    name: "Test Offering",
    description: "A synthetic offering used only in tests — no such product exists in this business.",
    type: "free",
    learningAreas: ["mathematics"],
    accessLevel: "free",
    availability: "available",
    status: "published",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("isOfferingPubliclyVisible", () => {
  it("is true for a published, available offering", () => {
    expect(isOfferingPubliclyVisible(makeOffering())).toBe(true);
  });

  it("is false for a draft offering", () => {
    expect(isOfferingPubliclyVisible(makeOffering({ status: "draft" }))).toBe(false);
  });

  it("is false for an archived offering", () => {
    expect(isOfferingPubliclyVisible(makeOffering({ status: "archived" }))).toBe(false);
  });

  it("is false once marked unavailable, even if published", () => {
    expect(isOfferingPubliclyVisible(makeOffering({ availability: "unavailable" }))).toBe(false);
  });

  it("is true for a published, coming-soon offering — visible, just not accessible yet", () => {
    expect(isOfferingPubliclyVisible(makeOffering({ availability: "coming-soon" }))).toBe(true);
  });
});

describe("canAccessOffering", () => {
  it("is true only for a visible, available, free-access-level offering", () => {
    expect(canAccessOffering(makeOffering({ accessLevel: "free", availability: "available" }))).toBe(true);
  });

  it("is false for a premium offering, even if published and available — no entitlement system exists yet", () => {
    expect(canAccessOffering(makeOffering({ type: "premium", accessLevel: "premium", availability: "available" }))).toBe(
      false,
    );
  });

  it("is false for a membership offering", () => {
    expect(
      canAccessOffering(makeOffering({ type: "membership", accessLevel: "membership", availability: "available" })),
    ).toBe(false);
  });

  it("is false for a free-access-level offering that's only coming soon", () => {
    expect(canAccessOffering(makeOffering({ accessLevel: "free", availability: "coming-soon" }))).toBe(false);
  });

  it("is false for a draft offering regardless of access level", () => {
    expect(canAccessOffering(makeOffering({ status: "draft", accessLevel: "free" }))).toBe(false);
  });
});
