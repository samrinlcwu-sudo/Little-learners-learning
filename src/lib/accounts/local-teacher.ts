import type { TeacherProfile } from "./types";
import { slugify, randomSlugSuffix } from "@/lib/utils/slugify";

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

/**
 * Fills in defaults for fields added or reshaped after a record may have
 * been created, so a profile saved before those changes doesn't crash the
 * rest of the app on read. A missing slug is generated and persisted
 * immediately, since every other piece of this system assumes one exists.
 */
function normalize(profile: TeacherProfile): TeacherProfile {
  // `profile` is parsed JSON asserted as TeacherProfile — the type says
  // these fields always exist, but an older record won't actually have
  // them (or, for teachingInterests, will have the pre-Prompt-28 string
  // shape), so each is read defensively rather than assumed.
  const withDefaults: TeacherProfile = {
    ...profile,
    expertise: profile.expertise ?? [],
    visibility: profile.visibility ?? "private",
    moderationStatus: profile.moderationStatus ?? "pending",
    // Prompt 28 changed this from free text to a fixed multi-select.
    // Old free text can't be safely auto-mapped onto the new options
    // without guessing at what the teacher meant — the same "don't invent
    // expertise" rule this prompt states outright — so it's dropped
    // rather than converted, and the teacher can reselect from the real
    // list next time they edit their profile.
    teachingInterests: Array.isArray(profile.teachingInterests) ? profile.teachingInterests : [],
  };
  if (!withDefaults.slug) {
    withDefaults.slug = `${slugify(withDefaults.name) || "teacher"}-${randomSlugSuffix()}`;
  }
  return withDefaults;
}

function readFromStorage(): TeacherProfile | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;

    const normalized = normalize(parsed as TeacherProfile);
    // A backfilled slug must be written back immediately — regenerating a
    // new random one on every future load would silently break any link
    // to the public profile page that used the previous one.
    if (normalized.slug !== (parsed as TeacherProfile).slug) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      } catch {
        // Storage full/unavailable — the in-memory value below still works for this session.
      }
    }
    return normalized;
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
    slug: `${slugify(account.name) || "teacher"}-${randomSlugSuffix()}`,
    ageGroupsTaught: [],
    subjects: [],
    languages: [],
    teachingInterests: [],
    expertise: [],
    visibility: "private",
    moderationStatus: "pending",
    verified: false,
    createdAt: new Date().toISOString(),
    ...account,
  };
  commit(profile);
  return profile;
}

export type TeacherProfileUpdates = Partial<
  Omit<TeacherProfile, "id" | "accountId" | "slug" | "visibility" | "moderationStatus" | "verified" | "createdAt">
>;

/** Merges profile-completion fields into the existing record — see teacher-profile-form.tsx. No-ops if no account exists yet. */
export function updateLocalTeacherProfile(updates: TeacherProfileUpdates): TeacherProfile | null {
  const current = getLocalTeacherSnapshot();
  if (!current) return null;
  return commit({ ...current, ...updates });
}

/**
 * The one control this browser has over public visibility (see
 * docs/TEACHER_ARCHITECTURE.md, "Privacy & visibility"). Kept separate
 * from updateLocalTeacherProfile — a publishing decision, not a content
 * edit — so the profile editor's Save can never accidentally flip it.
 */
export function setLocalTeacherVisibility(
  visibility: TeacherProfile["visibility"],
): TeacherProfile | null {
  const current = getLocalTeacherSnapshot();
  if (!current) return null;
  return commit({ ...current, visibility });
}

/**
 * The platform's side of the "two gates" (docs/TEACHER_DIRECTORY_ARCHITECTURE.md)
 * — the human review step `moderationStatus` was always modeled for but had
 * no real control anywhere in this codebase until the admin teacher
 * management area (docs/ADMIN_ARCHITECTURE.md). Kept as its own function,
 * separate from `updateLocalTeacherProfile`, for the same reason
 * `setLocalTeacherVisibility` is: a moderation decision, not a content
 * edit a teacher's own form could ever trigger.
 */
export function setLocalTeacherModerationStatus(
  moderationStatus: TeacherProfile["moderationStatus"],
): TeacherProfile | null {
  const current = getLocalTeacherSnapshot();
  if (!current) return null;
  return commit({ ...current, moderationStatus });
}

/**
 * The other human-review field that had no real setter anywhere in this
 * codebase — `verified` stayed permanently `false` because nothing could
 * set it to `true`. Only the admin teacher management area calls this; a
 * teacher's own profile editor never can (see `TeacherProfileUpdates`
 * above, which excludes it).
 */
export function setLocalTeacherVerified(verified: boolean): TeacherProfile | null {
  const current = getLocalTeacherSnapshot();
  if (!current) return null;
  return commit({ ...current, verified });
}
