import { z } from "zod";
import { getAllTeacherResourceTypeOptions } from "@/config/teacher-resource-types";
import { getAllLearningCategories } from "@/config/learning-categories";

const RESOURCE_TYPE_IDS = getAllTeacherResourceTypeOptions().map((option) => option.id);
const CATEGORY_SLUGS = getAllLearningCategories().map((category) => category.slug);

/**
 * What a teacher fills in to create or edit their own resource. Every
 * field here maps directly onto a real field on `Resource`
 * (src/lib/resources/types.ts) — nothing invented, and the type picker
 * reads the same `getAllTeacherResourceTypeOptions()` the dashboard
 * already used to show "planned resource types" (Prompt 28), so a
 * teacher can never pick something the rest of the app doesn't recognize.
 * No file/download field: this codebase has never had real file storage,
 * and pretending an upload works would be exactly the fabricated
 * capability the project's honesty rules forbid — see
 * docs/TEACHER_ARCHITECTURE.md.
 */
export const teacherResourceSchema = z.object({
  title: z.string().trim().min(3, "Enter a title").max(120, "Must be 120 characters or fewer"),
  description: z.string().trim().min(10, "Enter a short description").max(500, "Keep it under 500 characters"),
  resourceType: z.enum(RESOURCE_TYPE_IDS as [string, ...string[]], {
    message: "Choose a resource type",
  }),
  category: z
    .union([z.enum(CATEGORY_SLUGS as [string, ...string[]]), z.literal("")])
    .optional()
    .transform((value) => (value ? value : undefined)),
  minAge: z.coerce.number().int().min(2, "Enter a starting age").max(8, "Enter an age between 2 and 8"),
  maxAge: z.coerce.number().int().min(2, "Enter an ending age").max(8, "Enter an age between 2 and 8"),
  difficulty: z.enum(["beginner", "intermediate", "advanced"], { message: "Choose a difficulty" }),
  learningObjective: z.string().trim().min(5, "Enter what this teaches").max(200, "Must be 200 characters or fewer"),
  thumbnail: z.string().optional(),
}).refine((values) => values.minAge <= values.maxAge, {
  message: "Starting age must be at or before the ending age",
  path: ["maxAge"],
});

export type TeacherResourceInput = z.input<typeof teacherResourceSchema>;
export type TeacherResourceValues = z.output<typeof teacherResourceSchema>;
