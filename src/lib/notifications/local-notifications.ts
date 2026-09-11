import { getNotificationChannelProviders } from "./channels";
import type {
  Notification,
  NotificationAction,
  NotificationChannel,
  NotificationRelatedEntity,
  NotificationType,
} from "./types";
import { NOTIFICATION_CHANNELS } from "./types";

/**
 * This browser's own notifications, stored locally — same
 * useSyncExternalStore-backed localStorage pattern as every other
 * local-first store in this app (local-applications.ts, local-children.ts).
 * Storage key: `little-learners-learning:notifications`. There's no session
 * system to scope this by, so — exactly like applications and child
 * profiles — "this browser's notifications" already means "this family's
 * notifications": ownership by construction, not a runtime check. See
 * docs/NOTIFICATIONS_ARCHITECTURE.md.
 */
const STORAGE_KEY = "little-learners-learning:notifications";

const EMPTY_SNAPSHOT: Notification[] = [];

let cache: Notification[] | undefined;
const listeners = new Set<() => void>();

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readFromStorage(): Notification[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function commit(notifications: Notification[]): Notification[] {
  cache = notifications;
  if (isBrowser()) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch {
      // Private browsing, storage full, etc. — the in-memory cache still
      // keeps this session working; it just won't persist a reload.
    }
  }
  listeners.forEach((listener) => listener());
  return notifications;
}

export function subscribeLocalNotifications(onChange: () => void): () => void {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

export function getLocalNotificationsSnapshot(): Notification[] {
  if (cache === undefined) cache = readFromStorage();
  return cache;
}

export function getServerNotificationsSnapshot(): Notification[] {
  return EMPTY_SNAPSHOT;
}

export interface CreateNotificationInput {
  recipientAccountId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedEntity?: NotificationRelatedEntity;
  action?: NotificationAction;
  /** Which channels to attempt — defaults to every prepared channel; only "in-app" can actually deliver until a real provider is connected. */
  channels?: readonly NotificationChannel[];
}

/**
 * The one entry point every real feature calls to create a notification —
 * never called with invented content, only in response to something that
 * genuinely just happened (e.g. src/lib/admissions/use-applications.ts,
 * after a real submit or withdraw). Delivers through every requested
 * channel's provider (src/lib/notifications/channels.ts) and records the
 * real outcome of each, so `deliveries` never claims a channel worked when
 * it didn't.
 */
export function createNotification(input: CreateNotificationInput): Notification {
  const requestedChannels = input.channels ?? NOTIFICATION_CHANNELS;
  const id = crypto.randomUUID();
  const deliveries = getNotificationChannelProviders()
    .filter((provider) => requestedChannels.includes(provider.channel))
    .map((provider) => provider.deliver({ id, title: input.title, message: input.message }));

  const notification: Notification = {
    id,
    recipientAccountId: input.recipientAccountId,
    type: input.type,
    title: input.title,
    message: input.message,
    relatedEntity: input.relatedEntity,
    action: input.action,
    read: false,
    createdAt: new Date().toISOString(),
    deliveries,
  };

  commit([...getLocalNotificationsSnapshot(), notification]);
  return notification;
}

export function markNotificationRead(id: string): Notification[] {
  return commit(
    getLocalNotificationsSnapshot().map((notification) =>
      notification.id === id ? { ...notification, read: true } : notification,
    ),
  );
}

export function markAllNotificationsRead(): Notification[] {
  return commit(getLocalNotificationsSnapshot().map((notification) => ({ ...notification, read: true })));
}
