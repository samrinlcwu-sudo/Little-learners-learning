import type { Notification, NotificationChannel, NotificationDelivery } from "./types";

/**
 * The abstraction that lets a future real provider (a transactional email
 * API, WhatsApp Business API, an SMS gateway, Web Push) be connected one
 * channel at a time without rebuilding anything that calls
 * `createNotification` (src/lib/notifications/local-notifications.ts) — the
 * exact same shape `AiAssistantProvider` already uses for the AI assistant
 * (src/lib/ai/get-provider.ts, docs/AI_ASSISTANT_ARCHITECTURE.md).
 *
 * `deliver` never performs a real network call today — connecting a
 * channel later means replacing one provider's `deliver` with a real
 * implementation and flipping its `connected` flag, nothing else in the
 * codebase changes shape.
 */
export interface NotificationChannelProvider {
  channel: NotificationChannel;
  /** Whether this channel can actually deliver something today. Only "in-app" is ever true right now. */
  connected: boolean;
  deliver(notification: Pick<Notification, "id" | "title" | "message">): NotificationDelivery;
}

/**
 * "Delivering" in-app just means the notification row exists in this
 * browser's own local store — there's nothing further to send, so this is
 * the one channel that's honestly fully connected today.
 */
const inAppChannelProvider: NotificationChannelProvider = {
  channel: "in-app",
  connected: true,
  deliver: () => ({ channel: "in-app", status: "delivered" }),
};

/**
 * One placeholder per not-yet-connected channel — mirrors
 * `devPlaceholderProvider` (src/lib/ai/dev-placeholder-provider.ts): it
 * never contacts a real service, and its result says so honestly
 * ("not-connected") instead of pretending to have sent anything.
 */
function unconnectedChannelProvider(channel: NotificationChannel): NotificationChannelProvider {
  return {
    channel,
    connected: false,
    deliver: () => ({ channel, status: "not-connected" }),
  };
}

/**
 * Every channel the architecture is prepared for, in the fixed order
 * defined by NOTIFICATION_CHANNELS. Connecting a real provider later means
 * replacing one entry here — never adding a parallel system.
 */
export function getNotificationChannelProviders(): NotificationChannelProvider[] {
  return [
    inAppChannelProvider,
    unconnectedChannelProvider("email"),
    unconnectedChannelProvider("whatsapp"),
    unconnectedChannelProvider("sms"),
    unconnectedChannelProvider("push"),
  ];
}
