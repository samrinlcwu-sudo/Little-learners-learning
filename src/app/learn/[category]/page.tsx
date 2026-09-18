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
  buildCategoryMetaDescription,
} from "@/config/learning-categories";
import { LearningContentBrowser } from "@/components/patterns/learning-content-browser";
import { LearningJourneySteps } from "@/components/patterns/learning-journey-steps";
import { GameCard } from "@/components/patterns/game-card";
import { ResourceCard } from "@/components/patterns/resource-card";
import { BlogArticleCard } from "@/components/patterns/blog-article-card";
import { TrackPageView } from "@/components/patterns/track-page-view";
import { LearningAreaStructuredData } from "@/components/patterns/learning-area-structured-data";
import { CONTENT_TYPE_LABELS } from "@/lib/content/types";
import { getCategoryJourney } from "@/lib/learning-journey";
import { CATEGORY_TONE_TILE } from "@/lib/utils/category-tone";
import { getLearningAreaKnowledge } from "@/lib/ai/knowledge/public-knowledge";
import { getAllBlogTopics } from "@/config/blog-topics";
import { SAMPLE_ARTICLES } from "@/lib/blog/sample-articles";
import { isArticlePublished } from "@/lib/blog/types";
import { siteConfig } from "@/config/site";
import { buildSocialMetadata } from "@/lib/seo/social-metadata";
import { getSubtopicsForCategory, subtopicMatchesSkill, subtopicMatchesTags } from "@/config/subtopics";
import { buildCategoryFaq } from "@/lib/faq/category-faq";
import { FaqSection } from "@/components/patterns/faq-section";
import { FileText, Gamepad2, Newspaper, BookOpen, type LucideIcon } from "lucide-react";

export function generateStaticParams() {
  return getAllLearningCategories().map((category) => ({ category: category.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/learn/[category]">): Promise<Metadata> {
  const { category: slug } = await params;
  const category = getLearningCategoryBySlug(slug);
  if (!category) return {};

  const description = buildCategoryMetaDescription(category);
  return {
    title: category.name,
    description,
    alternates: { canonical: `${siteConfig.url}/learn/${category.slug}` },
    ...buildSocialMetadata(`${category.name} — ${siteConfig.name}`, description, `/learn/${category.slug}`),
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
  const categoryArticles = SAMPLE_ARTICLES.filter(
    (article) => article.category === category.slug && isArticlePublished(article),
  );
  const topicNameBySlug = new Map(getAllBlogTopics().map((t) => [t.slug, t.name] as const));
  const categoryFaq = buildCategoryFaq(category, journey, categoryArticles.length);

  // The subtopic outline (Prompt 75) — each entry only appears when real,
  // already-published content in this category actually matches it (see
  // src/config/subtopics.ts). A subtopic with zero real matches is simply
  // omitted, never shown with a fake/empty item list.
  type SubtopicLink = { title: string; href: string; icon: LucideIcon };
  const subtopicSections = getSubtopicsForCategory(category.slug)
    .map((subtopic) => {
      const links: SubtopicLink[] = [
        ...categoryContent
          .filter((item) => subtopicMatchesTags(subtopic, item.tags))
          .map((item) => ({ title: item.title, href: `/learn/${category.slug}#content`, icon: BookOpen })),
        ...categoryResources
          .filter((item) => subtopicMatchesTags(subtopic, item.tags))
          .map((item) => ({ title: item.title, href: `/resources/${item.slug}`, icon: FileText })),
        ...categoryGames
          .filter((item) => subtopicMatchesSkill(subtopic, item.skill))
          .map((item) => ({ title: item.title, href: `/games/${item.slug}`, icon: Gamepad2 })),
        ...categoryArticles
          .filter((item) => subtopicMatchesTags(subtopic, item.tags))
          .map((item) => ({ title: item.title, href: `/blog/${item.slug}`, icon: Newspaper })),
      ];
      return { subtopic, links };
    })
    .filter((section) => section.links.length > 0);

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
            <div className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${CATEGORY_TONE_TILE[category.color]}`}>
              <category.icon className="size-6" aria-hidden="true" />
            </div>
            <Heading level="h1">{category.name}</Heading>
          </div>
          <p className="mt-3 text-neutral-600">{category.description}</p>

          <div className="mt-5 flex flex-wrap gap-2">
            <Badge variant={category.color}>
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

          {subtopicSections.length > 0 && (
            <div className="mt-8">
              <Heading level="h4" as="h2" className="text-neutral-500">
                Explore by subtopic
              </Heading>
              <p className="mt-1 text-sm text-neutral-500">
                {category.name} broken down into the specific skills real content here builds.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {subtopicSections.map(({ subtopic, links }) => (
                  <div key={subtopic.slug} className="rounded-xl border border-neutral-200 p-4">
                    <p className="font-display font-semibold text-ink">{subtopic.name}</p>
                    <p className="mt-1 text-sm text-neutral-600">{subtopic.description}</p>
                    <ul className="mt-3 space-y-1.5">
                      {links.map((link) => (
                        <li key={link.href + link.title}>
                          <Link
                            href={link.href}
                            className="flex items-center gap-2 text-sm text-primary-700 hover:underline"
                          >
                            <link.icon className="size-4 shrink-0" aria-hidden="true" />
                            {link.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

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

        <div id="articles" className="mt-12 scroll-mt-20 border-t border-neutral-200 pt-8">
          <Heading level="h4" as="h2" className="text-neutral-500">
            Articles for parents and teachers
          </Heading>
          <div className="mt-4">
            {categoryArticles.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {categoryArticles.map((article) => (
                  <BlogArticleCard key={article.id} article={article} topicName={topicNameBySlug.get(article.topic)} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No articles for this subject yet"
                description="Guidance for parents and teachers on this subject is still being added. Browse the full blog in the meantime."
                action={
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/blog">Browse the blog</Link>
                  </Button>
                }
              />
            )}
          </div>
        </div>

        <FaqSection
          title={`${category.name} — questions parents and teachers ask`}
          items={categoryFaq}
          className="mt-12 max-w-3xl border-t border-neutral-200 pt-8"
        />

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
