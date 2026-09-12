import type { Metadata } from "next";
import Link from "next/link";
import { ShoppingBag, Library, Gamepad2 } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/patterns/page-header";
import { CapabilityList } from "@/components/patterns/capability-list";
import { OfferingCard } from "@/components/patterns/offering-card";
import { ResourceCard } from "@/components/patterns/resource-card";
import { GameCard } from "@/components/patterns/game-card";
import { getAllLearningCategories } from "@/config/learning-categories";
import { getAllOfferings } from "@/lib/offerings/offerings";
import { filterOfferings, type OfferingFilters } from "@/lib/offerings/filters";
import {
  OFFERING_AVAILABILITIES,
  OFFERING_AVAILABILITY_LABELS,
  OFFERING_TYPES,
  OFFERING_TYPE_LABELS,
  type OfferingAvailability,
  type OfferingType,
} from "@/lib/offerings/types";
import type { AccessTier } from "@/lib/resources/types";
import { SAMPLE_RESOURCES } from "@/lib/resources/sample-resources";
import { isResourcePublished } from "@/lib/resources/types";
import { SAMPLE_GAMES } from "@/lib/games/sample-games";
import { isGamePublished } from "@/lib/games/types";
import { siteConfig } from "@/config/site";
import { buildSocialMetadata } from "@/lib/seo/social-metadata";

const description =
  "Browse Little Learners Learning's catalog of learning products — worksheet bundles, digital resources, learning programs, and memberships — organized by subject, age, and access level.";

export const metadata: Metadata = {
  title: "Catalog",
  description,
  alternates: { canonical: `${siteConfig.url}/offerings` },
  ...buildSocialMetadata("Catalog — " + siteConfig.name, description, "/offerings"),
};

const categoryNameBySlug = new Map(getAllLearningCategories().map((c) => [c.slug, c.name] as const));

const todayCapabilities = [
  {
    title: "Browse real, free resources and games",
    description: "Every worksheet, activity, ebook, and game already in the library is organized by subject and age.",
  },
  {
    title: "See exactly what's free vs. premium",
    description: "Every resource already carries an honest access-level label — nothing is hidden behind a fake paywall.",
  },
];

const aheadCapabilities = [
  {
    title: "Worksheet bundles, digital products, and learning programs",
    description: "Real, purchasable offerings will appear here the moment they actually exist — none are invented in the meantime.",
  },
  {
    title: "Memberships and future services",
    description: "The catalog is built to hold these the moment a real one is decided — see docs/BUSINESS_ARCHITECTURE.md.",
  },
];

/**
 * The Prompt 60 catalog — an additional, honest layer above the Resource
 * Library and Games Hub, not a replacement for either
 * (docs/BUSINESS_ARCHITECTURE.md). `getAllOfferings()` returns `[]` today
 * because no real bundle, program, or membership exists in this business
 * yet; the filter/search UI below is real, working logic (the same
 * pattern `/resources` and `/teachers` already use) that will apply
 * unchanged the moment a real offering does. In the meantime, this page's
 * job is to be genuinely useful today: it surfaces real, free content
 * already in the library so a visitor never lands on an empty page with
 * nothing to do.
 */
