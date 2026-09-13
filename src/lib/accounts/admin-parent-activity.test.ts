import { describe, expect, it } from "vitest";
import { getFamilyActivitySummary } from "./admin-parent-activity";
import type { ProgressEvent } from "@/lib/progress/types";

function makeEvent(overrides: Partial<ProgressEvent> = {}): ProgressEvent {
  return {
    id: "e1",
    childId: "child-1",
    type: "game_played",
    activityLabel: "Letter Match",
    activityHref: "/games/letter-match",
    occurredAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("getFamilyActivitySummary", () => {
  it("returns zero events and no last-activity date for an empty family", () => {
    expect(getFamilyActivitySummary([], ["child-1"])).toEqual({ totalEvents: 0 });
  });

  it("counts only events belonging to the given child ids", () => {
    const events = [
      makeEvent({ childId: "child-1" }),
      makeEvent({ id: "e2", childId: "child-2" }),
      makeEvent({ id: "e3", childId: "someone-elses-child" }),
    ];
    const summary = getFamilyActivitySummary(events, ["child-1", "child-2"]);
    expect(summary.totalEvents).toBe(2);
  });

  it("reports the most recent occurredAt across the family", () => {
    const events = [
      makeEvent({ childId: "child-1", occurredAt: "2026-01-01T00:00:00.000Z" }),
      makeEvent({ id: "e2", childId: "child-2", occurredAt: "2026-03-15T00:00:00.000Z" }),
      makeEvent({ id: "e3", childId: "child-1", occurredAt: "2026-02-01T00:00:00.000Z" }),
    ];
    const summary = getFamilyActivitySummary(events, ["child-1", "child-2"]);
    expect(summary.lastActivityAt).toBe("2026-03-15T00:00:00.000Z");
  });
});
