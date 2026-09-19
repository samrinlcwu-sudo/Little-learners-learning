import { createClient } from "@/lib/supabase/client";
import { slugify, randomSlugSuffix } from "@/lib/utils/slugify";
import type { TeacherProfile } from "./types";
import type { Tables } from "@/lib/supabase/database.types";

/**
 * The real, Supabase-backed replacement for `local-teacher.ts` (Prompt
 * 110 — see docs/AUTHENTICATION_BACKEND_AUDIT.md). `id` is the teacher's
 * own `auth.users.id` (a one-to-one relationship, not a separate
 * generated id) — RLS on `teacher_profiles` scopes every owner read/write
 * to `id = auth.uid()`, and a separate policy allows public read only for
 * rows that are genuinely `visibility = 'public'` and not moderation-
 * blocked, matching `canViewTeacherProfile()`
 * (`./teacher-visibility.ts`) exactly.
 */
type TeacherProfileRow = Tables<"teacher_profiles">;

function toTeacherProfile(row: TeacherProfileRow): TeacherProfile {
  return {
    id: row.id,
    accountId: row.id,
    name: row.name,
    email: row.email,
    countryRegion: row.country_region,
    slug: row.slug,
    photo: row.photo ?? undefined,
    headline: row.headline ?? undefined,
    bio: row.bio ?? undefined,
    education: row.education ?? undefined,
    certifications: row.certifications ?? undefined,
    yearsExperience: row.years_experience ?? undefined,
    ageGroupsTaught: row.age_groups_taught as TeacherProfile["ageGroupsTaught"],
    subjects: row.subjects,
    languages: row.languages as TeacherProfile["languages"],
    teachingInterests: row.teaching_interests as TeacherProfile["teachingInterests"],
    expertise: row.expertise,
    visibility: row.visibility as TeacherProfile["visibility"],
    moderationStatus: row.moderation_status as TeacherProfile["moderationStatus"],
    verified: row.verified,
    createdAt: row.created_at,
    accountStatus: row.account_status as TeacherProfile["accountStatus"],
  };
}

/**
 * Handles the case `teacher-register-form.tsx` can't handle itself: when
 * this Supabase project requires email confirmation, `signUp()` returns
 * no session, so there is no authenticated request that could satisfy the
 * `teacher_profiles` insert policy (`with check (id = auth.uid())`) at
 * registration time. The profile row is created lazily instead, the
 * first time this teacher actually has a real session — right after they
 * confirm and sign in — using the name/country they entered at
 * registration (`user_metadata`, set by `signUp`'s own `options.data`)
 * and their confirmed email. Idempotent: a second call once the row
 * exists is a plain read.
 */
export async function ensureOwnTeacherProfileExists(): Promise<{ teacher: TeacherProfile; justCreated: boolean }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");

  const existing = await fetchOwnTeacherProfile();
  if (existing) return { teacher: existing, justCreated: false };

  const metadata = user.user_metadata as { name?: string; countryRegion?: string };
  const created = await createTeacherProfileRow(user.id, {
    name: metadata.name ?? "",
    email: user.email ?? "",
    countryRegion: metadata.countryRegion ?? "",
  });
  return { teacher: created, justCreated: true };
}

export async function fetchOwnTeacherProfile(): Promise<TeacherProfile | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase.from("teacher_profiles").select("*").eq("id", user.id).maybeSingle();
  if (error) throw error;
  return data ? toTeacherProfile(data) : null;
}

export interface NewTeacherAccount {
  name: string;
  email: string;
  countryRegion: string;
}

/**
 * Called right after a successful `supabase.auth.signUp()` — `userId` is
 * that new auth user's real id, reused as this row's own primary key.
 */
export async function createTeacherProfileRow(userId: string, account: NewTeacherAccount): Promise<TeacherProfile> {
  const supabase = createClient();
  const slug = `${slugify(account.name) || "teacher"}-${randomSlugSuffix()}`;
  const { data, error } = await supabase
    .from("teacher_profiles")
    .insert({
      id: userId,
      name: account.name,
      email: account.email,
      country_region: account.countryRegion,
      slug,
    })
    .select("*")
    .single();
  if (error) throw error;
  return toTeacherProfile(data);
}

