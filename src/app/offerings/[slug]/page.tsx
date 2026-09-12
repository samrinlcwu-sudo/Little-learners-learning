import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Package, type LucideIcon } from "lucide-react";
import { Sparkles, BookOpen, Users, Rocket, Gift } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { getLearningCategoryBySlug } from "@/config/learning-categories";
import { getAllOfferings, getOfferingBySlug } from "@/lib/offerings/offerings";
import { ACCESS_TIER_LABELS, canDownload, isResourcePublished, type Resource } from "@/lib/resources/types";
import { SAMPLE_RESOURCES } from "@/lib/resources/sample-resources";
import {
  OFFERING_AVAILABILITY_LABELS,
  OFFERING_TYPE_LABELS,
  canAccessOffering,
  type Offering,
} from "@/lib/offerings/types";
import { siteConfig } from "@/config/site";

export function generateStaticParams() {
  return getAllOfferings().map((offering) => ({ slug: offering.slug }));
}

const TYPE_ICONS: Record<Offering["type"], LucideIcon> = {
  free: Gift,
  premium: Sparkles,
  "digital-product": Package,
  "learning-program": BookOpen,
  membership: Users,
  "future-service": Rocket,
};

export async function generateMetadata({ params }: PageProps<"/offerings/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const offering = getOfferingBySlug(slug);
  if (!offering) return {};

  return {
    title: offering.name,
    description: offering.description,
    alternates: { canonical: `${siteConfig.url}/offerings/${offering.slug}` },
  };
}

/**
 * The real product/offering detail page (docs/BUSINESS_ARCHITECTURE.md).
 * `getOfferingBySlug()` reads the same always-empty `getAllOfferings()`
 * every other offering view does, so every slug honestly 404s today via
 * Next's own `notFound()` — the same real-404 pattern
 * `/resources/[resource]` already uses for an unmatched resource, not a
 * fabricated "coming soon" page pretending a lookup happened. The render
 * below is real, correct code, ready the moment a real offering exists.
 */
export default async function OfferingDetailPage({ params }: PageProps<"/offerings/[slug]">) {
  const { slug } = await params;
  const offering = getOfferingBySlug(slug);

  if (!offering) {
    notFound();
  }

  const learningAreas = offering.learningAreas
    .map((areaSlug) => getLearningCategoryBySlug(areaSlug))
    .filter((area): area is NonNullable<typeof area> => Boolean(area));

  const includedResources: Resource[] = (offering.includedResourceIds ?? [])
    .map((id) => SAMPLE_RESOURCES.find((r) => r.id === id && isResourcePublished(r)))
    .filter((r): r is Resource => Boolean(r));

  // Real learning benefits are exactly the linked resources' own real
  // objectives — never a marketing claim invented for this page.
  const learningBenefits = includedResources.map((r) => r.learningObjective);

  const accessible = canAccessOffering(offering);
  const canonicalUrl = `${siteConfig.url}/offerings/${offering.slug}`;
  const TypeIcon = TYPE_ICONS[offering.type];

  // Only the real fields this model actually carries — no rating, review
  // count, or sales figures, since none exist.
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: offering.name,
    description: offering.description,
    url: canonicalUrl,
    category: OFFERING_TYPE_LABELS[offering.type],
    ...(offering.thumbnail ? { image: offering.thumbnail } : {}),
    offers: {
      "@type": "Offer",
      availability:
        offering.availability === "available" ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
      ...(offering.price
        ? { price: offering.price.amount, priceCurrency: offering.price.currency }
        : { price: "0", priceCurrency: "USD" }),
    },
  };

  return (
    <Section>
      <Container>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

        <div className="max-w-3xl">
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Catalog", href: "/offerings" }, { label: offering.name }]} />

          <div className="mt-4 flex items-start gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-primary-700">
              <TypeIcon className="size-6" aria-hidden="true" />
            </div>
            <div>
              <Heading level="h1">{offering.name}</Heading>
              <p className="mt-2 text-neutral-600">{offering.description}</p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {learningAreas.map((area) => (
              <Link key={area.slug} href={`/learn/${area.slug}`}>
                <Badge variant="primary">{area.name}</Badge>
              </Link>
            ))}
            {offering.ageRange && (
              <Badge variant="neutral">
                Ages {offering.ageRange.minYears}–{offering.ageRange.maxYears}
              </Badge>
            )}
            <Badge variant="neutral">{OFFERING_TYPE_LABELS[offering.type]}</Badge>
            <Badge variant="neutral">{ACCESS_TIER_LABELS[offering.accessLevel]}</Badge>
            <Badge variant="neutral">{OFFERING_AVAILABILITY_LABELS[offering.availability]}</Badge>
          </div>

          <dl className="mt-8 grid gap-4 border-y border-neutral-200 py-6 sm:grid-cols-2">
            {learningBenefits.length > 0 && (
              <div className="sm:col-span-2">
                <dt className="text-sm font-semibold text-neutral-500">What you&apos;ll learn</dt>
                <dd className="mt-1 text-sm text-ink">
                  <ul className="list-disc space-y-1 pl-5">
                    {learningBenefits.map((benefit) => (
                      <li key={benefit}>{benefit}</li>
                    ))}
                  </ul>
                </dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-semibold text-neutral-500">Age group</dt>
              <dd className="mt-1 text-sm text-ink">
                {offering.ageRange ? `${offering.ageRange.minYears}–${offering.ageRange.maxYears} years` : "All ages"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-neutral-500">Format</dt>
              <dd className="mt-1 text-sm text-ink">{OFFERING_TYPE_LABELS[offering.type]}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-neutral-500">Access</dt>
              <dd className="mt-1 text-sm text-ink">{ACCESS_TIER_LABELS[offering.accessLevel]}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-neutral-500">Price</dt>
              <dd className="mt-1 text-sm text-ink">
                {offering.price
                  ? `${offering.price.amount} ${offering.price.currency}${offering.price.billingPeriod === "monthly" ? " / month" : offering.price.billingPeriod === "yearly" ? " / year" : ""}`
                  : "Not set"}
              </dd>
            </div>
          </dl>

          {includedResources.length > 0 && (
            <div className="mt-8">
              <Heading level="h4" as="h2" className="text-neutral-500">
                What&apos;s included
              </Heading>
              <ul className="mt-3 space-y-1.5 text-sm text-ink">
                {includedResources.map((resource) => (
                  <li key={resource.id}>
                    <Link href={`/resources/${resource.slug}`} className="text-primary-700 hover:underline">
                      {resource.title}
                    </Link>
                    {canDownload(resource) ? "" : " — access not available yet"}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-8">
            {accessible ? (
              <Button asChild>
                <Link href="#">Access this offering</Link>
              </Button>
            ) : (
              <Alert variant="info" title="Not available yet">
                {offering.availability === "coming-soon"
                  ? "This is announced but not available yet — check back soon."
                  : `This is a ${ACCESS_TIER_LABELS[offering.accessLevel].toLowerCase()} offering. There's no payment or membership system connected yet, so it can't be purchased or unlocked here.`}
              </Alert>
            )}
          </div>
        </div>
      </Container>
    </Section>
  );
}
