import { describe, expect, it } from "vitest";
import { filterGames, paginateGames, sortGames } from "./filters";
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

describe("filterGames", () => {
  it("hides unpublished games", () => {
    const items = [makeGame({ id: "a", publicationStatus: "draft" }), makeGame({ id: "b" })];
    expect(filterGames(items, {})).toHaveLength(1);
  });

  it("hides games pending religious review in a required category", () => {
    const items = [makeGame({ id: "a", category: "arabic-letters", religiousReview: "pending-review" })];
    expect(filterGames(items, {})).toHaveLength(0);
  });

  it("filters by category, game type, age, difficulty, and access tier", () => {
    const items = [
      makeGame({ id: "a", category: "mathematics", gameType: "counting", ageRange: { minYears: 3, maxYears: 5 } }),
      makeGame({ id: "b", category: "creativity", gameType: "identification", ageRange: { minYears: 6, maxYears: 8 }, difficulty: "advanced", accessTier: "premium" }),
    ];
    expect(filterGames(items, { category: "creativity" })).toHaveLength(1);
    expect(filterGames(items, { gameType: "counting" })).toHaveLength(1);
    expect(filterGames(items, { ageYears: 7 })).toHaveLength(1);
    expect(filterGames(items, { difficulty: "advanced" })).toHaveLength(1);
    expect(filterGames(items, { accessTier: "premium" })).toHaveLength(1);
  });

  it("matches the free-text query against title, description, and skill", () => {
    const items = [makeGame({ title: "Count the Fruits", description: "Counting apples", skill: "Counting to 5" })];
    expect(filterGames(items, { query: "apples" })).toHaveLength(1);
    expect(filterGames(items, { query: "shapes" })).toHaveLength(0);
  });
});

describe("sortGames", () => {
  it("sorts title A-Z without mutating the input", () => {
    const items = [makeGame({ id: "b", title: "Banana" }), makeGame({ id: "a", title: "Apple" })];
    const result = sortGames(items, "title-asc");
    expect(result.map((g) => g.id)).toEqual(["a", "b"]);
    expect(items.map((g) => g.id)).toEqual(["b", "a"]);
  });

  it("keeps declaration order for newest (games have no createdAt)", () => {
    const items = [makeGame({ id: "a" }), makeGame({ id: "b" })];
    expect(sortGames(items, "newest").map((g) => g.id)).toEqual(["a", "b"]);
  });
});

describe("paginateGames", () => {
  it("slices to a page and reports totals", () => {
    const items = Array.from({ length: 10 }, (_, i) => i);
    expect(paginateGames(items, 1, 4)).toEqual({ items: [0, 1, 2, 3], page: 1, pageCount: 3, totalCount: 10 });
  });

  it("clamps an out-of-range page", () => {
    expect(paginateGames([1, 2, 3], 99, 2).page).toBe(2);
  });

  it("clamps a NaN page (e.g. a non-numeric query param) instead of producing NaN paging state", () => {
    expect(Number.isNaN(paginateGames([1, 2, 3], Number("bad"), 2).page)).toBe(false);
  });
});