export type TeacherProfileUpdates = Partial<
  Omit<TeacherProfile, "id" | "accountId" | "slug" | "visibility" | "moderationStatus" | "verified" | "accountStatus" | "createdAt">
>;

export async function updateOwnTeacherProfile(updates: TeacherProfileUpdates): Promise<TeacherProfile> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");

  const payload: Partial<TeacherProfileRow> = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.email !== undefined) payload.email = updates.email;
  if (updates.countryRegion !== undefined) payload.country_region = updates.countryRegion;
  if (updates.photo !== undefined) payload.photo = updates.photo;
  if (updates.headline !== undefined) payload.headline = updates.headline;
  if (updates.bio !== undefined) payload.bio = updates.bio;
  if (updates.education !== undefined) payload.education = updates.education;
  if (updates.certifications !== undefined) payload.certifications = updates.certifications;
  if (updates.yearsExperience !== undefined) payload.years_experience = updates.yearsExperience;
  if (updates.ageGroupsTaught !== undefined) payload.age_groups_taught = updates.ageGroupsTaught;
  if (updates.subjects !== undefined) payload.subjects = updates.subjects;
  if (updates.languages !== undefined) payload.languages = updates.languages;
  if (updates.teachingInterests !== undefined) payload.teaching_interests = updates.teachingInterests;
  if (updates.expertise !== undefined) payload.expertise = updates.expertise;

  const { data, error } = await supabase.from("teacher_profiles").update(payload).eq("id", user.id).select("*").single();
  if (error) throw error;
  return toTeacherProfile(data);
}

/** The teacher's own control over public visibility — kept separate from a content edit, same reasoning as the local-only version. */
export async function setOwnTeacherVisibility(visibility: TeacherProfile["visibility"]): Promise<TeacherProfile> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");

  const { data, error } = await supabase
    .from("teacher_profiles")
    .update({ visibility })
    .eq("id", user.id)
    .select("*")
    .single();
  if (error) throw error;
  return toTeacherProfile(data);
}

/**
 * The real, cross-browser public lookup the local-only version could
 * never do (its own comment said so plainly: "the only profile this page
 * can ever actually find is the one saved in the visitor's own browser").
 * Reads from the `public_teacher_profiles` view, not the base table — the
 * view's own column list never includes `email`, so there is no query
 * mistake here that could leak it. Anonymous (not signed in) visitors can
 * call this: the view's underlying RLS policy allows it for any row that
 * is genuinely `visibility = 'public'` and not moderation-blocked.
 */
export async function fetchPublicTeacherProfileBySlug(
  slug: string,
): Promise<Omit<TeacherProfile, "email" | "accountId" | "accountStatus"> | null> {
  const supabase = createClient();
  const { data, error } = await supabase.from("public_teacher_profiles").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id!,
    name: data.name!,
    countryRegion: data.country_region!,
    slug: data.slug!,
    photo: data.photo ?? undefined,
    headline: data.headline ?? undefined,
    bio: data.bio ?? undefined,
    education: data.education ?? undefined,
    certifications: data.certifications ?? undefined,
    yearsExperience: data.years_experience ?? undefined,
    ageGroupsTaught: (data.age_groups_taught ?? []) as TeacherProfile["ageGroupsTaught"],
    subjects: data.subjects ?? [],
    languages: (data.languages ?? []) as TeacherProfile["languages"],
    teachingInterests: (data.teaching_interests ?? []) as TeacherProfile["teachingInterests"],
    expertise: data.expertise ?? [],
    visibility: data.visibility as TeacherProfile["visibility"],
    moderationStatus: data.moderation_status as TeacherProfile["moderationStatus"],
    verified: data.verified ?? false,
    createdAt: data.created_at!,
  };
}
