import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { PageHeader } from "@/components/patterns/page-header";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { BlogArticleCard } from "@/components/patterns/blog-article-card";
import { getAllBlogTopics } from "@/config/blog-topics";
import { SAMPLE_ARTICLES } from "@/lib/blog/sample-articles";
import {
  DEFAULT_ARTICLE_PAGE_SIZE,
  filterArticles,
  paginateArticles,
  sortArticles,
  type BlogFilters,
  type BlogSort,
} from "@/lib/blog/filters";
import { BLOG_AUDIENCE_LABELS, isArticlePublished, type BlogAudience } from "@/lib/blog/types";
import { siteConfig } from "@/config/site";
import { buildSocialMetadata } from "@/lib/seo/social-metadata";
import { toJsonLdHtml } from "@/lib/seo/json-ld";

const description =
  "Practical, honest guidance for parents and early-years teachers — early childhood education, classroom ideas, learning through play, and more from Little Learners Learning.";

export const metadata: Metadata = {
  title: "Blog",
  description,
  // Faceted/paginated views canonicalize back to the base blog URL —
  // same "avoid thousands of low-value URLs" rule the Resource Library
  // and Teacher Directory already follow.
  alternates: { canonical: `${siteConfig.url}/blog` },
  ...buildSocialMetadata("Blog — " + siteConfig.name, description, "/blog"),
};

const topicNameBySlug = new Map(getAllBlogTopics().map((t) => [t.slug, t.name] as const));

/**
 * Server-rendered and URL-driven, the same reasoning `/resources` already
 * uses (docs/RESOURCE_LIBRARY_ARCHITECTURE.md): a blog is designed to
 * eventually hold many articles, so filtering/sorting/pagination happen
 * server-side and work fully without JavaScript.
 */
export default async function BlogPage({ searchParams }: PageProps<"/blog">) {
  const params = await searchParams;
  const getParam = (key: string) => {
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const filters: BlogFilters = {
    query: getParam("q") || undefined,
    topic: getParam("topic") || undefined,
    audience: (getParam("audience") as BlogAudience) || undefined,
  };
  const sort = (getParam("sort") as BlogSort) || "newest";
  const page = Number(getParam("page")) || 1;
  const hasActiveFilters = Boolean(filters.query || filters.topic || filters.audience);

  const published = SAMPLE_ARTICLES.filter(isArticlePublished);
  const filtered = sortArticles(filterArticles(SAMPLE_ARTICLES, filters), sort);
  const { items, pageCount, totalCount } = paginateArticles(filtered, page);

  // Featured articles are shown once, up top, and excluded from double
  // appearing if they'd also land on page 1 of the main grid below.
  const featured = !hasActiveFilters && page === 1 ? published.filter((a) => a.featured).slice(0, 2) : [];
  const featuredSlugs = new Set(featured.map((a) => a.slug));
  const gridItems = items.filter((a) => !featuredSlugs.has(a.slug));

  const availableTopics = getAllBlogTopics().filter((t) => published.some((a) => a.topic === t.slug));

  function pageHref(targetPage: number) {
    const next = new URLSearchParams();
    if (filters.query) next.set("q", filters.query);
    if (filters.topic) next.set("topic", filters.topic);
    if (filters.audience) next.set("audience", filters.audience);
    if (sort !== "newest") next.set("sort", sort);
    if (targetPage > 1) next.set("page", String(targetPage));
    const qs = next.toString();
    return qs ? `/blog?${qs}` : "/blog";
  }

  // Names exactly the articles rendered on this page — same "only what's
  // visible" rule as the Resource Library's and Teacher Directory's ItemList.
  const structuredData =
    items.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: items.map((article, index) => ({
            "@type": "ListItem",
            position: (page - 1) * DEFAULT_ARTICLE_PAGE_SIZE + index + 1,
            url: `${siteConfig.url}/blog/${article.slug}`,
            name: article.title,
          })),
        }
      : null;

  return (
    <>
      {structuredData && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toJsonLdHtml(structuredData) }} />
      )}
      <PageHeader
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Blog" }]}
        eyebrow="Educational Blog"
        title="Blog"
        description="Practical, honest guidance for parents and early-years teachers. The blog is just getting started — search and filters are fully working, even while the library is small."
        surface="tint-secondary"
      />

      {featured.length > 0 && (
        <Section className="pt-10 sm:pt-12">
          <Container>
            <Heading level="h3" as="h2">
              Featured
            </Heading>
            <div className="mt-4 grid gap-6 sm:grid-cols-2">
              {featured.map((article) => (
                <BlogArticleCard key={article.id} article={article} topicName={topicNameBySlug.get(article.topic)} />
              ))}
            </div>
          </Container>
        </Section>
      )}

      <Section className={featured.length > 0 ? "pt-4 sm:pt-6" : "pt-10 sm:pt-12 lg:pt-14"}>
        <Container>
          <form method="get" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2">
              <Label htmlFor="q">Search</Label>
              <Input id="q" name="q" type="search" placeholder="Search articles…" defaultValue={filters.query} />
            </div>
            <div>
              <Label htmlFor="topic">Topic</Label>
              <Select id="topic" name="topic" defaultValue={filters.topic ?? ""}>
                <option value="">All topics</option>
                {availableTopics.map((t) => (
                  <option key={t.slug} value={t.slug}>
                    {t.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="audience">Written for</Label>
              <Select id="audience" name="audience" defaultValue={filters.audience ?? ""}>
                <option value="">Everyone</option>
                {(Object.keys(BLOG_AUDIENCE_LABELS) as BlogAudience[]).map((audience) => (
                  <option key={audience} value={audience}>
                    {BLOG_AUDIENCE_LABELS[audience]}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="sort">Sort</Label>
              <Select id="sort" name="sort" defaultValue={sort}>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="title-asc">Title A–Z</option>
              </Select>
            </div>
            <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-4">
              <Button type="submit">Apply filters</Button>
              {hasActiveFilters && (
                <Button variant="outline" asChild>
                  <Link href="/blog">Clear filters</Link>
                </Button>
              )}
            </div>
          </form>

          <div className="mt-10">
            {gridItems.length > 0 ? (
              <>
                <p className="text-sm text-neutral-500">
                  {totalCount} article{totalCount === 1 ? "" : "s"}
                </p>
                <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {gridItems.map((article) => (
                    <BlogArticleCard key={article.id} article={article} topicName={topicNameBySlug.get(article.topic)} />
                  ))}
                </div>

                {pageCount > 1 && (
                  <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1} asChild={page > 1}>
                      {page > 1 ? <Link href={pageHref(page - 1)}>Previous</Link> : <span>Previous</span>}
                    </Button>
                    <span className="text-sm text-neutral-600">
                      Page {page} of {pageCount}
                    </span>
                    <Button variant="outline" size="sm" disabled={page >= pageCount} asChild={page < pageCount}>
                      {page < pageCount ? <Link href={pageHref(page + 1)}>Next</Link> : <span>Next</span>}
                    </Button>
                  </nav>
                )}
              </>
            ) : (
              <EmptyState
                title={hasActiveFilters ? "No articles match your filters" : "No articles published yet"}
                description={
                  hasActiveFilters
                    ? "Try clearing a filter or searching for something else."
                    : "Check back as new guidance is added."
                }
                action={
                  hasActiveFilters ? (
                    <Button size="sm" variant="outline" asChild>
                      <Link href="/blog">Clear filters</Link>
                    </Button>
                  ) : undefined
                }
              />
            )}
          </div>
        </Container>
      </Section>
    </>
  );
}
