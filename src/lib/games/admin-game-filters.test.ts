import { describe, expect, it } from "vitest";
import { filterAdminGames } from "./admin-game-filters";
import type { Game } from "./types";

function makeGame(overrides: Partial<Game> = {}): Game {
  return {
    id: "g1",
    slug: "g1",
    title: "Letter Match",
    description: "Match letters.",
    category: "english-early-literacy",
    skill: "Letter recognition",
    ageRange: { minYears: 3, maxYears: 5 },
    difficulty: "beginner",
    gameType: "matching",
    instructions: [],
    estimatedMinutes: 3,
    learningObjective: "Match letters.",
    featured: false,
    publicationStatus: "published",
    religiousReview: "not-applicable",
    accessTier: "free",
    ...overrides,
  };
}

describe("filterAdminGames", () => {
  it("includes unpublished and pending-review games — unlike the public isGamePublished gate", () => {
    const games = [makeGame({ id: "draft", publicationStatus: "draft" }), makeGame({ id: "pending", religiousReview: "pending-review" })];
    expect(filterAdminGames(games, {})).toHaveLength(2);
  });

  it("filters by category, game type, age, difficulty, access tier, and status", () => {
    const games = [
      makeGame({ id: "a", category: "mathematics", gameType: "counting", ageRange: { minYears: 3, maxYears: 5 } }),
      makeGame({ id: "b", category: "creativity", gameType: "identification", ageRange: { minYears: 6, maxYears: 8 }, difficulty: "advanced", accessTier: "premium", publicationStatus: "draft" }),
    ];
    expect(filterAdminGames(games, { category: "creativity" })).toHaveLength(1);
    expect(filterAdminGames(games, { gameType: "counting" })).toHaveLength(1);
    expect(filterAdminGames(games, { ageYears: 7 })).toHaveLength(1);
    expect(filterAdminGames(games, { difficulty: "advanced" })).toHaveLength(1);
    expect(filterAdminGames(games, { accessTier: "premium" })).toHaveLength(1);
    expect(filterAdminGames(games, { status: "draft" })).toHaveLength(1);
  });

  it("matches the free-text query against title, description, and skill", () => {
    const games = [makeGame({ title: "Count the Fruits", description: "Counting apples", skill: "Counting to 5" })];
    expect(filterAdminGames(games, { query: "apples" })).toHaveLength(1);
    expect(filterAdminGames(games, { query: "shapes" })).toHaveLength(0);
  });
});
