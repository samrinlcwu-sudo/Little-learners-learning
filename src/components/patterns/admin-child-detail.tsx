"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { UserX } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { PageHeader } from "@/components/patterns/page-header";
import { ChildAvatar } from "@/components/patterns/child-avatar";
import { useChildProfiles } from "@/lib/accounts/use-child-profiles";
import { getLearningCategoryBySlug } from "@/config/learning-categories";
import { ACCOUNT_STATUS_LABELS } from "@/lib/accounts/types";

/**
 * A child profile's admin view — deliberately minimal, per the brief's
 * "Child privacy" section: name, age, avatar, favorite subject, the
 * placeholder id linking it to "this device's parent" (never a parent
 * name or email — none is ever stored, see docs/ADMIN_ARCHITECTURE.md),
 * registration date, and account status. No progress, activity, or
 * anything from src/lib/progress — a child's learning history isn't
 * "relevant account information" for a suspension decision, and showing
 * it here would be exactly the unnecessary child data exposure the brief
 * warns against.
 */
function AdminChildDetail() {
  const params = useParams<{ childId: string }>();
  const { children, ready, setAccountStatus } = useChildProfiles();

  if (!ready) {
    return <Section className="min-h-[60vh]" />;
  }

  const child = children.find((item) => item.id === params.childId);

  if (!child) {
    return (
      <Section surface="sunken" className="flex flex-1 flex-col justify-center">
        <Container className="max-w-md text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-500">
            <UserX className="size-7" aria-hidden="true" />
          </div>
          <Heading level="h1" className="mt-5">
            We couldn&apos;t find that child profile
          </Heading>
          <p className="mt-3 text-neutral-600">
            Child profiles aren&apos;t connected to a shared database yet — this admin view can only ever see
            profiles saved on this device.
          </p>
          <Button className="mt-6" asChild>
            <Link href="/admin/users">Back to user management</Link>
          </Button>
        </Container>
      </Section>
    );
  }

  const favorite = child.favoriteCategory ? getLearningCategoryBySlug(child.favoriteCategory) : undefined;

  return (
    <>
      <PageHeader
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Admin", href: "/admin" },
          { label: "Users", href: "/admin/users" },
          { label: child.name },
        ]}
        eyebrow="Admin · Child account"
        title={child.name}
        description={`${child.ageYears} year${child.ageYears === 1 ? "" : "s"} old`}
        surface="tint-secondary"
      />

      <Section className="pt-10 sm:pt-12 lg:pt-14">
        <Container className="max-w-2xl space-y-8">
          {child.accountStatus === "deactivated" && (
            <Alert variant="error">
              This profile is deactivated — its learning view is blocked at{" "}
              <code>/dashboard/children/{child.id}</code>.
            </Alert>
          )}

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <ChildAvatar avatar={child.avatar} size="lg" />
              <div>
                <p className="font-display text-lg font-semibold text-ink">{child.name}</p>
                <p className="text-sm text-neutral-600">
                  {child.ageYears} year{child.ageYears === 1 ? "" : "s"} old
                </p>
                {favorite && <p className="text-xs text-neutral-500">Loves {favorite.name}</p>}
              </div>
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-neutral-200 pt-4 text-sm">
              <div>
                <dt className="text-neutral-500">Registered</dt>
                <dd className="mt-0.5 font-medium text-ink">{new Date(child.createdAt).toLocaleDateString()}</dd>
              </div>
              <div>
                <dt className="text-neutral-500">Parent (this device)</dt>
                <dd className="mt-0.5 font-mono text-xs text-neutral-600">{child.parentAccountId}</dd>
              </div>
            </dl>
          </Card>

          <Card className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Heading level="h3" as="h2">
                Account status
              </Heading>
              <Badge variant={child.accountStatus === "active" ? "success" : "error"}>
                {ACCOUNT_STATUS_LABELS[child.accountStatus]}
              </Badge>
            </div>
            <p className="mt-2 text-sm text-neutral-600">
              Deactivating blocks this child&apos;s own learning view without deleting their profile or progress.
            </p>
            <div className="mt-4">
              <Button
                size="sm"
                variant={child.accountStatus === "active" ? "outline" : "primary"}
                onClick={() => setAccountStatus(child.id, child.accountStatus === "active" ? "deactivated" : "active")}
              >
                {child.accountStatus === "active" ? "Deactivate profile" : "Reactivate profile"}
              </Button>
            </div>
          </Card>
        </Container>
      </Section>
    </>
  );
}

export { AdminChildDetail };
