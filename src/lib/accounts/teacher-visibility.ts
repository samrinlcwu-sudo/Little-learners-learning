import type { TeacherProfile } from "./types";

/**
 * The same two-gate shape as `isResourcePublished()`
 * (src/lib/resources/types.ts) and `isGamePublished()`
 * (src/lib/games/types.ts): one real function every public-facing path
 * calls, so "should this be visible" is never re-implemented (and never
 * silently diverges) at each call site.
 *
 * Whether a profile can be viewed at all, via its direct link
 * (/teachers/p/[slug]). Requires the account not be admin-deactivated
 * (Prompt 57, docs/ADMIN_ARCHITECTURE.md), the teacher's own opt-in
 * (`visibility === "public"`), AND that moderation hasn't actively
 * blocked it. "pending" still passes — an unreviewed profile is visible
 * via direct link (innocent until reviewed), it just isn't listed in the
 * searchable directory yet (see `canListTeacherInDirectory` below).
 */
export function canViewTeacherProfile(teacher: TeacherProfile): boolean {
  if (teacher.accountStatus === "deactivated") return false;
  if (teacher.visibility !== "public") return false;
  return teacher.moderationStatus !== "rejected" && teacher.moderationStatus !== "hidden";
}

/**
 * Whether a profile appears in the searchable directory (/teachers) —
 * strictly narrower than `canViewTeacherProfile`: being viewable via a
 * direct link isn't the same as being discoverable through search, which
 * requires an actual human "approved" decision — real since Prompt 56's
 * admin review tool. See docs/TEACHER_DIRECTORY_ARCHITECTURE.md for why
 * the directory itself still shows nothing even so.
 */
export function canListTeacherInDirectory(teacher: TeacherProfile): boolean {
  return canViewTeacherProfile(teacher) && teacher.moderationStatus === "approved";
}
