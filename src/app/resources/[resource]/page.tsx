import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { ResourceCard } from "@/components/patterns/resource-card";
import { getLearningCategoryBySlug } from "@/config/learning-categories";
import { SAMPLE_RESOURCES } from "@/lib/resources/sample-resources";
import {
  ACCESS_TIER_LABELS,
  RESOURCE_TYPE_LABELS,
  canDownload,
  isResourcePublished,
  type Resource,
} from "@/lib/resources/types";
import { siteConfig } from "@/config/site";

export function generateStaticParams() {
  return SAMPLE_RESOURCES.filter(isResourcePublished).map((resource) => ({
    resource: resource.slug,
  }));
}

function findPublishedResource(slug: string): Resource | undefined {
  return SAMPLE_RESOURCES.find((r) => r.slug === slug && isResourcePublished(r));
}

export async function generateMetadata({
  params,
}: PageProps<"/resources/[resource]">): Promise<Metadata> {
  const { resource: slug } = await params;
  const resource = findPublishedResource(slug);
  if (!resource) return {};

  return {
    title: resource.title,
    description: resource.description,
    alternates: { canonical: `${siteConfig.url}/resources/${resource.slug}` },
  };
}

export default async function ResourceDetailPage({
  params,
}: PageProps<"/resources/[resource]">) {
  const { resource: slug } = await params;
  const resource = findPublishedResource(slug);

  if (!resource) {
    notFound();
  }

  const category = resource.category ? getLearningCategoryBySlug(resource.category) : undefined;
  const downloadable = canDownload(resource);

  const related = SAMPLE_RESOURCES.filter(
    (r) =>
      r.slug !== resource.slug &&
      isResourcePublished(r) &&
      (r.category === resource.category || r.resourceType === resource.resourceType),
  ).slice(0, 3);

  return (
    <Section>
      <Container>
        <div className="max-w-3xl">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Resources", href: "/resources" },
              { label: resource.title },
            ]}
          />
          <Heading level="h1" className="mt-4">
            {resource.title}
          </Heading>
          <p className="mt-3 text-neutral-600">{resource.description}</p>

          <div className="mt-5 flex flex-wrap gap-2">
            {category ? (
              <Link href={`/learn/${category.slug}`}>
                <Badge variant="primary">{category.name}</Badge>
              </Link>
            ) : resource.subject ? (
              <Badge variant="primary">{resource.subject}</Badge>
            ) : null}
            <Badge variant="neutral">
              Ages {resource.ageRange.minYears}–{resource.ageRange.maxYears}
            </Badge>
            <Badge variant="neutral">{RESOURCE_TYPE_LABELS[resource.resourceType]}</Badge>
            <Badge variant="neutral">{ACCESS_TIER_LABELS[resource.accessTier]}</Badge>
          </div>

          <dl className="mt-8 grid gap-4 border-y border-neutral-200 py-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-semibold text-neutral-500">Learning objective</dt>
              <dd className="mt-1 text-sm text-ink">{resource.learningObjective}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-neutral-500">Creator</dt>
              <dd className="mt-1 text-sm text-ink">{resource.author.name}</dd>
            </div>
          </dl>

          <div className="mt-8">
            {downloadable ? (
              <Button asChild>
                <a href={resource.downloadFile}>Download</a>
              </Button>
            ) : (
              <Alert variant="info" title="Not available yet">
                {resource.accessTier === "free"
                  ? "This resource doesn't have a file attached yet — check back soon."
                  : `This is a ${ACCESS_TIER_LABELS[resource.accessTier].toLowerCase()} resource. ${ACCESS_TIER_LABELS[resource.accessTier]} access isn't available yet.`}
              </Alert>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-12 border-t border-neutral-200 pt-8">
            <Heading level="h4" as="h2" className="text-neutral-500">
              Related resources
            </Heading>
            <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <ResourceCard
                  key={r.id}
                  resource={r}
                  categoryName={r.category ? getLearningCategoryBySlug(r.category)?.name : undefined}
                  isSample
                />
              ))}
            </div>
          </div>
        )}
      </Container>
    </Section>
  );
}
