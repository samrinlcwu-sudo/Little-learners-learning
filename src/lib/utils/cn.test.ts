import { describe, expect, it } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
  it("joins truthy class names", () => {
    expect(cn("a", false && "b", "c")).toBe("a c");
  });

  it("resolves conflicting Tailwind utilities, last one wins", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });
});
