"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FileWarning } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/patterns/page-header";
import { AdminResourceForm } from "@/components/patterns/admin-resource-form";
import { useAdminResources } from "@/lib/resources/use-admin-resources";
import type { AdminResourceUpdates } from "@/lib/resources/local-admin-resources";

/** Split out of its route's page.tsx (Prompt 68 checkpoint fix) so that file can stay a server component and export `metadata` — see admin-content-tabs.tsx. */
function AdminResourceEdit() {
  const params = useParams<{ resourceId: string }>();
  const router = useRouter();
  const { resources, ready, updateResource } = useAdminResources();

  if (!ready) {
    return <Section className="min-h-[60vh]" />;
  }

  const resource = resources.find((item) => item.id === params.resourceId);

  // Only admin-authored resources live in this store — a seed or
  // teacher-submitted resource's id will never match here, which is the
  // correct, honest "not editable" outcome rather than a special check.
  if (!resource) {
    return (
      <Section surface="sunken" className="flex flex-1 flex-col justify-center">
        <Container className="max-w-md text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-500">
            <FileWarning className="size-7" aria-hidden="true" />
          </div>
          <Heading level="h1" className="mt-5">
            This resource can&apos;t be edited here
          </Heading>
          <p className="mt-3 text-neutral-600">
            Only resources created through this content library can be edited. It may be sample library content or a
            teacher submission instead.
          </p>
          <Button className="mt-6" asChild>
            <Link href="/admin/content">Back to content library</Link>
          </Button>
        </Container>
      </Section>
    );
  }

  function handleSave(values: AdminResourceUpdates) {
    updateResource(resource!.id, values);
    router.push(`/admin/content/${resource!.id}`);
  }

  return (
    <>
      <PageHeader
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Admin", href: "/admin" },
          { label: "Content", href: "/admin/content" },
          { label: resource.title, href: `/admin/content/${resource.id}` },
          { label: "Edit" },
        ]}
        eyebrow="Admin · Content library"
        title={`Edit: ${resource.title}`}
        description="Editing content fields never changes publication status — use the status buttons on the resource's page for that."
        surface="tint-secondary"
      />
      <Section className="pt-10 sm:pt-12 lg:pt-14">
        <Container className="max-w-2xl">
          <Card className="p-6">
            <AdminResourceForm
              resource={resource}
              onSave={handleSave}
              onCancel={() => router.push(`/admin/content/${resource.id}`)}
            />
          </Card>
        </Container>
      </Section>
    </>
  );
}

export { AdminResourceEdit };
