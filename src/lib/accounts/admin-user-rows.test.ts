import { describe, expect, it } from "vitest";
import { buildParentRows } from "./admin-user-rows";
import type { ChildProfile } from "./types";

function makeChild(overrides: Partial<ChildProfile> = {}): ChildProfile {
  return {
    id: "child-1",
    parentAccountId: "local-browser-only",
    name: "Test Child",
    ageYears: 5,
    avatar: "sun",
    createdAt: "2026-01-05T00:00:00.000Z",
    accountStatus: "active",
    ...overrides,
  };
}

describe("buildParentRows", () => {
  it("returns nothing for an empty child list", () => {
    expect(buildParentRows([])).toEqual([]);
  });

  it("groups every child sharing a parentAccountId into a single row", () => {
    const children = [
      makeChild({ id: "c1", parentAccountId: "local-browser-only" }),
      makeChild({ id: "c2", parentAccountId: "local-browser-only" }),
    ];
    const rows = buildParentRows(children);
    expect(rows).toHaveLength(1);
    expect(rows[0].summary).toBe("2 children");
  });

  it("produces one row per distinct parentAccountId", () => {
    const children = [
      makeChild({ id: "c1", parentAccountId: "family-a" }),
      makeChild({ id: "c2", parentAccountId: "family-b" }),
    ];
    expect(buildParentRows(children)).toHaveLength(2);
  });

  it("labels the known local placeholder id honestly, and shows any other id as-is", () => {
    const rows = buildParentRows([
      makeChild({ parentAccountId: "local-browser-only" }),
      makeChild({ id: "c2", parentAccountId: "family-b" }),
    ]);
    const local = rows.find((r) => r.id === "local-browser-only");
    const other = rows.find((r) => r.id === "family-b");
    expect(local?.name).toBe("Parent (this device)");
    expect(other?.name).toBe("family-b");
  });

  it("rolls up accountStatus to active if at least one child is active", () => {
    const rows = buildParentRows([
      makeChild({ id: "c1", accountStatus: "active" }),
      makeChild({ id: "c2", accountStatus: "deactivated" }),
    ]);
    expect(rows[0].accountStatus).toBe("active");
  });

  it("rolls up accountStatus to deactivated only when every child is deactivated", () => {
    const rows = buildParentRows([
      makeChild({ id: "c1", accountStatus: "deactivated" }),
      makeChild({ id: "c2", accountStatus: "deactivated" }),
    ]);
    expect(rows[0].accountStatus).toBe("deactivated");
  });

  it("uses the earliest child's createdAt as registeredAt", () => {
    const rows = buildParentRows([
      makeChild({ id: "c1", createdAt: "2026-03-01T00:00:00.000Z" }),
      makeChild({ id: "c2", createdAt: "2026-01-15T00:00:00.000Z" }),
    ]);
    expect(rows[0].registeredAt).toBe("2026-01-15T00:00:00.000Z");
  });

  it("points detailHref at the parent detail route for that id", () => {
    const rows = buildParentRows([makeChild({ parentAccountId: "local-browser-only" })]);
    expect(rows[0].detailHref).toBe("/admin/users/parents/local-browser-only");
  });
});
