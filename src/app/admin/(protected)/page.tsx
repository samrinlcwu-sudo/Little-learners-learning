import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap, Users } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { PageHeader } from "@/components/patterns/page-header";
import { AdminAuditPanel } from "@/components/patterns/admin-audit-panel";
import { CapabilityList } from "@/components/patterns/capability-list";

/**
 * The honest "what this dashboard will grow into" panel (Prompt 64) —
 * same `CapabilityList` pattern `/parents`, `/teachers`, and `/offerings`
 * already use for this exact distinction. These are real future admin
 * sections named in the brief, not sidebar links, because none has a
 * page yet — see docs/ADMIN_ARCHITECTURE.md, "Dashboard shell (Prompt 64)."
 */
const roadmapCapabilities = [
  {
    title: "Resources, games & learning categories",
    description: "Manage worksheets, ebooks, activities, games, and the subject taxonomy from one place.",
  },
  {
    title: "Applications & admissions",
    description: "Review real submitted applications alongside the tracking experience families already see.",
  },
  {
    title: "Business: offerings & memberships",
    description: "Visibility into the real (currently empty) Offering/Membership catalog — see docs/BUSINESS_ARCHITECTURE.md.",
  },
  {
    title: "Content, SEO & platform settings",
    description: "Manage page copy, metadata, and platform-wide configuration without editing code.",
  },
];

export const metadata: Metadata = {
  title: "Admin",
  description: "Admin area for Little Learners Learning.",
  robots: { index: false, follow: false },
};

/**
 * `/admin` (Prompt 56, extended in Prompt 57 — docs/ADMIN_ARCHITECTURE.md).
 * Reaching this page at all already proves a valid signed admin session
 * exists — `src/proxy.ts` runs before this component does — so
 * there's no "not protected yet" disclosure here anymore, unlike Prompt
 * 56's version of this page.
 */
export default function AdminPage() {
  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Admin" }]}
        eyebrow="Admin"
        title="Admin"
        description="Platform management tools for Little Learners Learning."
        surface="tint-secondary"
      />

      <Section className="pt-10 sm:pt-12 lg:pt-14">
        <Container className="max-w-3xl space-y-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <Link href="/admin/teachers" className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/30">
              <Card interactive className="flex h-full items-center gap-4 p-5">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary-100 text-secondary-700">
                  <GraduationCap className="size-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-display text-lg font-semibold text-ink">Teacher management</p>
                  <p className="mt-1 text-sm text-neutral-600">
                    Review teacher profiles, moderate visibility, and see resource ownership.
                  </p>
                </div>
              </Card>
            </Link>

            <Link href="/admin/users" className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/30">
              <Card interactive className="flex h-full items-center gap-4 p-5">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
                  <Users className="size-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-display text-lg font-semibold text-ink">User management</p>
                  <p className="mt-1 text-sm text-neutral-600">
                    Search and filter every real account this device holds, and manage account status.
                  </p>
                </div>
              </Card>
            </Link>
          </div>

          <AdminAuditPanel />

          <Card className="p-6">
            <Heading level="h3" as="h2">
              Roadmap
            </Heading>
            <p className="mt-1 text-sm text-neutral-600">
              This dashboard is built to grow into — nothing below is a link, because none of it has a page yet.
            </p>
            <CapabilityList
              className="mt-4"
              title="Ahead"
              status="coming"
              items={roadmapCapabilities}
            />
          </Card>
        </Container>
      </Section>
    </>
  );
}
