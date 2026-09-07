"use client";

import * as React from "react";
import {
  getEventsForChild,
  getProgressEventsSnapshot,
  getServerProgressEventsSnapshot,
  subscribeProgressEvents,
} from "./local-progress";
import type { ProgressEvent } from "./types";

/**
 * All recorded events, live — same useSyncExternalStore pattern as
 * src/lib/accounts/use-child-profiles.ts, for the same reason: the server
 * and the client's first paint agree on an empty list, and every
 * subscribed component re-renders the instant a new event is recorded.
 */
export function useProgressEvents(): { events: ProgressEvent[]; ready: boolean } {
  const events = React.useSyncExternalStore(
    subscribeProgressEvents,
    getProgressEventsSnapshot,
    getServerProgressEventsSnapshot,
  );
  const ready = events !== getServerProgressEventsSnapshot();
  return { events, ready };
}

/** The same events, filtered to one child — for a child's own view or one card in the parent dashboard. */
export function useChildProgressEvents(childId: string | undefined): { events: ProgressEvent[]; ready: boolean } {
  const { events, ready } = useProgressEvents();
  const childEvents = React.useMemo(
    () => (childId ? getEventsForChild(events, childId) : []),
    [events, childId],
  );
  return { events: childEvents, ready };
}
