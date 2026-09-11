import { describe, expect, it } from "vitest";
import { getNotificationChannelProviders } from "./channels";
import { NOTIFICATION_CHANNELS } from "./types";

describe("getNotificationChannelProviders", () => {
  it("prepares every notification channel, in the fixed order", () => {
    const providers = getNotificationChannelProviders();
    expect(providers.map((p) => p.channel)).toEqual([...NOTIFICATION_CHANNELS]);
  });

  it("only in-app is connected today — every other channel is honestly not", () => {
    const providers = getNotificationChannelProviders();
    const connected = providers.filter((p) => p.connected).map((p) => p.channel);
    expect(connected).toEqual(["in-app"]);
  });

  it("in-app delivers; every other channel reports not-connected without doing anything", () => {
    const notification = { id: "n1", title: "Title", message: "Message" };
    for (const provider of getNotificationChannelProviders()) {
      const result = provider.deliver(notification);
      expect(result.channel).toBe(provider.channel);
      expect(result.status).toBe(provider.connected ? "delivered" : "not-connected");
    }
  });
});
