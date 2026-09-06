import {
  RELIGIOUS_REVIEW_REQUIRED_CATEGORIES,
  type AgeRange,
  type ContentAuthor,
  type ContentType,
  type DifficultyLevel,
  type PublicationStatus,
  type ReligiousReviewStatus,
} from "@/lib/content/types";

/**
 * The downloadable/consumable subset of ContentType — a resource is
 * something you'd browse in a library and take away, unlike an interactive
 * `lesson` or `game`. Derived with `Extract` (not redeclared) so it can
 * never drift from the master ContentType union in src/lib/content/types.ts.
 */
export type ResourceType = Extract<
  ContentType,
  | "worksheet"
  | "activity"
  | "ebook"
  | "puzzle"
  | "maze"
  | "coloring"
  | "writing-practice"
  | "teacher-resource"
  | "parent-resource"
>;

export const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
  worksheet: "Worksheet",
  activity: "Activity",
  ebook: "Ebook",
  puzzle: "Puzzle",
  maze: "Maze",
  coloring: "Coloring",
  "writing-practice": "Writing Practice",
  "teacher-resource": "Teacher Resource",
  "parent-resource": "Parent Resource",
};

/**
 * The future business model this architecture supports — no payment
 * processing exists yet (Prompt 9 explicitly excludes it), but every
 * resource already declares which tier it belongs to.
 */
export type AccessTier = "free" | "premium" | "membership";

export const ACCESS_TIER_LABELS: Record<AccessTier, string> = {
  free: "Free",
  premium: "Premium",
  membership: "Membership",
};

export interface Resource {
  id: string;
  /** URL-safe, unique across the whole library — drives /resources/[slug]. */
  slug: string;
  title: string;
  description: string;
  resourceType: ResourceType;
  /** A learning-category slug (src/config/learning-categories.ts), when this resource belongs to one of the 16 subjects. */
  category?: string;
  subcategory?: string;
  /** Free-text label for resources that don't map to a learning category — e.g. "Classroom Management" for a teacher resource. */
  subject?: string;
  ageRange: AgeRange;
  difficulty: DifficultyLevel;
  learningObjective: string;
  tags: string[];
  thumbnail?: string;
  preview?: string;
  /**
   * Only set once a real file has been uploaded somewhere real (e.g.
   * Supabase Storage). Every UI must treat its absence as "no download
   * exists" — never render a working download action without it.
   */
  downloadFile?: string;
  author: ContentAuthor;
  accessTier: AccessTier;
  featured: boolean;
  publicationStatus: PublicationStatus;
  religiousReview: ReligiousReviewStatus;
  createdAt: string;
  updatedAt: string;
}

/** Same gate as learning content: draft never shows, Qur'an-category resources require explicit human verification. */
export function isResourcePublished(resource: Resource): boolean {
  if (resource.publicationStatus !== "published") return false;

  const requiresReligiousReview = resource.category
    ? (RELIGIOUS_REVIEW_REQUIRED_CATEGORIES as readonly string[]).includes(resource.category)
    : false;

  if (requiresReligiousReview && resource.religiousReview !== "verified") {
    return false;
  }

  return true;
}

/**
 * Whether a real download action can be shown. Deliberately conservative:
 * even a free, published resource needs an actual file — access tier
 * beyond "free" can't be enforced yet (no accounts/payments exist), so
 * premium/membership resources never show a working action regardless of
 * whether a file is attached.
 */
export function canDownload(resource: Resource): boolean {
  return isResourcePublished(resource) && resource.accessTier === "free" && Boolean(resource.downloadFile);
}
