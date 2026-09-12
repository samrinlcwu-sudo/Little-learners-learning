"use client";

import * as React from "react";
import { useAdminTeacherAccounts } from "./admin-teacher-directory";
import { useChildProfiles } from "./use-child-profiles";
import type { AccountStatus } from "./types";

/**
 * The unified admin "Users" view (Prompt 57, docs/ADMIN_ARCHITECTURE.md).
 * Combines the two real, stored account-like records this app actually
 * has — `TeacherProfile` and `ChildProfile` — into one comparable row
 * shape for a single searchable list, real fields only.
 *
 * Two user types the brief names are deliberately absent from this list,
 * both explained in docs/ADMIN_ARCHITECTURE.md rather than faked here:
 * "Parent" has no persisted account record anywhere in this codebase
 * (sign-up validates and discards everything — docs/ACCOUNTS_ARCHITECTURE.md
 * — only a fixed placeholder id links a child to "their" parent), so
 * there is no real name, email, or registration date to show for one; and
 * "Administrator" has no stored account either — there's a single shared
 * admin passphrase (`src/lib/admin/session.ts`), not a multi-admin table.
 * Inventing rows for either would be exactly the fake user data the brief
 * forbids.
 */
export type AdminUserRole = "teacher" | "child";

export interface AdminUserRow {
  id: string;
  role: AdminUserRole;
  name: string;
  accountStatus: AccountStatus;
  registeredAt: string;
  /** One short, real, non-sensitive line — an email for a teacher, an age for a child. Never a child's activity history (see docs/ADMIN_ARCHITECTURE.md, "Child privacy"). */
  summary: string;
  detailHref: string;
}

export function useAdminUserRows(): { rows: AdminUserRow[]; ready: boolean } {
  const { teachers, ready: teachersReady } = useAdminTeacherAccounts();
  const { children, ready: childrenReady } = useChildProfiles();

  const rows = React.useMemo<AdminUserRow[]>(() => {
    const teacherRows: AdminUserRow[] = teachers.map((teacher) => ({
      id: teacher.id,
      role: "teacher",
      name: teacher.name,
      accountStatus: teacher.accountStatus,
      registeredAt: teacher.createdAt,
      summary: teacher.email,
      detailHref: `/admin/teachers/${teacher.id}`,
    }));
    const childRows: AdminUserRow[] = children.map((child) => ({
      id: child.id,
      role: "child",
      name: child.name,
      accountStatus: child.accountStatus,
      registeredAt: child.createdAt,
      summary: `${child.ageYears} year${child.ageYears === 1 ? "" : "s"} old`,
      detailHref: `/admin/users/children/${child.id}`,
    }));
    return [...teacherRows, ...childRows];
  }, [teachers, children]);

  return { rows, ready: teachersReady && childrenReady };
}
