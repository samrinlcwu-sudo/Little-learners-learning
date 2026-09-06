import {
  RELIGIOUS_REVIEW_REQUIRED_CATEGORIES,
  type AgeRange,
  type DifficultyLevel,
  type PublicationStatus,
  type ReligiousReviewStatus,
} from "@/lib/content/types";

/**
 * Extensible by design — each maps to a distinct interaction shape, not
 * just a label. Only "matching" has a built-in engine so far
 * (useChoiceGame covers matching/multiple-choice/identification/counting,
 * since they're all "show a prompt, pick the right option" at heart);
 * sorting/drag-drop/sequencing/pattern need their own state hook later.
 */
export type GameType =
  | "matching"
  | "memory"
  | "sorting"
  | "drag-drop"
  | "multiple-choice"
  | "sequencing"
  | "counting"
  | "identification"
  | "word-letter"
  | "pattern";

export const GAME_TYPE_LABELS: Record<GameType, string> = {
  matching: "Matching",
  memory: "Memory",
  sorting: "Sorting",
  "drag-drop": "Drag & Drop",
  "multiple-choice": "Multiple Choice",
  sequencing: "Sequencing",
  counting: "Counting",
  identification: "Identification",
  "word-letter": "Word & Letter",
  pattern: "Pattern",
};

export interface Game {
  id: string;
  /** URL-safe, unique — drives /games/[slug]. */
  slug: string;
  title: string;
  description: string;
  /** A learning-category slug (src/config/learning-categories.ts), when this game teaches one of the 16 subjects. */
  category?: string;
  /** The specific thing it builds — e.g. "Letter recognition", "Counting to 5". Free text, shorter than learningObjective. */
  skill: string;
  ageRange: AgeRange;
  difficulty: DifficultyLevel;
  gameType: GameType;
  instructions: string[];
  thumbnail?: string;
  estimatedMinutes: number;
  learningObjective: string;
  /** Plain-language notes on what's already accessible — e.g. "Fully keyboard playable", "No color-only cues". Not a compliance claim, a description of what was actually built. */
  accessibilityNotes?: string[];
  featured: boolean;
  publicationStatus: PublicationStatus;
  religiousReview: ReligiousReviewStatus;
}

/** Same gate used everywhere else: draft never shows, Qur'an-category games require explicit human verification. */
export function isGamePublished(game: Game): boolean {
  if (game.publicationStatus !== "published") return false;

  const requiresReligiousReview = game.category
    ? (RELIGIOUS_REVIEW_REQUIRED_CATEGORIES as readonly string[]).includes(game.category)
    : false;

  if (requiresReligiousReview && game.religiousReview !== "verified") {
    return false;
  }

  return true;
}
