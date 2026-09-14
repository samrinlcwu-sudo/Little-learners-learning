"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ExternalLink, FileWarning, PenSquare, Trash2 } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { PageHeader } from "@/components/patterns/page-header";
import { useAdminResources } from "@/lib/resources/use-admin-resources";
import { useTeacherResources } from "@/lib/resources/use-teacher-resources";
import { SAMPLE_RESOURCES } from "@/lib/resources/sample-resources";
import { buildAdminResourceRows, findAdminResourceRow } from "@/lib/resources/admin-resource-rows";
import { getAllLearningCategories } from "@/config/learning-categories";
import { ACCESS_TIER_LABELS, RESOURCE_TYPE_LABELS, canDownload, getResourceObjectives, isResourcePublished } from "@/lib/resources/types";
import { PUBLICATION_STATUS_BADGE_VARIANT, PUBLICATION_STATUS_LABELS, type PublicationStatus } from "@/lib/content/types";
import { siteConfig } from "@/config/site";

const PUBLICATION_STATUSES: PublicationStatus[] = ["draft", "review", "published", "archived"];
const categoryNameBySlug = new Map(getAllLearningCategories().map((c) => [c.slug, c.name] as const));

const CONFIRM_MESSAGE: Partial<Record<PublicationStatus, string>> = {
  published:
    "Publish this resource? It will be marked live in the content library. (It still won't appear on the public site for other visitors until a shared backend exists.)",
  archived: "Archive this resource? It will be removed from active status until restored.",
};

/**
 * One resource's full admin view (Prompt 67) — real fields only, read from
 * whichever of the three real sources actually holds it (see
 * admin-resource-rows.ts). Doubles as the "preview" the brief asks for:
 * this page already renders every real field a public detail page would,
 * without a second, separate preview route to keep in sync.
 */
