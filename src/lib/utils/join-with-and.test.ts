import { describe, expect, it } from "vitest";
import { joinWithAnd } from "./join-with-and";

describe("joinWithAnd", () => {
  it("returns a single item unchanged", () => {
    expect(joinWithAnd(["a"])).toBe("a");
  });

  it("joins two items with 'and', no comma", () => {
    expect(joinWithAnd(["a", "b"])).toBe("a and b");
  });

  it("joins three or more items with an Oxford comma before 'and'", () => {
    expect(joinWithAnd(["a", "b", "c"])).toBe("a, b, and c");
  });

  it("returns an empty string for an empty list", () => {
    expect(joinWithAnd([])).toBe("");
  });
});
