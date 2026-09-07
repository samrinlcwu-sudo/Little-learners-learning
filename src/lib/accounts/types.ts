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
 * The professional profile promised on the /teachers page — separate from
 * Account so a teacher's public-facing details (bio, subjects) don't live
 * mixed in with private account fields (email).
 */
export interface TeacherProfile {
  id: string;
  accountId: string;
  bio: string;
  subjects: string[];
  yearsExperience?: number;
  /** Sourced by a human review step once teacher registration exists — never set automatically. */
  verified: boolean;
  createdAt: string;
}
