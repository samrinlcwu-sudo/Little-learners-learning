import { describe, expect, it } from "vitest";
import { getUnreadCount, sortNotificationsByRecency, type Notification } from "./types";

function makeNotification(overrides: Partial<Notification> = {}): Notification {
  return {
    id: "n1",
    recipientAccountId: "local-browser-only",
    type: "application-update",
    title: "Application submitted",
    message: "Reference LLL-ABC123.",
    read: false,
    createdAt: "2026-01-01T00:00:00.000Z",
    deliveries: [{ channel: "in-app", status: "delivered" }],
    ...overrides,
  };
}

describe("getUnreadCount", () => {
  it("counts only unread notifications", () => {
    const notifications = [
      makeNotification({ id: "n1", read: false }),
      makeNotification({ id: "n2", read: true }),
      makeNotification({ id: "n3", read: false }),
    ];
    expect(getUnreadCount(notifications)).toBe(2);
  });

  it("is zero for an empty list", () => {
    expect(getUnreadCount([])).toBe(0);
  });
});

describe("sortNotificationsByRecency", () => {
  it("orders newest first without mutating the input array", () => {
    const oldest = makeNotification({ id: "n1", createdAt: "2026-01-01T00:00:00.000Z" });
    const newest = makeNotification({ id: "n2", createdAt: "2026-01-03T00:00:00.000Z" });
    const middle = makeNotification({ id: "n3", createdAt: "2026-01-02T00:00:00.000Z" });
    const input = [oldest, newest, middle];

    const sorted = sortNotificationsByRecency(input);

    expect(sorted.map((n) => n.id)).toEqual(["n2", "n3", "n1"]);
    expect(input.map((n) => n.id)).toEqual(["n1", "n2", "n3"]);
  });
});
