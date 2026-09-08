import { z } from "zod";
import { emailSchema, nameSchema } from "./common";

/**
 * Shared across every auth form so the rule lives in one place. 8 characters
 * matches Supabase Auth's own default minimum — when a real project is
 * connected, nothing here needs to change to stay in sync with it.
 */
export const passwordSchema = z.string().min(8, "Must be at least 8 characters");

/**
 * Parent-only: a teacher creating an account uses the dedicated flow at
 * /teachers/register instead (see docs/TEACHER_ARCHITECTURE.md for why
 * that's a separate, richer form rather than a role picker bolted onto
 * this one). `Account.role` in src/lib/accounts/types.ts still allows
 * "teacher" — that's the data model, not this form.
 */
export const signUpSchema = z.object({
  name: nameSchema,
  email: emailSchema,
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
