import Link from "next/link";
import { Lock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ACCESS_TIER_LABELS,
  ACTIVITY_SUBTYPE_LABELS,
  RESOURCE_TYPE_ICONS,
  RESOURCE_TYPE_LABELS,
  canDownload,
  type Resource,
} from "@/lib/resources/types";

export interface ResourceCardProps {
  resource: Resource;
  categoryName?: string;
  isSample: boolean;
}

const DIFFICULTY_LABELS: Record<Resource["difficulty"], string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

const TIER_BADGE_VARIANT = {
  free: "success",
  premium: "accent",
  membership: "secondary",
} as const;

/**
 * The one card for any resource in the library — a preview tile (the
 * resource type's icon, since no real thumbnail images exist), title,
 * category/subject, what it teaches, age, difficulty, tier, and an honest
 * action: a real link only when `canDownload()` says a file actually
 * exists, otherwise a disabled-style state that matches the tier (never a
 * button that implies a download which doesn't exist).
 */
function ResourceCard({ resource, categoryName, isSample }: ResourceCardProps) {
  const downloadable = canDownload(resource);
  const TypeIcon = RESOURCE_TYPE_ICONS[resource.resourceType];

  return (
    <Card interactive className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center gap-3 border-b border-neutral-200 bg-surface-sunken px-6 py-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-100">
          <TypeIcon className="size-5 text-primary-700" aria-hidden="true" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            {RESOURCE_TYPE_LABELS[resource.resourceType]}
            {resource.activitySubtype && resource.activitySubtype !== "general"
              ? ` · ${ACTIVITY_SUBTYPE_LABELS[resource.activitySubtype]}`
              : ""}
          </p>
          {isSample && (
            <Badge variant="warning" className="mt-1">
              Sample
            </Badge>
          )}
        </div>
      </div>

      <CardHeader>
        <Badge variant="primary" className="w-fit">
          {categoryName ?? resource.subject ?? "General"}
        </Badge>
        <CardTitle className="mt-2">{resource.title}</CardTitle>
        {resource.subtitle && <p className="mt-0.5 text-sm text-neutral-500">{resource.subtitle}</p>}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        <p className="text-sm text-neutral-600">{resource.description}</p>
        <p className="text-sm text-neutral-500">
          <span className="font-medium text-neutral-700">Learn to:</span> {resource.learningObjective}
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="neutral">
            Ages {resource.ageRange.minYears}–{resource.ageRange.maxYears}
          </Badge>
          <Badge variant="neutral">{DIFFICULTY_LABELS[resource.difficulty]}</Badge>
          {resource.pageCount && (
            <Badge variant="neutral">
              {resource.pageCount} page{resource.pageCount === 1 ? "" : "s"}
            </Badge>
          )}
          <Badge variant={TIER_BADGE_VARIANT[resource.accessTier]}>
            {ACCESS_TIER_LABELS[resource.accessTier]}
          </Badge>
        </div>
      </CardContent>
      <CardFooter>
        {downloadable ? (
          <Button size="sm" asChild className="w-full">
            <Link href={`/resources/${resource.slug}`}>View resource</Link>
          </Button>
        ) : (
          <Button size="sm" variant="outline" asChild className="w-full">
            <Link href={`/resources/${resource.slug}`}>
              {resource.accessTier !== "free" && <Lock aria-hidden="true" />}
              {resource.accessTier === "free" ? "Details — no file yet" : "Details — coming soon"}
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export { ResourceCard };
