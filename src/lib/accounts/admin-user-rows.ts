"use client";

import * as React from "react";
import { useAdminTeacherAccounts } from "./admin-teacher-directory";
import { useChildProfiles } from "./use-child-profiles";
import { LOCAL_PARENT_ID } from "./local-children";
import type { AccountStatus, ChildProfile } from "./types";

/**
 * The unified admin "Users" view (Prompt 57, extended in Prompt 65 —
 * docs/ADMIN_ARCHITECTURE.md). Combines the real, stored account-like
 * records this app actually has — `TeacherProfile`, `ChildProfile`, and
 * (as of Prompt 65) a derived `"parent"` row grouped from real
 * `ChildProfile.parentAccountId` values — into one comparable row shape
 * for a single searchable list, real fields only.
 *
 * "Administrator" is still deliberately absent from this list: there's a
 * single shared admin passphrase (`src/lib/admin/session.ts`), not a
 * multi-admin table — inventing a row for it would be exactly the fake
 * user data the brief forbids.
 */
export type AdminUserRole = "teacher" | "child" | "parent";

export interface AdminUserRow {
  id: string;
  role: AdminUserRole;
  name: string;
  accountStatus: AccountStatus;
  registeredAt: string;
  /** One short, real, non-sensitive line — an email for a teacher, an age for a child, a child count for a parent. Never a child's activity history (see docs/ADMIN_ARCHITECTURE.md, "Child privacy"). */
  summary: string;
  detailHref: string;
}

/**
 * Groups real child profiles by their real `parentAccountId` into one row
 * per family — never a fabricated name or email (none is ever stored;
 * see docs/ACCOUNTS_ARCHITECTURE.md), and never split into per-child
 * "parent" rows. Every browser in this codebase currently assigns the
 * same fixed placeholder id (`LOCAL_PARENT_ID`,
 * `src/lib/accounts/local-children.ts`) to every child it saves, so this
 * always produces at most one row today — but it's written as a real
 * group-by, not a hardcoded single row, so it stays correct the day a
 * real backend allows more than one family per device.
 *
 * `accountStatus` is a real, derived rollup — `"active"` if any child in
 * the family is active, `"deactivated"` only if every one of them is —
 * never an invented independent status, since no separate parent account
 * record exists to hold one. `registeredAt` is the earliest child's own
 * `createdAt` — the earliest real fact this codebase actually has about
 * when this family started using the platform.
 */
export function buildParentRows(children: ChildProfile[]): AdminUserRow[] {
  const groups = new Map<string, ChildProfile[]>();
  for (const child of children) {
    const group = groups.get(child.parentAccountId);
    if (group) {
      group.push(child);
    } else {
      groups.set(child.parentAccountId, [child]);
    }
  }

  return Array.from(groups.entries()).map(([parentAccountId, kids]) => {
    const registeredAt = kids.reduce(
      (earliest, kid) => (kid.createdAt < earliest ? kid.createdAt : earliest),
      kids[0].createdAt,
    );
    return {
      id: parentAccountId,
      role: "parent" as const,
      name: parentAccountId === LOCAL_PARENT_ID ? "Parent (this device)" : parentAccountId,
      accountStatus: kids.some((kid) => kid.accountStatus === "active") ? "active" : "deactivated",
      registeredAt,
      summary: `${kids.length} child${kids.length === 1 ? "" : "ren"}`,
      detailHref: `/admin/users/parents/${parentAccountId}`,
    };
  });
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
    return [...teacherRows, ...childRows, ...buildParentRows(children)];
  }, [teachers, children]);

  return { rows, ready: teachersReady && childrenReady };
}
