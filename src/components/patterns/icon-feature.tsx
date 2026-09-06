import type { LucideIcon } from "lucide-react";
import { Heading } from "@/components/ui/heading";
import { cn } from "@/lib/utils/cn";

export interface IconFeatureProps {
  icon: LucideIcon;
  title: string;
  description: string;
  /** Semantic heading tag — set to keep the document outline non-skipping wherever this is used. */
  headingAs?: "h2" | "h3" | "h4";
  /** Which brand color tints the icon tile. Pick the tone that reads best against the section it sits on. */
  tone?: "primary" | "secondary" | "accent" | "neutral";
  className?: string;
}

const toneStyles: Record<NonNullable<IconFeatureProps["tone"]>, string> = {
  primary: "bg-primary-100 text-primary-700",
  secondary: "bg-secondary-100 text-secondary-700",
  accent: "bg-accent-100 text-accent-800",
  neutral: "bg-neutral-100 text-neutral-600",
};

/**
 * The one "icon + title + description" shape reused across the category
 * grid, parent/teacher value points, and the trust pillars — rather than
 * four near-identical components. The icon sits in a colored tile (not
 * bare) so the pattern reads as an intentional visual element rather than
 * a plain list with icons bolted on.
 */
function IconFeature({
  icon: Icon,
  title,
  description,
  headingAs = "h3",
  tone = "primary",
  className,
}: IconFeatureProps) {
  return (
    <div className={cn("flex gap-4", className)}>
      <div
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-xl",
          toneStyles[tone],
        )}
      >
        <Icon className="size-5" aria-hidden="true" />
      </div>
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
