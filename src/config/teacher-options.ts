import type { TeacherAgeGroup, TeacherLanguage, TeachingInterest } from "@/lib/accounts/types";
import type { AgeRange } from "@/lib/content/types";
import { getActiveOptions, type TaxonomyOption } from "@/lib/taxonomy/types";

export interface TeacherAgeGroupOption extends TaxonomyOption<TeacherAgeGroup> {
  /**
   * The actual years this band covers — kept as data, not baked into
   * `label`, so the range is configurable in one place (Prompt 28, Part 2)
   * instead of hunting through label strings across the app whenever it
   * changes. Reuses the same AgeRange shape learning categories, games,
   * and resources already use (src/lib/content/types.ts) rather than a
   * one-off shape just for this list.
   */
  ageRange: AgeRange;
}

/**
 * Child-friendly stage names instead of clinical "0-3 years" style ranges
 * — a parent or teacher recognizes "Nursery" or "Kindergarten" instantly.
 * The ids themselves are unchanged from Prompt 27 (only the label and the
 * now-explicit ageRange changed), so any profile saved before this prompt
 * still matches correctly.
 */
export const TEACHER_AGE_GROUP_OPTIONS: TeacherAgeGroupOption[] = [
  { id: "toddlers", label: "Nursery", ageRange: { minYears: 2, maxYears: 3 } },
  { id: "preschool", label: "Preschool", ageRange: { minYears: 3, maxYears: 5 } },
  { id: "early-primary", label: "Kindergarten", ageRange: { minYears: 5, maxYears: 6 } },
  { id: "primary", label: "Primary", ageRange: { minYears: 6, maxYears: 8 } },
];

/** Active age-group options, each with its own configurable age range — see TeacherAgeGroupOption above. */
export function getAllTeacherAgeGroupOptions(): TeacherAgeGroupOption[] {
  return getActiveOptions(TEACHER_AGE_GROUP_OPTIONS);
}

/** The friendly label plus its configured range, e.g. "Preschool (3–5)" — built from data, not hand-written per option. */
export function formatTeacherAgeGroupLabel(option: TeacherAgeGroupOption): string {
  return `${option.label} (${option.ageRange.minYears}–${option.ageRange.maxYears})`;
}

export type TeacherLanguageOption = TaxonomyOption<TeacherLanguage>;

/** A teacher only ever appears here by their own selection (Prompt 28, Part 3) — nothing infers language ability from name, country, or any other field. */
export const TEACHER_LANGUAGE_OPTIONS: TeacherLanguageOption[] = [
  { id: "english", label: "English" },
  { id: "arabic", label: "Arabic" },
  { id: "urdu", label: "Urdu" },
  { id: "french", label: "French" },
  { id: "spanish", label: "Spanish" },
  { id: "other", label: "Other" },
];

export function getAllTeacherLanguageOptions(): TeacherLanguageOption[] {
  return getActiveOptions(TEACHER_LANGUAGE_OPTIONS);
}

export type TeachingInterestOption = TaxonomyOption<TeachingInterest>;

/**
 * Plain, parent-readable labels — no jargon like "pedagogy" or
 * "andragogy" (Prompt 28, Part 8: labels should read clearly to a person
 * and to an answer engine, not sound like an internal taxonomy code).
 */
export const TEACHING_INTEREST_OPTIONS: TeachingInterestOption[] = [
  { id: "phonics-based-reading", label: "Phonics-based reading" },
  { id: "hands-on-learning", label: "Hands-on learning" },
  { id: "outdoor-nature-learning", label: "Outdoor & nature learning" },
  { id: "arts-and-crafts", label: "Arts & crafts" },
  { id: "storytelling-imaginative-play", label: "Storytelling & imaginative play" },
  { id: "music-and-movement", label: "Music & movement" },
  { id: "stem-inquiry-based", label: "STEM & inquiry-based learning" },
  { id: "montessori-inspired", label: "Montessori-inspired methods" },
  { id: "play-based-learning", label: "Play-based learning" },
  { id: "project-based-learning", label: "Project-based learning" },
  { id: "special-needs-support", label: "Special needs support" },
  { id: "bilingual-multilingual-teaching", label: "Bilingual / multilingual teaching" },
  { id: "quran-memorization-support", label: "Qur'an memorization support" },
  { id: "social-emotional-focus", label: "Social-emotional learning focus" },
  { id: "classroom-routines-behavior", label: "Classroom routines & behavior support" },
  { id: "family-engagement", label: "Parent & family engagement" },
];

export function getAllTeachingInterestOptions(): TeachingInterestOption[] {
  return getActiveOptions(TEACHING_INTEREST_OPTIONS);
}
