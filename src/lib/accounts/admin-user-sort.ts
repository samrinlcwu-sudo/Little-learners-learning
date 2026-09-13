import type { AdminUserRow } from "./admin-user-rows";

/** Same convention and default as `ResourceSort`/`sortResources()` (src/lib/resources/filters.ts). */
export type AdminUserSort = "newest" | "oldest" | "name-asc";

export const ADMIN_USER_SORT_LABELS: Record<AdminUserSort, string> = {
  newest: "Newest first",
  oldest: "Oldest first",
  "name-asc": "Name (A–Z)",
};

export function sortAdminUsers(rows: AdminUserRow[], sort: AdminUserSort = "newest"): AdminUserRow[] {
  const sorted = [...rows];
  switch (sort) {
    case "oldest":
      return sorted.sort((a, b) => a.registeredAt.localeCompare(b.registeredAt));
    case "name-asc":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case "newest":
    default:
      return sorted.sort((a, b) => b.registeredAt.localeCompare(a.registeredAt));
  }
}
