import { z } from "zod";
import { emailSchema, nameSchema } from "./common";
import { passwordSchema } from "./auth";
import { TEACHER_AGE_GROUPS, TEACHER_LANGUAGES, TEACHING_INTERESTS } from "@/lib/accounts/types";

export const countryRegionSchema = z
  .string()
  .trim()
  .min(2, "Enter your country or region")
  .max(80, "Must be 80 characters or fewer");

/**
 * Step 1 of teacher registration — everything required to create an
 * account, nothing else. See src/components/patterns/teacher-register-form.tsx.
 */
export const teacherAccountSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  countryRegion: countryRegionSchema,
  password: passwordSchema,
});
export type TeacherAccountValues = z.infer<typeof teacherAccountSchema>;

/**
 * Step 2 — every field here is optional, on purpose: a teacher lands here
 * right after creating an account and shouldn't face a wall of required
 * fields before they can reach their dashboard. See
 * src/components/patterns/teacher-profile-form.tsx.
 */
export const teacherProfileSchema = z.object({
  photo: z.string().optional(),
  headline: z.string().trim().max(120, "Must be 120 characters or fewer").optional(),
  bio: z.string().trim().max(600, "Keep it under 600 characters").optional(),
  education: z.string().trim().max(200, "Must be 200 characters or fewer").optional(),
  certifications: z.string().trim().max(300, "Must be 300 characters or fewer").optional(),
  // Preprocessed so a blank field means "not provided" rather than
  // coercing to 0 — z.coerce.number() would otherwise turn "" into 0,
  // silently recording "0 years of experience" for someone who left it empty.
  yearsExperience: z.preprocess(
    (value) => (value === "" || value === undefined || value === null ? undefined : value),
    z.coerce
      .number()
      .int("Enter a whole number")
      .min(0, "Enter a number of years")
      .max(60, "Enter a realistic number of years")
      .optional(),
  ),
  ageGroupsTaught: z.array(z.enum(TEACHER_AGE_GROUPS)).default([]),
  subjects: z.array(z.string()).default([]),
  languages: z.array(z.enum(TEACHER_LANGUAGES)).default([]),
  teachingInterests: z.array(z.enum(TEACHING_INTERESTS)).default([]),
  // Entered as one comma-separated line in the UI, stored as a real array —
  // simpler than another checkbox grid for something that's genuinely
  // free-text ("Special needs support," "Bilingual education," ...).
  expertise: z
    .string()
    .optional()
    .transform((value) =>
      (value ?? "")
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean),
    ),
});
/** The shape react-hook-form fields hold before validation (yearsExperience arrives as a string). */
export type TeacherProfileInput = z.input<typeof teacherProfileSchema>;
/** The shape after zod validates and coerces — what onSave actually receives. */
export type TeacherProfileValues = z.output<typeof teacherProfileSchema>;
