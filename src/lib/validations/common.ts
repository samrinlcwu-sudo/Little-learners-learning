import { z } from "zod";

/**
 * Shared primitive schemas reused across future forms (contact, registration,
 * admissions, teacher applications, etc.) so validation rules stay consistent
 * in one place instead of being redefined per form.
 */
export const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required")
  .email("Enter a valid email address");

export const nameSchema = z
  .string()
  .trim()
  .min(2, "Must be at least 2 characters")
  .max(100, "Must be 100 characters or fewer");

export const phoneSchema = z
  .string()
  .trim()
  .min(7, "Enter a valid phone number")
  .max(20, "Enter a valid phone number");
