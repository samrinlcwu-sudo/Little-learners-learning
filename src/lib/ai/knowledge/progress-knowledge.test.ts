import { describe, expect, it } from "vitest";
import { getChildProgressKnowledge } from "./progress-knowledge";
import type { ProgressEvent } from "@/lib/progress/types";

function makeEvent(overrides: Partial<ProgressEvent> = {}): ProgressEvent {
  return {
    id: crypto.randomUUID(),
    childId: "child-1",
    type: "topic_explored",
    topic: "mathematics",
    activityLabel: "Mathematics",
    activityHref: "/learn/mathematics",
    occurredAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("getChildProgressKnowledge", () => {
  it("only ever reflects the requested child's own events, never another child's", () => {
    const events = [
      makeEvent({ childId: "child-1", activityLabel: "Mathematics" }),
      makeEvent({ childId: "child-2", activityLabel: "Should never appear", topic: "creativity" }),
    ];
    const knowledge = getChildProgressKnowledge("child-1", events);
    expect(knowledge.childId).toBe("child-1");
    expect(knowledge.recentActivities.every((event) => event.childId === "child-1")).toBe(true);
    expect(knowledge.topicsExplored).not.toContain("Creativity");
  });

  it("returns an honest empty summary and no next step for a child with no events yet", () => {
    const knowledge = getChildProgressKnowledge("child-3", []);
    expect(knowledge.recentActivities).toHaveLength(0);
    expect(knowledge.achievements).toHaveLength(0);
    expect(knowledge.nextStep).toBeNull();
  });
});
