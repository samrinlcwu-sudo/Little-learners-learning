import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap, Users } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/patterns/page-header";
import { AdminAuditPanel } from "@/components/patterns/admin-audit-panel";

export const metadata: Metadata = {
  title: "Admin",
  description: "Admin area for Little Learners Learning.",
  robots: { index: false, follow: false },
};

/**
 * `/admin` (Prompt 56, extended in Prompt 57 — docs/ADMIN_ARCHITECTURE.md).
 * Reaching this page at all already proves a valid signed admin session
 * exists — `src/middleware.ts` runs before this component does — so
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
        </Container>
      </Section>
    </>
  );
}
