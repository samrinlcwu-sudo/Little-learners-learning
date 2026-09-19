/**
 * The fixed set of site-wide analytics events this platform measures.
 * Deliberately small and named for a real business question each answers
 * (which subjects get explored, whether the teacher/application funnels
 * lose people, whether the contact path gets used) — not a general-purpose
 * "track anything" event bus. Kept separate from
 * `src/lib/progress/types.ts` `ProgressEventType`: that system is a real
 * per-child learning-progress feature (attributed to one child, stored to
 * build "what to try next"); this one is anonymous, aggregate site
 * analytics with no child attribution at all. Analytics & search
 * monitoring setup, Prompt 105.
 */
export type AnalyticsEventName =
  | "learning_category_viewed"
  | "resource_viewed"
  | "game_opened"
  | "contact_initiated"
  | "teacher_registration_started"
  | "teacher_registration_completed"
  | "application_started"
  | "application_completed";

/**
 * Non-identifying context only — a category/resource/game slug (public
 * content identifiers, not personal data), never a name, email, phone
 * number, child profile, application content, or auth token. See
 * `docs/SEARCH_MONITORING_PLAN.md`, "Privacy," for the full rule this
 * type is here to make hard to violate by accident.
 */
export type AnalyticsEventProperties = Record<string, string | number | boolean>;
