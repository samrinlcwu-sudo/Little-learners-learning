import type { TeacherProfile } from "./types";

/**
 * Exactly what a public teacher profile is allowed to show — everything
 * else on TeacherProfile (email, accountId, moderationStatus, ...) is
 * never passed to the public-facing view, on purpose. Prompt 27 kept this
 * list to exactly what its Part 4 named; Prompt 28's directory (Part 2)
 * explicitly asks to search by language and "region where appropriate,"
 * so `languages` and `countryRegion` were added; Prompt 43's discovery
 * work adds `teachingInterests` the same way — a teacher's own selected
 * teaching styles/approaches are exactly as low-sensitivity as `subjects`
 * or `expertise` (already public), and a parent deciding whether a
 * teacher's approach fits their child benefits from seeing them.
 * Everything else stays excluded.
 *
 * Both the real public route (src/app/teachers/p/[slug]/page.tsx), the
 * directory card (src/components/patterns/teacher-directory-card.tsx),
 * and the profile editor's "Preview" modal render through this same
 * transform, so none of them can ever show something the others wouldn't.
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
  countryRegion: string;
  ageGroupsTaught: TeacherProfile["ageGroupsTaught"];
  subjects: string[];
  languages: TeacherProfile["languages"];
  expertise: string[];
  teachingInterests: TeacherProfile["teachingInterests"];
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
    countryRegion: teacher.countryRegion,
    ageGroupsTaught: teacher.ageGroupsTaught,
    subjects: teacher.subjects,
    languages: teacher.languages,
    expertise: teacher.expertise,
    teachingInterests: teacher.teachingInterests,
    verified: teacher.verified,
  };
}
