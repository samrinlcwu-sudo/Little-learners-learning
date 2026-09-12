"use client";

import * as React from "react";
import { useTeacherProfile } from "./use-teacher-profile";
import type { TeacherProfile } from "./types";

/**
 * Every teacher account this admin view can see — deliberately the
 * opposite filter from `getApprovedTeacherDirectoryEntries()`
 * (src/lib/accounts/teacher-directory.ts), which only ever returns
 * public, approved profiles. An admin review tool exists specifically to
 * look at everything the public directory hides: pending, private, even
 * rejected profiles. See docs/ADMIN_ARCHITECTURE.md.
 *
 * There is still no shared backend (src/lib/supabase/is-configured.ts),
 * so this browser can only ever see the one teacher account it holds
 * itself (src/lib/accounts/local-teacher.ts) — never another browser's.
 * Once a real database exists, this becomes a real
 * `supabase.from("teacher_profiles").select("*")` with no visibility/
 * moderation filter at all (an admin's Row Level Security policy bypasses
 * both gates, unlike a family's or a teacher's own scoped policy) — the
 * shape returned here (`TeacherProfile[]`) already matches that query's
 * result, so nothing calling this hook needs to change later.
 */
export function useAdminTeacherAccounts(): { teachers: TeacherProfile[]; ready: boolean } {
  const { teacher, ready } = useTeacherProfile();
  const teachers = React.useMemo(() => (teacher ? [teacher] : []), [teacher]);
  return { teachers, ready };
}
