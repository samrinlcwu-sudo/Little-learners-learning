import type { AgeRange, DifficultyLevel } from "@/lib/content/types";

/**
 * The AI-facing projection of a real resource or game — slug/title/href
 * plus the fields useful for matching a question against ("suitable for
 * this age", "beginner or advanced"), never the full record. Mirrors the
 * same allowlist-projection pattern as `toPublicTeacherProfile`
 * (src/lib/accounts/teacher-public-profile.ts): a deliberate, narrow shape
 * rather than passing the whole `Resource`/`Game` through.
 */
export interface KnowledgeItemRef {
  id: string;
  slug: string;
  title: string;
  href: string;
  ageRange: AgeRange;
  difficulty: DifficultyLevel;
}

/**
 * One learning area (a category from src/config/learning-categories.ts)
 * with its real published content attached — the "Learning Area → Age
 * Group → Learning Objective → Resource → Activity → Game" chain from the
 * Prompt 47 brief, built entirely from data that already exists. See
 * docs/AI_KNOWLEDGE_LAYER_ARCHITECTURE.md.
 */
export interface LearningAreaKnowledge {
  slug: string;
  name: string;
  description: string;
  ageRange: AgeRange;
  learningObjectives: string[];
  /** Every published resource in this area, of any resourceType. */
  resources: KnowledgeItemRef[];
  /** The subset of `resources` whose resourceType is specifically "activity". */
  activities: KnowledgeItemRef[];
  games: KnowledgeItemRef[];
}
