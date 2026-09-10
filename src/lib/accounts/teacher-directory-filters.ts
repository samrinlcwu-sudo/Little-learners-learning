import type { PublicTeacherProfile } from "./teacher-public-profile";
import type { TeacherAgeGroup, TeacherLanguage, TeachingInterest } from "./types";

export interface TeacherDirectoryFilters {
  /** Matches against name, headline, bio, and country/region — see Prompt 29 Part 2's "region where appropriate." */
  query?: string;
  subject?: string;
  ageGroup?: TeacherAgeGroup;
  language?: TeacherLanguage;
  /** Free-text substring match against `expertise` — that field is itself free text, so a fixed dropdown wouldn't fit it. */
  expertise?: string;
  /** A fixed option, unlike `expertise` — teachingInterests is a multi-select from TEACHING_INTEREST_OPTIONS, so this filters by exact id (Prompt 43). */
  teachingInterest?: TeachingInterest;
}

export const DEFAULT_DIRECTORY_PAGE_SIZE = 12;

/**
 * Same contract and shape as `filterResources()` (src/lib/resources/filters.ts)
 * — plain in-memory filtering today, the exact WHERE-clause logic a real
 * database query applies later. Every teacher passed in is assumed
 * already approved for listing (see `canListTeacherInDirectory` in
 * teacher-visibility.ts) — this function only narrows by search/filter,
 * it doesn't re-check visibility.
 */
export function filterTeacherDirectory(
  entries: PublicTeacherProfile[],
  filters: TeacherDirectoryFilters,
): PublicTeacherProfile[] {
  return entries.filter((entry) => {
    if (filters.subject && !entry.subjects.includes(filters.subject)) return false;
    if (filters.ageGroup && !entry.ageGroupsTaught.includes(filters.ageGroup)) return false;
    if (filters.language && !entry.languages.includes(filters.language)) return false;

    if (filters.expertise) {
      const q = filters.expertise.trim().toLowerCase();
      if (q && !entry.expertise.some((item) => item.toLowerCase().includes(q))) return false;
    }

    if (filters.teachingInterest && !entry.teachingInterests.includes(filters.teachingInterest)) return false;

    if (filters.query) {
      const q = filters.query.trim().toLowerCase();
      const haystack = `${entry.name} ${entry.headline ?? ""} ${entry.bio ?? ""} ${entry.countryRegion}`.toLowerCase();
      if (q && !haystack.includes(q)) return false;
    }

    return true;
  });
}

export interface PaginatedDirectoryResult {
  items: PublicTeacherProfile[];
  page: number;
  pageCount: number;
  totalCount: number;
}

/**
 * Same shape as `paginateResources()` — a pure slice today, the shape a
 * `.range()` query returns later (Prompt 29 Part 10: "prepare the
 * architecture for pagination... as the number of teachers grows").
 */
export function paginateTeacherDirectory(
  entries: PublicTeacherProfile[],
  page: number,
  pageSize: number = DEFAULT_DIRECTORY_PAGE_SIZE,
): PaginatedDirectoryResult {
  const pageCount = Math.max(1, Math.ceil(entries.length / pageSize));
  const safePage = Math.min(Math.max(1, page), pageCount);
  const start = (safePage - 1) * pageSize;

  return {
    items: entries.slice(start, start + pageSize),
    page: safePage,
    pageCount,
    totalCount: entries.length,
  };
}
