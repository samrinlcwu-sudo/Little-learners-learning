/**
 * The reusable content model every future learning resource (lesson,
 * worksheet, game, ebook, ...) will conform to, regardless of which
 * category it belongs to or where it's eventually stored (this file has
 * no dependency on Supabase — the shape is the contract, the storage is
 * an implementation detail decided later).
 */

export type ContentType =
  | "lesson"
  | "worksheet"
  | "activity"
  | "ebook"
  | "writing-practice"
  | "puzzle"
  | "maze"
  | "coloring"
  | "game"
  | "parent-resource"
  | "teacher-resource";

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  lesson: "Lessons",
  worksheet: "Worksheets",
  activity: "Activities",
  ebook: "Ebooks",
  "writing-practice": "Writing Practice",
  puzzle: "Puzzles",
  maze: "Mazes",
  coloring: "Coloring",
  game: "Games",
  "parent-resource": "Parent Resources",
  "teacher-resource": "Teacher Resources",
};

export type DifficultyLevel = "beginner" | "intermediate" | "advanced";

export type PublicationStatus = "draft" | "published" | "archived";

/**
 * Every piece of Qur'an/Islamic content must carry this status, and only
 * "verified" content may ever render on a public route. Never set to
 * "verified" automatically or by generating content — a qualified human
 * makes that call. See `isPubliclyVisible` below, which enforces it.
 */
export type ReligiousReviewStatus = "not-applicable" | "pending-review" | "verified";

/**
 * A flexible numeric range rather than a fixed enum (e.g. "toddler",
 * "preschool") — content declares its own applicable ages instead of the
 * whole app being built around one age group.
 */
export interface AgeRange {
  minYears: number;
  maxYears: number;
}

export interface ContentAuthor {
  name: string;
  role: "platform" | "teacher";
  /** Set once teacher accounts exist; a platform-authored item has none. */
  teacherId?: string;
}

export interface LearningContent {
  id: string;
  /** URL-safe, unique within its category — used to build /learn/[category]/[slug]. */
  slug: string;
  title: string;
  description: string;
  /** References a LearningCategory slug from src/config/learning-categories.ts. */
  category: string;
  subcategory?: string;
  ageRange: AgeRange;
  learningObjective: string;
  difficulty: DifficultyLevel;
  contentType: ContentType;
  thumbnail?: string;
  preview?: string;
  tags: string[];
  author: ContentAuthor;
  publicationStatus: PublicationStatus;
  /** Required (not "not-applicable") for anything under a Qur'an/Arabic category. */
  religiousReview: ReligiousReviewStatus;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Category slugs whose content must pass religious review before publishing. */
export const RELIGIOUS_REVIEW_REQUIRED_CATEGORIES = [
  "quran-nazra",
  "arabic-letters",
  "foundational-quran-reading",
] as const;

/**
 * The single gate every rendering path (pages, sitemap, search) must call
 * before showing a piece of content. Draft content never shows; religious
 * content additionally requires human verification.
 */
export function isPubliclyVisible(content: LearningContent): boolean {
  if (content.publicationStatus !== "published") return false;

  const requiresReligiousReview = (
    RELIGIOUS_REVIEW_REQUIRED_CATEGORIES as readonly string[]
  ).includes(content.category);

  if (requiresReligiousReview && content.religiousReview !== "verified") {
    return false;
  }

  return true;
}
