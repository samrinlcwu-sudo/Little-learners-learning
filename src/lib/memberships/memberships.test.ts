import { describe, expect, it } from "vitest";
import { getAllMemberships } from "./memberships";

describe("getAllMemberships", () => {
  it("returns an empty array — no code path exists to create a membership", () => {
    expect(getAllMemberships()).toEqual([]);
  });
});
