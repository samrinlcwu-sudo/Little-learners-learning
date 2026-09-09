import { describe, expect, it } from "vitest";
import { getAchievements, getEarnedAchievements } from "./achievements";
import type { ProgressEvent } from "./types";

function event(overrides: Partial<ProgressEvent> & { id: string }): ProgressEvent {
  return {
    childId: "child-1",
    type: "topic_explored",
    activityLabel: "Mathematics",
    activityHref: "/learn/mathematics",
    occurredAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("getAchievements", () => {
  it("earns nothing for a child with no events", () => {
    const achievements = getAchievements([]);
    expect(achievements.every((a) => !a.earned)).toBe(true);
    expect(achievements.every((a) => a.earnedAt === undefined)).toBe(true);
  });

  it("earns First Steps from a single real event", () => {
    const achievements = getAchievements([event({ id: "e1" })]);
    const firstSteps = achievements.find((a) => a.id === "first-steps");
    expect(firstSteps?.earned).toBe(true);
    expect(firstSteps?.earnedAt).toBe("2026-01-01T00:00:00.000Z");
  });

  it("does not award Game Champion for replaying the same game three times", () => {
    const events = [1, 2, 3].map((n) =>
      event({
        id: `e${n}`,
        type: "game_completed",
        activityHref: "/games/letter-match",
        occurredAt: `2026-01-0${n}T00:00:00.000Z`,
      }),
    );
    const achievements = getAchievements(events);
    expect(achievements.find((a) => a.id === "game-explorer")?.earned).toBe(true);
    expect(achievements.find((a) => a.id === "game-champion")?.earned).toBe(false);
  });

  it("awards Game Champion once three distinct games are completed", () => {
    const events = ["letter-match", "count-the-fruits", "shape-match"].map((slug, i) =>
      event({
        id: `e${i}`,
        type: "game_completed",
        activityHref: `/games/${slug}`,
        occurredAt: `2026-01-0${i + 1}T00:00:00.000Z`,
      }),
    );
    const achievements = getAchievements(events);
    expect(achievements.find((a) => a.id === "game-champion")?.earned).toBe(true);
  });

  it("counts distinct subjects, not raw events, for Subject Explorer", () => {
    const events = [
      event({ id: "e1", topic: "mathematics", occurredAt: "2026-01-01T00:00:00.000Z" }),
      event({ id: "e2", topic: "mathematics", occurredAt: "2026-01-02T00:00:00.000Z" }),
      event({ id: "e3", topic: "mathematics", occurredAt: "2026-01-03T00:00:00.000Z" }),
    ];
    expect(getAchievements(events).find((a) => a.id === "subject-explorer")?.earned).toBe(false);

    events.push(event({ id: "e4", topic: "english-early-literacy", occurredAt: "2026-01-04T00:00:00.000Z" }));
    expect(getAchievements(events).find((a) => a.id === "subject-explorer")?.earned).toBe(true);
  });

  it("ignores events with no topic when counting distinct subjects", () => {
    const events = [
      event({ id: "e1", topic: undefined, activityHref: "/resources/screen-time-conversation-starters" }),
      event({ id: "e2", topic: undefined, activityHref: "/resources/classroom-circle-time-ideas" }),
    ];
    expect(getAchievements(events).find((a) => a.id === "subject-explorer")?.earned).toBe(false);
  });
});

describe("getEarnedAchievements", () => {
  it("returns only earned achievements, never the locked ones", () => {
    const earned = getEarnedAchievements([event({ id: "e1" })]);
    expect(earned.every((a) => a.earned)).toBe(true);
    expect(earned.length).toBeGreaterThan(0);
    expect(earned.length).toBeLessThan(6);
  });

  it("returns an empty list for a child with no events", () => {
    expect(getEarnedAchievements([])).toEqual([]);
  });
});
