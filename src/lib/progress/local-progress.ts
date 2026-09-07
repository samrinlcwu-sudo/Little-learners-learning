import type { ProgressEvent, ProgressEventType } from "./types";

/**
 * Progress events, stored in this browser only — same architecture and
 * same reasoning as src/lib/accounts/local-children.ts (a tiny external
 * store, read via useSyncExternalStore, never sent anywhere). See
 * docs/PROGRESS_ARCHITECTURE.md.
 *
 * Capped at MAX_EVENTS so this can't grow without bound over a long
 * browsing history — old events are dropped, not summarized or estimated.
 */
const STORAGE_KEY = "little-learners-learning:progress-events";
const ACTIVE_CHILD_KEY = "little-learners-learning:active-child";
const MAX_EVENTS = 300;

const EMPTY_SNAPSHOT: ProgressEvent[] = [];

let cache: ProgressEvent[] | undefined;
const listeners = new Set<() => void>();

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readFromStorage(): ProgressEvent[] {
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

function commit(events: ProgressEvent[]): ProgressEvent[] {
  cache = events;
  if (isBrowser()) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch {
      // Private browsing, storage full, etc. — the in-memory cache still
      // keeps this session working; it just won't persist a reload.
    }
  }
  listeners.forEach((listener) => listener());
  return events;
}

export function subscribeProgressEvents(onChange: () => void): () => void {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

export function getProgressEventsSnapshot(): ProgressEvent[] {
  if (cache === undefined) cache = readFromStorage();
  return cache;
}

export function getServerProgressEventsSnapshot(): ProgressEvent[] {
  return EMPTY_SNAPSHOT;
}

/**
 * Which child the site is currently "playing as" — set when a parent opens
 * a child's own view (src/components/patterns/child-experience.tsx), and
 * used to attribute any progress event recorded afterward. This is a
 * simple "last child opened" heuristic, not a real per-visitor identity
 * system — good enough to prove the tracking pipeline honestly without
 * inventing a login for a young child. A household with more than one
 * child needs to reopen that child's view before playing to keep
 * attribution correct; documented plainly rather than hidden.
 */
export function setActiveChild(childId: string): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(ACTIVE_CHILD_KEY, childId);
  } catch {
    // Ignore — attribution just won't persist this session.
  }
}

export function getActiveChildId(): string | null {
  if (!isBrowser()) return null;
  try {
    return window.localStorage.getItem(ACTIVE_CHILD_KEY);
  } catch {
    return null;
  }
}

export interface NewProgressEvent {
  type: ProgressEventType;
  topic?: string;
  activityLabel: string;
  activityHref: string;
  score?: { correct: number; total: number };
}

/**
 * Records an event against whichever child is currently active — and,
 * critically, does nothing at all if no child is active. There is no
 * "default child" or "most recent child" fallback beyond the explicit
 * active-child pointer: guessing who to attribute an activity to would be
 * exactly the kind of invented progress this system exists to avoid.
 */
export function recordProgressEvent(event: NewProgressEvent): void {
  const childId = getActiveChildId();
  if (!childId) return;

  const next = [
    ...getProgressEventsSnapshot(),
    { id: crypto.randomUUID(), childId, occurredAt: new Date().toISOString(), ...event },
  ].slice(-MAX_EVENTS);

  commit(next);
}

export function getEventsForChild(events: ProgressEvent[], childId: string): ProgressEvent[] {
  return events.filter((event) => event.childId === childId);
}
