import Link from "next/link";
import { Lock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ACCESS_TIER_LABELS, RESOURCE_TYPE_LABELS, canDownload, type Resource } from "@/lib/resources/types";

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
 * The one card for any resource in the library — title, category/subject,
 * age, resource type, difficulty, tier, and an honest action: a real link
 * only when `canDownload()` says a file actually exists, otherwise a
 * disabled state that matches the tier (never a working button pointing
 * nowhere).
 */
function ResourceCard({ resource, categoryName, isSample }: ResourceCardProps) {
  const downloadable = canDownload(resource);

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex-row items-start justify-between gap-2 space-y-0">
        <div>
          <Badge variant="primary">{categoryName ?? resource.subject ?? "General"}</Badge>
          <CardTitle className="mt-3">{resource.title}</CardTitle>
        </div>
        {isSample && <Badge variant="warning">Sample</Badge>}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        <p className="text-sm text-neutral-600">{resource.description}</p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="neutral">
            Ages {resource.ageRange.minYears}–{resource.ageRange.maxYears}
          </Badge>
          <Badge variant="neutral">{RESOURCE_TYPE_LABELS[resource.resourceType]}</Badge>
          <Badge variant="neutral">{DIFFICULTY_LABELS[resource.difficulty]}</Badge>
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
