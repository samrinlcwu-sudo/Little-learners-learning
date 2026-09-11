import type { Application, ApplicationStatus } from "./types";

/**
 * This browser's own applications, stored locally — same architecture and
 * reasoning as src/lib/accounts/local-children.ts and
 * src/lib/resources/local-teacher-resources.ts: no backend is connected,
 * so there's no shared table to write these rows into yet. A browser holds
 * at most one local parent (matching local-children.ts's own
 * "local-browser-only" placeholder), so this is simply "this browser's
 * applications" — ownership is enforced by construction, not a runtime
 * check, the same guarantee every other local-first store in this app
 * relies on.
 */
const STORAGE_KEY = "little-learners-learning:applications";
const LOCAL_PARENT_ID = "local-browser-only";

const EMPTY_SNAPSHOT: Application[] = [];

let cache: Application[] | undefined;
const listeners = new Set<() => void>();

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readFromStorage(): Application[] {
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

function commit(applications: Application[]): Application[] {
  cache = applications;
  if (isBrowser()) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
    } catch {
      // Private browsing, storage full, etc. — the in-memory cache still
      // keeps this session working; it just won't persist a reload.
    }
  }
  listeners.forEach((listener) => listener());
  return applications;
}

export function subscribeLocalApplications(onChange: () => void): () => void {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

export function getLocalApplicationsSnapshot(): Application[] {
  if (cache === undefined) cache = readFromStorage();
  return cache;
}

export function getServerApplicationsSnapshot(): Application[] {
  return EMPTY_SNAPSHOT;
}

/** A short, human-readable reference — not a guess at a real institution's numbering scheme, just something a family can quote back. */
function generateReferenceNumber(): string {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `LLL-${random}`;
}

function pushStatusEvent(application: Application, status: ApplicationStatus): Application {
  return { ...application, statusHistory: [...application.statusHistory, { status, occurredAt: new Date().toISOString() }] };
}

export type NewApplication = Pick<Application, "childId" | "learningInterests" | "message">;

export function createDraftApplication(input: NewApplication): Application[] {
  const now = new Date().toISOString();
  let application: Application = {
    id: crypto.randomUUID(),
    parentAccountId: LOCAL_PARENT_ID,
    childId: input.childId,
    learningInterests: input.learningInterests,
    message: input.message,
    status: "draft",
    statusHistory: [],
    createdAt: now,
    updatedAt: now,
  };
  application = pushStatusEvent(application, "draft");
  return commit([...getLocalApplicationsSnapshot(), application]);
}

export type ApplicationUpdates = Partial<Pick<Application, "childId" | "learningInterests" | "message">>;

/** Editing is only meaningful for a draft — see canEditApplication in types.ts; this function doesn't re-check that itself, the same way updateLocalTeacherResource trusts its caller. */
export function updateDraftApplication(id: string, updates: ApplicationUpdates): Application[] {
  return commit(
    getLocalApplicationsSnapshot().map((application) =>
      application.id === id ? { ...application, ...updates, updatedAt: new Date().toISOString() } : application,
    ),
  );
}

export function submitApplication(id: string): Application[] {
  const now = new Date().toISOString();
  return commit(
    getLocalApplicationsSnapshot().map((application) => {
      if (application.id !== id || application.status !== "draft") return application;
      return pushStatusEvent(
        { ...application, status: "submitted", referenceNumber: generateReferenceNumber(), submittedAt: now, updatedAt: now },
        "submitted",
      );
    }),
  );
}

export function withdrawApplication(id: string): Application[] {
  return commit(
    getLocalApplicationsSnapshot().map((application) => {
      if (application.id !== id || (application.status !== "draft" && application.status !== "submitted")) {
        return application;
      }
      return pushStatusEvent({ ...application, status: "withdrawn", updatedAt: new Date().toISOString() }, "withdrawn");
    }),
  );
}

/** Only a draft can be deleted outright — a submitted or withdrawn application keeps its own real history instead of disappearing. */
export function deleteDraftApplication(id: string): Application[] {
  return commit(
    getLocalApplicationsSnapshot().filter((application) => !(application.id === id && application.status === "draft")),
  );
}
