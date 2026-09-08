import type { TeacherProfile } from "./types";

export interface ProfileCompletionField {
  label: string;
  complete: boolean;
}

export interface ProfileCompletionSummary {
  percent: number;
  completedCount: number;
  totalCount: number;
  fields: ProfileCompletionField[];
}

/**
 * A real count of which profile-completion fields are actually filled in —
 * never an estimate. Required account fields (name, email, countryRegion)
 * aren't included: they're guaranteed to exist the moment an account is
 * created, so counting them would inflate every teacher's percentage
 * before they've done anything on the profile-completion step.
 */
export function calculateProfileCompletion(teacher: TeacherProfile): ProfileCompletionSummary {
  const fields: ProfileCompletionField[] = [
    { label: "Profile photo", complete: Boolean(teacher.photo) },
    { label: "Professional bio", complete: Boolean(teacher.bio) },
    { label: "Education", complete: Boolean(teacher.education) },
    { label: "Certifications", complete: Boolean(teacher.certifications) },
    { label: "Years of experience", complete: teacher.yearsExperience !== undefined },
    { label: "Age groups taught", complete: teacher.ageGroupsTaught.length > 0 },
    { label: "Subjects / learning areas", complete: teacher.subjects.length > 0 },
    { label: "Languages", complete: teacher.languages.length > 0 },
    { label: "Teaching interests", complete: Boolean(teacher.teachingInterests) },
  ];

  const completedCount = fields.filter((field) => field.complete).length;
  const totalCount = fields.length;

  return {
    percent: Math.round((completedCount / totalCount) * 100),
    completedCount,
    totalCount,
    fields,
  };
}
