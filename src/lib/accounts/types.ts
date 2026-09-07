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
 * One parent account can have many child profiles. A child profile is data
 * the parent controls, not a separate login — appropriate for young
 * children who shouldn't hold their own credentials.
 */
export interface ChildProfile {
  id: string;
  parentAccountId: string;
  name: string;
  ageYears: number;
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
