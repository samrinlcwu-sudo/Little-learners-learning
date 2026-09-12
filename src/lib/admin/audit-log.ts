"use client";

import * as React from "react";

/**
 * A real, locally-recorded log of administrative actions — the honest
 * stand-in for a real `admin_audit_log` table, exactly the same reasoning
 * `Application.statusHistory` already uses (docs/ADMISSIONS_ARCHITECTURE.md):
 * nothing here is invented or backdated, every entry is written at the
 * moment the real action it describes actually happens. See
 * docs/ADMIN_ARCHITECTURE.md, "Auditability."
 *
 * Recorded client-side, in this browser's own localStorage, for the same
 * reason every other local-first store in this app is: there is still no
 * database to write a real audit row into. Once one exists, each entry
 * becomes a row scoped by the signed-in admin account's real id — this
 * shape (`action`, `targetType`, `targetId`, `details`, `occurredAt`)
 * already matches what that table needs; only `actorId` would be added.
 */
export type AdminAuditTargetType = "session" | "teacher" | "teacher-resource" | "child";

export interface AdminAuditEvent {
  id: string;
  action: string;
  targetType: AdminAuditTargetType;
  targetId?: string;
  details: string;
  occurredAt: string;
}

const STORAGE_KEY = "little-learners-learning:admin-audit-log";
/** Caps local growth — this is a recent-activity trail, not a permanent archive; a real backend's table would have no such limit. */
const MAX_ENTRIES = 200;

const EMPTY_SNAPSHOT: AdminAuditEvent[] = [];

let cache: AdminAuditEvent[] | undefined;
const listeners = new Set<() => void>();

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readFromStorage(): AdminAuditEvent[] {
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

function commit(events: AdminAuditEvent[]): AdminAuditEvent[] {
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

export function subscribeAdminAuditLog(onChange: () => void): () => void {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

export function getAdminAuditLogSnapshot(): AdminAuditEvent[] {
  if (cache === undefined) cache = readFromStorage();
  return cache;
}

export function getServerAdminAuditLogSnapshot(): AdminAuditEvent[] {
  return EMPTY_SNAPSHOT;
}

export interface NewAdminAuditEvent {
  action: string;
  targetType: AdminAuditTargetType;
  targetId?: string;
  details: string;
}

/**
 * The one function every real admin mutation calls — never invoked with
 * invented content, only in direct response to an action that just
 * genuinely happened (a moderation change, a verification toggle, a
 * sign-in). If this browser can't currently reach localStorage (a
 * server-rendered call site, a private-browsing failure), the event is
 * silently skipped rather than throwing — an audit trail is a record of
 * what happened, not something the action itself should ever depend on.
 */
export function recordAdminAuditEvent(input: NewAdminAuditEvent): void {
  if (!isBrowser()) return;
  const event: AdminAuditEvent = {
    id: crypto.randomUUID(),
    occurredAt: new Date().toISOString(),
    ...input,
  };
  const next = [...getAdminAuditLogSnapshot(), event].slice(-MAX_ENTRIES);
  commit(next);
}

/** Newest first — the order the admin activity panel renders in. */
export function useAdminAuditLog() {
  const events = React.useSyncExternalStore(
    subscribeAdminAuditLog,
    getAdminAuditLogSnapshot,
    getServerAdminAuditLogSnapshot,
  );
  const ready = events !== getServerAdminAuditLogSnapshot();
  const sorted = React.useMemo(() => [...events].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)), [events]);
  return { events: sorted, ready };
}
