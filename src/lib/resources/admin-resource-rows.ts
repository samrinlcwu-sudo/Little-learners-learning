import type { Resource } from "./types";

/** Where one row in the admin content table actually came from — determines what the admin is allowed to do with it. */
export type AdminResourceSource = "seed" | "admin" | "teacher";

export interface AdminResourceRow {
  resource: Resource;
  source: AdminResourceSource;
  /**
   * Only resources created through this admin content library can be
   * edited or deleted here. `seed` rows (SAMPLE_RESOURCES) are checked-in
   * demo data, not a real database row — there's nowhere for an edit to
   * persist to. `teacher` rows are reviewed from the teacher's own record
   * (see /admin/teachers/[teacherId], docs/TEACHER_ARCHITECTURE.md) — this
   * table shows them for a full-library view but never edits someone
   * else's authored content.
   */
  editable: boolean;
}

/**
 * The one place the admin content library's three real data sources come
 * together — same "combine, don't invent" technique as
 * `buildParentRows()` (src/lib/accounts/admin-user-rows.ts): every row here
 * is a real `Resource` that exists somewhere in this browser, never a
 * fabricated entry. See docs/CONTENT_MANAGEMENT_ARCHITECTURE.md.
 */
export function buildAdminResourceRows(
  seedResources: Resource[],
  adminResources: Resource[],
  teacherResources: Resource[],
): AdminResourceRow[] {
  return [
    ...seedResources.map((resource) => ({ resource, source: "seed" as const, editable: false })),
    ...adminResources.map((resource) => ({ resource, source: "admin" as const, editable: true })),
    ...teacherResources.map((resource) => ({ resource, source: "teacher" as const, editable: false })),
  ];
}

export function findAdminResourceRow(rows: AdminResourceRow[], resourceId: string): AdminResourceRow | undefined {
  return rows.find((row) => row.resource.id === resourceId);
}
