import { Check, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { JourneyStep } from "@/lib/learning-journey";
import { cn } from "@/lib/utils/cn";

/**
 * Names the three sections already on a category page (Content, Games,
 * Resources) as steps in one journey — Learn, Practice, Play — and links
 * straight down to each. Same available/coming distinction and icon
 * language as CapabilityList, so this reads as the same honesty pattern
 * used everywhere else rather than a new visual idiom. A step is never
 * shown as available unless real published content backs it.
 */
function LearningJourneySteps({ steps }: { steps: JourneyStep[] }) {
  return (
    <ol className="mt-6 grid gap-3 sm:grid-cols-3">
      {steps.map((step, index) => (
        <li key={step.key}>
          <a
            href={step.anchor}
            className={cn(
              "flex h-full flex-col gap-2 rounded-xl border p-4 transition-colors hover:border-primary-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/30",
              step.available ? "border-neutral-200" : "border-dashed border-neutral-300",
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Step {index + 1} · {step.label}
              </span>
              {step.available ? (
                <Check className="size-4 shrink-0 text-success-600" aria-hidden="true" />
              ) : (
                <Clock className="size-4 shrink-0 text-neutral-400" aria-hidden="true" />
              )}
            </div>
            <p className="text-sm text-neutral-600">{step.description}</p>
            <Badge variant={step.available ? "success" : "neutral"} className="mt-auto w-fit">
              {step.available ? `${step.count} today` : "Coming soon"}
            </Badge>
          </a>
        </li>
      ))}
    </ol>
  );
}

export { LearningJourneySteps };
