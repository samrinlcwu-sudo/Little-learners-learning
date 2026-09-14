"use client";

import { useRouter } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/patterns/page-header";
import { AdminResourceForm } from "@/components/patterns/admin-resource-form";
import { useAdminResources } from "@/lib/resources/use-admin-resources";
import type { NewAdminResource } from "@/lib/resources/local-admin-resources";

/** Split out of its route's page.tsx (Prompt 68 checkpoint fix) so that file can stay a server component and export `metadata` — see admin-content-tabs.tsx. */
function AdminResourceCreate() {
  const router = useRouter();
  const { addResource } = useAdminResources();

  function handleSave(values: NewAdminResource, status?: "draft" | "review") {
    addResource(values, status);
    router.push("/admin/content");
  }

  return (
    <>
      <PageHeader
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Admin", href: "/admin" },
          { label: "Content", href: "/admin/content" },
          { label: "New resource" },
        ]}
        eyebrow="Admin · Content library"
        title="New resource"
        description="Create a new resource for the content library. It starts as a draft or in review — publishing is always a separate, confirmed step."
        surface="tint-secondary"
      />
      <Section className="pt-10 sm:pt-12 lg:pt-14">
        <Container className="max-w-2xl">
          <Card className="p-6">
            <AdminResourceForm onSave={handleSave} onCancel={() => router.push("/admin/content")} />
          </Card>
        </Container>
      </Section>
    </>
  );
}

export { AdminResourceCreate };
