import { isArticlePublished, type BlogArticle, type BlogAudience } from "./types";

/**
 * Same "plain in-memory filtering today, a WHERE clause later" contract as
 * filterResources/filterContent (src/lib/resources/filters.ts,
 * src/lib/content/filters.ts).
 */
export interface BlogFilters {
  query?: string;
  topic?: string;
  category?: string;
  audience?: BlogAudience;
  tag?: string;
}

export type BlogSort = "newest" | "oldest" | "title-asc";

export const DEFAULT_ARTICLE_PAGE_SIZE = 9;

export function filterArticles(items: BlogArticle[], filters: BlogFilters): BlogArticle[] {
  return items.filter((item) => {
    if (!isArticlePublished(item)) return false;
    if (filters.topic && item.topic !== filters.topic) return false;
    if (filters.category && item.category !== filters.category) return false;
    if (filters.audience && !item.audience.includes(filters.audience)) return false;
    if (filters.tag && !item.tags.includes(filters.tag)) return false;
    if (filters.query) {
      const q = filters.query.trim().toLowerCase();
      const haystack = `${item.title} ${item.excerpt}`.toLowerCase();
      if (q && !haystack.includes(q)) return false;
    }
    return true;
  });
}

export function sortArticles(items: BlogArticle[], sort: BlogSort = "newest"): BlogArticle[] {
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

export interface PaginatedArticles<T> {
  items: T[];
  page: number;
  pageCount: number;
  totalCount: number;
}

export function paginateArticles<T>(
  items: T[],
  page: number,
  pageSize: number = DEFAULT_ARTICLE_PAGE_SIZE,
): PaginatedArticles<T> {
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
