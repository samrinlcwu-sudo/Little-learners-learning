import { describe, expect, it } from "vitest";
import { sortAdminUsers } from "./admin-user-sort";
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

describe("sortAdminUsers", () => {
  const rows = [
    makeRow({ id: "1", name: "Zara", registeredAt: "2026-01-01T00:00:00.000Z" }),
    makeRow({ id: "2", name: "Amina", registeredAt: "2026-03-01T00:00:00.000Z" }),
    makeRow({ id: "3", name: "Musa", registeredAt: "2026-02-01T00:00:00.000Z" }),
  ];

  it("defaults to newest first", () => {
    expect(sortAdminUsers(rows).map((r) => r.id)).toEqual(["2", "3", "1"]);
  });

  it("sorts oldest first", () => {
    expect(sortAdminUsers(rows, "oldest").map((r) => r.id)).toEqual(["1", "3", "2"]);
  });

  it("sorts by name ascending", () => {
    expect(sortAdminUsers(rows, "name-asc").map((r) => r.id)).toEqual(["2", "3", "1"]);
  });

  it("never mutates the input array", () => {
    const original = [...rows];
    sortAdminUsers(rows, "oldest");
    expect(rows).toEqual(original);
  });
});
