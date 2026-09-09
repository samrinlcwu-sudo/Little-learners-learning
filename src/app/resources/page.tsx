import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { PageHeader } from "@/components/patterns/page-header";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ResourceCard } from "@/components/patterns/resource-card";
import { getAllLearningCategories } from "@/config/learning-categories";
import { SAMPLE_RESOURCES } from "@/lib/resources/sample-resources";
import {
  DEFAULT_PAGE_SIZE,
  filterResources,
  paginateResources,
  sortResources,
  type ResourceFilters,
  type ResourceSort,
} from "@/lib/resources/filters";
import { RESOURCE_TYPE_LABELS, type ResourceType } from "@/lib/resources/types";
import type { DifficultyLevel } from "@/lib/content/types";
import { siteConfig } from "@/config/site";
import { buildSocialMetadata } from "@/lib/seo/social-metadata";

const description =
  "Browse Little Learners Learning's resource library — worksheets, activities, ebooks, and teacher & parent resources.";

export const metadata: Metadata = {
  title: "Resources",
  description,
  // Faceted/paginated views of this page canonicalize back to the base
  // library URL rather than each generating their own indexable page.
  alternates: { canonical: `${siteConfig.url}/resources` },
  ...buildSocialMetadata("Resources — " + siteConfig.name, description, "/resources"),
};

const categoryNameBySlug = new Map(
  getAllLearningCategories().map((c) => [c.slug, c.name] as const),
);

const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

/**
 * Server-rendered and URL-driven (query params, not client state) on
 * purpose: unlike the small, fixed Learning Hub content, a resource
 * library is designed to eventually hold a large number of items, so
 * filtering/sorting/pagination happen server-side (in-memory today, a
 * database query later) and only one page's worth of results is ever
 * sent to the browser. Works fully without JavaScript.
 */
export default async function ResourcesPage({
  searchParams,
}: PageProps<"/resources">) {
  const params = await searchParams;
  const getParam = (key: string) => {
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const filters: ResourceFilters = {
    query: getParam("q") || undefined,
    category: getParam("category") || undefined,
    resourceType: (getParam("type") as ResourceType) || undefined,
    ageYears: getParam("age") ? Number(getParam("age")) : undefined,
    difficulty: (getParam("difficulty") as DifficultyLevel) || undefined,
    accessTier: (getParam("tier") as ResourceFilters["accessTier"]) || undefined,
  };
  const sort = (getParam("sort") as ResourceSort) || "newest";
  const page = Number(getParam("page")) || 1;

  const filtered = sortResources(filterResources(SAMPLE_RESOURCES, filters), sort);
  const { items, pageCount, totalCount } = paginateResources(filtered, page);
  const hasActiveFilters = Boolean(
    filters.query ||
      filters.category ||
      filters.resourceType ||
      filters.ageYears ||
      filters.difficulty ||
      filters.accessTier,
  );

  const availableCategories = getAllLearningCategories().filter((c) =>
    SAMPLE_RESOURCES.some((r) => r.category === c.slug),
  );
  const availableTypes = Array.from(new Set(SAMPLE_RESOURCES.map((r) => r.resourceType)));

  function pageHref(targetPage: number) {
    const next = new URLSearchParams();
    if (filters.query) next.set("q", filters.query);
    if (filters.category) next.set("category", filters.category);
    if (filters.resourceType) next.set("type", filters.resourceType);
    if (filters.ageYears) next.set("age", String(filters.ageYears));
    if (filters.difficulty) next.set("difficulty", filters.difficulty);
    if (filters.accessTier) next.set("tier", filters.accessTier);
    if (sort !== "newest") next.set("sort", sort);
    if (targetPage > 1) next.set("page", String(targetPage));
    const qs = next.toString();
    return qs ? `/resources?${qs}` : "/resources";
  }

  // Names exactly the resources rendered on this page of results — same
  // "only what's visible" rule as the Teacher Directory's ItemList, so the
  // schema never claims a resource is here that a visitor can't see.
  const structuredData =
    items.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: items.map((resource, index) => ({
            "@type": "ListItem",
            position: (page - 1) * DEFAULT_PAGE_SIZE + index + 1,
            url: `${siteConfig.url}/resources/${resource.slug}`,
            name: resource.title,
          })),
        }
      : null;

  return (
    <>
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
      <PageHeader
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Resources" }]}
        eyebrow="Resource Library"
        title="Resources"
        description="Worksheets, activities, ebooks, and resources for parents and teachers. The library is just getting started — search and filters are fully working, even while the catalog is small."
        surface="tint-secondary"
      />
      <Section className="pt-10 sm:pt-12 lg:pt-14">
        <Container>
          <form method="get" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2">
            <Label htmlFor="q">Search</Label>
            <Input id="q" name="q" type="search" placeholder="Search titles…" defaultValue={filters.query} />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Select id="category" name="category" defaultValue={filters.category ?? ""}>
              <option value="">All categories</option>
              {availableCategories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="type">Resource type</Label>
            <Select id="type" name="type" defaultValue={filters.resourceType ?? ""}>
              <option value="">All types</option>
              {availableTypes.map((type) => (
                <option key={type} value={type}>
                  {RESOURCE_TYPE_LABELS[type]}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="age">Age</Label>
            <Select id="age" name="age" defaultValue={filters.ageYears ? String(filters.ageYears) : ""}>
              <option value="">Any age</option>
              {[2, 3, 4, 5, 6, 7, 8].map((age) => (
                <option key={age} value={age}>
                  {age} years
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="difficulty">Difficulty</Label>
            <Select id="difficulty" name="difficulty" defaultValue={filters.difficulty ?? ""}>
              <option value="">Any difficulty</option>
              {(Object.keys(DIFFICULTY_LABELS) as DifficultyLevel[]).map((level) => (
                <option key={level} value={level}>
                  {DIFFICULTY_LABELS[level]}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="tier">Access</Label>
            <Select id="tier" name="tier" defaultValue={filters.accessTier ?? ""}>
              <option value="">Free & Premium</option>
              <option value="free">Free</option>
              <option value="premium">Premium</option>
              <option value="membership">Membership</option>
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
                <Link href="/resources">Clear filters</Link>
              </Button>
            )}
          </div>
        </form>

        <div className="mt-10">
          {items.length > 0 ? (
            <>
              <p className="text-sm text-neutral-500">
                {totalCount} resource{totalCount === 1 ? "" : "s"}
              </p>
              <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    categoryName={resource.category ? categoryNameBySlug.get(resource.category) : undefined}
                    isSample
                  />
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
              title={hasActiveFilters ? "No resources match your filters" : "No resources published yet"}
              description={
                hasActiveFilters
                  ? "Try clearing a filter or searching for something else."
                  : "Check back as worksheets, activities, and other resources are added."
              }
              action={
                hasActiveFilters ? (
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/resources">Clear filters</Link>
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