function AdminResourceDetail() {
  const params = useParams<{ resourceId: string }>();
  const router = useRouter();
  const { resources: adminResources, ready: adminReady, setStatus, deleteResource } = useAdminResources();
  const { resources: teacherResources, ready: teacherReady } = useTeacherResources();

  if (!adminReady || !teacherReady) {
    return <Section className="min-h-[60vh]" />;
  }

  const rows = buildAdminResourceRows(SAMPLE_RESOURCES, adminResources, teacherResources);
  const row = findAdminResourceRow(rows, params.resourceId);

  if (!row) {
    return (
      <Section surface="sunken" className="flex flex-1 flex-col justify-center">
        <Container className="max-w-md text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-500">
            <FileWarning className="size-7" aria-hidden="true" />
          </div>
          <Heading level="h1" className="mt-5">
            We couldn&apos;t find that resource
          </Heading>
          <p className="mt-3 text-neutral-600">
            It may have been deleted, or this device may not hold it — resources created here only ever save to the
            browser that created them.
          </p>
          <Button className="mt-6" asChild>
            <Link href="/admin/content">Back to content library</Link>
          </Button>
        </Container>
      </Section>
    );
  }

  const { resource, source, editable } = row;
  const objectives = getResourceObjectives(resource);
  const category = resource.category ? categoryNameBySlug.get(resource.category) : undefined;
  const isLivePublic = source === "seed" && isResourcePublished(resource);

  function handleStatusChange(status: PublicationStatus) {
    const confirmMessage = CONFIRM_MESSAGE[status];
    if (confirmMessage && !window.confirm(confirmMessage)) return;
    setStatus(resource.id, status);
  }

  function handleDelete() {
    if (!window.confirm(`Delete "${resource.title}"? This can't be undone.`)) return;
    deleteResource(resource.id);
    router.push("/admin/content");
  }

  return (
    <>
      <PageHeader
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Admin", href: "/admin" },
          { label: "Content", href: "/admin/content" },
          { label: resource.title },
        ]}
        eyebrow="Admin · Content library"
        title={resource.title}
        description={resource.description}
        surface="tint-secondary"
      />

      <Section className="pt-10 sm:pt-12 lg:pt-14">
        <Container className="max-w-3xl space-y-8">
          {source === "seed" && (
            <Alert variant="info">
              This is checked-in sample library content, not a row this admin area can edit or delete — see
              docs/CONTENT_MANAGEMENT_ARCHITECTURE.md.
            </Alert>
          )}
          {source === "teacher" && (
            <Alert variant="info">
              This resource was submitted by a teacher. Review it from{" "}
              <Link href="/admin/teachers" className="underline">
                Teacher management
              </Link>{" "}
              — this admin area shows it for a full-library view but never edits someone else&apos;s content.
            </Alert>
          )}

          <Card className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={PUBLICATION_STATUS_BADGE_VARIANT[resource.publicationStatus]}>
                  {PUBLICATION_STATUS_LABELS[resource.publicationStatus]}
                </Badge>
                <Badge variant="neutral">{RESOURCE_TYPE_LABELS[resource.resourceType]}</Badge>
                <Badge variant="neutral">{ACCESS_TIER_LABELS[resource.accessTier]}</Badge>
              </div>
              {isLivePublic && (
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/resources/${resource.slug}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink aria-hidden="true" />
                    View live page
                  </Link>
                </Button>
              )}
            </div>

            {editable && (
              <div className="mt-5 border-t border-neutral-200 pt-5">
                <p className="text-sm font-medium text-neutral-700">Status</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {PUBLICATION_STATUSES.map((status) => (
                    <Button
                      key={status}
                      size="sm"
                      variant={resource.publicationStatus === status ? "primary" : "outline"}
                      disabled={resource.publicationStatus === status}
                      onClick={() => handleStatusChange(status)}
                    >
                      {PUBLICATION_STATUS_LABELS[status]}
                    </Button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-neutral-500">
                  Publishing and archiving both ask for confirmation — publication is never a single accidental
                  click.
                </p>
              </div>
            )}

            {editable && (
              <div className="mt-5 flex flex-wrap gap-2 border-t border-neutral-200 pt-5">
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/admin/content/${resource.id}/edit`}>
                    <PenSquare aria-hidden="true" />
                    Edit
                  </Link>
                </Button>
                <Button size="sm" variant="outline" onClick={handleDelete}>
                  <Trash2 aria-hidden="true" />
                  Delete
                </Button>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <Heading level="h3" as="h2">
              Learning details
            </Heading>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-semibold text-neutral-500">Category</dt>
                <dd className="mt-1 text-sm text-ink">{category ?? resource.subject ?? "General"}</dd>
              </div>
              <div>
                <dt className="text-sm font-semibold text-neutral-500">Age range</dt>
                <dd className="mt-1 text-sm text-ink">
                  {resource.ageRange.minYears}–{resource.ageRange.maxYears} years
                </dd>
              </div>
              <div>
                <dt className="text-sm font-semibold text-neutral-500">Difficulty</dt>
                <dd className="mt-1 text-sm capitalize text-ink">{resource.difficulty}</dd>
              </div>
              <div>
                <dt className="text-sm font-semibold text-neutral-500">Author</dt>
                <dd className="mt-1 text-sm text-ink">{resource.author.name}</dd>
              </div>
              <div className={objectives.length > 1 ? "sm:col-span-2" : undefined}>
                <dt className="text-sm font-semibold text-neutral-500">
                  Learning objective{objectives.length > 1 ? "s" : ""}
                </dt>
                <dd className="mt-1 text-sm text-ink">
                  <ul className="list-disc space-y-1 pl-5">
                    {objectives.map((objective) => (
                      <li key={objective}>{objective}</li>
                    ))}
                  </ul>
                </dd>
              </div>
              {resource.skillsDeveloped && resource.skillsDeveloped.length > 0 && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-semibold text-neutral-500">Skills developed</dt>
                  <dd className="mt-1.5 flex flex-wrap gap-1.5">
                    {resource.skillsDeveloped.map((skill) => (
                      <Badge key={skill} variant="neutral">
                        {skill}
                      </Badge>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
          </Card>

          <Card className="p-6">
            <Heading level="h3" as="h2">
              Media &amp; download
            </Heading>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-semibold text-neutral-500">Thumbnail</dt>
                <dd className="mt-1.5">
                  {resource.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element -- a locally-read data URL, not a served/optimizable image
                    <img src={resource.thumbnail} alt="" className="h-20 w-20 rounded-lg border border-neutral-200 object-cover" />
                  ) : (
                    <span className="text-sm text-neutral-500">Not added yet</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-semibold text-neutral-500">Downloadable file</dt>
                <dd className="mt-1.5 text-sm text-ink">
                  {resource.downloadFile ? "Attached" : "Not attached yet"}
                  {resource.downloadFile && (
                    <p className="mt-1 text-xs text-neutral-500">
                      {canDownload(resource)
                        ? "A visitor could download this — free, published, and a file is attached."
                        : "Not downloadable yet — a resource only offers a real download once it's free and published too."}
                    </p>
                  )}
                </dd>
              </div>
            </dl>
          </Card>

          <Card className="p-6">
            <Heading level="h3" as="h2">
              Search &amp; SEO
            </Heading>
            <dl className="mt-4 space-y-4">
              <div>
                <dt className="text-sm font-semibold text-neutral-500">SEO title</dt>
                <dd className="mt-1 text-sm text-ink">{resource.seoTitle || `${resource.title} (default)`}</dd>
              </div>
              <div>
                <dt className="text-sm font-semibold text-neutral-500">Meta description</dt>
                <dd className="mt-1 text-sm text-ink">{resource.metaDescription || `${resource.description} (default)`}</dd>
              </div>
              <div>
                <dt className="text-sm font-semibold text-neutral-500">Canonical URL</dt>
                <dd className="mt-1 text-sm text-ink">
                  {resource.canonicalUrl || `${siteConfig.url}/resources/${resource.slug} (default)`}
                </dd>
              </div>
            </dl>
          </Card>
        </Container>
      </Section>
    </>
  );
}

export { AdminResourceDetail };
