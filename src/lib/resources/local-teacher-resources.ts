import type { Resource } from "./types";
import { slugify, randomSlugSuffix } from "@/lib/utils/slugify";

/**
 * Resources a teacher has created, stored in this browser only — same
 * architecture and reasoning as src/lib/accounts/local-children.ts and
 * src/lib/accounts/local-teacher.ts: no backend is connected, so there is
 * no shared table to write these rows into yet. Each record is a real,
 * ordinary `Resource` (src/lib/resources/types.ts) — the exact same shape
 * SAMPLE_RESOURCES uses — with `author.role: "teacher"` and
 * `reviewStatus: "pending"`, so `isResourcePublished()` already treats it
 * correctly (invisible until a real reviewer approves it) with no special
 * casing anywhere else in the app. See docs/TEACHER_ARCHITECTURE.md.
 *
 * A browser holds at most one local teacher account (local-teacher.ts), so
 * this is simply "this browser's teacher's resources" — a flat list, not
 * scoped by a teacher id the way a real multi-tenant table would be.
 * Each resource still carries `author.teacherId`, so migrating to a real
 * `resources` table scoped by the signed-in teacher's id needs no reshaping.
 */
const STORAGE_KEY = "little-learners-learning:teacher-resources";

const EMPTY_SNAPSHOT: Resource[] = [];

let cache: Resource[] | undefined;
const listeners = new Set<() => void>();

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readFromStorage(): Resource[] {
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

function commit(resources: Resource[]): Resource[] {
  cache = resources;
  if (isBrowser()) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(resources));
    } catch {
      // Private browsing, storage full, etc. — the in-memory cache still
      // keeps this session working; it just won't persist a reload.
    }
  }
  listeners.forEach((listener) => listener());
  return resources;
}

export function subscribeLocalTeacherResources(onChange: () => void): () => void {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

export function getLocalTeacherResourcesSnapshot(): Resource[] {
  if (cache === undefined) cache = readFromStorage();
  return cache;
}

export function getServerTeacherResourcesSnapshot(): Resource[] {
  return EMPTY_SNAPSHOT;
}

export type NewTeacherResource = Pick<
  Resource,
  | "title"
  | "description"
  | "resourceType"
  | "category"
  | "subject"
  | "ageRange"
  | "difficulty"
  | "learningObjective"
  | "instructions"
  | "materialsRequired"
  | "thumbnail"
>;

export function addLocalTeacherResource(
  teacherId: string,
  teacherName: string,
  resource: NewTeacherResource,
  status: Resource["publicationStatus"] = "draft",
): Resource[] {
  const now = new Date().toISOString();
  const newResource: Resource = {
    id: crypto.randomUUID(),
    slug: `${slugify(resource.title) || "resource"}-${randomSlugSuffix()}`,
    tags: [],
    author: { name: teacherName, role: "teacher", teacherId },
    accessTier: "free",
    featured: false,
    publicationStatus: status,
    religiousReview: "not-applicable",
    reviewStatus: "pending",
    createdAt: now,
    updatedAt: now,
    ...resource,
  };
  return commit([...getLocalTeacherResourcesSnapshot(), newResource]);
}

export type TeacherResourceUpdates = Partial<NewTeacherResource> & {
  publicationStatus?: Resource["publicationStatus"];
};

export function updateLocalTeacherResource(id: string, updates: TeacherResourceUpdates): Resource[] {
  return commit(
    getLocalTeacherResourcesSnapshot().map((existing) =>
      existing.id === id
        ? {
            ...existing,
            ...updates,
            // Re-submitting after an edit resets review — an approved
            // resource's content can't change without being looked at
            // again. Never a no-op concern in practice today (nothing can
            // reach "approved" without a reviewer tool), but keeps this
            // correct the moment one exists.
            reviewStatus: updates.publicationStatus === "published" ? "pending" : existing.reviewStatus,
            updatedAt: new Date().toISOString(),
          }
        : existing,
    ),
  );
}

export function deleteLocalTeacherResource(id: string): Resource[] {
  return commit(getLocalTeacherResourcesSnapshot().filter((existing) => existing.id !== id));
}
