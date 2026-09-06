import { Star } from "lucide-react";
import type { RewardResult } from "@/lib/games/rewards";
import { cn } from "@/lib/utils/cn";

export interface RewardBadgeProps {
  reward: RewardResult;
}

/**
 * A private, on-screen-only reward — never stored, never shared, never
 * compared to anyone else's. The star count is stated in text
 * (`aria-label` + a visible "3 out of 3 stars" line), not conveyed by
 * color or fill alone.
 */
function RewardBadge({ reward }: RewardBadgeProps) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="flex gap-1" role="img" aria-label={`${reward.stars} out of 3 stars`}>
        {[1, 2, 3].map((position) => (
          <Star
            key={position}
            className={cn(
              "size-8",
              position <= reward.stars ? "fill-accent-400 text-accent-500" : "fill-none text-neutral-300",
            )}
            aria-hidden="true"
          />
        ))}
      </div>
      <p className="text-sm font-medium text-neutral-500">{reward.stars} out of 3 stars</p>
      <p className="font-display text-lg font-semibold text-ink">{reward.title}</p>
    </div>
  );
}

export { RewardBadge };
