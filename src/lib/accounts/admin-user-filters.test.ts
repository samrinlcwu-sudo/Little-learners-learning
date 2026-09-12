import { describe, expect, it } from "vitest";
import { filterAdminUsers } from "./admin-user-filters";
import type { AdminUserRow } from "./admin-user-rows";

function makeRow(overrides: Partial<AdminUserRow> = {}): AdminUserRow {
  return {
    id: "1",
    role: "teacher",
    name: "Amina Yusuf",
    accountStatus: "active",
    registeredAt: "2026-01-01T00:00:00.000Z",
    summary: "amina@example.com",
    detailHref: "/admin/teachers/1",
    ...overrides,
  };
}

describe("filterAdminUsers", () => {
  it("returns everything when no filters are set", () => {
    const rows = [makeRow(), makeRow({ id: "2", role: "child", name: "Yusuf" })];
    expect(filterAdminUsers(rows, {})).toHaveLength(2);
  });

  it("filters by role", () => {
    const rows = [makeRow({ role: "teacher" }), makeRow({ id: "2", role: "child" })];
    expect(filterAdminUsers(rows, { role: "child" })).toHaveLength(1);
    expect(filterAdminUsers(rows, { role: "child" })[0].role).toBe("child");
  });

  it("filters by account status", () => {
    const rows = [makeRow({ accountStatus: "active" }), makeRow({ id: "2", accountStatus: "deactivated" })];
    const result = filterAdminUsers(rows, { accountStatus: "deactivated" });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("2");
  });

  it("matches the free-text query against name and summary", () => {
    const rows = [
      makeRow({ name: "Amina Yusuf", summary: "amina@example.com" }),
      makeRow({ id: "2", name: "Yusuf Child", summary: "6 years old" }),
    ];
    expect(filterAdminUsers(rows, { query: "amina" })).toHaveLength(1);
    expect(filterAdminUsers(rows, { query: "6 years" })).toHaveLength(1);
  });

  it("combines multiple filters with AND semantics", () => {
    const rows = [
      makeRow({ role: "teacher", accountStatus: "active" }),
      makeRow({ id: "2", role: "teacher", accountStatus: "deactivated" }),
      makeRow({ id: "3", role: "child", accountStatus: "active" }),
    ];
    const result = filterAdminUsers(rows, { role: "teacher", accountStatus: "active" });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });
});
