import type { TeacherProfile } from "./types";

/**
 * The one teacher profile this browser holds — same reasoning as
 * src/lib/accounts/local-children.ts: no Supabase project is connected
 * (src/lib/supabase/is-configured.ts), so there's no real account to
 * attach this to, and `accountId` is always this fixed placeholder.
 * Unlike child profiles (a parent can have several), a browser holds at
 * most one local teacher record — it represents "your own account," so a
 * single nullable slot rather than a list.
 *
 * Deliberately does NOT store a password. A password is validated by
 * teacherAccountSchema (src/lib/validations/teacher.ts) for format only,
 * then discarded the moment the form submits — see
 * src/components/patterns/teacher-register-form.tsx. This matches the
 * existing account-security rule documented in
 * docs/ACCOUNTS_ARCHITECTURE.md: "passwords are never touched by this
 * codebase's own code." Storing one in localStorage, even locally, would
 * break that rule for no real benefit.
 *
 * Modeled as a tiny external store, read via useSyncExternalStore
 * (see use-teacher-profile.ts) for the same hydration-safety reasons as
 * every other local-first feature in this codebase.
 */
const STORAGE_KEY = "little-learners-learning:teacher-profile";
const LOCAL_TEACHER_ACCOUNT_ID = "local-browser-only-teacher";

/**
 * `undefined` means "haven't checked localStorage yet" (what the server,
 * and the client's first paint, both start with); `null` means "checked,
 * and there genuinely isn't a local account." Using `undefined` as the
 * not-loaded placeholder — rather than `null` for that too — is what lets
 * useTeacherProfile's `ready` flag tell those two states apart, the same
 * way local-children.ts uses two different array references for the
 * equivalent distinction.
 */
let cache: TeacherProfile | null | undefined;
const listeners = new Set<() => void>();

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readFromStorage(): TeacherProfile | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as TeacherProfile) : null;
  } catch {
    return null;
  }
}

function commit(profile: TeacherProfile | null): TeacherProfile | null {
  cache = profile;
  if (isBrowser()) {
    try {
      if (profile) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Private browsing, storage full, etc. — the in-memory cache still
      // keeps this session working; it just won't persist a reload.
    }
  }
  listeners.forEach((listener) => listener());
  return profile;
}

export function subscribeLocalTeacher(onChange: () => void): () => void {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

export function getLocalTeacherSnapshot(): TeacherProfile | null | undefined {
  if (cache === undefined) cache = readFromStorage();
  return cache;
}

/** Always `undefined` — the fixed placeholder for "not loaded yet" (see the `cache` comment above). */
export function getServerTeacherSnapshot(): TeacherProfile | null | undefined {
  return undefined;
}

export interface NewTeacherAccount {
  name: string;
  email: string;
  countryRegion: string;
}

/** Creates the local record for step 1 of registration — see teacher-register-form.tsx. Never receives a password. */
export function createLocalTeacherAccount(account: NewTeacherAccount): TeacherProfile {
  const profile: TeacherProfile = {
    id: crypto.randomUUID(),
    accountId: LOCAL_TEACHER_ACCOUNT_ID,
    ageGroupsTaught: [],
    subjects: [],
    languages: [],
    verified: false,
    createdAt: new Date().toISOString(),
    ...account,
  };
  commit(profile);
  return profile;
}

export type TeacherProfileUpdates = Partial<
  Omit<TeacherProfile, "id" | "accountId" | "verified" | "createdAt">
>;

/** Merges profile-completion fields into the existing record — see teacher-profile-form.tsx. No-ops if no account exists yet. */
export function updateLocalTeacherProfile(updates: TeacherProfileUpdates): TeacherProfile | null {
  const current = getLocalTeacherSnapshot();
  if (!current) return null;
  return commit({ ...current, ...updates });
}
