import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { BlogArticleCard } from "@/components/patterns/blog-article-card";
import { ResourceCard } from "@/components/patterns/resource-card";
import { GameCard } from "@/components/patterns/game-card";
import { AuthorLink } from "@/components/patterns/author-link";
import { getBlogTopicBySlug, getAllBlogTopics } from "@/config/blog-topics";
import { getLearningCategoryBySlug } from "@/config/learning-categories";
import { SAMPLE_ARTICLES } from "@/lib/blog/sample-articles";
import { BLOG_AUDIENCE_LABELS, isArticlePublished, type BlogArticle } from "@/lib/blog/types";
import { SAMPLE_RESOURCES } from "@/lib/resources/sample-resources";
import { SAMPLE_GAMES } from "@/lib/games/sample-games";
import { isGamePublished } from "@/lib/games/types";
import { siteConfig } from "@/config/site";
import { buildSocialMetadata } from "@/lib/seo/social-metadata";
import { buildAuthorSchema } from "@/lib/seo/author-schema";
import { buildFaqPageSchema } from "@/lib/seo/faq-schema";

export function generateStaticParams() {
  return SAMPLE_ARTICLES.filter(isArticlePublished).map((article) => ({ article: article.slug }));
}

function findPublishedArticle(slug: string): BlogArticle | undefined {
  return SAMPLE_ARTICLES.find((a) => a.slug === slug && isArticlePublished(a));
}

export async function generateMetadata({ params }: PageProps<"/blog/[article]">): Promise<Metadata> {
  const { article: slug } = await params;
  const article = findPublishedArticle(slug);
  if (!article) return {};

  const title = article.seoTitle || article.title;
  const description = article.metaDescription || article.excerpt;
  const canonicalUrl = article.canonicalUrl || `${siteConfig.url}/blog/${article.slug}`;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    ...buildSocialMetadata(title, description, `/blog/${article.slug}`),
  };
}

export default async function BlogArticlePage({ params }: PageProps<"/blog/[article]">) {
  const { article: slug } = await params;
  const article = findPublishedArticle(slug);

  if (!article) {
    notFound();
  }

  const topic = getBlogTopicBySlug(article.topic);
  const category = article.category ? getLearningCategoryBySlug(article.category) : undefined;
  const canonicalUrl = article.canonicalUrl || `${siteConfig.url}/blog/${article.slug}`;

  const relatedResources = (article.relatedResourceSlugs ?? [])
    .map((s) => SAMPLE_RESOURCES.find((r) => r.slug === s))
    .filter((r): r is NonNullable<typeof r> => Boolean(r));

  const publishedOthers = SAMPLE_ARTICLES.filter((a) => a.slug !== article.slug && isArticlePublished(a));
  const relatedArticles = publishedOthers.filter((a) => a.topic === article.topic).slice(0, 3);

  // Same category match connecting adult-facing guidance to a real,
  // published game a child could actually play on the same subject —
  // the reverse of the game detail page's own "From the blog" link.
  const relatedGame = article.category
    ? SAMPLE_GAMES.find((g) => g.category === article.category && isGamePublished(g))
    : undefined;

  // Structured data reflects only fields the model actually carries — no
  // ratings, review counts, or author credentials this platform can't back.
  // author uses Person for a real named teacher, Organization for the
  // platform itself — see src/lib/seo/author-schema.ts.
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.excerpt,
    url: canonicalUrl,
    inLanguage: "en",
    author: buildAuthorSchema(article.author),
    publisher: { "@type": "Organization", name: siteConfig.name },
    datePublished: article.createdAt,
    dateModified: article.updatedAt,
  };

  const faqStructuredData = article.faq ? buildFaqPageSchema(article.faq) : null;

  return (
    <Section>
      <Container>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
        {faqStructuredData && (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }} />
        )}

        <div className="max-w-3xl">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Blog", href: "/blog" }, { label: article.title }]} />

          <Heading level="h1" className="mt-4">
            {article.title}
          </Heading>
          <p className="mt-3 text-lg text-neutral-600">{article.excerpt}</p>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            {topic && (
              <Link href={`/blog?topic=${topic.slug}`}>
                <Badge variant="secondary">{topic.name}</Badge>
              </Link>
            )}
            {category && (
              <Link href={`/learn/${category.slug}`}>
                <Badge variant="primary">{category.name}</Badge>
              </Link>
            )}
            {article.audience.map((audience) => (
              <Badge key={audience} variant="neutral">
                {BLOG_AUDIENCE_LABELS[audience]}
              </Badge>
            ))}
            {article.ageRange && (
              <Badge variant="neutral">
                Ages {article.ageRange.minYears}–{article.ageRange.maxYears}
              </Badge>
            )}
          </div>

          <p className="mt-4 text-sm text-neutral-500">
            By <AuthorLink author={article.author} /> · Published{" "}
            {new Date(article.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            {article.updatedAt !== article.createdAt && (
              <>
                {" "}
                · Updated{" "}
                {new Date(article.updatedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </>
            )}
            {article.reviewer && (
              <>
                {" "}
                · Reviewed by <AuthorLink author={article.reviewer} />
              </>
            )}
          </p>

          <div className="mt-8 space-y-8">
            {article.sections.map((section) => (
              <div key={section.heading}>
                <Heading level="h4" as="h2">
                  {section.heading}
                </Heading>
                <div className="mt-3 space-y-3 text-neutral-700">
                  {section.paragraphs.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {article.practicalExamples && article.practicalExamples.length > 0 && (
            <div className="mt-8">
              <Heading level="h4" as="h2" className="text-neutral-500">
                Try this
              </Heading>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-ink">
                {article.practicalExamples.map((example) => (
                  <li key={example}>{example}</li>
                ))}
              </ul>
            </div>
          )}

          {article.faq && article.faq.length > 0 && (
            <div className="mt-10 border-t border-neutral-200 pt-8">
              <Heading level="h4" as="h2">
                Frequently asked questions
              </Heading>
              <dl className="mt-4 space-y-5">
                {article.faq.map((item) => (
                  <div key={item.question}>
                    <dt className="font-medium text-ink">{item.question}</dt>
                    <dd className="mt-1 text-sm text-neutral-600">{item.answer}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>

        {relatedGame && (
          <div className="mt-12 max-w-3xl border-t border-neutral-200 pt-8">
            <Heading level="h4" as="h2" className="text-neutral-500">
              Practice the same skill with a game
            </Heading>
            <div className="mt-4 max-w-sm">
              <GameCard game={relatedGame} categoryName={category?.name} />
            </div>
          </div>
        )}

        {relatedResources.length > 0 && (
          <div className="mt-12 max-w-3xl border-t border-neutral-200 pt-8">
            <Heading level="h4" as="h2" className="text-neutral-500">
              Related resources
            </Heading>
            <div className="mt-4 grid gap-6 sm:grid-cols-2">
              {relatedResources.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  categoryName={resource.category ? getLearningCategoryBySlug(resource.category)?.name : undefined}
                  isSample
                />
              ))}
            </div>
          </div>
        )}

        {relatedArticles.length > 0 && (
          <div className="mt-12 max-w-5xl border-t border-neutral-200 pt-8">
            <Heading level="h4" as="h2" className="text-neutral-500">
              More like this
            </Heading>
            <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedArticles.map((related) => (
                <BlogArticleCard key={related.id} article={related} topicName={getAllBlogTopics().find((t) => t.slug === related.topic)?.name} />
              ))}
            </div>
          </div>
        )}
      </Container>
    </Section>
  );
}
