import { describe, expect, it } from "vitest";
import { isGamePublished, type Game } from "./types";
import { SAMPLE_GAMES } from "./sample-games";

function makeGame(overrides: Partial<Game> = {}): Game {
  return {
    id: "g1",
    slug: "test-game",
    title: "Test Game",
    description: "A test game.",
    skill: "Testing",
    ageRange: { minYears: 3, maxYears: 5 },
    difficulty: "beginner",
    gameType: "matching",
    instructions: ["Do the thing."],
    estimatedMinutes: 3,
    learningObjective: "Test.",
    featured: false,
    publicationStatus: "published",
    religiousReview: "not-applicable",
    ...overrides,
  };
}

describe("isGamePublished", () => {
  it("hides drafts", () => {
    expect(isGamePublished(makeGame({ publicationStatus: "draft" }))).toBe(false);
  });

  it("shows a published, non-religious game", () => {
    expect(isGamePublished(makeGame())).toBe(true);
  });

  it("hides an unverified Arabic-letters-category game", () => {
    const game = makeGame({ category: "arabic-letters", religiousReview: "pending-review" });
    expect(isGamePublished(game)).toBe(false);
  });

  it("shows an Arabic-letters-category game only once verified", () => {
    const game = makeGame({ category: "arabic-letters", religiousReview: "verified" });
    expect(isGamePublished(game)).toBe(true);
  });

  it("the seeded arabic-letter-match sample is excluded from the public sample set", () => {
    const visible = SAMPLE_GAMES.filter(isGamePublished);
    expect(visible.find((g) => g.slug === "arabic-letter-match")).toBeUndefined();
  });
});
