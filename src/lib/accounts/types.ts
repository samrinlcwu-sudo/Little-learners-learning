/**
 * The account data model — contracts only, exactly like
 * src/lib/content/types.ts and src/lib/games/types.ts. No backend reads or
 * writes any of this yet (no Supabase project is connected — see
 * src/lib/supabase/is-configured.ts). Defining the shape now means real
 * tables and forms can be built against it later without redesigning it
 * under pressure.
 *
 * Full rationale, the planned database schema, and security notes live in
 * docs/ACCOUNTS_ARCHITECTURE.md.
 */

/**
 * "child" is deliberately not a role here — a child doesn't sign in with
 * their own credentials. A child is a profile a parent account manages
 * (see ChildProfile below), not a fourth kind of authenticated account.
 * "admin" exists so the type system already accounts for it, but no admin
 * route or UI is built yet, and none should be exposed publicly when it is.
 */
export type AccountRole = "parent" | "teacher" | "admin";

export interface Account {
  id: string;
  email: string;
  name: string;
  role: AccountRole;
  createdAt: string;
}

/**
 * The fixed set of playful avatar choices a parent picks from — deliberately
 * not a photo upload. No real image of a child is ever collected or stored,
 * which sidesteps the privacy question entirely rather than needing to
 * secure it (see docs/ACCOUNTS_ARCHITECTURE.md).
 */
export const CHILD_AVATAR_IDS = ["sun", "star", "flower", "rocket", "dino", "butterfly"] as const;
export type ChildAvatarId = (typeof CHILD_AVATAR_IDS)[number];

/**
 * One parent account can have many child profiles. A child profile is data
 * the parent controls, not a separate login — appropriate for young
 * children who shouldn't hold their own credentials. Only what's needed to
 * personalize the experience is collected — no photo, no date of birth
 * (just an age in years), no school or location.
 */
export interface ChildProfile {
  id: string;
  parentAccountId: string;
  name: string;
  ageYears: number;
  avatar: ChildAvatarId;
  /** A learning-category slug (src/config/learning-categories.ts) — optional, personalizes what's suggested first. */
  favoriteCategory?: string;
  createdAt: string;
}

/**
 * The self-declared age bands a teacher can pick from — deliberately a
 * short fixed list (matching the platform's own 2–8 audience) rather than
 * a free-text field, so profiles stay comparable and quick to fill in.
 */
export const TEACHER_AGE_GROUPS = ["toddlers", "preschool", "early-primary", "primary"] as const;
export type TeacherAgeGroup = (typeof TEACHER_AGE_GROUPS)[number];

/**
 * Common languages a teacher might teach in. "other" exists so nobody is
 * forced into a false choice, without the maintenance burden of an
 * exhaustive world-language list for what's an optional profile field.
 */
export const TEACHER_LANGUAGES = ["english", "arabic", "urdu", "french", "spanish", "other"] as const;
export type TeacherLanguage = (typeof TEACHER_LANGUAGES)[number];

/**
 * Teaching *styles and approaches* — distinct from `subjects` (what a
 * teacher teaches, from src/config/learning-categories.ts) and
 * `expertise` (a teacher's own free-text specialties). A fixed list
 * because Prompt 28 Part 4 asks for multi-select, not open text, and a
 * teacher's approach is realistically drawn from a recognizable set
 * rather than needing arbitrary new words each time.
 */
export const TEACHING_INTERESTS = [
  "phonics-based-reading",
  "hands-on-learning",
  "outdoor-nature-learning",
  "arts-and-crafts",
  "storytelling-imaginative-play",
  "music-and-movement",
  "stem-inquiry-based",
  "montessori-inspired",
  "play-based-learning",
  "project-based-learning",
  "special-needs-support",
  "bilingual-multilingual-teaching",
  "quran-memorization-support",
  "social-emotional-focus",
  "classroom-routines-behavior",
  "family-engagement",
] as const;
export type TeachingInterest = (typeof TEACHING_INTERESTS)[number];

