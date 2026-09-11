import { describe, expect, it } from "vitest";
import {
  findGamesByKeyword,
  findResourcesByKeyword,
  getAllLearningAreaKnowledge,
  getLearningAreaKnowledge,
  getLearningAreasForAge,
  getLearningAreasForNamedAgeGroup,
} from "./public-knowledge";

describe("getLearningAreaKnowledge", () => {
  it("returns null for a slug that isn't a real learning category", () => {
    expect(getLearningAreaKnowledge("not-a-real-category")).toBeNull();
  });

  it("builds real knowledge for mathematics from the same published content the category page shows", () => {
    const knowledge = getLearningAreaKnowledge("mathematics");
    expect(knowledge).not.toBeNull();
    expect(knowledge?.name).toBe("Mathematics");
    expect(knowledge?.learningObjectives.length).toBeGreaterThan(0);
    expect(knowledge?.resources.some((r) => r.slug === "counting-animals-worksheet")).toBe(true);
  });

  it("never includes an activity ref that isn't also in resources", () => {
    const knowledge = getLearningAreaKnowledge("mathematics");
    for (const activity of knowledge?.activities ?? []) {
      expect(knowledge?.resources.some((r) => r.slug === activity.slug)).toBe(true);
    }
  });
});

describe("getAllLearningAreaKnowledge", () => {
  it("covers exactly the 16 real learning categories, never inventing an extra one", () => {
    expect(getAllLearningAreaKnowledge()).toHaveLength(16);
  });
});

describe("getLearningAreasForAge", () => {
  it("only returns areas whose real age range covers the given age", () => {
    const areas = getLearningAreasForAge(5);
    expect(areas.length).toBeGreaterThan(0);
    for (const area of areas) {
      expect(area.ageRange.minYears).toBeLessThanOrEqual(5);
      expect(area.ageRange.maxYears).toBeGreaterThanOrEqual(5);
    }
  });

  it("returns nothing for an age no category covers", () => {
    expect(getLearningAreasForAge(40)).toHaveLength(0);
  });
});

describe("getLearningAreasForNamedAgeGroup", () => {
  it("uses the same real preschool range a teacher profile already uses (3–5)", () => {
    const areas = getLearningAreasForNamedAgeGroup("preschool");
    expect(areas.length).toBeGreaterThan(0);
    for (const area of areas) {
      expect(area.ageRange.minYears).toBeLessThanOrEqual(5);
      expect(area.ageRange.maxYears).toBeGreaterThanOrEqual(3);
    }
  });
});

describe("findResourcesByKeyword", () => {
  it("finds the real counting worksheet when asked about counting", () => {
    const results = findResourcesByKeyword("counting");
    expect(results.some((r) => r.slug === "counting-animals-worksheet")).toBe(true);
  });

  it("returns nothing for a keyword that matches no real resource", () => {
    expect(findResourcesByKeyword("xyznonexistentkeyword")).toHaveLength(0);
  });
});

describe("findGamesByKeyword", () => {
  it("returns only published games", () => {
    for (const game of findGamesByKeyword("a")) {
      expect(game.href).toMatch(/^\/games\//);
    }
  });

  it("returns nothing for an empty keyword", () => {
    expect(findGamesByKeyword("   ")).toHaveLength(0);
  });
});
