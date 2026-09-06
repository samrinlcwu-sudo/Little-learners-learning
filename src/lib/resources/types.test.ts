import { describe, expect, it } from "vitest";
import { canDownload, isResourcePublished, type Resource } from "./types";
import { SAMPLE_RESOURCES } from "./sample-resources";

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
    author: { name: "Little Learners Learning", role: "platform" },
    accessTier: "free",
    featured: false,
    publicationStatus: "published",
    religiousReview: "not-applicable",
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
    ...overrides,
  };
}

describe("isResourcePublished", () => {
  it("hides drafts", () => {
    expect(isResourcePublished(makeResource({ publicationStatus: "draft" }))).toBe(false);
  });

  it("shows a published, non-religious resource", () => {
    expect(isResourcePublished(makeResource())).toBe(true);
  });

  it("hides an unverified Qur'an/Arabic-category resource", () => {
    const resource = makeResource({ category: "arabic-letters", religiousReview: "pending-review" });
    expect(isResourcePublished(resource)).toBe(false);
  });

  it("the seeded arabic-letters sample is excluded from the public sample set", () => {
    const visible = SAMPLE_RESOURCES.filter(isResourcePublished);
    expect(visible.find((r) => r.slug === "arabic-letters-tracing-pack")).toBeUndefined();
  });
});

describe("canDownload", () => {
  it("is false with no downloadFile even for a free, published resource", () => {
    expect(canDownload(makeResource())).toBe(false);
  });

  it("is false for premium resources even with a downloadFile", () => {
    const resource = makeResource({ accessTier: "premium", downloadFile: "/files/test.pdf" });
    expect(canDownload(resource)).toBe(false);
  });

  it("is true only for a published, free resource with a real file", () => {
    const resource = makeResource({ downloadFile: "/files/test.pdf" });
    expect(canDownload(resource)).toBe(true);
  });
});
