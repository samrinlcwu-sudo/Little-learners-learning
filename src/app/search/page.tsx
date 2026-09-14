import type { Metadata } from "next";
import Link from "next/link";
import { Search as SearchIcon } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ResourceCard } from "@/components/patterns/resource-card";
import { GameCard } from "@/components/patterns/game-card";
import { BlogArticleCard } from "@/components/patterns/blog-article-card";
import { getAllLearningCategories } from "@/config/learning-categories";
import { getAllResourceTypeOptions } from "@/config/teacher-resource-types";
import { SAMPLE_RESOURCES } from "@/lib/resources/sample-resources";
import { filterResources, sortResources, paginateResources, DEFAULT_PAGE_SIZE } from "@/lib/resources/filters";
import { ACCESS_TIER_LABELS, type AccessTier, type ResourceType } from "@/lib/resources/types";
import { SAMPLE_GAMES } from "@/lib/games/sample-games";
import { filterGames, paginateGames, DEFAULT_GAME_PAGE_SIZE } from "@/lib/games/filters";
import { SAMPLE_ARTICLES } from "@/lib/blog/sample-articles";
import { filterArticles, paginateArticles, DEFAULT_ARTICLE_PAGE_SIZE } from "@/lib/blog/filters";
import { getAllBlogTopics } from "@/config/blog-topics";
import { rankBySearchMatch, scoreSearchMatch } from "@/lib/search/relevance";

type SearchType = "all" | "resources" | "games" | "articles" | "categories";

const TYPE_LABELS: Record<SearchType, string> = {
  all: "Everything",
  resources: "Resources",
  games: "Games",
  articles: "Articles",
  categories: "Learning areas",
};

const TYPE_TABS: SearchType[] = ["all", "resources", "games", "articles", "categories"];

// A search page's own URL is never a fixed, indexable piece of content —
// every q/filter/page combination is a different view of the same data,
// which is exactly the "endless crawlable duplicate pages" the brief
// warns against. `follow: true` still lets crawl equity flow through to
// the real destination pages this page links to.
export const metadata: Metadata = {
  title: "Search",
  description: "Search resources, games, learning areas, and articles across Little Learners Learning.",
  robots: { index: false, follow: true },
};

const categoryNameBySlug = new Map(getAllLearningCategories().map((c) => [c.slug, c.name] as const));
const topicNameBySlug = new Map(getAllBlogTopics().map((t) => [t.slug, t.name] as const));

