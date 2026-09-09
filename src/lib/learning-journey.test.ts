import { describe, expect, it } from "vitest";
import { getCategoryJourney, getNextStepSuggestion } from "./learning-journey";
import type { ProgressEvent } from "@/lib/progress/types";

function event(overrides: Partial<ProgressEvent>): ProgressEvent {
  return {
    id: overrides.id ?? "evt-1",
    childId: "child-1",
    type: "topic_explored",
    activityLabel: "Mathematics",
    activityHref: "/learn/mathematics",
    occurredAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("getCategoryJourney", () => {
  it("returns null for a category that doesn't exist", () => {
    expect(getCategoryJourney("not-a-real-category")).toBeNull();
  });

  it("marks a step available only when real published content exists", () => {
    const journey = getCategoryJourney("mathematics");
    expect(journey).not.toBeNull();
    // Mathematics has real published content, resources, and games today.
    expect(journey?.steps.map((s) => s.key)).toEqual(["learn", "practice", "play"]);
    for (const step of journey?.steps ?? []) {
      expect(step.available).toBe(step.count > 0);
    }
  });

  it("marks every step unavailable for a category with no published content yet", () => {
    const journey = getCategoryJourney("science-discovery");
    expect(journey).not.toBeNull();
    expect(journey?.steps.every((s) => !s.available && s.count === 0)).toBe(true);
  });
});

describe("getNextStepSuggestion", () => {
  it("returns null when there are no events at all", () => {
    expect(getNextStepSuggestion([])).toBeNull();
  });

  it("suggests an unexplored published game or resource in the last-explored subject", () => {
    const suggestion = getNextStepSuggestion([
      event({ topic: "mathematics", occurredAt: "2026-01-01T00:00:00.000Z" }),
    ]);
    expect(suggestion).not.toBeNull();
    expect(suggestion?.categoryName).toBe("Mathematics");
    expect(["game", "resource"]).toContain(suggestion?.kind);
  });

  it("never suggests something already visited", () => {
    const suggestion = getNextStepSuggestion([
      event({ id: "evt-1", topic: "mathematics", activityHref: "/games/count-the-fruits" }),
      event({ id: "evt-2", topic: "mathematics", activityHref: "/games/shape-match" }),
      event({ id: "evt-3", topic: "mathematics", activityHref: "/games/number-memory" }),
      event({ id: "evt-4", topic: "mathematics", activityHref: "/resources/counting-animals-worksheet" }),
      event({ id: "evt-5", topic: "mathematics", activityHref: "/resources/first-shapes-ebook" }),
    ]);
    // Every real Mathematics game/resource above has been visited, so the
    // suggestion (if any) must point to a different, related subject.
    if (suggestion) {
      expect(suggestion.kind).toBe("category");
      expect(suggestion.categoryName).not.toBe("Mathematics");
    }
  });

  it("falls back to a related, unexplored subject once everything in the current one is seen", () => {
    const allMathHrefs = [
      "/games/count-the-fruits",
      "/games/shape-match",
      "/games/number-memory",
      "/resources/counting-animals-worksheet",
      "/resources/first-shapes-ebook",
    ];
    const suggestion = getNextStepSuggestion(
      allMathHrefs.map((href, index) => event({ id: `evt-${index}`, topic: "mathematics", activityHref: href })),
    );
    expect(suggestion).not.toBeNull();
    expect(suggestion?.kind).toBe("category");
    expect(suggestion?.href).toMatch(/^\/learn\//);
  });

  it("ignores events with no topic when finding the last-explored subject", () => {
    const suggestion = getNextStepSuggestion([
      event({ id: "evt-1", topic: undefined, activityHref: "/resources/screen-time-conversation-starters" }),
    ]);
    expect(suggestion).toBeNull();
  });
});
