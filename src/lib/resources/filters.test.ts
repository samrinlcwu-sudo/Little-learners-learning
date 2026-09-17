import { describe, expect, it } from "vitest";
import { filterResources, paginateResources, sortResources } from "./filters";
import type { Resource } from "./types";

function makeResource(overrides: Partial<Resource> = {}): Resource {
  return {
    id: "r1",
    slug: "test-resource",
    title: "Test Resource",
    description: "A resource for testing.",
    resourceType: "worksheet",
    ageRange: { minYears: 3, maxYears: 5 },
    difficulty: "beginner",
    learningObjective: "Testing.",
    tags: [],
    author: { name: "Platform", role: "platform" },
    accessTier: "free",
    featured: false,
    publicationStatus: "published",
    religiousReview: "not-applicable",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  } as Resource;
}

describe("filterResources", () => {
  it("excludes a draft resource even when every other filter matches", () => {
    const items = [makeResource({ publicationStatus: "draft" })];
    expect(filterResources(items, {})).toHaveLength(0);
  });

  it("excludes a teacher-authored resource stuck in pending review, even though publicationStatus says published — never a fake review", () => {
    const items = [
      makeResource({
        publicationStatus: "published",
        author: { name: "A Teacher", role: "teacher", teacherId: "t1" },
        reviewStatus: "pending",
      }),
    ];
    expect(filterResources(items, {})).toHaveLength(0);
  });

  it("excludes a teacher-authored resource an admin explicitly rejected", () => {
    const items = [
      makeResource({
        publicationStatus: "published",
        author: { name: "A Teacher", role: "teacher", teacherId: "t1" },
        reviewStatus: "rejected",
      }),
    ];
    expect(filterResources(items, {})).toHaveLength(0);
  });

  it("includes a teacher-authored resource once an admin has approved it", () => {
    const items = [
      makeResource({
        publicationStatus: "published",
        author: { name: "A Teacher", role: "teacher", teacherId: "t1" },
        reviewStatus: "approved",
      }),
    ];
    expect(filterResources(items, {})).toHaveLength(1);
  });

  it("filters by category, resource type, difficulty, and access tier", () => {
    const items = [
      makeResource({ id: "a", category: "mathematics", resourceType: "worksheet", difficulty: "beginner", accessTier: "free" }),
      makeResource({ id: "b", category: "english-early-literacy", resourceType: "activity", difficulty: "advanced", accessTier: "premium" }),
    ];
    expect(filterResources(items, { category: "mathematics" }).map((r) => r.id)).toEqual(["a"]);
    expect(filterResources(items, { resourceType: "activity" }).map((r) => r.id)).toEqual(["b"]);
    expect(filterResources(items, { accessTier: "premium" }).map((r) => r.id)).toEqual(["b"]);
  });

  it("filters by age range membership, not just a single field", () => {
    const items = [makeResource({ id: "a", ageRange: { minYears: 3, maxYears: 5 } })];
    expect(filterResources(items, { ageYears: 4 }).map((r) => r.id)).toEqual(["a"]);
    expect(filterResources(items, { ageYears: 8 })).toHaveLength(0);
  });

  it("matches a text query against title and description, case-insensitively", () => {
    const items = [makeResource({ id: "a", title: "Counting Animals", description: "Practice numbers 1-10." })];
    expect(filterResources(items, { query: "counting" }).map((r) => r.id)).toEqual(["a"]);
    expect(filterResources(items, { query: "COUNTING" }).map((r) => r.id)).toEqual(["a"]);
    expect(filterResources(items, { query: "dinosaurs" })).toHaveLength(0);
  });

  it("never returns a resource requiring religious verification that hasn't received it", () => {
    const items = [makeResource({ category: "quran-nazra", religiousReview: "pending-review" })];
    expect(filterResources(items, {})).toHaveLength(0);
  });
});

describe("sortResources", () => {
  const items = [
    makeResource({ id: "a", title: "Zebra", createdAt: "2026-01-01T00:00:00.000Z" }),
    makeResource({ id: "b", title: "Apple", createdAt: "2026-03-01T00:00:00.000Z" }),
  ];

  it("defaults to newest first", () => {
    expect(sortResources(items).map((r) => r.id)).toEqual(["b", "a"]);
  });

  it("sorts oldest first when asked", () => {
    expect(sortResources(items, "oldest").map((r) => r.id)).toEqual(["a", "b"]);
  });

  it("sorts alphabetically by title when asked", () => {
    expect(sortResources(items, "title-asc").map((r) => r.id)).toEqual(["b", "a"]);
  });

  it("never mutates the array it was given", () => {
    const original = [...items];
    sortResources(items, "title-asc");
    expect(items).toEqual(original);
  });
});

describe("paginateResources", () => {
  const items = Array.from({ length: 10 }, (_, i) => i);

  it("returns one page's worth of items with correct paging metadata", () => {
    expect(paginateResources(items, 1, 4)).toEqual({ items: [0, 1, 2, 3], page: 1, pageCount: 3, totalCount: 10 });
  });

  it("clamps a page number far beyond the real page count down to the last real page — an out-of-range/excessive request never errors or returns everything", () => {
    const result = paginateResources(items, 9999, 4);
    expect(result.page).toBe(3);
    expect(result.items).toEqual([8, 9]);
  });

  it("clamps a zero or negative page number up to page 1", () => {
    expect(paginateResources(items, 0, 4).page).toBe(1);
    expect(paginateResources(items, -5, 4).page).toBe(1);
  });

  it("clamps a NaN page number (e.g. a non-numeric query param) to a real page rather than producing NaN paging state", () => {
    const result = paginateResources(items, Number("not-a-number"), 4);
    expect(Number.isNaN(result.page)).toBe(false);
  });

  it("still reports page 1 of 1 for an empty result set", () => {
    expect(paginateResources([], 1, 4)).toEqual({ items: [], page: 1, pageCount: 1, totalCount: 0 });
  });
});
