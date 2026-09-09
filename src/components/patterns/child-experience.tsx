"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Gamepad2,
  Library,
  Sparkles,
  Star,
  type LucideIcon,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { DecorativeBlob } from "@/components/ui/decorative-blob";
import { ChildAvatar } from "@/components/patterns/child-avatar";
import { AchievementBadges } from "@/components/patterns/achievement-badges";
import { getAllLearningCategories } from "@/config/learning-categories";
import { useChildProfiles } from "@/lib/accounts/use-child-profiles";
import { useChildProgressEvents } from "@/lib/progress/use-progress-events";
import { setActiveChild } from "@/lib/progress/local-progress";
import { getEarnedAchievements } from "@/lib/progress/achievements";
import { getAccuracyReward } from "@/lib/games/rewards";
import { getCategoryJourney, getNextStepSuggestion, type NextStepSuggestion } from "@/lib/learning-journey";
import { cn } from "@/lib/utils/cn";

const bigActions = [
  { icon: BookOpen, label: "Learn", href: "/learn", tone: "bg-primary-500" },
  { icon: Gamepad2, label: "Games", href: "/games", tone: "bg-accent-400" },
  { icon: Library, label: "Resources", href: "/resources", tone: "bg-secondary-500" },
];

const NEXT_STEP_ICONS: Record<NextStepSuggestion["kind"], LucideIcon> = {
  game: Gamepad2,
  resource: Library,
  category: BookOpen,
};

/** Subjects a child can jump straight into today — never one with nothing published yet. */
function getExploreCategories(limit = 4) {
  return getAllLearningCategories()
    .filter((category) => getCategoryJourney(category.slug)?.steps.some((step) => step.available))
    .slice(0, limit);
}

/**
 * The child-facing view — deliberately built differently from the rest of
 * the site: bigger, bolder, and with almost no text, per Prompt 22's
 * explicit exception to the site's usual restraint. It still reuses real
 * data (the child profile from src/lib/accounts) and real destinations
 * (/learn, /games, /resources) — nothing here is a standalone toy screen.
 */
function ChildExperience() {
  const params = useParams<{ childId: string }>();
  const { children, ready: childrenReady } = useChildProfiles();
  const child = children.find((c) => c.id === params.childId);
  const { events, ready: progressReady } = useChildProgressEvents(child?.id);

  React.useEffect(() => {
    if (child) setActiveChild(child.id);
  }, [child]);

  if (!childrenReady) {
    return <Section className="min-h-[60vh]" />;
  }

  if (!child) {
    return (
      <Section surface="sunken" className="flex flex-1 flex-col justify-center">
        <Container className="max-w-md text-center">
          <Heading level="h1">We couldn&apos;t find that profile</Heading>
          <p className="mt-3 text-neutral-600">
            It may have been on a different device or browser — child
            profiles are only saved on the device they were added on.
          </p>
          <Button className="mt-6" asChild>
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
        </Container>
      </Section>
    );
  }

  const completedGames = events.filter((event) => event.type === "game_completed").slice(-5).reverse();
  const nextStep = getNextStepSuggestion(events);
  const exploreCategories = getExploreCategories();
  const earnedBadges = getEarnedAchievements(events);
  const NextStepIcon = nextStep ? NEXT_STEP_ICONS[nextStep.kind] : null;

  return (
    <Section surface="tint-accent" className="relative min-h-[85vh] overflow-hidden">
      <DecorativeBlob tone="primary" className="pointer-events-none absolute -right-20 -top-16 size-72 opacity-25" />
      <DecorativeBlob tone="secondary" className="pointer-events-none absolute -bottom-24 -left-16 size-72 opacity-20" />

      <Container className="relative max-w-2xl">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-600 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/30 rounded-sm"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          For parents
        </Link>

        <div className="mt-8 flex flex-col items-center text-center">
          <ChildAvatar avatar={child.avatar} size="xl" />
          <Heading level="display" as="h1" className="mt-5">
            Hi, {child.name}!
          </Heading>
          <p className="mt-2 text-lg text-neutral-600">What do you want to do?</p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {bigActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={`flex flex-col items-center gap-3 rounded-3xl ${action.tone} px-6 py-10 text-white shadow-md transition-transform hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/50 motion-reduce:hover:translate-y-0`}
            >
              <action.icon className="size-12" aria-hidden="true" />
              <span className="text-xl font-bold">{action.label}</span>
            </Link>
          ))}
        </div>

        {exploreCategories.length > 0 && (
          <div className="mt-10">
            <p className="text-center text-sm font-semibold uppercase tracking-wide text-neutral-500">
              Or pick a subject
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {exploreCategories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/learn/${category.slug}`}
                  className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl bg-white/70 px-3 py-4 text-center shadow-sm transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-600/30 motion-reduce:hover:translate-y-0"
                >
                  <div className="flex size-11 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                    <category.icon className="size-5" aria-hidden="true" />
                  </div>
                  <span className="text-sm font-bold text-ink">{category.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {progressReady && (
          <div className="mt-12 rounded-2xl bg-white/60 p-6">
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-accent-600" aria-hidden="true" />
              <p className="font-display text-lg font-semibold text-ink">Your learning journey</p>
            </div>

            {earnedBadges.length > 0 && <AchievementBadges achievements={earnedBadges} size="lg" className="mt-4" />}

            {nextStep && NextStepIcon && (
              <Link
                href={nextStep.href}
                className="mt-4 flex items-center gap-3 rounded-xl bg-primary-600 px-5 py-4 text-white shadow-sm transition-colors hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/50"
              >
                <NextStepIcon className="size-6 shrink-0" aria-hidden="true" />
                <span className="flex-1">
                  <span className="block text-xs font-semibold uppercase tracking-wide text-primary-100">
                    {nextStep.label}
                  </span>
                  <span className="block text-base font-bold">{nextStep.activityLabel}</span>
                </span>
                <ArrowRight className="size-5 shrink-0" aria-hidden="true" />
              </Link>
            )}

            {completedGames.length === 0 ? (
              !nextStep && (
                <p className="mt-2 text-sm text-neutral-600">
                  Nothing finished yet — pick something above to get started!
                </p>
              )
            ) : (
              <>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Finished games
                </p>
                <ul className="mt-2 space-y-3">
                  {completedGames.map((event) => {
                    const reward = event.score ? getAccuracyReward(event.score.correct, event.score.total) : null;
                    return (
                      <li key={event.id} className="flex items-center justify-between gap-3 text-sm">
                        <span className="font-medium text-ink">{event.activityLabel}</span>
                        {reward && (
                          <span className="flex items-center gap-0.5" aria-label={`${reward.stars} out of 3 stars`}>
                            {[1, 2, 3].map((position) => (
                              <Star
                                key={position}
                                className={cn(
                                  "size-4",
                                  position <= reward.stars ? "fill-accent-400 text-accent-500" : "fill-none text-neutral-300",
                                )}
                                aria-hidden="true"
                              />
                            ))}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </div>
        )}
      </Container>
    </Section>
  );
}

export { ChildExperience };
