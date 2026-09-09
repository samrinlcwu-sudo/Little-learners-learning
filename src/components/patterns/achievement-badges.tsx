import { Footprints, Gamepad2, Trophy, Library, Compass, Rocket, type LucideIcon } from "lucide-react";
import type { Achievement } from "@/lib/progress/achievements";
import { cn } from "@/lib/utils/cn";

const ACHIEVEMENT_ICONS: Record<string, LucideIcon> = {
  "first-steps": Footprints,
  "game-explorer": Gamepad2,
  "game-champion": Trophy,
  "resource-reader": Library,
  "subject-explorer": Compass,
  "curious-mind": Rocket,
};

export interface AchievementBadgesProps {
  /** Pass the result of getEarnedAchievements() — this component never renders a locked badge. */
  achievements: Achievement[];
  size?: "sm" | "lg";
  className?: string;
}

/**
 * Positive-only badge display, shared by the child view and the parent
 * dashboard so a badge always looks and reads the same in both places.
 * There's no "locked" state rendered anywhere — see
 * src/lib/progress/achievements.ts: a badge either genuinely happened or
 * it isn't shown, never a grayed-out "not yet" checklist.
 */
function AchievementBadges({ achievements, size = "sm", className }: AchievementBadgesProps) {
  if (achievements.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {achievements.map((achievement) => {
        const Icon = ACHIEVEMENT_ICONS[achievement.id] ?? Trophy;
        return (
          <span
            key={achievement.id}
            title={achievement.description}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full bg-accent-100 font-medium text-accent-800",
              size === "lg" ? "px-3.5 py-2 text-sm" : "px-2.5 py-1 text-xs",
            )}
          >
            <Icon className={size === "lg" ? "size-5" : "size-3.5"} aria-hidden="true" />
            {achievement.title}
          </span>
        );
      })}
    </div>
  );
}

export { AchievementBadges };
