import type { TeacherProfile } from "./types";

/**
 * Exactly what a public teacher profile is allowed to show — everything
 * else on TeacherProfile (email, countryRegion, languages,
 * teachingInterests, verified, accountId, ...) is never passed to the
 * public-facing view, on purpose. Deliberately narrower than "everything
 * that isn't obviously private": country and languages are genuinely
 * low-sensitivity, but Prompt 27 asks for a focused, professional page —
 * not everything a teacher has ever typed into their dashboard — so this
 * list matches exactly what Part 4 of the brief named, nothing more.
 *
 * Both the real public route (src/app/teachers/p/[slug]/page.tsx) and the
 * profile editor's "Preview" modal render through this same transform, so
 * a preview can never show something the real page wouldn't.
 */
export interface PublicTeacherProfile {
  name: string;
  slug: string;
  photo?: string;
  headline?: string;
  bio?: string;
  education?: string;
  certifications?: string;
  yearsExperience?: number;
  ageGroupsTaught: TeacherProfile["ageGroupsTaught"];
  subjects: string[];
  expertise: string[];
  verified: boolean;
}

export function toPublicTeacherProfile(teacher: TeacherProfile): PublicTeacherProfile {
  return {
    name: teacher.name,
    slug: teacher.slug,
    photo: teacher.photo,
    headline: teacher.headline,
    bio: teacher.bio,
    education: teacher.education,
    certifications: teacher.certifications,
    yearsExperience: teacher.yearsExperience,
    ageGroupsTaught: teacher.ageGroupsTaught,
    subjects: teacher.subjects,
    expertise: teacher.expertise,
    verified: teacher.verified,
  };
}
