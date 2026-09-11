/**
 * The notification data model — contracts only, same pattern as every other
 * domain's types.ts in this codebase (admissions, accounts, resources). No
 * backend exists yet (src/lib/supabase/is-configured.ts), so nothing here
 * is delivered anywhere beyond this browser's own localStorage. See
 * docs/NOTIFICATIONS_ARCHITECTURE.md for the full reasoning.
 *
 * Deliberately reuses the existing account model instead of inventing a new
 * one: `recipientAccountId` is one of the placeholder ids the rest of the
 * app already uses for "this browser's one parent/teacher"
 * (`local-browser-only` in src/lib/accounts/local-children.ts,
 * `local-browser-only-teacher` in src/lib/accounts/local-teacher.ts) — never
 * a new identity system of its own.
 */

/**
 * Every kind of notification the architecture is prepared for. Today, only
 * "application-update" is ever actually created by any code path (when a
 * family submits or withdraws a real application — see
 * src/lib/admissions/use-applications.ts). The other five are real,
 * documented categories a future feature can start creating the moment it
 * has a genuine event to report — never fabricated ahead of time just to
 * fill out this list, the same "prepared, not automatic" rule
 * `UNREACHABLE_APPLICATION_STATUSES` already follows in
 * src/lib/admissions/types.ts.
 */
export const NOTIFICATION_TYPES = [
  "application-update",
  "account-activity",
  "learning-activity",
  "teacher-activity",
  "resource-update",
  "platform-message",
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  "application-update": "Application update",
  "account-activity": "Account activity",
  "learning-activity": "Learning activity",
  "teacher-activity": "Teacher activity",
  "resource-update": "Resource update",
  "platform-message": "Platform message",
};

/**
 * Every delivery channel the architecture is prepared for. None are
 * connected today — see src/lib/notifications/channels.ts. "in-app" is the
 * only channel that can ever actually deliver anything right now, because
 * it just means "write a row to this browser's own notification list,"
 * which needs no external service.
 */
export const NOTIFICATION_CHANNELS = ["in-app", "email", "whatsapp", "sms", "push"] as const;
export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[number];

export const NOTIFICATION_CHANNEL_LABELS: Record<NotificationChannel, string> = {
  "in-app": "In-app",
  email: "Email",
  whatsapp: "WhatsApp",
  sms: "SMS",
  push: "Push notification",
};

/**
 * "delivered" — the channel actually did something (today, only ever
 * "in-app," which just means the row was written). "not-connected" — a
 * real, honest outcome for every other channel: nothing was sent anywhere,
 * because no provider exists to send it. "failed" is modeled for a future
 * real provider that can genuinely fail (a bounced email, an undeliverable
 * number) — nothing in this codebase can produce it today.
 */
export const NOTIFICATION_DELIVERY_STATUSES = ["delivered", "not-connected", "failed"] as const;
export type NotificationDeliveryStatus = (typeof NOTIFICATION_DELIVERY_STATUSES)[number];

export interface NotificationDelivery {
  channel: NotificationChannel;
  status: NotificationDeliveryStatus;
}

/**
 * What a notification is actually about — an opaque reference, never a
 * copy of the related record's own data (so a notification never goes
 * stale or duplicates information that already lives on the real record).
 */
export interface NotificationRelatedEntity {
  kind: "application" | "child-profile" | "teacher-profile" | "resource";
  id: string;
}

/** A single real place a notification can send someone — never more than one per notification today. */
export interface NotificationAction {
  label: string;
  href: string;
}

export interface Notification {
  id: string;
  recipientAccountId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedEntity?: NotificationRelatedEntity;
  action?: NotificationAction;
  read: boolean;
  createdAt: string;
  /** One entry per channel this notification was created with — see src/lib/notifications/channels.ts. */
  deliveries: NotificationDelivery[];
}

export function getUnreadCount(notifications: Notification[]): number {
  return notifications.filter((notification) => !notification.read).length;
}

/** Newest first — the order every notification list in this app renders in. */
export function sortNotificationsByRecency(notifications: Notification[]): Notification[] {
  return [...notifications].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
