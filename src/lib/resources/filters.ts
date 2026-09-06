import { isResourcePublished, type AccessTier, type Resource, type ResourceType } from "./types";
import type { DifficultyLevel } from "@/lib/content/types";

export interface ResourceFilters {
  query?: string;
  category?: string;
  resourceType?: ResourceType;
  ageYears?: number;
  difficulty?: DifficultyLevel;
  accessTier?: AccessTier;
}

export type ResourceSort = "newest" | "oldest" | "title-asc";

export const DEFAULT_PAGE_SIZE = 12;

/**
 * Plain in-memory filtering, same contract as filterContent — this is
 * intentionally the pattern that will move server-side (a SQL WHERE
 * clause) once resources live in a real database. Nothing calling this
 * needs to change when that happens.
 */
export function filterResources(items: Resource[], filters: ResourceFilters): Resource[] {
  return items.filter((item) => {
    if (!isResourcePublished(item)) return false;
    if (filters.category && item.category !== filters.category) return false;
    if (filters.resourceType && item.resourceType !== filters.resourceType) return false;
    if (filters.difficulty && item.difficulty !== filters.difficulty) return false;
    if (filters.accessTier && item.accessTier !== filters.accessTier) return false;
    if (
      filters.ageYears != null &&
      (filters.ageYears < item.ageRange.minYears || filters.ageYears > item.ageRange.maxYears)
    ) {
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

export function sortResources(items: Resource[], sort: ResourceSort = "newest"): Resource[] {
  const sorted = [...items];
  switch (sort) {
    case "oldest":
      return sorted.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    case "title-asc":
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case "newest":
    default:
      return sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  pageCount: number;
  totalCount: number;
}

/**
 * Slices the already-filtered/sorted list to one page. Deliberately a
 * pure function over an in-memory array today — the shape (page in,
 * {items, page, pageCount, totalCount} out) is what a Supabase
 * `.range()` query will return later, so callers don't change.
 */
export function paginateResources<T>(
  items: T[],
  page: number,
  pageSize: number = DEFAULT_PAGE_SIZE,
): PaginatedResult<T> {
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(Math.max(1, page), pageCount);
  const start = (safePage - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    page: safePage,
    pageCount,
    totalCount: items.length,
  };
}