const PREVIEW_COUNT = 3;

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const params = await searchParams;
  const getParam = (key: string) => {
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const q = (getParam("q") ?? "").trim();
  const type = (TYPE_TABS.includes(getParam("type") as SearchType) ? getParam("type") : "all") as SearchType;
  const category = getParam("category") || undefined;
  const ageYears = getParam("age") ? Number(getParam("age")) : undefined;
  const resourceType = (getParam("resourceType") as ResourceType) || undefined;
  const tier = (getParam("tier") as AccessTier) || undefined;
  const page = Number(getParam("page")) || 1;
  const hasQuery = q.length > 0;

  // Every list below is built the same way: apply the real, existing
  // structural filters (category/age/type/tier), never the content
  // type's own weak title+description query match — relevance ranking
  // (src/lib/search/relevance.ts) replaces that with the brief's own
  // priority order (title > category > topic > age > description).
  const filteredResources = filterResources(SAMPLE_RESOURCES, { category, ageYears, resourceType, accessTier: tier });
  const rankedResources = hasQuery
    ? rankBySearchMatch(
        q,
        filteredResources,
        (r) => ({
          title: r.title,
          categoryName: r.category ? categoryNameBySlug.get(r.category) : undefined,
          topic: r.subject,
          description: r.description,
          ageRange: r.ageRange,
        }),
        ageYears,
      )
    : sortResources(filteredResources, "newest");

  const filteredGames = filterGames(SAMPLE_GAMES, { category, ageYears, accessTier: tier });
  const rankedGames = hasQuery
    ? rankBySearchMatch(
        q,
        filteredGames,
        (g) => ({
          title: g.title,
          categoryName: g.category ? categoryNameBySlug.get(g.category) : undefined,
          topic: g.skill,
          description: g.description,
          ageRange: g.ageRange,
        }),
        ageYears,
      )
    : filteredGames;

  const filteredArticles = filterArticles(SAMPLE_ARTICLES, { category });
  const rankedArticles = hasQuery
    ? rankBySearchMatch(q, filteredArticles, (a) => ({
        title: a.title,
        categoryName: a.category ? categoryNameBySlug.get(a.category) : undefined,
        topic: topicNameBySlug.get(a.topic),
        description: a.excerpt,
        ageRange: a.ageRange,
      }))
    : filteredArticles;

  const allCategories = getAllLearningCategories();
  const rankedCategories = hasQuery
    ? allCategories
        .map((c) => ({ c, score: scoreSearchMatch(q, { title: c.name, description: c.description }) }))
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .map(({ c }) => c)
    : allCategories;

  const totalCount = rankedResources.length + rankedGames.length + rankedArticles.length + rankedCategories.length;
  // The count that actually decides "should this view show an empty
  // state" — the combined total when browsing everything, but only the
  // selected tab's own count once one is active. Without this, selecting
  // a tab with zero matches (while a different type still has results)
  // would silently render a "0 resources" heading with no real empty
  // state below it, instead of the same helpful guidance every other
  // empty result set in this codebase gives.
  const activeCount =
    type === "resources"
      ? rankedResources.length
      : type === "games"
        ? rankedGames.length
        : type === "articles"
          ? rankedArticles.length
          : type === "categories"
            ? rankedCategories.length
            : totalCount;

  const availableResourceTypes = getAllResourceTypeOptions().filter((option) =>
    SAMPLE_RESOURCES.some((r) => r.resourceType === option.id),
  );

  function buildHref(overrides: Record<string, string | number | undefined>) {
    const next = new URLSearchParams();
    const merged = { q: q || undefined, type, category, age: ageYears, resourceType, tier, ...overrides };
    for (const [key, value] of Object.entries(merged)) {
      if (value !== undefined && value !== "" && !(key === "type" && value === "all") && !(key === "page" && value === 1)) {
        next.set(key, String(value));
      }
    }
    const qs = next.toString();
    return qs ? `/search?${qs}` : "/search";
  }

  return (
    <Section>
      <Container>
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Search" }]} />
        <div className="mt-4 max-w-2xl">
          <Heading level="h1">Search</Heading>
          <p className="mt-3 text-neutral-600">
            Find resources, games, learning areas, and articles across the whole platform.
          </p>
        </div>

        <form method="get" className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="sm:col-span-2 lg:col-span-2">
            <Label htmlFor="q">Search</Label>
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-neutral-500" aria-hidden="true" />
              <Input id="q" name="q" type="search" placeholder="Search everything…" defaultValue={q} className="pl-9" />
            </div>
          </div>
          <input type="hidden" name="type" value={type} />
          <div>
            <Label htmlFor="category">Learning area</Label>
            <Select id="category" name="category" defaultValue={category ?? ""}>
              <option value="">All learning areas</option>
              {allCategories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="age">Age</Label>
            <Select id="age" name="age" defaultValue={ageYears ? String(ageYears) : ""}>
              <option value="">Any age</option>
              {[2, 3, 4, 5, 6, 7, 8].map((age) => (
                <option key={age} value={age}>
                  {age} years
                </option>
              ))}
            </Select>
          </div>
          {(type === "resources" || type === "all") && (
            <div>
              <Label htmlFor="resourceType">Resource type</Label>
              <Select id="resourceType" name="resourceType" defaultValue={resourceType ?? ""}>
                <option value="">All types</option>
                {availableResourceTypes.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
          )}
          {(type === "resources" || type === "games" || type === "all") && (
            <div>
              <Label htmlFor="tier">Access</Label>
              <Select id="tier" name="tier" defaultValue={tier ?? ""}>
                <option value="">Free &amp; Premium</option>
                {(Object.keys(ACCESS_TIER_LABELS) as AccessTier[]).map((t) => (
                  <option key={t} value={t}>
                    {ACCESS_TIER_LABELS[t]}
                  </option>
                ))}
              </Select>
            </div>
          )}
          <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-5">
            <Button type="submit">Search</Button>
            <Button variant="outline" asChild>
              <Link href="/search">Clear</Link>
            </Button>
          </div>
        </form>

        <div className="mt-6 flex flex-wrap gap-2 border-b border-neutral-200 pb-4">
          {TYPE_TABS.map((tab) => (
            <Link
              key={tab}
              href={buildHref({ type: tab, page: undefined })}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                type === tab ? "bg-primary-600 text-white" : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              }`}
            >
              {TYPE_LABELS[tab]}
            </Link>
          ))}
        </div>

        <div className="mt-8">
          {!hasQuery && !category && !ageYears && !resourceType && !tier ? (
            <EmptyState
              icon={SearchIcon}
              title="Start typing to search"
              description="Search across resources, games, learning areas, and articles — or use the filters above to browse."
            />
          ) : activeCount === 0 ? (
            <EmptyState
              icon={SearchIcon}
              title={
                hasQuery
                  ? `No ${type === "all" ? "results" : TYPE_LABELS[type].toLowerCase()} for "${q}"`
                  : `No ${type === "all" ? "results" : TYPE_LABELS[type].toLowerCase()} match your filters`
              }
              description={
                type !== "all" && totalCount > activeCount
                  ? "Try a different tab above — this search does have matches, just not in this category."
                  : "Try a different word, clear a filter, or browse by learning area instead."
              }
              action={
                <Button size="sm" variant="outline" asChild>
                  <Link href="/learn">Browse learning areas</Link>
                </Button>
              }
            />
          ) : type === "all" ? (
            <AllResultsView
              resources={rankedResources}
              games={rankedGames}
              articles={rankedArticles}
              categories={rankedCategories}
              buildHref={buildHref}
            />
          ) : (
            <SingleTypeResults
              type={type}
              resources={rankedResources}
              games={rankedGames}
              articles={rankedArticles}
              categories={rankedCategories}
              page={page}
              buildHref={buildHref}
            />
          )}
        </div>
      </Container>
    </Section>
  );
}

function SectionHeading({ title, count, seeAllHref }: { title: string; count: number; seeAllHref?: string }) {
  return (
    <div className="flex items-center justify-between">
      <Heading level="h4" as="h2" className="text-neutral-500">
        {title} ({count})
      </Heading>
      {seeAllHref && (
        <Link href={seeAllHref} className="text-sm font-medium text-primary-700 hover:underline">
          View all
        </Link>
      )}
    </div>
  );
}

function CategoryResultCard({ category }: { category: ReturnType<typeof getAllLearningCategories>[number] }) {
  return (
    <Link href={`/learn/${category.slug}`} className="group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/30">
      <Card interactive className="flex h-full flex-col gap-3 p-5">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary-100 text-primary-700">
          <category.icon className="size-5" aria-hidden="true" />
        </div>
        <p className="font-display font-semibold text-ink group-hover:text-primary-700">{category.name}</p>
        <p className="text-sm text-neutral-600">{category.description}</p>
        <Badge variant="neutral" className="mt-auto w-fit">
          Ages {category.ageRange.minYears}–{category.ageRange.maxYears}
        </Badge>
      </Card>
    </Link>
  );
}

interface ResultLists {
  resources: ReturnType<typeof filterResources>;
  games: ReturnType<typeof filterGames>;
  articles: ReturnType<typeof filterArticles>;
  categories: ReturnType<typeof getAllLearningCategories>;
  buildHref: (overrides: Record<string, string | number | undefined>) => string;
}

function AllResultsView({ resources, games, articles, categories, buildHref }: ResultLists) {
  return (
    <div className="space-y-12">
      {categories.length > 0 && (
        <div>
          <SectionHeading title="Learning areas" count={categories.length} seeAllHref={categories.length > PREVIEW_COUNT ? buildHref({ type: "categories" }) : undefined} />
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.slice(0, PREVIEW_COUNT).map((c) => (
              <CategoryResultCard key={c.slug} category={c} />
            ))}
          </div>
        </div>
      )}
      {resources.length > 0 && (
        <div>
          <SectionHeading title="Resources" count={resources.length} seeAllHref={resources.length > PREVIEW_COUNT ? buildHref({ type: "resources" }) : undefined} />
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {resources.slice(0, PREVIEW_COUNT).map((r) => (
              <ResourceCard key={r.id} resource={r} categoryName={r.category ? categoryNameBySlug.get(r.category) : undefined} isSample />
            ))}
          </div>
        </div>
      )}
      {games.length > 0 && (
        <div>
          <SectionHeading title="Games" count={games.length} seeAllHref={games.length > PREVIEW_COUNT ? buildHref({ type: "games" }) : undefined} />
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {games.slice(0, PREVIEW_COUNT).map((g) => (
              <GameCard key={g.id} game={g} categoryName={g.category ? categoryNameBySlug.get(g.category) : undefined} />
            ))}
          </div>
        </div>
      )}
      {articles.length > 0 && (
        <div>
          <SectionHeading title="Articles" count={articles.length} seeAllHref={articles.length > PREVIEW_COUNT ? buildHref({ type: "articles" }) : undefined} />
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.slice(0, PREVIEW_COUNT).map((a) => (
              <BlogArticleCard key={a.id} article={a} topicName={topicNameBySlug.get(a.topic)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface SingleTypeProps extends ResultLists {
  type: SearchType;
  page: number;
}

function SingleTypeResults({ type, resources, games, articles, categories, page, buildHref }: SingleTypeProps) {
  if (type === "resources") {
    const { items, pageCount, totalCount } = paginateResources(resources, page, DEFAULT_PAGE_SIZE);
    return (
      <div>
        <p className="text-sm text-neutral-500">
          {totalCount} resource{totalCount === 1 ? "" : "s"}
        </p>
        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((r) => (
            <ResourceCard key={r.id} resource={r} categoryName={r.category ? categoryNameBySlug.get(r.category) : undefined} isSample />
          ))}
        </div>
        <SearchPagination page={page} pageCount={pageCount} buildHref={buildHref} />
      </div>
    );
  }

  if (type === "games") {
    const { items, pageCount, totalCount } = paginateGames(games, page, DEFAULT_GAME_PAGE_SIZE);
    return (
      <div>
        <p className="text-sm text-neutral-500">
          {totalCount} game{totalCount === 1 ? "" : "s"}
        </p>
        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((g) => (
            <GameCard key={g.id} game={g} categoryName={g.category ? categoryNameBySlug.get(g.category) : undefined} />
          ))}
        </div>
        <SearchPagination page={page} pageCount={pageCount} buildHref={buildHref} />
      </div>
    );
  }

  if (type === "articles") {
    const { items, pageCount, totalCount } = paginateArticles(articles, page, DEFAULT_ARTICLE_PAGE_SIZE);
    return (
      <div>
        <p className="text-sm text-neutral-500">
          {totalCount} article{totalCount === 1 ? "" : "s"}
        </p>
        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((a) => (
            <BlogArticleCard key={a.id} article={a} topicName={topicNameBySlug.get(a.topic)} />
          ))}
        </div>
        <SearchPagination page={page} pageCount={pageCount} buildHref={buildHref} />
      </div>
    );
  }

  // categories — small, fixed list (16 total), no pagination needed.
  return (
    <div>
      <p className="text-sm text-neutral-500">
        {categories.length} learning area{categories.length === 1 ? "" : "s"}
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <CategoryResultCard key={c.slug} category={c} />
        ))}
      </div>
    </div>
  );
}

function SearchPagination({
  page,
  pageCount,
  buildHref,
}: {
  page: number;
  pageCount: number;
  buildHref: (overrides: Record<string, string | number | undefined>) => string;
}) {
  if (pageCount <= 1) return null;
  return (
    <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-2">
      <Button variant="outline" size="sm" disabled={page <= 1} asChild={page > 1}>
        {page > 1 ? <Link href={buildHref({ page: page - 1 })}>Previous</Link> : <span>Previous</span>}
      </Button>
      <span className="text-sm text-neutral-600">
        Page {page} of {pageCount}
      </span>
      <Button variant="outline" size="sm" disabled={page >= pageCount} asChild={page < pageCount}>
        {page < pageCount ? <Link href={buildHref({ page: page + 1 })}>Next</Link> : <span>Next</span>}
      </Button>
    </nav>
  );
}
