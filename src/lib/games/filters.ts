import { isGamePublished, type Game, type GameType } from "./types";
import type { AccessTier } from "@/lib/resources/types";
import type { DifficultyLevel } from "@/lib/content/types";

/**
 * The public-facing games filter (Prompt 72) — same shape and gate as
 * `filterResources`/`filterArticles`, filling the one gap those two
 * content types didn't have: games had only ad-hoc inline filtering in
 * `GamesBrowser` (a client component) and an admin-only filter
 * (`admin-game-filters.ts`, which deliberately never gates on
 * `isGamePublished` since admin needs to see unpublished ones). This is
 * the real, published-only counterpart every other content type already
 * had, added so the new site-wide search page (`/search`) can filter
 * games the same consistent way it filters resources and articles.
 */
export interface GameFilters {
  query?: string;
  category?: string;
  gameType?: GameType;
  ageYears?: number;
  difficulty?: DifficultyLevel;
  accessTier?: AccessTier;
}

export function filterGames(items: Game[], filters: GameFilters): Game[] {
  return items.filter((item) => {
    if (!isGamePublished(item)) return false;
    if (filters.category && item.category !== filters.category) return false;
    if (filters.gameType && item.gameType !== filters.gameType) return false;
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
      const haystack = `${item.title} ${item.description} ${item.skill}`.toLowerCase();
      if (q && !haystack.includes(q)) return false;
    }
    return true;
  });
}

export type GameSort = "newest" | "title-asc";

/** Games don't carry a `createdAt` (they're hand-built, not dated content — see src/lib/games/types.ts), so "newest" here means declaration order, the same order SAMPLE_GAMES already lists them in everywhere else. */
export function sortGames(items: Game[], sort: GameSort = "newest"): Game[] {
  if (sort === "title-asc") {
    return [...items].sort((a, b) => a.title.localeCompare(b.title));
  }
  return items;
}

export interface PaginatedGames<T> {
  items: T[];
  page: number;
  pageCount: number;
  totalCount: number;
}

export const DEFAULT_GAME_PAGE_SIZE = 12;

export function paginateGames<T>(
  items: T[],
  page: number,
  pageSize: number = DEFAULT_GAME_PAGE_SIZE,
): PaginatedGames<T> {
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  // See paginateResources (src/lib/resources/filters.ts) for why this
  // guards against non-finite input rather than trusting every caller to
  // have already sanitized a URL query param.
  const requestedPage = Number.isFinite(page) ? page : 1;
  const safePage = Math.min(Math.max(1, requestedPage), pageCount);
  const start = (safePage - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    page: safePage,
    pageCount,
    totalCount: items.length,
  };
}
