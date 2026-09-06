import type { LucideIcon } from "lucide-react";
import { Heading } from "@/components/ui/heading";
import { cn } from "@/lib/utils/cn";

export interface IconFeatureProps {
  icon: LucideIcon;
  title: string;
  description: string;
  /** Semantic heading tag — set to keep the document outline non-skipping wherever this is used. */
  headingAs?: "h2" | "h3" | "h4";
  className?: string;
}

/**
 * The one "icon + title + description" shape reused across the category
 * grid, parent/teacher value points, and the trust pillars — rather than
 * four near-identical components.
 */
function IconFeature({ icon: Icon, title, description, headingAs = "h3", className }: IconFeatureProps) {
  return (
    <div className={cn("flex gap-3", className)}>
      <Icon className="mt-0.5 size-5 shrink-0 text-primary-600" aria-hidden="true" />
      <div>
        <Heading level="h5" as={headingAs} className="text-ink">
          {title}
        </Heading>
        <p className="mt-1 text-sm text-neutral-600">{description}</p>
      </div>
    </div>
  );
}

export { IconFeature };
