import { z } from "zod";
import { nameSchema } from "./common";
import { CHILD_AVATAR_IDS } from "@/lib/accounts/types";

export const childProfileSchema = z.object({
  name: nameSchema,
  ageYears: z.coerce
    .number({ error: "Enter an age" })
    .int("Enter a whole number")
    .min(1, "Enter an age between 1 and 12")
    .max(12, "Enter an age between 1 and 12"),
  avatar: z.enum(CHILD_AVATAR_IDS, { message: "Choose an avatar" }),
  favoriteCategory: z.string().optional(),
});

/** The shape react-hook-form fields hold before validation (ageYears arrives as a string from the number input). */
export type ChildProfileInput = z.input<typeof childProfileSchema>;
/** The shape after zod validates and coerces — what onSave actually receives. */
export type ChildProfileValues = z.output<typeof childProfileSchema>;
