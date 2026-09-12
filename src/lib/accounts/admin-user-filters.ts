import type { AccountStatus } from "./types";
import type { AdminUserRole, AdminUserRow } from "./admin-user-rows";

/** Same "pure function over an array" contract as every other admin/directory filter in this codebase (e.g. `filterAdminTeachers`). */
export interface AdminUserFilters {
  query?: string;
  role?: AdminUserRole;
  accountStatus?: AccountStatus;
}

export function filterAdminUsers(rows: AdminUserRow[], filters: AdminUserFilters): AdminUserRow[] {
  return rows.filter((row) => {
    if (filters.role && row.role !== filters.role) return false;
    if (filters.accountStatus && row.accountStatus !== filters.accountStatus) return false;

    if (filters.query) {
      const q = filters.query.trim().toLowerCase();
      const haystack = `${row.name} ${row.summary}`.toLowerCase();
      if (q && !haystack.includes(q)) return false;
    }

    return true;
  });
}
