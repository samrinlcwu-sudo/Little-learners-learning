"use client";

import * as React from "react";
import {
  getLocalNotificationsSnapshot,
  getServerNotificationsSnapshot,
  markAllNotificationsRead,
  markNotificationRead,
  subscribeLocalNotifications,
} from "./local-notifications";
import { getUnreadCount, sortNotificationsByRecency } from "./types";

/**
 * Same useSyncExternalStore pattern as every other local-first store's hook
 * in this codebase (use-applications.ts, use-child-profiles.ts) — server
 * and client agree on the same empty snapshot at first paint, so there's no
 * hydration mismatch, and every subscribed component (the header bell, the
 * dedicated /dashboard/notifications page) re-renders the instant a
 * notification is created or marked read.
 */
export function useNotifications() {
  const notifications = React.useSyncExternalStore(
    subscribeLocalNotifications,
    getLocalNotificationsSnapshot,
    getServerNotificationsSnapshot,
  );
  const ready = notifications !== getServerNotificationsSnapshot();
  const sorted = React.useMemo(() => sortNotificationsByRecency(notifications), [notifications]);
  const unreadCount = React.useMemo(() => getUnreadCount(notifications), [notifications]);

  const markRead = React.useCallback((id: string) => {
    markNotificationRead(id);
  }, []);

  const markAllRead = React.useCallback(() => {
    markAllNotificationsRead();
  }, []);

  return { notifications: sorted, ready, unreadCount, markRead, markAllRead };
}
