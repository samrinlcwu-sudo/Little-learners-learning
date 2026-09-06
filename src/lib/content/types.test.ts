import { describe, expect, it } from "vitest";
import { isPubliclyVisible, type LearningContent } from "./types";

function makeContent(overrides: Partial<LearningContent> = {}): LearningContent {
  return {
    id: "1",
    slug: "test-item",
    title: "Test item",
    description: "A test item.",
    category: "mathematics",
    ageRange: { minYears: 3, maxYears: 6 },
    learningObjective: "Count to ten.",
    difficulty: "beginner",
    contentType: "lesson",
    tags: [],
    author: { name: "Little Learners Learning", role: "platform" },
    publicationStatus: "published",
    religiousReview: "not-applicable",
    featured: false,
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
    ...overrides,
  };
}

describe("isPubliclyVisible", () => {
  it("hides draft content", () => {
    expect(isPubliclyVisible(makeContent({ publicationStatus: "draft" }))).toBe(false);
  });

  it("shows published, non-religious content", () => {
    expect(isPubliclyVisible(makeContent())).toBe(true);
  });

  it("hides Qur'an-category content that has not been verified", () => {
    const content = makeContent({
      category: "quran-nazra",
      religiousReview: "pending-review",
    });
    expect(isPubliclyVisible(content)).toBe(false);
  });

  it("hides Qur'an-category content even if left as not-applicable", () => {
    const content = makeContent({
      category: "arabic-letters",
      religiousReview: "not-applicable",
    });
    expect(isPubliclyVisible(content)).toBe(false);
  });

  it("shows Qur'an-category content only once explicitly verified", () => {
    const content = makeContent({
      category: "foundational-quran-reading",
      religiousReview: "verified",
    });
    expect(isPubliclyVisible(content)).toBe(true);
  });
});
