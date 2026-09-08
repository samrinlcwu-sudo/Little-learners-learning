import type { PublicTeacherProfile } from "./teacher-public-profile";

/**
 * Where the /teachers directory's results would come from. Today there is
 * no shared backend — every teacher profile lives only in the browser
 * that created it (docs/TEACHER_ARCHITECTURE.md) — so there is no
 * cross-visitor data source this function could honestly read from, and
 * it always returns an empty list. This is not a placeholder bug: Prompt
 * 29 explicitly requires "do not populate the directory with fake
 * teachers... create an excellent empty state instead," and an
 * always-empty, real result is exactly that, correctly.
 *
 * Once Supabase (or any real backend) exists, this becomes:
 *
 *   const { data } = await supabase
 *     .from("teacher_profiles")
 *     .select(PUBLIC_TEACHER_COLUMNS)
 *     .eq("visibility", "public")
 *     .eq("moderation_status", "approved")
 *     .range(offset, offset + pageSize - 1);
 *
 * — filtered and paginated server-side, matching exactly what
 * `canListTeacherInDirectory()` (src/lib/accounts/teacher-visibility.ts)
 * already expresses as the listing rule. Nothing calling this function
 * needs to change: it already returns `PublicTeacherProfile[]`, the same
 * narrow, privacy-safe shape the real query would select.
 */
export function getApprovedTeacherDirectoryEntries(): PublicTeacherProfile[] {
  return [];
}
