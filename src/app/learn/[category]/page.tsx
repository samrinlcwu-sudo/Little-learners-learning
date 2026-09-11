import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  getAllLearningCategories,
  getLearningCategoryBySlug,
  getRelatedCategories,
} from "@/config/learning-categories";
import { LearningContentBrowser } from "@/components/patterns/learning-content-browser";
import { LearningJourneySteps } from "@/components/patterns/learning-journey-steps";
import { GameCard } from "@/components/patterns/game-card";
import { ResourceCard } from "@/components/patterns/resource-card";
import { TrackPageView } from "@/components/patterns/track-page-view";
import { LearningAreaStructuredData } from "@/components/patterns/learning-area-structured-data";
import { CONTENT_TYPE_LABELS } from "@/lib/content/types";
import { getCategoryJourney } from "@/lib/learning-journey";
import { getLearningAreaKnowledge } from "@/lib/ai/knowledge/public-knowledge";
import { siteConfig } from "@/config/site";

export function generateStaticParams() {
  return getAllLearningCategories().map((category) => ({ category: category.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/learn/[category]">): Promise<Metadata> {
  const { category: slug } = await params;
  const category = getLearningCategoryBySlug(slug);
  if (!category) return {};

  return {
    title: category.name,
    description: category.description,
    alternates: { canonical: `${siteConfig.url}/learn/${category.slug}` },
  };
}

export default async function LearnCategoryPage({
  params,
}: PageProps<"/learn/[category]">) {
  const { category: slug } = await params;
  const category = getLearningCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const journey = getCategoryJourney(category.slug);
  const categoryContent = journey?.content ?? [];
  const categoryGames = journey?.games ?? [];
  const categoryResources = journey?.resources ?? [];
  const relatedCategories = getRelatedCategories(category.slug);
  const areaKnowledge = getLearningAreaKnowledge(category.slug);

  return (
    <Section>
      <Container>
        {areaKnowledge && <LearningAreaStructuredData area={areaKnowledge} />}
        <TrackPageView
          type="topic_explored"
          topic={category.slug}
          activityLabel={category.name}
          activityHref={`/learn/${category.slug}`}
        />
        <div className="max-w-3xl">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Learn", href: "/learn" },
              { label: category.name },
            ]}
          />
          <div className="mt-4 flex items-center gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
              <category.icon className="size-6" aria-hidden="true" />
            </div>
            <Heading level="h1">{category.name}</Heading>
          </div>
          <p className="mt-3 text-neutral-600">{category.description}</p>

          <div className="mt-5 flex flex-wrap gap-2">
            <Badge variant="primary">
              Ages {category.ageRange.minYears}–{category.ageRange.maxYears}
            </Badge>
            {category.contentTypes.map((type) => (
              <Badge key={type} variant="neutral">
                {CONTENT_TYPE_LABELS[type]}
              </Badge>
            ))}
          </div>

          <div className="mt-8">
            <Heading level="h4" as="h2" className="text-neutral-500">
              What this covers
            </Heading>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-neutral-700">
              {category.learningObjectives.map((objective) => (
                <li key={objective}>{objective}</li>
              ))}
            </ul>
          </div>

          {journey && (
            <div className="mt-8">
              <Heading level="h4" as="h2" className="text-neutral-500">
                Your learning journey
              </Heading>
              <p className="mt-1 text-sm text-neutral-500">
                Learn what this subject covers, practice it, then play — jump to any step below.
              </p>
              <LearningJourneySteps steps={journey.steps} />
            </div>
          )}
        </div>

        <div id="content" className="mt-10 scroll-mt-20">
          <Heading level="h4" as="h2" className="text-neutral-500">
            Content
          </Heading>
          <div className="mt-4">
            <LearningContentBrowser items={categoryContent} />
          </div>
        </div>

        <div id="games" className="mt-12 scroll-mt-20 border-t border-neutral-200 pt-8">
          <Heading level="h4" as="h2" className="text-neutral-500">
            Games for this subject
          </Heading>
          <div className="mt-4">
            {categoryGames.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {categoryGames.map((game) => (
                  <GameCard key={game.id} game={game} categoryName={category.name} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No games for this subject yet"
                description="Games are added one at a time, each built around a single skill. See what's playable today in the Games Hub."
                action={
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/games">Browse all games</Link>
                  </Button>
                }
              />
            )}
          </div>
        </div>

        <div id="resources" className="mt-12 scroll-mt-20 border-t border-neutral-200 pt-8">
          <Heading level="h4" as="h2" className="text-neutral-500">
            Resources for this subject
          </Heading>
          <div className="mt-4">
            {categoryResources.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {categoryResources.map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} categoryName={category.name} isSample />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No resources for this subject yet"
                description="Worksheets, activities, and ebooks are still being added here. Search the full Resource Library in the meantime."
                action={
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/resources?category=${category.slug}`}>Search resources</Link>
                  </Button>
                }
              />
            )}
          </div>
        </div>

        {relatedCategories.length > 0 && (
          <div className="mt-12 border-t border-neutral-200 pt-8">
            <Heading level="h4" as="h2" className="text-neutral-500">
              Related categories
            </Heading>
            <ul className="mt-4 flex flex-wrap gap-3">
              {relatedCategories.map((related) => (
                <li key={related.slug}>
                  <Link
                    href={`/learn/${related.slug}`}
                    className="inline-flex items-center gap-2 rounded-md border border-neutral-200 px-3.5 py-2 text-sm font-medium text-ink transition-colors hover:border-primary-300 hover:text-primary-700"
                  >
                    <related.icon className="size-4 text-primary-600" aria-hidden="true" />
                    {related.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Container>
    </Section>
  );
}
