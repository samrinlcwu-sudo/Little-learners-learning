import type { ChildProfile } from "./types";
import { recordAdminAuditEvent } from "@/lib/admin/audit-log";

/**
 * Child profiles, stored in this browser only — there is no parent account
 * to attach them to yet (no Supabase project is connected; see
 * src/lib/supabase/is-configured.ts), so `parentAccountId` is always this
 * fixed placeholder rather than a real account id. Nothing here is ever
 * sent anywhere: the privacy requirement ("don't expose child information
 * publicly") is satisfied by the data never leaving the device, not by a
 * policy on top of a server that has it.
 *
 * Modeled as a tiny external store (read/write/subscribe) rather than
 * component state, because that's what `localStorage` actually is — an
 * external, mutable data source. `src/lib/accounts/use-child-profiles.ts`
 * reads it via `useSyncExternalStore`, React's built-in tool for exactly
 * this: it keeps the server-rendered HTML and the client's first paint
 * identical (both use `EMPTY_SNAPSHOT` below) without a manual "have we
 * loaded yet" flag, and it re-renders every subscribed component the
 * instant `addLocalChild`/`updateLocalChild` change something — including
 * in the same tab, which the browser's own `storage` event doesn't do.
 *
 * Migrating to real accounts later means writing these same rows into a
 * `child_profiles` table scoped by the signed-in parent's id — the shape
 * (`ChildProfile`) already matches what that table needs.
 */
const STORAGE_KEY = "little-learners-learning:child-profiles";
/** Exported so anything else needing "this browser's one local parent" (e.g. the dashboard's membership status card, src/components/patterns/parent-dashboard.tsx) references the same id rather than a second copy of the literal. */
export const LOCAL_PARENT_ID = "local-browser-only";

/** The one stable reference returned before the real data has loaded — same object every call, which useSyncExternalStore requires. */
const EMPTY_SNAPSHOT: ChildProfile[] = [];

let cache: ChildProfile[] | undefined;
const listeners = new Set<() => void>();

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/** Backfills fields added after a profile may have been created — a stored record without `accountStatus` (everything before Prompt 57) is read as "active", never as "deactivated" by omission. */
function normalize(child: ChildProfile): ChildProfile {
  return { ...child, accountStatus: child.accountStatus ?? "active" };
}

function readFromStorage(): ChildProfile[] {
  // Distinct from EMPTY_SNAPSHOT on purpose: this means "checked, and there
  // genuinely aren't any" — useChildProfiles' `ready` flag depends on this
  // being a different array reference than the server placeholder, even
  // though both are logically empty.
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(normalize) : [];
  } catch {
    return [];
  }
}

function commit(children: ChildProfile[]): ChildProfile[] {
  cache = children;
  if (isBrowser()) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(children));
    } catch {
      // Private browsing, storage full, etc. — the in-memory cache still
      // keeps this session working; it just won't persist a reload.
    }
  }
  listeners.forEach((listener) => listener());
  return children;
}

export function subscribeLocalChildren(onChange: () => void): () => void {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

export function getLocalChildrenSnapshot(): ChildProfile[] {
  if (cache === undefined) cache = readFromStorage();
  return cache;
}

export function getServerChildrenSnapshot(): ChildProfile[] {
  return EMPTY_SNAPSHOT;
}

export type NewChildProfile = Pick<ChildProfile, "name" | "ageYears" | "avatar" | "favoriteCategory">;

export function addLocalChild(child: NewChildProfile): ChildProfile[] {
  return commit([
    ...getLocalChildrenSnapshot(),
    {
      id: crypto.randomUUID(),
      parentAccountId: LOCAL_PARENT_ID,
      createdAt: new Date().toISOString(),
      accountStatus: "active",
      ...child,
    },
  ]);
}

export function updateLocalChild(id: string, updates: NewChildProfile): ChildProfile[] {
  return commit(getLocalChildrenSnapshot().map((existing) => (existing.id === id ? { ...existing, ...updates } : existing)));
}

/**
 * The account-level suspension Prompt 57 adds (docs/ADMIN_ARCHITECTURE.md)
 * — only the admin user management area calls this; a parent's own
 * child-profile form never can (it only ever sends `NewChildProfile`,
 * which excludes this field). A deactivated child's own view
 * (`/dashboard/children/[childId]`) shows a real blocked state instead of
 * the learning experience.
 */
export function setLocalChildAccountStatus(id: string, accountStatus: ChildProfile["accountStatus"]): ChildProfile[] {
  const target = getLocalChildrenSnapshot().find((child) => child.id === id);
  const result = commit(
    getLocalChildrenSnapshot().map((existing) => (existing.id === id ? { ...existing, accountStatus } : existing)),
  );
  if (target) {
    recordAdminAuditEvent({
      action: "child.account_status_changed",
      targetType: "child",
      targetId: id,
      details: `Set ${target.name}'s account status to "${accountStatus}".`,
    });
  }
  return result;
}
