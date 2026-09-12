import { isOfferingPubliclyVisible, type Offering, type OfferingType } from "./types";
import type { AccessTier } from "@/lib/resources/types";

export interface OfferingFilters {
  query?: string;
  type?: OfferingType;
  learningArea?: string;
  accessLevel?: AccessTier;
}

/**
 * Same "pure function over an array" contract as `filterResources()`
 * (src/lib/resources/filters.ts) and `filterTeacherDirectory()` — real
 * logic, unit-tested, ready to move server-side as a real query's WHERE
 * clause the moment a real offering catalog exists. Every offering
 * returned by `getAllOfferings()` is filtered through
 * `isOfferingPubliclyVisible()` first, exactly like `filterResources()`
 * always calls `isResourcePublished()` before applying any other filter.
 */
export function filterOfferings(items: Offering[], filters: OfferingFilters): Offering[] {
  return items.filter((item) => {
    if (!isOfferingPubliclyVisible(item)) return false;
    if (filters.type && item.type !== filters.type) return false;
    if (filters.accessLevel && item.accessLevel !== filters.accessLevel) return false;
    if (filters.learningArea && !item.learningAreas.includes(filters.learningArea)) return false;
    if (filters.query) {
      const q = filters.query.trim().toLowerCase();
      const haystack = `${item.name} ${item.description}`.toLowerCase();
      if (q && !haystack.includes(q)) return false;
    }
    return true;
  });
}