/**
 * Whether the teacher WANTS their profile visible. Defaults to "private"
 * on every new account — a profile is never public just because it
 * exists. This is one of two independent gates; see
 * `TeacherModerationStatus` below for the other, and
 * src/lib/accounts/teacher-visibility.ts for how they combine.
 */
export const TEACHER_PROFILE_VISIBILITIES = ["private", "public"] as const;
export type TeacherProfileVisibility = (typeof TEACHER_PROFILE_VISIBILITIES)[number];

/**
 * The PLATFORM's side of the same decision (Prompt 28 Part 7) —
 * independent of the teacher's own `visibility` toggle above. A teacher
 * controls whether they *want* to be found; moderation controls whether
 * the platform has actually cleared them to be found or listed.
 *
 * - "pending" — the default for every new profile. Nothing to review yet
 *   (no moderation queue or reviewer exists), so no profile can reach
 *   "approved" automatically or by any action in this codebase — matching
 *   the same rule `verified` already follows: never set automatically.
 * - "approved" — cleared to appear in the searchable directory
 *   (/teachers). Only a real human review step sets this.
 * - "rejected" — declined; hidden everywhere public, including the
 *   direct profile link.
 * - "hidden" — previously approved, later unlisted (e.g. a policy
 *   concern found after the fact) — distinct from "rejected" as a
 *   history, but has the identical effect on visibility.
 *
 * See src/lib/accounts/teacher-visibility.ts for exactly how this
 * combines with `visibility`, and docs/TEACHER_DIRECTORY_ARCHITECTURE.md
 * for the full reasoning.
 */
export const TEACHER_MODERATION_STATUSES = ["pending", "approved", "rejected", "hidden"] as const;
export type TeacherModerationStatus = (typeof TEACHER_MODERATION_STATUSES)[number];

/** Shared display labels — used by the Teacher Dashboard's own read-only badge and the admin teacher management area's moderation controls (docs/ADMIN_ARCHITECTURE.md), so the wording never drifts between the two. */
export const TEACHER_MODERATION_STATUS_LABELS: Record<TeacherModerationStatus, string> = {
  pending: "Pending review",
  approved: "Approved",
  rejected: "Not approved",
  hidden: "Hidden",
};

/**
 * The professional profile behind the /teachers page and the teacher
 * registration flow (docs/TEACHER_ARCHITECTURE.md) — separate from Account
 * so a teacher's public-facing details (bio, subjects) don't live mixed in
 * with private account fields (email). Everything but `name`, `email`, and
 * `countryRegion` is optional on purpose: registration only asks for those,
 * and a teacher can fill in the rest of their profile whenever they like,
 * a little at a time.
 */
export interface TeacherProfile {
  id: string;
  accountId: string;
  name: string;
  email: string;
  countryRegion: string;
  /**
   * URL-safe identifier for the public profile route — generated once at
   * account creation from the name plus a short random suffix, never
   * user-edited, so a shared link never breaks even if the teacher later
   * changes their display name.
   */
  slug: string;
  /** A data URL, stored on this device only — see docs/TEACHER_ARCHITECTURE.md for why this is safe without a file-storage backend. */
  photo?: string;
  /** A one-line professional title, e.g. "Early Years Teacher | Montessori Certified". */
  headline?: string;
  bio?: string;
  education?: string;
  certifications?: string;
  yearsExperience?: number;
  ageGroupsTaught: TeacherAgeGroup[];
  /** Learning-category slugs from src/config/learning-categories.ts. */
  subjects: string[];
  languages: TeacherLanguage[];
  /** Selected from TEACHING_INTERESTS — teaching styles/approaches, not subject matter. */
  teachingInterests: TeachingInterest[];
  /** Free-text professional specialties, distinct from the fixed `subjects` list — e.g. "Special needs support," "Bilingual education." */
  expertise: string[];
  visibility: TeacherProfileVisibility;
  /** See TeacherModerationStatus above — the platform's side of directory/profile visibility, separate from the teacher's own `visibility` toggle. */
  moderationStatus: TeacherModerationStatus;
  /** Sourced by a human review step once teacher registration is connected to a real backend — never set automatically. */
  verified: boolean;
  createdAt: string;
}
