import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAllLearningCategories } from "@/config/learning-categories";
import { APPLICATION_STATUS_LABELS, getApplicationLearningAreas, type Application, type ApplicationStatus } from "@/lib/admissions/types";
import type { ChildProfile } from "@/lib/accounts/types";

const STATUS_BADGE_VARIANT: Record<ApplicationStatus, "neutral" | "primary" | "secondary" | "warning" | "success" | "error"> = {
  draft: "neutral",
  submitted: "primary",
  "under-review": "secondary",
  "info-requested": "warning",
  accepted: "success",
  declined: "error",
  withdrawn: "neutral",
};

export interface ApplicationCardProps {
  application: Application;
  child?: ChildProfile;
}

/**
 * One application's summary in the family's own list
 * (src/app/dashboard/applications/page.tsx) — real fields only, no
 * fabricated progress. `child` can be undefined if a child profile was
 * later removed; the card says so rather than guessing a name.
 */
function ApplicationCard({ application, child }: ApplicationCardProps) {
  const learningAreas = getApplicationLearningAreas(application, getAllLearningCategories());

  return (
    <Card className="flex flex-col gap-3 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display text-lg font-semibold text-ink">{child?.name ?? "Child profile removed"}</p>
          {application.referenceNumber && (
            <p className="mt-0.5 text-xs text-neutral-500">Reference {application.referenceNumber}</p>
          )}
        </div>
        <Badge variant={STATUS_BADGE_VARIANT[application.status]}>{APPLICATION_STATUS_LABELS[application.status]}</Badge>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {learningAreas.map((area) => (
          <Badge key={area.slug} variant="neutral">
            {area.name}
          </Badge>
        ))}
      </div>

      <div className="mt-1 flex justify-end">
        <Button size="sm" variant="outline" asChild>
          <Link href={`/dashboard/applications/${application.id}`}>
            {application.status === "draft" ? "Continue draft" : "View details"}
          </Link>
        </Button>
      </div>
    </Card>
  );
}

export { ApplicationCard };
