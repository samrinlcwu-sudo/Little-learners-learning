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
  /** A data URL, stored on this device only — see docs/TEACHER_ARCHITECTURE.md for why this is safe without a file-storage backend. */
  photo?: string;
  bio?: string;
  education?: string;
  certifications?: string;
  yearsExperience?: number;
  ageGroupsTaught: TeacherAgeGroup[];
  /** Learning-category slugs from src/config/learning-categories.ts. */
  subjects: string[];
  languages: TeacherLanguage[];
  teachingInterests?: string;
  /** Sourced by a human review step once teacher registration is connected to a real backend — never set automatically. */
  verified: boolean;
  createdAt: string;
}
