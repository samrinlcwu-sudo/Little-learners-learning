import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { PageHeader } from "@/components/patterns/page-header";

export const metadata: Metadata = {
  title: "Admin",
  description: "Admin area for Little Learners Learning.",
  robots: { index: false, follow: false },
};

/**
 * The first `/admin` route in this codebase (Prompt 56) — see
 * docs/ADMIN_ARCHITECTURE.md. Scoped to exactly one real area today
 * (teacher management); this index exists so that area has a stable home
 * to grow alongside, without inventing sections that don't exist yet.
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
        <Container className="max-w-3xl">
          <Alert variant="warning" className="mb-8">
            This admin area isn&apos;t protected by real authentication yet — see docs/ACCOUNTS_ARCHITECTURE.md and
            docs/ADMIN_ARCHITECTURE.md for exactly what that means today.
          </Alert>

          <Link href="/admin/teachers" className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/30">
            <Card interactive className="flex items-center gap-4 p-5">
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
        </Container>
      </Section>
    </>
  );
}
