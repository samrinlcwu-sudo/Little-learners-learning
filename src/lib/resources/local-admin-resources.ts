import type { Resource } from "./types";
import { slugify, randomSlugSuffix } from "@/lib/utils/slugify";

/**
 * Resources created directly through the Admin Dashboard's content library
 * (Prompt 67) — stored in this browser only, the same architecture and
 * reasoning as src/lib/resources/local-teacher-resources.ts: there is still
 * no shared backend (src/lib/supabase/is-configured.ts), so there's no
 * shared table an admin's "create resource" action could write into yet.
 * Each record is a real, ordinary `Resource` with `author.role: "platform"`
 * — the exact same shape SAMPLE_RESOURCES and teacher resources use — so
 * every existing reader (`isResourcePublished`, `filterResources`, the
 * public /resources pages once a backend exists) already handles it
 * correctly with no special casing. See docs/CONTENT_MANAGEMENT_ARCHITECTURE.md.
 *
 * Kept as its own store, separate from local-teacher-resources.ts, for the
 * same reason admin/teacher accounts are separate stores: an admin-authored
 * resource and a teacher-submitted one have different authorship and are
 * moderated by different rules (a platform resource never needs
 * `reviewStatus`), even though both are real `Resource` rows.
 */
const STORAGE_KEY = "little-learners-learning:admin-resources";

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

export function subscribeLocalAdminResources(onChange: () => void): () => void {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

export function getLocalAdminResourcesSnapshot(): Resource[] {
  if (cache === undefined) cache = readFromStorage();
  return cache;
}

export function getServerAdminResourcesSnapshot(): Resource[] {
  return EMPTY_SNAPSHOT;
}

export type NewAdminResource = Pick<
  Resource,
  | "title"
  | "description"
  | "resourceType"
  | "activitySubtype"
  | "category"
  | "subcategory"
  | "subject"
  | "ageRange"
  | "difficulty"
  | "learningObjective"
  | "learningObjectives"
  | "skillsDeveloped"
  | "pageCount"
  | "instructions"
  | "materialsRequired"
  | "tags"
  | "thumbnail"
  | "downloadFile"
  | "accessTier"
  | "featured"
  | "seoTitle"
  | "metaDescription"
  | "canonicalUrl"
>;

/**
 * A brand-new resource can only ever start at "draft" or "review" — never
 * "published" or "archived" — from this one call site, so "create" can
 * never itself be the action that makes something live. Reaching
 * "published" always requires the separate, confirmed
 * setLocalAdminResourceStatus() call.
 */
export function addLocalAdminResource(
  resource: NewAdminResource,
  status: "draft" | "review" = "draft",
): Resource[] {
  const now = new Date().toISOString();
  const newResource: Resource = {
    id: crypto.randomUUID(),
    slug: `${slugify(resource.title) || "resource"}-${randomSlugSuffix()}`,
    author: { name: "Little Learners Learning", role: "platform" },
    publicationStatus: status,
    religiousReview: "not-applicable",
    createdAt: now,
    updatedAt: now,
    ...resource,
  };
  return commit([...getLocalAdminResourcesSnapshot(), newResource]);
}

export type AdminResourceUpdates = Partial<NewAdminResource>;

/** Editing content fields never changes its publication status — only setLocalAdminResourceStatus does that, so an edit can't accidentally publish or unpublish something. */
export function updateLocalAdminResource(id: string, updates: AdminResourceUpdates): Resource[] {
  return commit(
    getLocalAdminResourcesSnapshot().map((existing) =>
      existing.id === id ? { ...existing, ...updates, updatedAt: new Date().toISOString() } : existing,
    ),
  );
}

export function deleteLocalAdminResource(id: string): Resource[] {
  return commit(getLocalAdminResourcesSnapshot().filter((existing) => existing.id !== id));
}

/**
 * The one place publicationStatus ever changes for an admin-authored
 * resource — kept separate from updateLocalAdminResource so that
 * publishing (or archiving) is always its own explicit call, never a
 * side effect of saving an edited field. The admin content list/detail UI
 * additionally requires a confirmation before calling this with
 * "published" or "archived" (see admin-resource-detail.tsx) — "publishing
 * must be deliberate."
 */
export function setLocalAdminResourceStatus(id: string, status: Resource["publicationStatus"]): Resource[] {
  return commit(
    getLocalAdminResourcesSnapshot().map((existing) =>
      existing.id === id ? { ...existing, publicationStatus: status, updatedAt: new Date().toISOString() } : existing,
    ),
  );
}
