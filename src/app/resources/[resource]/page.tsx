import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ImageOff, BookOpen } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { ResourceCard } from "@/components/patterns/resource-card";
import { TrackPageView } from "@/components/patterns/track-page-view";
import { getLearningCategoryBySlug } from "@/config/learning-categories";
import { SAMPLE_RESOURCES } from "@/lib/resources/sample-resources";
import {
  ACCESS_TIER_LABELS,
  RESOURCE_TYPE_LABELS,
  canDownload,
  getResourceObjectives,
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
  const canonicalUrl = `${siteConfig.url}/resources/${resource.slug}`;
  const isActivity = resource.resourceType === "activity";
  const isEbook = resource.resourceType === "ebook";
  const instructionsLabel = isActivity ? "Steps" : "Instructions";
  const objectives = getResourceObjectives(resource);

  const publishedOthers = SAMPLE_RESOURCES.filter(
    (r) => r.slug !== resource.slug && isResourcePublished(r),
  );

  // Worksheets and activities get their two own related lists (per the
  // brief); every other resource type keeps one generic "Related resources"
  // list, since splitting doesn't make sense for e.g. an ebook.
  const showsSplitRelated = resource.resourceType === "worksheet" || isActivity;
  const relatedWorksheets = showsSplitRelated
    ? publishedOthers
        .filter((r) => r.resourceType === "worksheet" && r.category === resource.category)
        .slice(0, 3)
    : [];
  const relatedActivities = showsSplitRelated
    ? publishedOthers
        .filter((r) => r.resourceType === "activity" && r.category === resource.category)
        .slice(0, 3)
    : [];
  const relatedGeneric = showsSplitRelated
    ? []
    : publishedOthers
        .filter((r) => r.category === resource.category || r.resourceType === resource.resourceType)
        .slice(0, 3);

  // Structured data reflects only fields the model actually carries — no
  // ratings, review counts, or other social-proof properties, since none exist.
  const structuredData = {
    "@context": "https://schema.org",
    "@type": isEbook ? ["LearningResource", "Book"] : "LearningResource",
    name: resource.title,
    ...(resource.subtitle ? { alternateName: resource.subtitle } : {}),
    description: resource.description,
    url: canonicalUrl,
    learningResourceType: RESOURCE_TYPE_LABELS[resource.resourceType],
    teaches: objectives,
    typicalAgeRange: `${resource.ageRange.minYears}-${resource.ageRange.maxYears}`,
    inLanguage: "en",
    isAccessibleForFree: resource.accessTier === "free",
    author: { "@type": "Organization", name: resource.author.name },
    datePublished: resource.createdAt,
    dateModified: resource.updatedAt,
    ...(resource.pageCount ? { numberOfPages: resource.pageCount } : {}),
  };

  return (
    <Section>
      <Container>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <TrackPageView
          type="resource_viewed"
          topic={resource.category}
          activityLabel={resource.title}
          activityHref={`/resources/${resource.slug}`}
        />

        <div className="max-w-3xl">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Resources", href: "/resources" },
              { label: resource.title },
            ]}
          />
          {isEbook ? (
            <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-start">
              {resource.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element -- cover URLs are arbitrary/external, not part of the optimized asset pipeline
                <img
                  src={resource.thumbnail}
                  alt={`Cover of ${resource.title}`}
                  className="h-44 w-32 shrink-0 rounded-md border border-neutral-200 object-cover"
                />
              ) : (
                <div className="flex h-44 w-32 shrink-0 flex-col items-center justify-center gap-1.5 rounded-md border border-dashed border-neutral-300 text-center">
                  <BookOpen className="size-6 text-neutral-400" aria-hidden="true" />
                  <p className="px-2 text-xs text-neutral-500">No cover yet</p>
                </div>
              )}
              <div>
                <Heading level="h1">{resource.title}</Heading>
                {resource.subtitle && <p className="mt-1 text-base text-neutral-500">{resource.subtitle}</p>}
                <p className="mt-3 text-neutral-600">{resource.description}</p>
              </div>
            </div>
          ) : (
            <>
              <Heading level="h1" className="mt-4">
                {resource.title}
              </Heading>
              <p className="mt-3 text-neutral-600">{resource.description}</p>
            </>
          )}

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

          <div className="mt-8">
            <Heading level="h4" as="h2" className="text-neutral-500">
              Preview
            </Heading>
            {resource.preview ? (
              // eslint-disable-next-line @next/next/no-img-element -- resource preview URLs are arbitrary/external, not part of the optimized asset pipeline
              <img
                src={resource.preview}
                alt={`Preview of ${resource.title}`}
                className="mt-3 w-full rounded-lg border border-neutral-200"
              />
            ) : (
              <div className="mt-3 flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-neutral-300 py-12 text-center">
                <ImageOff className="size-8 text-neutral-400" aria-hidden="true" />
                <p className="text-sm text-neutral-500">No preview available yet.</p>
              </div>
            )}
          </div>

          <dl className="mt-8 grid gap-4 border-y border-neutral-200 py-6 sm:grid-cols-2">
            <div className={objectives.length > 1 ? "sm:col-span-2" : undefined}>
              <dt className="text-sm font-semibold text-neutral-500">
                Learning objective{objectives.length > 1 ? "s" : ""}
              </dt>
              {objectives.length > 1 ? (
                <dd className="mt-1 text-sm text-ink">
                  <ul className="list-disc space-y-1 pl-5">
                    {objectives.map((objective) => (
                      <li key={objective}>{objective}</li>
                    ))}
                  </ul>
                </dd>
              ) : (
                <dd className="mt-1 text-sm text-ink">{objectives[0]}</dd>
              )}
            </div>
            <div>
              <dt className="text-sm font-semibold text-neutral-500">Age group</dt>
              <dd className="mt-1 text-sm text-ink">
                {resource.ageRange.minYears}–{resource.ageRange.maxYears} years
              </dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-neutral-500">Category</dt>
              <dd className="mt-1 text-sm text-ink">{category?.name ?? resource.subject ?? "General"}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-neutral-500">Resource type</dt>
              <dd className="mt-1 text-sm text-ink">{RESOURCE_TYPE_LABELS[resource.resourceType]}</dd>
            </div>
            {resource.pageCount && (
              <div>
                <dt className="text-sm font-semibold text-neutral-500">Length</dt>
                <dd className="mt-1 text-sm text-ink">{resource.pageCount} pages</dd>
              </div>
            )}
            {resource.skillsDeveloped && resource.skillsDeveloped.length > 0 && (
              <div className="sm:col-span-2">
                <dt className="text-sm font-semibold text-neutral-500">Skills developed</dt>
                <dd className="mt-1.5 flex flex-wrap gap-2">
                  {resource.skillsDeveloped.map((skill) => (
                    <Badge key={skill} variant="neutral">
                      {skill}
                    </Badge>
                  ))}
                </dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-semibold text-neutral-500">Creator</dt>
              <dd className="mt-1 text-sm text-ink">{resource.author.name}</dd>
            </div>
          </dl>

          {resource.materialsRequired && resource.materialsRequired.length > 0 && (
            <div className="mt-8">
              <Heading level="h4" as="h2" className="text-neutral-500">
                What you&apos;ll need
              </Heading>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-ink">
                {resource.materialsRequired.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {resource.instructions && resource.instructions.length > 0 && (
            <div className="mt-8">
              <Heading level="h4" as="h2" className="text-neutral-500">
                {instructionsLabel}
              </Heading>
              <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-ink">
                {resource.instructions.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>
          )}

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

        {showsSplitRelated ? (
          <>
            {relatedWorksheets.length > 0 && (
              <div className="mt-12 border-t border-neutral-200 pt-8">
                <Heading level="h4" as="h2" className="text-neutral-500">
                  Related worksheets
                </Heading>
                <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {relatedWorksheets.map((r) => (
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
            {relatedActivities.length > 0 && (
              <div className={relatedWorksheets.length > 0 ? "mt-10" : "mt-12 border-t border-neutral-200 pt-8"}>
                <Heading level="h4" as="h2" className="text-neutral-500">
                  Related activities
                </Heading>
                <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {relatedActivities.map((r) => (
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
          </>
        ) : (
          relatedGeneric.length > 0 && (
            <div className="mt-12 border-t border-neutral-200 pt-8">
              <Heading level="h4" as="h2" className="text-neutral-500">
                Related resources
              </Heading>
              <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {relatedGeneric.map((r) => (
                  <ResourceCard
                    key={r.id}
                    resource={r}
                    categoryName={r.category ? getLearningCategoryBySlug(r.category)?.name : undefined}
                    isSample
                  />
                ))}
              </div>
            </div>
          )
        )}
      </Container>
    </Section>
  );
}
