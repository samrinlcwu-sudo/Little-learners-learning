import type { TeacherProfile } from "./types";

export interface ProfileCompletionField {
  label: string;
  complete: boolean;
}

export interface ProfileCompletionSection {
  title: string;
  fields: ProfileCompletionField[];
  percent: number;
}

export interface ProfileCompletionSummary {
  percent: number;
  completedCount: number;
  totalCount: number;
  sections: ProfileCompletionSection[];
  /** Not scored — see the module comment for why. Always its own section, so it stays visible without dragging the percentage down. */
  resourcesNote: string;
}

function sectionPercent(fields: ProfileCompletionField[]): number {
  return Math.round((fields.filter((f) => f.complete).length / fields.length) * 100);
}

/**
 * A real count of which profile-completion fields are actually filled in —
 * never an estimate. Required account fields (name, email, countryRegion)
 * aren't included: they're guaranteed to exist the moment an account is
 * created, so counting them would inflate every teacher's percentage
 * before they've done anything on the profile-completion step.
 *
 * Grouped into the same named sections the profile editor and dashboard
 * use (Basic Information, Professional Information, Teaching Expertise),
 * per Prompt 27's request for "a useful profile-completion indicator,"
 * not just one flat number. "Resources" is deliberately excluded from the
 * score: resource authoring isn't built yet (docs/TEACHER_ARCHITECTURE.md),
 * so there is nothing a teacher could fill in there — scoring it would
 * unfairly cap everyone's percentage below 100% for a feature that isn't
 * theirs to complete.
 */
export function calculateProfileCompletion(teacher: TeacherProfile): ProfileCompletionSummary {
  const basicInformation: ProfileCompletionField[] = [
    { label: "Profile photo", complete: Boolean(teacher.photo) },
    { label: "Professional headline", complete: Boolean(teacher.headline) },
  ];

  const professionalInformation: ProfileCompletionField[] = [
    { label: "Professional bio", complete: Boolean(teacher.bio) },
    { label: "Education", complete: Boolean(teacher.education) },
    { label: "Certifications", complete: Boolean(teacher.certifications) },
    { label: "Years of experience", complete: teacher.yearsExperience !== undefined },
  ];

  const teachingExpertise: ProfileCompletionField[] = [
    { label: "Age groups taught", complete: teacher.ageGroupsTaught.length > 0 },
    { label: "Subjects / learning areas", complete: teacher.subjects.length > 0 },
    { label: "Languages", complete: teacher.languages.length > 0 },
    { label: "Areas of expertise", complete: teacher.expertise.length > 0 },
    { label: "Teaching interests", complete: teacher.teachingInterests.length > 0 },
  ];

  const sections: ProfileCompletionSection[] = [
    { title: "Basic Information", fields: basicInformation, percent: sectionPercent(basicInformation) },
    { title: "Professional Information", fields: professionalInformation, percent: sectionPercent(professionalInformation) },
    { title: "Teaching Expertise", fields: teachingExpertise, percent: sectionPercent(teachingExpertise) },
  ];

  const allFields = sections.flatMap((section) => section.fields);
  const completedCount = allFields.filter((field) => field.complete).length;
  const totalCount = allFields.length;

  return {
    percent: Math.round((completedCount / totalCount) * 100),
    completedCount,
    totalCount,
    sections,
    resourcesNote: "Resource authoring isn't connected yet — nothing to show here until it is.",
  };
}
