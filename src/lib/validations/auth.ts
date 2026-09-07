import { z } from "zod";
import { emailSchema, nameSchema } from "./common";

/**
 * Shared across every auth form so the rule lives in one place. 8 characters
 * matches Supabase Auth's own default minimum — when a real project is
 * connected, nothing here needs to change to stay in sync with it.
 */
export const passwordSchema = z.string().min(8, "Must be at least 8 characters");

export const accountRoleSchema = z.enum(["parent", "teacher"], {
  message: "Choose one",
});
export type AccountRole = z.infer<typeof accountRoleSchema>;

export const signUpSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  role: accountRoleSchema,
  password: passwordSchema,
});
export type SignUpValues = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password"),
});
export type SignInValues = z.infer<typeof signInSchema>;

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  password: passwordSchema,
});
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
