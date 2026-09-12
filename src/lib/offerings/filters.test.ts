import { describe, expect, it } from "vitest";
import { filterOfferings } from "./filters";
import type { Offering } from "./types";

function makeOffering(overrides: Partial<Offering> = {}): Offering {
  return {
    id: "o1",
    slug: "test-offering",
    name: "Counting Bundle",
    description: "A synthetic offering used only in tests.",
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

describe("filterOfferings", () => {
  it("excludes anything not publicly visible before applying any filter", () => {
    const items = [makeOffering({ id: "o1", status: "draft" }), makeOffering({ id: "o2" })];
    expect(filterOfferings(items, {})).toHaveLength(1);
  });

  it("filters by type", () => {
    const items = [makeOffering({ id: "o1", type: "free" }), makeOffering({ id: "o2", type: "membership" })];
    const result = filterOfferings(items, { type: "membership" });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("o2");
  });

  it("filters by access level", () => {
    const items = [makeOffering({ id: "o1", accessLevel: "free" }), makeOffering({ id: "o2", accessLevel: "premium" })];
    const result = filterOfferings(items, { accessLevel: "premium" });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("o2");
  });

  it("filters by learning area", () => {
    const items = [
      makeOffering({ id: "o1", learningAreas: ["mathematics"] }),
      makeOffering({ id: "o2", learningAreas: ["creativity"] }),
    ];
    const result = filterOfferings(items, { learningArea: "creativity" });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("o2");
  });

  it("matches the free-text query against name and description", () => {
    const items = [
      makeOffering({ id: "o1", name: "Counting Bundle", description: "Practice numbers." }),
      makeOffering({ id: "o2", name: "Letters Pack", description: "Practice the alphabet." }),
    ];
    expect(filterOfferings(items, { query: "alphabet" })).toHaveLength(1);
    expect(filterOfferings(items, { query: "counting" })).toHaveLength(1);
  });

  it("combines multiple filters with AND semantics", () => {
    const items = [
      makeOffering({ id: "o1", type: "free", learningAreas: ["mathematics"] }),
      makeOffering({ id: "o2", type: "membership", learningAreas: ["mathematics"] }),
    ];
    const result = filterOfferings(items, { type: "membership", learningArea: "mathematics" });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("o2");
  });

  it("returns an empty array for an empty catalog, never an error", () => {
    expect(filterOfferings([], {})).toEqual([]);
  });
});
