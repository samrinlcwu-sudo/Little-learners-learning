import { describe, expect, it } from "vitest";
import { getAccuracyReward, getCompletionReward } from "./rewards";

describe("getAccuracyReward", () => {
  it("awards 3 stars for a perfect score", () => {
    expect(getAccuracyReward(6, 6).stars).toBe(3);
  });

  it("awards 2 stars for a solid but imperfect score", () => {
    expect(getAccuracyReward(4, 6).stars).toBe(2);
  });

  it("still awards 1 star (never 0) for a low score", () => {
    expect(getAccuracyReward(1, 6).stars).toBe(1);
  });

  it("never returns 0 stars, even for zero correct answers", () => {
    expect(getAccuracyReward(0, 6).stars).toBeGreaterThanOrEqual(1);
  });
});

describe("getCompletionReward", () => {
  it("always awards the encouraging top tier", () => {
    expect(getCompletionReward().stars).toBe(3);
  });
});
