import { z } from "zod";
import { getAllResourceTypeOptions } from "@/config/teacher-resource-types";
import { getAllLearningCategories } from "@/config/learning-categories";

const RESOURCE_TYPE_IDS = getAllResourceTypeOptions().map((option) => option.id);
const CATEGORY_SLUGS = getAllLearningCategories().map((category) => category.slug);
const ACTIVITY_SUBTYPE_IDS = ["matching", "tracing", "sorting", "counting", "letter", "coloring", "general"] as const;

/** One item per line in a textarea, blank lines dropped — the same "simple textarea over a repeating field group" tradeoff used throughout this codebase (e.g. teacher `expertise`). */
const lineListSchema = z
  .string()
  .optional()
  .transform((value) =>
    (value ?? "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
  );

/**
 * What an admin fills in to create or edit a resource in the Content
 * Library (Prompt 67). Every field maps directly onto a real field on
 * `Resource` (src/lib/resources/types.ts) — the resource type picker reads
 * the full `getAllResourceTypeOptions()` list (unlike a teacher's own,
 * narrower `getAllTeacherResourceTypeOptions()`), since an admin manages
 * the whole catalog. `publicationStatus` is deliberately absent — creating
 * or editing content never sets it; only a separate, confirmed action does
 * (see local-admin-resources.ts, "publishing must be deliberate").
 */
export const adminResourceSchema = z
  .object({
    title: z.string().trim().min(3, "Enter a title").max(120, "Must be 120 characters or fewer"),
    description: z.string().trim().min(10, "Enter a short description").max(500, "Keep it under 500 characters"),
    resourceType: z.enum(RESOURCE_TYPE_IDS as [string, ...string[]], { message: "Choose a resource type" }),
    activitySubtype: z
      .union([z.enum(ACTIVITY_SUBTYPE_IDS), z.literal("")])
      .optional()
      .transform((value) => (value ? value : undefined)),
    category: z
      .union([z.enum(CATEGORY_SLUGS as [string, ...string[]]), z.literal("")])
      .optional()
      .transform((value) => (value ? value : undefined)),
    subcategory: z.string().trim().max(80, "Must be 80 characters or fewer").optional(),
    subject: z.string().trim().max(80, "Must be 80 characters or fewer").optional(),
    minAge: z.coerce.number().int().min(0, "Enter a starting age").max(12, "Enter an age between 0 and 12"),
    maxAge: z.coerce.number().int().min(0, "Enter an ending age").max(12, "Enter an age between 0 and 12"),
    difficulty: z.enum(["beginner", "intermediate", "advanced"], { message: "Choose a difficulty" }),
    learningObjective: z.string().trim().min(5, "Enter what this teaches").max(200, "Must be 200 characters or fewer"),
    learningObjectivesText: lineListSchema,
    skillsDevelopedText: lineListSchema,
    pageCount: z.preprocess(
      (value) => (value === "" || value === undefined || value === null ? undefined : value),
      z.coerce.number().int().min(1).max(500).optional(),
    ),
    instructionsText: lineListSchema,
    materialsRequiredText: lineListSchema,
    tagsText: z
      .string()
      .optional()
      .transform((value) =>
        (value ?? "")
          .split(",")
          .map((entry) => entry.trim())
          .filter(Boolean),
      ),
    accessTier: z.enum(["free", "premium", "membership"], { message: "Choose an access tier" }),
    featured: z.boolean().default(false),
    thumbnail: z.string().optional(),
    downloadFile: z.string().optional(),
    seoTitle: z.string().trim().max(70, "Keep it under 70 characters").optional(),
    metaDescription: z.string().trim().max(160, "Keep it under 160 characters").optional(),
    canonicalUrl: z.union([z.string().trim().url("Enter a full URL"), z.literal("")]).optional(),
  })
  .refine((values) => values.minAge <= values.maxAge, {
    message: "Starting age must be at or before the ending age",
    path: ["maxAge"],
  });

export type AdminResourceInput = z.input<typeof adminResourceSchema>;
export type AdminResourceValues = z.output<typeof adminResourceSchema>;
