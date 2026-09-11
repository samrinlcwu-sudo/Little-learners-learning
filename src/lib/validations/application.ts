import { z } from "zod";
import { getAllLearningCategories } from "@/config/learning-categories";

const CATEGORY_SLUGS = getAllLearningCategories().map((category) => category.slug);

/**
 * What a family fills in to start or edit a draft application
 * (src/lib/admissions/types.ts). `childId` isn't restricted to a fixed
 * enum here — unlike `learningInterests`, which really is one of a known,
 * static set of 16 category slugs, which child profile exists is per-family
 * data the schema can't know in advance. The form only ever offers this
 * family's own real children as options (ApplicationForm), so an invalid
 * id can't reach this schema in practice.
 */
export const applicationSchema = z.object({
  childId: z.string().trim().min(1, "Choose a child"),
  learningInterests: z
    .array(z.enum(CATEGORY_SLUGS as [string, ...string[]]))
    .min(1, "Choose at least one learning interest"),
  message: z
    .string()
    .trim()
    .max(500, "Keep it under 500 characters")
    .optional()
    .transform((value) => (value ? value : undefined)),
});

export type ApplicationInput = z.input<typeof applicationSchema>;
export type ApplicationValues = z.output<typeof applicationSchema>;
