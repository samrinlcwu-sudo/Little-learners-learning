import type { Game } from "./types";

/**
 * A small, real set of games (Prompt 14) — not a placeholder catalog.
 * Five are fully playable (see src/lib/games/registry.ts): Letter Match,
 * Count the Fruits, Shape Match, Color Match, and Number Memory. Quality
 * over quantity — no more were added just to pad the count.
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
    description: "Count the apples and choose the matching number.",
    category: "mathematics",
    skill: "Counting to 5",
    ageRange: { minYears: 3, maxYears: 5 },
    difficulty: "beginner",
    gameType: "counting",
    instructions: [
      "Look at the row of apples.",
      "Count how many there are.",
      "Choose the matching number.",
    ],
    estimatedMinutes: 3,
    learningObjective: "Count a group of up to five objects and identify the matching number.",
    accessibilityNotes: [
      "Fully playable with keyboard (Tab and Enter/Space)",
      "The apple group has a text alternative for screen readers (e.g. \"3 apples\")",
      "No timer — play at your own pace",
    ],
    featured: true,
    publicationStatus: "published",
    religiousReview: "not-applicable",
  },
  {
    id: "game-3",
    slug: "shape-match",
    title: "Shape Match",
    description: "Look at a shape and choose its correct name.",
    category: "mathematics",
    skill: "Shape recognition",
    ageRange: { minYears: 2, maxYears: 4 },
    difficulty: "beginner",
    gameType: "identification",
    instructions: [
      "A shape appears on the screen.",
      "Choose its correct name — circle, square, triangle, or rectangle.",
      "Get it right to move to the next shape.",
    ],
    estimatedMinutes: 3,
    learningObjective: "Identify a circle, square, triangle, and rectangle by name.",
    accessibilityNotes: [
      "Fully playable with keyboard (Tab and Enter/Space)",
      "Each shape has a text alternative for screen readers",
      "No timer — play at your own pace",
    ],
    featured: false,
    publicationStatus: "published",
    religiousReview: "not-applicable",
  },
  {
    id: "game-4",
    slug: "color-match",
    title: "Color Match",
    description: "Look at a color and choose its correct name.",
    category: "creativity",
    skill: "Color recognition",
    ageRange: { minYears: 2, maxYears: 4 },
    difficulty: "beginner",
    gameType: "identification",
    instructions: [
      "A colored circle appears on the screen.",
      "Choose its correct name — red, blue, green, or yellow.",
      "Get it right to move to the next color.",
    ],
    estimatedMinutes: 3,
    learningObjective: "Identify red, blue, green, and yellow by name.",
    accessibilityNotes: [
      "Fully playable with keyboard (Tab and Enter/Space)",
      "No timer — play at your own pace",
      "Known limitation: identifying a color swatch by sight is the game's subject, so it isn't meaningfully playable without color vision",
    ],
    featured: false,
    publicationStatus: "published",
    religiousReview: "not-applicable",
  },
  {
    id: "game-5",
    slug: "number-memory",
    title: "Number Memory",
    description: "Flip cards to find each matching pair of numbers.",
    category: "mathematics",
    skill: "Number recognition",
    ageRange: { minYears: 4, maxYears: 6 },
    difficulty: "beginner",
    gameType: "memory",
    instructions: [
      "Flip two cards to see the numbers underneath.",
      "If they match, they stay face up.",
      "If they don't match, click Continue and try again.",
      "Find all the pairs to finish.",
    ],
    estimatedMinutes: 4,
    learningObjective: "Recognize matching numbers 1 through 4.",
    accessibilityNotes: [
      "Fully playable with keyboard (Tab and Enter/Space)",
      "No auto-flip-back timer — mismatched cards stay visible until you click Continue",
      "No timer on the overall game — play at your own pace",
    ],
    featured: true,
    publicationStatus: "published",
    religiousReview: "not-applicable",
  },
  {
    id: "game-6",
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
