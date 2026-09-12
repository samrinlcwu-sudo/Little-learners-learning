/**
 * The offering/business model — contracts only, exactly like every other
 * domain's types.ts in this codebase (content, resources, games, accounts).
 * Introduced in Prompt 59 to prepare Little Learners Learning for a
 * professional commercial model "without forcing payments or subscriptions
 * into the platform yet" — see docs/BUSINESS_ARCHITECTURE.md for the full
 * reasoning, including why `getAllOfferings()` (./offerings.ts) honestly
 * returns an empty array today.
 *
 * An `Offering` is a catalog-level concept — a thing Little Learners could
 * eventually market or sell (a bundle, a program, a membership) — and is
 * deliberately distinct from `AccessTier` (src/lib/resources/types.ts),
 * which is a content-level flag on one `Resource`. This file imports
 * `AccessTier` rather than redeclaring it: an Offering's `accessLevel`
 * reuses the exact same three values a resource's `accessTier` already
 * uses, so "free/premium/membership" means one thing everywhere in this
 * codebase, not two overlapping vocabularies.
 */

import type { AccessTier } from "@/lib/resources/types";
import type { AgeRange, PublicationStatus } from "@/lib/content/types";

export type { AccessTier };

/**
 * Exactly the six categories the brief names, no more. "free" and
 * "premium" describe an offering that's essentially a labeled slice of
 * existing content (mirrors `AccessTier`); "digital-product",
 * "learning-program", "membership", and "future-service" describe a
 * distinct catalog item this platform doesn't have a real instance of
 * yet — see `getAllOfferings()`.
 */
export const OFFERING_TYPES = [
  "free",
  "premium",
  "digital-product",
  "learning-program",
  "membership",
  "future-service",
] as const;
export type OfferingType = (typeof OFFERING_TYPES)[number];

export const OFFERING_TYPE_LABELS: Record<OfferingType, string> = {
  free: "Free",
  premium: "Premium",
  "digital-product": "Digital Product",
  "learning-program": "Learning Program",
  membership: "Membership",
  "future-service": "Future Service",
};

/**
 * Distinct from `PublicationStatus` (draft/published/archived, which is
 * an editorial state) — availability is a commercial state: can a visitor
 * actually access this today, is it announced but not live, or has it
 * been withdrawn. `"available"` only ever really means something for a
 * `free` offering until real purchasing exists (see `canAccessOffering`
 * below) — a `premium`/`membership`/etc. offering marked `"available"`
 * still can't actually be unlocked by anyone, on purpose.
 */
export const OFFERING_AVAILABILITIES = ["available", "coming-soon", "unavailable"] as const;
export type OfferingAvailability = (typeof OFFERING_AVAILABILITIES)[number];

export const OFFERING_AVAILABILITY_LABELS: Record<OfferingAvailability, string> = {
  available: "Available",
  "coming-soon": "Coming soon",
  unavailable: "Unavailable",
};

/**
 * Modeled, never populated by real data (see docs/BUSINESS_ARCHITECTURE.md
 * and docs/ARCHITECTURE.md §18 — payments are planned around Stripe but
 * not connected). `billingPeriod` is optional because a one-time digital
 * product has none; a membership would set one. No currency conversion,
 * tax, or discount logic exists — this is the plain shape a real price
 * needs, nothing more.
 */
export interface OfferingPrice {
  amount: number;
  currency: string;
  billingPeriod?: "one-time" | "monthly" | "yearly";
}

/**
 * Every field the brief asks an offering to eventually hold. Reuses
 * existing relationships instead of duplicating content:
 * `learningAreas` are `LearningCategory` slugs
 * (src/config/learning-categories.ts, the same 16 subjects every other
 * part of the site already uses), `includedResourceIds` reference real
 * `Resource.id`s (src/lib/resources/types.ts) rather than copying their
 * title/description/file into a second place, and `status` reuses
 * `PublicationStatus` from src/lib/content/types.ts rather than a fourth
 * draft/published enum.
 */
export interface Offering {
  id: string;
  /** URL-safe, unique — would drive a future /offerings/[slug] the moment a real offering exists. */
  slug: string;
  name: string;
  description: string;
  type: OfferingType;
  /** LearningCategory slugs (src/config/learning-categories.ts) — never a second subject taxonomy. */
  learningAreas: string[];
  ageRange?: AgeRange;
  /** Real Resource ids (src/lib/resources/types.ts) this offering bundles — never a copy of their content. */
  includedResourceIds?: string[];
  accessLevel: AccessTier;
  availability: OfferingAvailability;
  /** Undefined until real pricing exists — see OfferingPrice above. */
  price?: OfferingPrice;
  status: PublicationStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * Whether an offering could ever be shown on a public page at all —
 * mirrors `isResourcePublished()`/`isGamePublished()`'s "must be
 * published" gate. Deliberately does **not** mean "can be accessed" —
 * see `canAccessOffering` below for that, which is a stricter question.
 */
export function isOfferingPubliclyVisible(offering: Offering): boolean {
  return offering.status === "published" && offering.availability !== "unavailable";
}

/**
 * Whether a visitor could actually receive this offering today — the
 * single function a future entitlement/purchase system needs to grow,
 * exactly the same shape `canDownload()` already establishes for
 * resources (docs/RESOURCE_LIBRARY_ARCHITECTURE.md, "Future business
 * model"). Today this is real, honest, and conservative: only a publicly
 * visible, available, `"free"`-access-level offering can actually be
 * accessed, because no purchase, entitlement, or membership system
 * exists yet to grant anything else. A `"premium"`/`"membership"`/etc.
 * offering can be modeled, displayed, and marked `"available"`, but this
 * function will keep returning `false` for it until a real entitlement
 * check replaces the `accessLevel === "free"` line below — everything
 * that calls this function stays the same when that happens.
 *
 * This function is a plain, pure client-evaluable check today because
 * there is nothing server-side to check against (no accounts backend,
 * no payments — src/lib/supabase/is-configured.ts). It must move
 * server-side the moment real entitlements exist: never trust a
 * client-supplied "I purchased this" flag. See docs/BUSINESS_ARCHITECTURE.md,
 * "Security."
 */
export function canAccessOffering(offering: Offering): boolean {
  return isOfferingPubliclyVisible(offering) && offering.availability === "available" && offering.accessLevel === "free";
}
