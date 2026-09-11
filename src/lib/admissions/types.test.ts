import { describe, expect, it } from "vitest";
import {
  canEditApplication,
  canSubmitApplication,
  canWithdrawApplication,
  getApplicationLearningAreas,
  getApplicationTimeline,
  UNREACHABLE_APPLICATION_STATUSES,
  type Application,
} from "./types";
import type { LearningCategory } from "@/config/learning-categories";

function makeApplication(overrides: Partial<Application> = {}): Application {
  return {
    id: "a1",
    parentAccountId: "local-browser-only",
    childId: "c1",
    learningInterests: ["mathematics"],
    status: "draft",
    statusHistory: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("canEditApplication / canSubmitApplication", () => {
  it("is true only for a draft", () => {
    expect(canEditApplication(makeApplication({ status: "draft" }))).toBe(true);
    expect(canSubmitApplication(makeApplication({ status: "draft" }))).toBe(true);
  });

  it("is false once submitted or withdrawn", () => {
    expect(canEditApplication(makeApplication({ status: "submitted" }))).toBe(false);
    expect(canSubmitApplication(makeApplication({ status: "withdrawn" }))).toBe(false);
  });
});

describe("canWithdrawApplication", () => {
  it("is true for a draft or a submitted application", () => {
    expect(canWithdrawApplication(makeApplication({ status: "draft" }))).toBe(true);
    expect(canWithdrawApplication(makeApplication({ status: "submitted" }))).toBe(true);
  });

  it("is false once already withdrawn or for any status this codebase can't reach", () => {
    expect(canWithdrawApplication(makeApplication({ status: "withdrawn" }))).toBe(false);
    expect(canWithdrawApplication(makeApplication({ status: "accepted" }))).toBe(false);
  });
});

describe("UNREACHABLE_APPLICATION_STATUSES", () => {
  it("lists exactly the four statuses nothing in this codebase can set", () => {
    expect(UNREACHABLE_APPLICATION_STATUSES).toEqual(["under-review", "info-requested", "accepted", "declined"]);
  });
});

describe("getApplicationTimeline", () => {
  it("marks only draft as reached for a brand-new draft, and flags the rest as unreachable today", () => {
    const application = makeApplication({
      status: "draft",
      statusHistory: [{ status: "draft", occurredAt: "2026-01-01T00:00:00.000Z" }],
    });
    const timeline = getApplicationTimeline(application);
    expect(timeline.map((step) => step.status)).toEqual(["draft", "submitted", "under-review", "accepted"]);
    expect(timeline[0]).toMatchObject({ reached: true, unreachable: false });
    expect(timeline[1]).toMatchObject({ reached: false, unreachable: false });
    expect(timeline[2]).toMatchObject({ reached: false, unreachable: true });
    expect(timeline[3]).toMatchObject({ reached: false, unreachable: true });
  });

  it("marks draft and submitted as reached once submitted", () => {
    const application = makeApplication({
      status: "submitted",
      statusHistory: [
        { status: "draft", occurredAt: "2026-01-01T00:00:00.000Z" },
        { status: "submitted", occurredAt: "2026-01-02T00:00:00.000Z" },
      ],
    });
    const timeline = getApplicationTimeline(application);
    expect(timeline[0].reached).toBe(true);
    expect(timeline[1]).toMatchObject({ reached: true, occurredAt: "2026-01-02T00:00:00.000Z" });
  });

  it("builds a short draft-to-withdrawn timeline for a withdrawn draft, without ever mentioning submission", () => {
    const application = makeApplication({
      status: "withdrawn",
      statusHistory: [
        { status: "draft", occurredAt: "2026-01-01T00:00:00.000Z" },
        { status: "withdrawn", occurredAt: "2026-01-02T00:00:00.000Z" },
      ],
    });
    const timeline = getApplicationTimeline(application);
    expect(timeline.map((step) => step.status)).toEqual(["draft", "withdrawn"]);
  });

  it("includes submitted in a withdrawn timeline when it was actually submitted first", () => {
    const application = makeApplication({
      status: "withdrawn",
      statusHistory: [
        { status: "draft", occurredAt: "2026-01-01T00:00:00.000Z" },
        { status: "submitted", occurredAt: "2026-01-02T00:00:00.000Z" },
        { status: "withdrawn", occurredAt: "2026-01-03T00:00:00.000Z" },
      ],
    });
    const timeline = getApplicationTimeline(application);
    expect(timeline.map((step) => step.status)).toEqual(["draft", "submitted", "withdrawn"]);
  });
});

describe("getApplicationLearningAreas", () => {
  const categories: LearningCategory[] = [
    { slug: "mathematics", name: "Mathematics" } as LearningCategory,
    { slug: "creativity", name: "Creativity" } as LearningCategory,
  ];

  it("resolves stored slugs to real category objects", () => {
    const application = makeApplication({ learningInterests: ["mathematics", "creativity"] });
    const areas = getApplicationLearningAreas(application, categories);
    expect(areas.map((a) => a.name)).toEqual(["Mathematics", "Creativity"]);
  });

  it("silently drops a slug that no longer resolves, rather than throwing", () => {
    const application = makeApplication({ learningInterests: ["mathematics", "deactivated-category"] });
    const areas = getApplicationLearningAreas(application, categories);
    expect(areas).toHaveLength(1);
  });
});
