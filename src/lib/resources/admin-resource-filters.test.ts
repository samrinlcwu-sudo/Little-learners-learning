import { describe, expect, it } from "vitest";
import { buildAdminResourceRows } from "./admin-resource-rows";
import { filterAdminResourceRows } from "./admin-resource-filters";
import type { Resource } from "./types";

function makeResource(overrides: Partial<Resource> = {}): Resource {
  return {
    id: "r1",
    slug: "r1",
    title: "Counting Animals",
    description: "Practice counting farm animals.",
    resourceType: "worksheet",
    category: "mathematics",
    ageRange: { minYears: 3, maxYears: 5 },
    difficulty: "beginner",
    learningObjective: "Count to ten.",
    tags: [],
    author: { name: "Little Learners Learning", role: "platform" },
    accessTier: "free",
    featured: false,
    publicationStatus: "published",
    religiousReview: "not-applicable",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("filterAdminResourceRows", () => {
  it("includes drafts and archived resources — unlike the public filterResources gate", () => {
    const rows = buildAdminResourceRows(
      [makeResource({ id: "draft-1", publicationStatus: "draft" }), makeResource({ id: "archived-1", publicationStatus: "archived" })],
      [],
      [],
    );
    expect(filterAdminResourceRows(rows, {})).toHaveLength(2);
  });

  it("filters by status", () => {
    const rows = buildAdminResourceRows(
      [makeResource({ id: "draft-1", publicationStatus: "draft" }), makeResource({ id: "review-1", publicationStatus: "review" })],
      [],
      [],
    );
    const result = filterAdminResourceRows(rows, { status: "review" });
    expect(result).toHaveLength(1);
    expect(result[0].resource.id).toBe("review-1");
  });

  it("filters by source", () => {
    const rows = buildAdminResourceRows(
      [makeResource({ id: "seed-1" })],
      [makeResource({ id: "admin-1" })],
      [makeResource({ id: "teacher-1", author: { name: "Amina", role: "teacher", teacherId: "t1" } })],
    );
    expect(filterAdminResourceRows(rows, { source: "admin" })).toHaveLength(1);
    expect(filterAdminResourceRows(rows, { source: "teacher" })[0].resource.id).toBe("teacher-1");
  });

  it("filters by category, resource type, age, difficulty, and access tier", () => {
    const rows = buildAdminResourceRows(
      [
        makeResource({ id: "a", category: "mathematics", resourceType: "worksheet", ageRange: { minYears: 3, maxYears: 5 } }),
        makeResource({ id: "b", category: "creativity", resourceType: "ebook", ageRange: { minYears: 6, maxYears: 8 }, difficulty: "advanced", accessTier: "premium" }),
      ],
      [],
      [],
    );
    expect(filterAdminResourceRows(rows, { category: "creativity" })).toHaveLength(1);
    expect(filterAdminResourceRows(rows, { resourceType: "ebook" })).toHaveLength(1);
    expect(filterAdminResourceRows(rows, { ageYears: 4 })).toHaveLength(1);
    expect(filterAdminResourceRows(rows, { difficulty: "advanced" })).toHaveLength(1);
    expect(filterAdminResourceRows(rows, { accessTier: "premium" })).toHaveLength(1);
  });

  it("matches the free-text query against title and description", () => {
    const rows = buildAdminResourceRows([makeResource({ title: "Counting Animals", description: "Farm animals" })], [], []);
    expect(filterAdminResourceRows(rows, { query: "farm" })).toHaveLength(1);
    expect(filterAdminResourceRows(rows, { query: "shapes" })).toHaveLength(0);
  });

  it("combines multiple filters with AND semantics", () => {
    const rows = buildAdminResourceRows(
      [
        makeResource({ id: "a", category: "mathematics", publicationStatus: "draft" }),
        makeResource({ id: "b", category: "mathematics", publicationStatus: "published" }),
      ],
      [],
      [],
    );
    const result = filterAdminResourceRows(rows, { category: "mathematics", status: "published" });
    expect(result).toHaveLength(1);
    expect(result[0].resource.id).toBe("b");
  });
});
