import {
  isPubliclyVisible,
  type ContentType,
  type DifficultyLevel,
  type LearningContent,
} from "./types";

/**
 * The shape every future search/filter UI (global search, category search,
 * age/difficulty/tag filters) will send. Deliberately storage-agnostic: it
 * works the same whether it's filtering an in-memory array today or
 * becoming a Postgres query's WHERE clause later.
 */
export interface ContentFilters {
  query?: string;
  category?: string;
  ageYears?: number;
  difficulty?: DifficultyLevel;
  contentType?: ContentType;
  tags?: string[];
}

/**
 * Simple in-memory filtering — deliberately not a search engine. Fine for
 * small in-memory lists (e.g. a "featured" row); once real content lives in
 * Supabase, replace the body with a SQL query using the same `ContentFilters`
 * shape so calling code doesn't change.
 */
export function filterContent(
  items: LearningContent[],
  filters: ContentFilters,
): LearningContent[] {
  return items.filter((item) => {
    if (!isPubliclyVisible(item)) return false;
    if (filters.category && item.category !== filters.category) return false;
    if (filters.contentType && item.contentType !== filters.contentType) return false;
    if (filters.difficulty && item.difficulty !== filters.difficulty) return false;
    if (
      filters.ageYears != null &&
      (filters.ageYears < item.ageRange.minYears || filters.ageYears > item.ageRange.maxYears)
    ) {
      return false;
    }
    if (filters.tags?.length && !filters.tags.every((tag) => item.tags.includes(tag))) {
      return false;
    }
    if (filters.query) {
      const q = filters.query.trim().toLowerCase();
      const haystack = `${item.title} ${item.description}`.toLowerCase();
      if (q && !haystack.includes(q)) return false;
    }
    return true;
  });
}
