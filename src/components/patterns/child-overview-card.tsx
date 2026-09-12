import Link from "next/link";
import { Pencil, BookOpen, Library, Gamepad2, Trophy, ArrowRight, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChildAvatar } from "@/components/patterns/child-avatar";
import { AchievementBadges } from "@/components/patterns/achievement-badges";
import { getLearningCategoryBySlug } from "@/config/learning-categories";
import { getEventsForChild } from "@/lib/progress/local-progress";
import { summarizeChildProgress, describeEvent } from "@/lib/progress/summarize";
import { getEarnedAchievements } from "@/lib/progress/achievements";
import { getNextStepSuggestion } from "@/lib/learning-journey";
import { formatRelativeTime } from "@/lib/utils/format-relative-time";
import type { ChildProfile } from "@/lib/accounts/types";
import type { ProgressEvent, ProgressEventType } from "@/lib/progress/types";

export interface ChildOverviewCardProps {
  child: ChildProfile;
  /** The full event log — filtered to this child inside, same as every other progress view (src/lib/progress/local-progress.ts). */
  events: ProgressEvent[];
  progressReady: boolean;
  onEdit: (child: ChildProfile) => void;
}

const EVENT_ICONS: Record<ProgressEventType, LucideIcon> = {
  topic_explored: BookOpen,
  resource_viewed: Library,
  game_played: Gamepad2,
  game_completed: Trophy,
};

/**
 * One card per child, combining what used to be two separate grids (a
 * plain identity card, and a same-child progress card elsewhere on the
 * page) into a single place a parent looks once for everything about
 * that child — identity, real progress, and the one real "what's next"
 * suggestion (src/lib/learning-journey.ts). Every number and label here
 * comes from that child's own recorded events; a child with none shows
 * an honest empty state, never an invented starting point.
 */
function ChildOverviewCard({ child, events, progressReady, onEdit }: ChildOverviewCardProps) {
  const favorite = child.favoriteCategory ? getLearningCategoryBySlug(child.favoriteCategory) : undefined;
  const childEvents = getEventsForChild(events, child.id);
  const summary = summarizeChildProgress(childEvents);
  const nextStep = getNextStepSuggestion(childEvents);
  const earnedBadges = getEarnedAchievements(childEvents);

  return (
    <Card className="flex h-full flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <ChildAvatar avatar={child.avatar} size="lg" />
          <div>
            <div className="flex items-center gap-1.5">
              <p className="font-display text-lg font-semibold text-ink">{child.name}</p>
              {child.accountStatus === "deactivated" && <Badge variant="error">Deactivated</Badge>}
            </div>
            <p className="text-sm text-neutral-600">
              {child.ageYears} year{child.ageYears === 1 ? "" : "s"} old
            </p>
            {favorite && <p className="mt-0.5 text-xs text-neutral-500">Loves {favorite.name}</p>}
          </div>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onEdit(child)}
          aria-label={`Edit ${child.name}'s profile`}
        >
          <Pencil aria-hidden="true" />
        </Button>
      </div>

      <div className="mt-4 flex-1 border-t border-neutral-200 pt-4">
        {!progressReady ? null : childEvents.length === 0 ? (
          <p className="text-sm text-neutral-600">
            Nothing recorded yet — progress shows up here once {child.name} explores a subject,
            resource, or game.
          </p>
        ) : (
          <>
            {summary.lastActiveAt && (
              <p className="text-xs text-neutral-500">Last active {formatRelativeTime(summary.lastActiveAt)}</p>
            )}
            {summary.topicsExplored.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {summary.topicsExplored.slice(0, 4).map((topic) => (
                  <Badge key={topic} variant="neutral">
                    {topic}
                  </Badge>
                ))}
              </div>
            )}
            <ul className="mt-3 space-y-2">
              {summary.recentActivities.slice(0, 3).map((event) => {
                const Icon = EVENT_ICONS[event.type];
                return (
                  <li key={event.id} className="flex items-center gap-2 text-sm">
                    <Icon className="size-3.5 shrink-0 text-neutral-400" aria-hidden="true" />
                    <span className="flex-1 text-neutral-700">{describeEvent(event)}</span>
                    <span className="shrink-0 text-xs text-neutral-500">
                      {formatRelativeTime(event.occurredAt)}
                    </span>
                  </li>
                );
              })}
            </ul>
            <AchievementBadges achievements={earnedBadges} className="mt-3" />
          </>
        )}
      </div>

      {nextStep && (
        <Link
          href={nextStep.href}
          className="mt-4 flex items-center justify-between gap-2 rounded-lg border border-primary-200 bg-primary-50 px-3.5 py-2.5 text-sm transition-colors hover:border-primary-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/30"
        >
          <span>
            <span className="block text-xs font-medium text-primary-700">{nextStep.label}</span>
            <span className="font-medium text-ink">{nextStep.activityLabel}</span>
          </span>
          <ArrowRight className="size-4 shrink-0 text-primary-700" aria-hidden="true" />
        </Link>
      )}

      <Button asChild className="mt-4 w-full">
        <Link href={`/dashboard/children/${child.id}`}>Open {child.name}&apos;s view</Link>
      </Button>
    </Card>
  );
}

export { ChildOverviewCard };
