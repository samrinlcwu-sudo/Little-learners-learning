import { describe, expect, it } from "vitest";
import { getTeacherResourceKnowledge } from "./teacher-knowledge";
import type { Resource } from "@/lib/resources/types";

function makeResource(overrides: Partial<Resource> = {}): Resource {
  return {
    id: "r1",
    slug: "test-resource",
    title: "Test resource",
    description: "A test resource.",
    resourceType: "worksheet",
    category: "mathematics",
    ageRange: { minYears: 3, maxYears: 5 },
    difficulty: "beginner",
    learningObjective: "Test.",
    tags: [],
    author: { name: "Teacher One", role: "teacher", teacherId: "t1" },
    accessTier: "free",
    featured: false,
    publicationStatus: "published",
    reviewStatus: "pending",
    religiousReview: "not-applicable",
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
    ...overrides,
  };
}

describe("getTeacherResourceKnowledge", () => {
  it("only ever includes the requested teacher's own resources, never another teacher's", () => {
    const resources = [
      makeResource({ id: "r1", author: { name: "Teacher One", role: "teacher", teacherId: "t1" } }),
      makeResource({ id: "r2", author: { name: "Teacher Two", role: "teacher", teacherId: "t2" } }),
    ];
    const knowledge = getTeacherResourceKnowledge("t1", resources);
    expect(knowledge).toHaveLength(1);
    expect(knowledge[0].id).toBe("r1");
  });

  it("includes a teacher's own unreviewed draft, unlike the public knowledge functions", () => {
    const resources = [makeResource({ publicationStatus: "draft", reviewStatus: undefined })];
    const knowledge = getTeacherResourceKnowledge("t1", resources);
    expect(knowledge[0].visibleToPublic).toBe(false);
    expect(knowledge[0].publicationStatus).toBe("draft");
  });

  it("marks visibleToPublic true only once actually approved", () => {
    const resources = [makeResource({ publicationStatus: "published", reviewStatus: "approved" })];
    expect(getTeacherResourceKnowledge("t1", resources)[0].visibleToPublic).toBe(true);
  });
});
