import { describe, expect, it } from "vitest";
import { slugify, randomSlugSuffix } from "./slugify";

describe("slugify", () => {
  it("lowercases and hyphenates spaces", () => {
    expect(slugify("Amina Yusuf")).toBe("amina-yusuf");
  });

  it("strips punctuation", () => {
    expect(slugify("Amina O'Neil-Yusuf!")).toBe("amina-oneil-yusuf");
  });

  it("collapses repeated whitespace and trims stray hyphens", () => {
    expect(slugify("  Amina   Yusuf  ")).toBe("amina-yusuf");
  });
});

describe("randomSlugSuffix", () => {
  it("returns a lowercase alphanumeric string of the requested length", () => {
    const suffix = randomSlugSuffix(6);
    expect(suffix).toMatch(/^[a-z0-9]{6}$/);
  });
});
