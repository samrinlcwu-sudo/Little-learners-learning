import { getAllLearningCategories, getLearningCategoryBySlug, type LearningCategory } from "@/config/learning-categories";
import { getAllTeacherAgeGroupOptions } from "@/config/teacher-options";
import { getCategoryJourney } from "@/lib/learning-journey";
import { filterResources } from "@/lib/resources/filters";
import { SAMPLE_RESOURCES } from "@/lib/resources/sample-resources";
import type { Resource } from "@/lib/resources/types";
import { SAMPLE_GAMES } from "@/lib/games/sample-games";
import { isGamePublished, type Game } from "@/lib/games/types";
import type { TeacherAgeGroup } from "@/lib/accounts/types";
import type { KnowledgeItemRef, LearningAreaKnowledge } from "./types";

/**
 * Public educational content only — every function here reads exclusively
 * from data that's already safe for anyone to see (published resources and
 * games, the categories themselves). Nothing in this file ever touches a
 * child's, parent's, or teacher's private data; see progress-knowledge.ts
 * and teacher-knowledge.ts for those, which are deliberately separate
 * modules so a caller can never blur "public" with "private" by importing
 * the wrong function. See docs/AI_KNOWLEDGE_LAYER_ARCHITECTURE.md.
 */

function toResourceRef(resource: Resource): KnowledgeItemRef {
  return {
    id: resource.id,
    slug: resource.slug,
    title: resource.title,
    href: `/resources/${resource.slug}`,
    ageRange: resource.ageRange,
    difficulty: resource.difficulty,
  };
}

function toGameRef(game: Game): KnowledgeItemRef {
  return {
    id: game.id,
    slug: game.slug,
    title: game.title,
    href: `/games/${game.slug}`,
    ageRange: game.ageRange,
    difficulty: game.difficulty,
  };
}

/**
 * Builds one learning area's knowledge from `getCategoryJourney` — the
 * same real, already-published-filtered content the category page itself
 * renders (src/app/learn/[category]/page.tsx) — reshaped into the slim,
 * AI-facing `KnowledgeItemRef` projection. Deliberately reuses
 * `getCategoryJourney` rather than re-filtering SAMPLE_RESOURCES/
 * SAMPLE_GAMES a second time, so there is exactly one place that decides
 * what counts as "this category's published content."
 */
export function getLearningAreaKnowledge(slug: string): LearningAreaKnowledge | null {
  const category = getLearningCategoryBySlug(slug);
  const journey = getCategoryJourney(slug);
  if (!category || !journey) return null;

  const resources = journey.resources.map(toResourceRef);
  const activities = journey.resources.filter((r) => r.resourceType === "activity").map(toResourceRef);
  const games = journey.games.map(toGameRef);

  return {
    slug: category.slug,
    name: category.name,
    description: category.description,
    ageRange: category.ageRange,
    learningObjectives: category.learningObjectives,
    resources,
    activities,
    games,
  };
}

export function getAllLearningAreaKnowledge(): LearningAreaKnowledge[] {
  return getAllLearningCategories()
    .map((category) => getLearningAreaKnowledge(category.slug))
    .filter((area): area is LearningAreaKnowledge => area !== null);
}

function ageOverlapsRange(category: LearningCategory, minYears: number, maxYears: number): boolean {
  return category.ageRange.minYears <= maxYears && minYears <= category.ageRange.maxYears;
}

/** Answers "what's suitable for a child this age" — a single age in years, e.g. a real child's `ageYears`. */
export function getLearningAreasForAge(ageYears: number): LearningAreaKnowledge[] {
  return getAllLearningCategories()
    .filter((category) => ageOverlapsRange(category, ageYears, ageYears))
    .map((category) => getLearningAreaKnowledge(category.slug))
    .filter((area): area is LearningAreaKnowledge => area !== null);
}

/**
 * Answers "what's available for preschool children" — a named band, using
 * the same real age ranges a teacher's own profile already uses
 * (TEACHER_AGE_GROUP_OPTIONS, src/config/teacher-options.ts) rather than
 * inventing a second definition of "preschool."
 */
export function getLearningAreasForNamedAgeGroup(ageGroupId: TeacherAgeGroup): LearningAreaKnowledge[] {
  const option = getAllTeacherAgeGroupOptions().find((o) => o.id === ageGroupId);
  if (!option) return [];
  return getAllLearningCategories()
    .filter((category) => ageOverlapsRange(category, option.ageRange.minYears, option.ageRange.maxYears))
    .map((category) => getLearningAreaKnowledge(category.slug))
    .filter((area): area is LearningAreaKnowledge => area !== null);
}

/** Answers "which resources are related to counting" — reuses the same query matching the Resource Library's own search already does. */
export function findResourcesByKeyword(keyword: string): KnowledgeItemRef[] {
  return filterResources(SAMPLE_RESOURCES, { query: keyword }).map(toResourceRef);
}

/** Same idea for games — no equivalent filter utility exists yet for games, so this is the one place that matches a keyword against a game's title/description/skill. */
export function findGamesByKeyword(keyword: string): KnowledgeItemRef[] {
  const q = keyword.trim().toLowerCase();
  if (!q) return [];
  return SAMPLE_GAMES.filter(
    (game) => isGamePublished(game) && `${game.title} ${game.description} ${game.skill}`.toLowerCase().includes(q),
  ).map(toGameRef);
}
