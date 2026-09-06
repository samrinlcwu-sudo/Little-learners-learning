import type { Game } from "./types";

/**
 * A small, real set of games — not a placeholder catalog. `letter-match` is
 * fully playable (see src/lib/games/registry.ts); `count-the-fruits` and
 * `shape-sorter` are genuine roadmap entries with real metadata, shown
 * honestly as "Coming soon" since their components don't exist yet.
 *
 * `arabic-letter-match` is deliberately left `religiousReview:
 * "pending-review"` — its category (arabic-letters) is grouped with
 * Qur'an/Nazra under Prompt 7's religious-review policy, so
 * `isGamePublished()` must exclude it from every listing until a person
 * verifies it, even though letter names are just factual linguistic data.
 * See types.test.ts.
 */
export const SAMPLE_GAMES: Game[] = [
  {
    id: "game-1",
    slug: "letter-match",
    title: "Letter Match",
    description: "Match each uppercase letter to its lowercase partner.",
    category: "english-early-literacy",
    skill: "Letter recognition",
    ageRange: { minYears: 3, maxYears: 5 },
    difficulty: "beginner",
    gameType: "matching",
    instructions: [
      "A big letter appears at the top of the screen.",
      "Pick the small letter that matches it.",
      "Get it right to move to the next letter.",
    ],
    estimatedMinutes: 3,
    learningObjective: "Match an uppercase letter to its lowercase form.",
    accessibilityNotes: [
      "Fully playable with keyboard (Tab and Enter/Space)",
      "Feedback uses icons and text, not color alone",
      "No timer — play at your own pace",
    ],
    featured: true,
    publicationStatus: "published",
    religiousReview: "not-applicable",
  },
  {
    id: "game-2",
    slug: "count-the-fruits",
    title: "Count the Fruits",
    description: "Count each group of fruit and choose the matching number.",
    category: "mathematics",
    skill: "Counting to 10",
    ageRange: { minYears: 3, maxYears: 5 },
    difficulty: "beginner",
    gameType: "counting",
    instructions: [
      "Look at the group of fruit.",
      "Count how many there are.",
      "Choose the matching number.",
    ],
    estimatedMinutes: 3,
    learningObjective: "Count a group of up to ten objects and identify the matching number.",
    featured: true,
    publicationStatus: "published",
    religiousReview: "not-applicable",
  },
  {
    id: "game-3",
    slug: "shape-sorter",
    title: "Shape Sorter",
    description: "Sort circles, squares, and triangles into the right group.",
    category: "mathematics",
    skill: "Shape recognition",
    ageRange: { minYears: 2, maxYears: 4 },
    difficulty: "beginner",
    gameType: "sorting",
    instructions: [
      "Look at the shape.",
      "Decide which group it belongs to.",
      "Place it in the matching group.",
    ],
    estimatedMinutes: 4,
    learningObjective: "Sort everyday shapes into circles, squares, and triangles.",
    featured: false,
    publicationStatus: "published",
    religiousReview: "not-applicable",
  },
  {
    id: "game-4",
    slug: "arabic-letter-match",
    title: "Arabic Letter Match",
    description: "Match each Arabic letter to its name.",
    category: "arabic-letters",
    skill: "Arabic letter recognition",
    ageRange: { minYears: 3, maxYears: 6 },
    difficulty: "beginner",
    gameType: "matching",
    instructions: [
      "An Arabic letter appears on the screen.",
      "Choose its correct name.",
      "Get it right to move to the next letter.",
    ],
    estimatedMinutes: 4,
    learningObjective: "Match an Arabic letter to its name.",
    featured: false,
    publicationStatus: "published",
    // arabic-letters is a religious-review-required category (grouped with
    // Qur'an/Nazra since Prompt 7's policy) — not yet reviewed, so
    // isGamePublished() must exclude this until a person verifies it, even
    // though the letter names themselves are just factual linguistic data.
    religiousReview: "pending-review",
  },
];
