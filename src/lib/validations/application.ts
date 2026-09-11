import { z } from "zod";
import { getAllLearningCategories } from "@/config/learning-categories";
import { emailSchema, nameSchema, phoneSchema } from "./common";

const CATEGORY_SLUGS = getAllLearningCategories().map((category) => category.slug);

/**
 * One zod object per wizard step (src/components/patterns/application-wizard.tsx),
 * merged into one schema so a single react-hook-form instance can back the
 * whole flow — each step validates only its own fields via `trigger()`
 * before advancing, and the merged schema validates everything at once
 * before the final submit. Reuses the shared primitives from
 * src/lib/validations/common.ts (written for exactly this: "future forms
 * — contact, registration, admissions, teacher applications") rather than
 * redefining name/email/phone rules a third time.
 */
export const applicantStepSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: z
    .union([phoneSchema, z.literal("")])
    .optional()
    .transform((value) => (value ? value : undefined)),
});

/**
 * `childId` isn't restricted to a fixed enum here — unlike learning
 * interests, which really are one of a known, static set of 16 category
 * slugs, which child profile exists is per-family data the schema can't
 * know in advance. The wizard only ever offers this family's own real
 * children as options, so an invalid id can't reach this schema in
 * practice.
 */
export const learnerStepSchema = z.object({
  childId: z.string().trim().min(1, "Choose a child"),
});

export const interestsStepSchema = z.object({
  learningInterests: z
    .array(z.enum(CATEGORY_SLUGS as [string, ...string[]]))
    .min(1, "Choose at least one learning interest"),
});

export const additionalStepSchema = z.object({
  message: z
    .string()
    .trim()
    .max(500, "Keep it under 500 characters")
    .optional()
    .transform((value) => (value ? value : undefined)),
});

export const applicationWizardSchema = applicantStepSchema
  .merge(learnerStepSchema)
  .merge(interestsStepSchema)
  .merge(additionalStepSchema);

export type ApplicationWizardInput = z.input<typeof applicationWizardSchema>;
export type ApplicationWizardValues = z.output<typeof applicationWizardSchema>;

/** Field names per step, for react-hook-form's `trigger(fields)` — validate only what's visible before letting a family move on. */
export const APPLICATION_STEP_FIELDS = {
  applicant: ["name", "email", "phone"],
  learner: ["childId"],
  interests: ["learningInterests"],
  additional: ["message"],
} as const;
