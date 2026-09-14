import type { AdminResourceRow, AdminResourceSource } from "./admin-resource-rows";
import type { AccessTier, ResourceType } from "./types";
import type { DifficultyLevel, PublicationStatus } from "@/lib/content/types";

/**
 * The admin content library's filter shape — deliberately the opposite of
 * `ResourceFilters` (src/lib/resources/filters.ts), which always gates
 * through `isResourcePublished()` for public visitors. An admin reviewing
 * the library needs to find drafts, in-review, and archived resources too,
 * so this never calls that gate — `status` here is just another filter,
 * not a visibility rule.
 */
export interface AdminResourceFilters {
  query?: string;
  category?: string;
  resourceType?: ResourceType;
  ageYears?: number;
  difficulty?: DifficultyLevel;
  accessTier?: AccessTier;
  status?: PublicationStatus;
  source?: AdminResourceSource;
}

export function filterAdminResourceRows(rows: AdminResourceRow[], filters: AdminResourceFilters): AdminResourceRow[] {
  return rows.filter(({ resource, source }) => {
    if (filters.category && resource.category !== filters.category) return false;
    if (filters.resourceType && resource.resourceType !== filters.resourceType) return false;
    if (filters.difficulty && resource.difficulty !== filters.difficulty) return false;
    if (filters.accessTier && resource.accessTier !== filters.accessTier) return false;
    if (filters.status && resource.publicationStatus !== filters.status) return false;
    if (filters.source && source !== filters.source) return false;
    if (
      filters.ageYears != null &&
      (filters.ageYears < resource.ageRange.minYears || filters.ageYears > resource.ageRange.maxYears)
    ) {
      return false;
    }
    if (filters.query) {
      const q = filters.query.trim().toLowerCase();
      const haystack = `${resource.title} ${resource.description}`.toLowerCase();
      if (q && !haystack.includes(q)) return false;
    }
    return true;
  });
}
