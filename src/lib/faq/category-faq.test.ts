import { describe, expect, it } from "vitest";
import { BookOpen } from "lucide-react";
import { buildCategoryFaq } from "./category-faq";
import type { LearningCategory } from "@/config/learning-categories";

const category: LearningCategory = {
  slug: "mathematics",
  name: "Mathematics",
  description: "Numbers, counting, and early problem-solving.",
  icon: BookOpen,
  ageRange: { minYears: 3, maxYears: 6 },
  contentTypes: ["lesson", "worksheet", "activity", "game"],
  learningObjectives: ["Understand numbers and counting", "Recognize shapes and simple patterns"],
};

describe("buildCategoryFaq", () => {
  it("always answers what the category covers and what age it's for, from real fields", () => {
    const faq = buildCategoryFaq(category, null, 0);
    expect(faq[0].question).toBe("What does Mathematics cover?");
    expect(faq[0].answer).toContain("Numbers, counting, and early problem-solving.");
    expect(faq[0].answer).toContain("understand numbers and counting");
    expect(faq[1].question).toBe("What age is Mathematics for?");
    expect(faq[1].answer).toContain("3–6");
  });

  it("honestly states when nothing is published yet, rather than skipping the question", () => {
    const faq = buildCategoryFaq(category, { resources: [], games: [] }, 0);
    expect(faq).toHaveLength(3);
    expect(faq[2].question).toBe("Is there content available for Mathematics yet?");
    expect(faq[2].answer).toContain("Not yet");
  });

  it("counts real published resources, games, and articles when they exist", () => {
    const faq = buildCategoryFaq(
      category,
      { resources: [{}, {}] as never, games: [{}] as never },
      1,
    );
    const availability = faq.find((item) => item.question.startsWith("What resources, games, or activities"));
    expect(availability).toBeDefined();
    expect(availability!.answer).toContain("2 resources");
    expect(availability!.answer).toContain("1 game");
    expect(availability!.answer).toContain("1 article");
  });

  it("treats a null journey the same as an empty one", () => {
    const faq = buildCategoryFaq(category, null, 0);
    expect(faq[2].answer).toContain("Not yet");
  });
});
