import { describe, expect, it } from "vitest";
import { buildCategoryMetaDescription, getAllLearningCategories, getLearningCategoryBySlug } from "./learning-categories";

describe("buildCategoryMetaDescription", () => {
  it("includes the category's own description, real age range, and real learning objectives", () => {
    const mathematics = getLearningCategoryBySlug("mathematics")!;
    const description = buildCategoryMetaDescription(mathematics);
    expect(description).toContain(mathematics.description);
    expect(description).toContain("ages 3–6");
    for (const objective of mathematics.learningObjectives) {
      expect(description).toContain(objective);
    }
  });

  it("produces a real, non-empty description for every real category — never a blank meta tag", () => {
    for (const category of getAllLearningCategories()) {
      const description = buildCategoryMetaDescription(category);
      expect(description.length).toBeGreaterThan(category.description.length);
      expect(description).toContain(`ages ${category.ageRange.minYears}–${category.ageRange.maxYears}`);
    }
  });
});
