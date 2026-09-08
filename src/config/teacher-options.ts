import type { TeacherAgeGroup, TeacherLanguage } from "@/lib/accounts/types";

export interface TeacherOption<T extends string> {
  id: T;
  label: string;
}

/** Presentation for each id in TEACHER_AGE_GROUPS — one entry per id, same order. */
export const TEACHER_AGE_GROUP_OPTIONS: TeacherOption<TeacherAgeGroup>[] = [
  { id: "toddlers", label: "Toddlers (2–3)" },
  { id: "preschool", label: "Preschool (3–5)" },
  { id: "early-primary", label: "Early primary (5–7)" },
  { id: "primary", label: "Primary (7–8+)" },
];

/** Presentation for each id in TEACHER_LANGUAGES — one entry per id, same order. */
export const TEACHER_LANGUAGE_OPTIONS: TeacherOption<TeacherLanguage>[] = [
  { id: "english", label: "English" },
  { id: "arabic", label: "Arabic" },
  { id: "urdu", label: "Urdu" },
  { id: "french", label: "French" },
  { id: "spanish", label: "Spanish" },
  { id: "other", label: "Other" },
];
