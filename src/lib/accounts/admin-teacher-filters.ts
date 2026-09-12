import type { TeacherAgeGroup, TeacherLanguage, TeacherModerationStatus, TeacherProfile } from "./types";

/**
 * The admin equivalent of `TeacherDirectoryFilters`
 * (src/lib/accounts/teacher-directory-filters.ts) — same shape and same
 * "pure function over an array" contract, but over the full private
 * `TeacherProfile`, not the redacted `PublicTeacherProfile` the family-
 * facing directory searches. Admin review needs to search and filter by
 * moderation state too, which is never exposed publicly.
 */
export interface AdminTeacherFilters {
  /** Matches against name, email, headline, bio, and country/region. */
  query?: string;
  subject?: string;
  ageGroup?: TeacherAgeGroup;
  language?: TeacherLanguage;
  expertise?: string;
  moderationStatus?: TeacherModerationStatus;
}

/**
 * Real logic, ready to move server-side as a real query's WHERE clause
 * without any caller changing — same contract as
 * `filterTeacherDirectory()`. Every teacher passed in is assumed already
 * within this admin's authorized scope; this only narrows by search/filter.
 */
export function filterAdminTeachers(entries: TeacherProfile[], filters: AdminTeacherFilters): TeacherProfile[] {
  return entries.filter((entry) => {
    if (filters.subject && !entry.subjects.includes(filters.subject)) return false;
    if (filters.ageGroup && !entry.ageGroupsTaught.includes(filters.ageGroup)) return false;
    if (filters.language && !entry.languages.includes(filters.language)) return false;
    if (filters.moderationStatus && entry.moderationStatus !== filters.moderationStatus) return false;

    if (filters.expertise) {
      const q = filters.expertise.trim().toLowerCase();
      if (q && !entry.expertise.some((item) => item.toLowerCase().includes(q))) return false;
    }

    if (filters.query) {
      const q = filters.query.trim().toLowerCase();
      const haystack = `${entry.name} ${entry.email} ${entry.headline ?? ""} ${entry.bio ?? ""} ${entry.countryRegion}`.toLowerCase();
      if (q && !haystack.includes(q)) return false;
    }

    return true;
  });
}
