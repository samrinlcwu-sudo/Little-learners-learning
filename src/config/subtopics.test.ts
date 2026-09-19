import { describe, expect, it } from "vitest";
import { getSubtopicsForCategory, learningSubtopics, subtopicMatchesSkill, subtopicMatchesTags } from "./subtopics";

describe("getSubtopicsForCategory", () => {
  it("returns only subtopics for the requested category", () => {
    const mathSubtopics = getSubtopicsForCategory("mathematics");
    expect(mathSubtopics.length).toBeGreaterThan(0);
    expect(mathSubtopics.every((s) => s.category === "mathematics")).toBe(true);
  });

  it("returns an empty list for a category with no real tagged content yet", () => {
    // Qur'an Learning — Nazra has no real content yet, deliberately: it
    // requires qualified human religious review before any content is
    // added (see docs/LEARNING_CONTENT_COMPLETION.md), unlike every other
    // category, which Prompt 111 populated with real, non-religious content.
    expect(getSubtopicsForCategory("quran-nazra")).toEqual([]);
  });

  it("every subtopic references a real, existing learning category slug", () => {
    const validSlugs = [
      "english-early-literacy",
      "mathematics",
      "early-writing",
      "world-around-us",
      "science-discovery",
      "life-skills",
      "social-emotional-learning",
      "creativity",
      "quran-nazra",
      "arabic-letters",
      "foundational-quran-reading",
      "educational-activities",
      "puzzles",
      "mazes",
      "coloring",
      "learning-games",
    ];
    for (const subtopic of learningSubtopics) {
      expect(validSlugs).toContain(subtopic.category);
    }
  });
});

describe("subtopicMatchesTags", () => {
  const counting = getSubtopicsForCategory("mathematics").find((s) => s.slug === "counting-numbers")!;

  it("matches a real tag used on existing content", () => {
    expect(subtopicMatchesTags(counting, ["counting", "numbers"])).toBe(true);
  });

  it("matches case-insensitively", () => {
    expect(subtopicMatchesTags(counting, ["COUNTING"])).toBe(true);
  });

  it("does not match unrelated tags", () => {
    expect(subtopicMatchesTags(counting, ["phonics", "alphabet"])).toBe(false);
  });

  it("does not match an empty tag list", () => {
    expect(subtopicMatchesTags(counting, [])).toBe(false);
  });
});

describe("subtopicMatchesSkill", () => {
  const counting = getSubtopicsForCategory("mathematics").find((s) => s.slug === "counting-numbers")!;
  const shapes = getSubtopicsForCategory("mathematics").find((s) => s.slug === "shape-recognition")!;

  it("matches a real game skill by keyword", () => {
    expect(subtopicMatchesSkill(counting, "Counting to 5")).toBe(true);
    expect(subtopicMatchesSkill(shapes, "Shape recognition")).toBe(true);
  });

  it("does not match an unrelated skill", () => {
    expect(subtopicMatchesSkill(counting, "Letter recognition")).toBe(false);
  });
});
