import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges conditional class names and resolves conflicting Tailwind utility
 * classes (e.g. "p-2" vs "p-4") in favor of the last one wins.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
