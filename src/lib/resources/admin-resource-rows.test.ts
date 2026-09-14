import { describe, expect, it } from "vitest";
import { buildAdminResourceRows, findAdminResourceRow } from "./admin-resource-rows";
import type { Resource } from "./types";

function makeResource(overrides: Partial<Resource> = {}): Resource {
  return {
    id: "r1",
    slug: "r1",
    title: "Sample",
    description: "A sample resource.",
    resourceType: "worksheet",
    ageRange: { minYears: 3, maxYears: 5 },
    difficulty: "beginner",
    learningObjective: "Learn something.",
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

describe("buildAdminResourceRows", () => {
  it("tags each source correctly and marks only admin rows editable", () => {
    const seed = [makeResource({ id: "seed-1" })];
    const admin = [makeResource({ id: "admin-1", author: { name: "Little Learners Learning", role: "platform" } })];
    const teacher = [makeResource({ id: "teacher-1", author: { name: "Amina", role: "teacher", teacherId: "t1" } })];

    const rows = buildAdminResourceRows(seed, admin, teacher);

    expect(rows).toHaveLength(3);
    expect(rows.find((r) => r.resource.id === "seed-1")).toMatchObject({ source: "seed", editable: false });
    expect(rows.find((r) => r.resource.id === "admin-1")).toMatchObject({ source: "admin", editable: true });
    expect(rows.find((r) => r.resource.id === "teacher-1")).toMatchObject({ source: "teacher", editable: false });
  });

  it("returns an empty list when every source is empty", () => {
    expect(buildAdminResourceRows([], [], [])).toEqual([]);
  });
});

describe("findAdminResourceRow", () => {
  it("finds a row by resource id", () => {
    const rows = buildAdminResourceRows([makeResource({ id: "seed-1" })], [], []);
    expect(findAdminResourceRow(rows, "seed-1")?.resource.id).toBe("seed-1");
  });

  it("returns undefined when no row matches", () => {
    const rows = buildAdminResourceRows([makeResource({ id: "seed-1" })], [], []);
    expect(findAdminResourceRow(rows, "missing")).toBeUndefined();
  });
});