export default async function OfferingsPage({ searchParams }: PageProps<"/offerings">) {
  const params = await searchParams;
  const getParam = (key: string) => {
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const filters: OfferingFilters = {
    query: getParam("q") || undefined,
    type: (getParam("type") as OfferingType) || undefined,
    learningArea: getParam("area") || undefined,
    ageYears: getParam("age") ? Number(getParam("age")) : undefined,
    accessLevel: (getParam("access") as AccessTier) || undefined,
    availability: (getParam("availability") as OfferingAvailability) || undefined,
  };
  const hasActiveFilters = Boolean(
    filters.query || filters.type || filters.learningArea || filters.ageYears || filters.accessLevel || filters.availability,
  );

  const allOfferings = getAllOfferings();
  const items = filterOfferings(allOfferings, filters);

  const featuredResources = SAMPLE_RESOURCES.filter(
    (r) => isResourcePublished(r) && r.accessTier === "free" && r.featured,
  ).slice(0, 3);
  const featuredGames = SAMPLE_GAMES.filter((g) => isGamePublished(g) && g.accessTier === "free" && g.featured).slice(
    0,
    3,
  );

  // Only ever names offerings actually rendered on this page — the same
  // "never describe more than a crawler can see" rule /resources and
  // /teachers already follow. Empty today, correctly.
  const structuredData =
    items.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: items.map((offering, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: `${siteConfig.url}/offerings/${offering.slug}`,
            name: offering.name,
          })),
        }
      : null;

  return (
    <>
      {structuredData && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      )}
      <PageHeader
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Catalog" }]}
        eyebrow="Products & Programs"
        title="Catalog"
        description="Worksheet bundles, digital resources, learning programs, and memberships — organized the same way the rest of Little Learners Learning is, by subject and age."
        surface="tint-primary"
      />

      <Section className="pt-10 sm:pt-12 lg:pt-14">
        <Container>
          <form method="get" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2">
              <Label htmlFor="q">Search</Label>
              <Input id="q" name="q" type="search" placeholder="Search the catalog…" defaultValue={filters.query} />
            </div>
            <div>
              <Label htmlFor="area">Learning area</Label>
              <Select id="area" name="area" defaultValue={filters.learningArea ?? ""}>
                <option value="">All learning areas</option>
                {getAllLearningCategories().map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="type">Product type</Label>
              <Select id="type" name="type" defaultValue={filters.type ?? ""}>
                <option value="">All types</option>
                {OFFERING_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {OFFERING_TYPE_LABELS[type]}
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
              <Label htmlFor="access">Access</Label>
              <Select id="access" name="access" defaultValue={filters.accessLevel ?? ""}>
                <option value="">Free & Premium</option>
                <option value="free">Free</option>
                <option value="premium">Premium</option>
                <option value="membership">Membership</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="availability">Availability</Label>
              <Select id="availability" name="availability" defaultValue={filters.availability ?? ""}>
                <option value="">Any availability</option>
                {OFFERING_AVAILABILITIES.map((a) => (
                  <option key={a} value={a}>
                    {OFFERING_AVAILABILITY_LABELS[a]}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-4">
              <Button type="submit">Apply filters</Button>
              {hasActiveFilters && (
                <Button variant="outline" asChild>
                  <Link href="/offerings">Clear filters</Link>
                </Button>
              )}
            </div>
          </form>

          <div className="mt-10">
            {items.length > 0 ? (
              <>
                <p className="text-sm text-neutral-500">
                  {items.length} product{items.length === 1 ? "" : "s"}
                </p>
                <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((offering) => (
                    <OfferingCard
                      key={offering.id}
                      offering={offering}
                      learningAreaNames={offering.learningAreas.map((slug) => categoryNameBySlug.get(slug) ?? slug)}
                    />
                  ))}
                </div>
              </>
            ) : (
              <EmptyState
                icon={ShoppingBag}
                title={hasActiveFilters ? "No products match your filters" : "The catalog is just getting started"}
                description={
                  hasActiveFilters
                    ? "Try clearing a filter — there's no worksheet bundle, program, or membership in the catalog yet either way."
                    : "There's no worksheet bundle, learning program, or membership to show yet — nothing here is invented in the meantime. Explore what's already free below, or check back as real products are added."
                }
                action={
                  hasActiveFilters ? (
                    <Button size="sm" variant="outline" asChild>
                      <Link href="/offerings">Clear filters</Link>
                    </Button>
                  ) : undefined
                }
              />
            )}
          </div>
        </Container>
      </Section>

      {(featuredResources.length > 0 || featuredGames.length > 0) && (
        <Section surface="tint-secondary" className="py-12 sm:py-16">
          <Container>
            <Heading level="h2">Explore what&apos;s free today</Heading>
            <p className="mt-2 max-w-2xl text-neutral-600">
              The real resources and games already in the library — free to use right now, no account required.
            </p>

            {featuredResources.length > 0 && (
              <div className="mt-8">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-display text-lg font-semibold text-ink">Resources</h3>
                  <Link
                    href="/resources"
                    className="flex items-center gap-1.5 text-sm font-medium text-primary-700 hover:underline"
                  >
                    <Library className="size-4" aria-hidden="true" />
                    Browse the Resource Library
                  </Link>
                </div>
                <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {featuredResources.map((resource) => (
                    <ResourceCard
                      key={resource.id}
                      resource={resource}
                      categoryName={resource.category ? categoryNameBySlug.get(resource.category) : undefined}
                      isSample
                    />
                  ))}
                </div>
              </div>
            )}

            {featuredGames.length > 0 && (
              <div className="mt-10">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-display text-lg font-semibold text-ink">Games</h3>
                  <Link
                    href="/games"
                    className="flex items-center gap-1.5 text-sm font-medium text-primary-700 hover:underline"
                  >
                    <Gamepad2 className="size-4" aria-hidden="true" />
                    Browse the Games Hub
                  </Link>
                </div>
                <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {featuredGames.map((game) => (
                    <GameCard
                      key={game.id}
                      game={game}
                      categoryName={game.category ? categoryNameBySlug.get(game.category) : undefined}
                    />
                  ))}
                </div>
              </div>
            )}
          </Container>
        </Section>
      )}

      <Section className="py-12 sm:py-16">
        <Container className="max-w-3xl">
          <Heading level="h2">What you can do here</Heading>
          <p className="mt-2 text-neutral-600">A clear line between what already works and what&apos;s still being built.</p>
          <div className="mt-6 grid gap-8 sm:grid-cols-2">
            <CapabilityList title="Today" status="available" items={todayCapabilities} />
            <CapabilityList title="Ahead" status="coming" items={aheadCapabilities} />
          </div>
        </Container>
      </Section>
    </>
  );
}
