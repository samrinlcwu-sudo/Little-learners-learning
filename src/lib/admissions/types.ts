/**
 * The application data model — contracts only, same pattern as
 * src/lib/accounts/types.ts and src/lib/resources/types.ts. No backend
 * exists yet (src/lib/supabase/is-configured.ts), so nothing here is
 * submitted anywhere beyond this browser's own localStorage. See
 * docs/ADMISSIONS_ARCHITECTURE.md for the full reasoning, including
 * exactly which statuses this codebase can ever actually reach.
 *
 * Deliberately reuses the existing account model instead of inventing a
 * separate "applicant" identity: an application belongs to this browser's
 * one parent (src/lib/accounts/local-children.ts) and references one of
 * their existing child profiles by id — never a new user or child record
 * of its own.
 *
 * There is also no "Program" here, on purpose. The project brief warns
 * against assuming specific admissions programs exist, and none do — a
 * family instead selects one or more real learning-category slugs
 * (src/config/learning-categories.ts) as their "learning interests," the
 * same 16 subjects every other part of the site already uses. Nothing new
 * was invented to fill that gap.
 */

import type { LearningCategory } from "@/config/learning-categories";

/**
 * Every status the architecture is prepared for. Only "draft", "submitted",
 * and "withdrawn" are ever actually reachable by any code path in this
 * codebase today — a family can save a draft, submit it, or withdraw it
 * themselves. "under-review", "info-requested", "accepted", and "declined"
 * all require a real human admissions reviewer, which doesn't exist yet
 * (the same "prepared, never automatic" rule `TeacherModerationStatus`
 * already follows in src/lib/accounts/types.ts) — nothing in this
 * codebase ever sets an application to one of those four statuses.
 */
export const APPLICATION_STATUSES = [
  "draft",
  "submitted",
  "under-review",
  "info-requested",
  "accepted",
  "declined",
  "withdrawn",
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

/** The four statuses no code path in this repository can ever set — see the comment on ApplicationStatus above. */
export const UNREACHABLE_APPLICATION_STATUSES: readonly ApplicationStatus[] = [
  "under-review",
  "info-requested",
  "accepted",
  "declined",
];

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  "under-review": "Under review",
  "info-requested": "Additional information required",
  accepted: "Accepted",
  declined: "Declined",
  withdrawn: "Withdrawn",
};

/**
 * A real, locally-recorded event — when this browser's own application
 * actually changed status. This is the honest stand-in for
 * "communication/notification": nothing is emailed or pushed anywhere
 * (no backend exists to send anything), but every real transition this
 * family makes is logged with a real timestamp, so the detail page has a
 * genuine timeline instead of a fabricated one.
 */
export interface ApplicationStatusEvent {
  status: ApplicationStatus;
  occurredAt: string;
}

export interface Application {
  id: string;
  parentAccountId: string;
  /** References an existing ChildProfile.id (src/lib/accounts/types.ts) — never a duplicate learner record. */
  childId: string;
  /** Learning-category slugs (src/config/learning-categories.ts) — at least one, chosen from the real 16 subjects. */
  learningInterests: string[];
  /** Whatever the family wants to add — never required, never pre-filled with a suggested claim. */
  message?: string;
  status: ApplicationStatus;
  /** Generated once, on first submission — see generateReferenceNumber in local-applications.ts. Absent for a draft that's never been submitted. */
  referenceNumber?: string;
  statusHistory: ApplicationStatusEvent[];
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
}

/** A submitted or withdrawn application is finished — only a draft or an already-submitted one can still be acted on by the family. */
export function canEditApplication(application: Application): boolean {
  return application.status === "draft";
}

export function canSubmitApplication(application: Application): boolean {
  return application.status === "draft";
}

export function canWithdrawApplication(application: Application): boolean {
  return application.status === "draft" || application.status === "submitted";
}

export interface ApplicationTimelineStep {
  status: ApplicationStatus;
  label: string;
  /** Whether this application's own real statusHistory actually reached this step. */
  reached: boolean;
  occurredAt?: string;
  /** True for a status nothing in this codebase can ever set — rendered as "not available yet," never as progress. */
  unreachable: boolean;
}

/**
 * A simple, honest timeline built only from this application's own real
 * `statusHistory` — never a projection of where it "should" be. A
 * withdrawn application gets its own short timeline (draft → [submitted]
 * → withdrawn) rather than being forced onto the accepted/declined ladder,
 * since withdrawing ends the process rather than advancing it.
 */
export function getApplicationTimeline(application: Application): ApplicationTimelineStep[] {
  const eventFor = (status: ApplicationStatus) => application.statusHistory.find((event) => event.status === status);

  if (application.status === "withdrawn") {
    const steps: ApplicationTimelineStep[] = [
      { status: "draft", label: APPLICATION_STATUS_LABELS.draft, reached: true, occurredAt: eventFor("draft")?.occurredAt, unreachable: false },
    ];
    const submitted = eventFor("submitted");
    if (submitted) {
      steps.push({ status: "submitted", label: APPLICATION_STATUS_LABELS.submitted, reached: true, occurredAt: submitted.occurredAt, unreachable: false });
    }
    steps.push({ status: "withdrawn", label: APPLICATION_STATUS_LABELS.withdrawn, reached: true, occurredAt: eventFor("withdrawn")?.occurredAt, unreachable: false });
    return steps;
  }

  const ladder: ApplicationStatus[] = ["draft", "submitted", "under-review", "accepted"];
  return ladder.map((status) => {
    const event = eventFor(status);
    return {
      status,
      label: APPLICATION_STATUS_LABELS[status],
      reached: Boolean(event),
      occurredAt: event?.occurredAt,
      unreachable: UNREACHABLE_APPLICATION_STATUSES.includes(status),
    };
  });
}

/** Real category objects for an application's stored slugs — filters out any slug that no longer resolves (e.g. a category later deactivated). */
export function getApplicationLearningAreas(
  application: Application,
  allCategories: LearningCategory[],
): LearningCategory[] {
  const bySlug = new Map(allCategories.map((category) => [category.slug, category] as const));
  return application.learningInterests
    .map((slug) => bySlug.get(slug))
    .filter((category): category is LearningCategory => category !== undefined);
}
