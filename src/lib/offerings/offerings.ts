import type { Offering } from "./types";

/**
 * Where a real offering catalog would come from. There is no commercial
 * product, bundle, program, or membership anywhere in this business today
 * — the platform's own FAQ says so plainly ("everything available on the
 * site today is free... no payment system exists yet"). Inventing a
 * `SAMPLE_OFFERINGS` array the way `SAMPLE_RESOURCES`/`SAMPLE_GAMES` exist
 * would mean fabricating commercial products that don't actually exist —
 * exactly what Prompt 59 forbids. So this always returns `[]`, honestly,
 * the identical pattern `getApprovedTeacherDirectoryEntries()`
 * (src/lib/accounts/teacher-directory.ts) already established for the
 * teacher directory: not a stub waiting to be finished, the correct
 * behavior until a real offering exists.
 *
 * Once one does (a real worksheet bundle, a real learning program, a real
 * membership plan a business decision actually creates), this becomes a
 * real query — `supabase.from("offerings").select("*").eq("status",
 * "published")` — filtered server-side the same way every other real
 * catalog in this app will be. Nothing calling this function needs to
 * change: it already returns `Offering[]`, the exact shape that query
 * would return.
 */
export function getAllOfferings(): Offering[] {
  return [];
}

export function getOfferingBySlug(slug: string): Offering | undefined {
  return getAllOfferings().find((offering) => offering.slug === slug);
}
