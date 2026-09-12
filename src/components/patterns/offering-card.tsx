import Link from "next/link";
import Image from "next/image";
import { Lock, Package, Sparkles, BookOpen, Users, Rocket, Gift, type LucideIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  OFFERING_AVAILABILITY_LABELS,
  OFFERING_TYPE_LABELS,
  canAccessOffering,
  type Offering,
} from "@/lib/offerings/types";
import { ACCESS_TIER_LABELS } from "@/lib/resources/types";

export interface OfferingCardProps {
  offering: Offering;
  /** Real category names for this offering's `learningAreas`, keyed by slug — passed in rather than looked up here, same convention `ResourceCard` uses for `categoryName`. */
  learningAreaNames?: string[];
}

const TYPE_ICONS: Record<Offering["type"], LucideIcon> = {
  free: Gift,
  premium: Sparkles,
  "digital-product": Package,
  "learning-program": BookOpen,
  membership: Users,
  "future-service": Rocket,
};

const TIER_BADGE_VARIANT = {
  free: "success",
  premium: "accent",
  membership: "secondary",
} as const;

const AVAILABILITY_BADGE_VARIANT = {
  available: "success",
  "coming-soon": "warning",
  unavailable: "neutral",
} as const;

/**
 * The catalog card for one real `Offering` — same visual language and
 * honesty rules `ResourceCard`/`GameCard` already establish: a real
 * thumbnail when one exists, a plain icon when it doesn't (never a stock
 * photo), real badges for every real field, and an action that's only
 * ever a working link when `canAccessOffering()` actually says so. There
 * is no numeric price shown unless `offering.price` is actually set.
 */
function OfferingCard({ offering, learningAreaNames = [] }: OfferingCardProps) {
  const accessible = canAccessOffering(offering);
  const TypeIcon = TYPE_ICONS[offering.type];

  return (
    <Card interactive className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center gap-3 border-b border-neutral-200 bg-surface-sunken px-6 py-4">
        {offering.thumbnail ? (
          <div className="relative size-10 shrink-0 overflow-hidden rounded-lg">
            <Image src={offering.thumbnail} alt="" fill className="object-cover" />
          </div>
        ) : (
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-100">
            <TypeIcon className="size-5 text-primary-700" aria-hidden="true" />
          </div>
        )}
        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          {OFFERING_TYPE_LABELS[offering.type]}
        </p>
      </div>

      <CardHeader>
        {learningAreaNames.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {learningAreaNames.map((name) => (
              <Badge key={name} variant="primary">
                {name}
              </Badge>
            ))}
          </div>
        )}
        <CardTitle className="mt-2">{offering.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        <p className="text-sm text-neutral-600">{offering.description}</p>
        <div className="flex flex-wrap gap-2">
          {offering.ageRange && (
            <Badge variant="neutral">
              Ages {offering.ageRange.minYears}–{offering.ageRange.maxYears}
            </Badge>
          )}
          <Badge variant={TIER_BADGE_VARIANT[offering.accessLevel]}>{ACCESS_TIER_LABELS[offering.accessLevel]}</Badge>
          <Badge variant={AVAILABILITY_BADGE_VARIANT[offering.availability]}>
            {OFFERING_AVAILABILITY_LABELS[offering.availability]}
          </Badge>
          {offering.price && (
            <Badge variant="neutral">
              {offering.price.amount} {offering.price.currency}
              {offering.price.billingPeriod === "monthly" && " / mo"}
              {offering.price.billingPeriod === "yearly" && " / yr"}
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter>
        {accessible ? (
          <Button size="sm" asChild className="w-full">
            <Link href={`/offerings/${offering.slug}`}>View details</Link>
          </Button>
        ) : (
          <Button size="sm" variant="outline" asChild className="w-full">
            <Link href={`/offerings/${offering.slug}`}>
              {offering.accessLevel !== "free" && <Lock aria-hidden="true" />}
              {offering.availability === "coming-soon" ? "Coming soon" : "Learn more"}
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export { OfferingCard };
