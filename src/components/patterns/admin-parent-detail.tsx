"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Home, UserX, Activity } from "lucide-react";
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
import { useProgressEvents } from "@/lib/progress/use-progress-events";
import { buildParentRows } from "@/lib/accounts/admin-user-rows";
import { getFamilyActivitySummary } from "@/lib/accounts/admin-parent-activity";
import { LOCAL_PARENT_ID } from "@/lib/accounts/local-children";
import { ACCOUNT_STATUS_LABELS } from "@/lib/accounts/types";

/**
 * A parent/family's admin view (Prompt 65) — a real, derived grouping of
 * child profiles sharing one `parentAccountId`, never a fabricated parent
 * account. There is no parent name, email, password, or any
 * authentication secret to show, because none is ever stored anywhere in
 * this codebase (docs/ACCOUNTS_ARCHITECTURE.md) — this page never invents
 * one. The one new thing beyond what `AdminChildDetail` already shows per
 * child is a family-level activity count (`getFamilyActivitySummary()`),
 * deliberately coarse — see that function's own doc comment for why this
 * is a different privacy decision than excluding progress from a child's
 * own admin record entirely.
 */
function AdminParentDetail() {
  const params = useParams<{ parentId: string }>();
  const { children, ready } = useChildProfiles();
  const { events, ready: eventsReady } = useProgressEvents();

  if (!ready || !eventsReady) {
    return <Section className="min-h-[60vh]" />;
  }

  const parentRow = buildParentRows(children).find((row) => row.id === params.parentId);

  if (!parentRow) {
    return (
      <Section surface="sunken" className="flex flex-1 flex-col justify-center">
        <Container className="max-w-md text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-500">
            <UserX className="size-7" aria-hidden="true" />
          </div>
          <Heading level="h1" className="mt-5">
            We couldn&apos;t find that family
          </Heading>
          <p className="mt-3 text-neutral-600">
            Parent groupings aren&apos;t connected to a shared database yet — this admin view can only ever see
            child profiles saved on this device.
          </p>
          <Button className="mt-6" asChild>
            <Link href="/admin/users">Back to user management</Link>
          </Button>
        </Container>
      </Section>
    );
  }

  const familyChildren = children.filter((child) => child.parentAccountId === parentRow.id);
  const activity = getFamilyActivitySummary(events, familyChildren.map((child) => child.id));

  return (
    <>
      <PageHeader
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Admin", href: "/admin" },
          { label: "Users", href: "/admin/users" },
          { label: parentRow.name },
        ]}
        eyebrow="Admin · Parent account"
        title={parentRow.name}
        description={parentRow.summary}
        surface="tint-secondary"
      />

      <Section className="pt-10 sm:pt-12 lg:pt-14">
        <Container className="max-w-2xl space-y-8">
          {parentRow.id === LOCAL_PARENT_ID && (
            <Alert variant="info">
              There&apos;s no real parent account record anywhere in this codebase yet — sign-up validates and
              discards everything (docs/ACCOUNTS_ARCHITECTURE.md). This is a real grouping of the child profiles
              saved on this device, not a fabricated account. See docs/ADMIN_ARCHITECTURE.md.
            </Alert>
          )}

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-primary-700">
                <Home className="size-6" aria-hidden="true" />
              </div>
              <div>
                <p className="font-display text-lg font-semibold text-ink">{parentRow.name}</p>
                <p className="text-sm text-neutral-600">{parentRow.summary}</p>
              </div>
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-neutral-200 pt-4 text-sm">
              <div>
                <dt className="text-neutral-500">First child profile added</dt>
                <dd className="mt-0.5 font-medium text-ink">
                  {new Date(parentRow.registeredAt).toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="text-neutral-500">Account status</dt>
                <dd className="mt-0.5">
                  <Badge variant={parentRow.accountStatus === "active" ? "success" : "error"}>
                    {ACCOUNT_STATUS_LABELS[parentRow.accountStatus]}
                  </Badge>
                </dd>
              </div>
            </dl>
            <p className="mt-4 text-xs text-neutral-500">
              A real status per child, not a fabricated single parent status — this reflects whether any child in
              the family is still active. Manage an individual child&apos;s status from their own profile below.
            </p>
          </Card>

          <Card className="p-6">
            <Heading level="h3" as="h2">
              Associated children
            </Heading>
            <p className="mt-1 text-sm text-neutral-600">
              Every real child profile linked to this family — deactivate or reactivate from each child&apos;s own
              page.
            </p>
            <ul className="mt-4 space-y-3">
              {familyChildren.map((child) => (
                <li key={child.id}>
                  <Link
                    href={`/admin/users/children/${child.id}`}
                    className="flex items-center gap-3 rounded-lg border border-neutral-200 p-3 transition-colors hover:border-primary-200 hover:bg-neutral-50"
                  >
                    <ChildAvatar avatar={child.avatar} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-ink">{child.name}</p>
                      <p className="text-xs text-neutral-500">
                        {child.ageYears} year{child.ageYears === 1 ? "" : "s"} old
                      </p>
                    </div>
                    <Badge variant={child.accountStatus === "active" ? "success" : "error"}>
                      {ACCOUNT_STATUS_LABELS[child.accountStatus]}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2">
              <Activity className="size-5 text-neutral-500" aria-hidden="true" />
              <Heading level="h3" as="h2">
                Family activity
              </Heading>
            </div>
            <p className="mt-1 text-sm text-neutral-600">
              A real, aggregate count across every child above — never which subject, game, or resource was
              involved (see docs/ADMIN_ARCHITECTURE.md, &ldquo;Parent management&rdquo;).
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-neutral-500">Total learning activities recorded</dt>
                <dd className="mt-0.5 font-medium text-ink">{activity.totalEvents}</dd>
              </div>
              <div>
                <dt className="text-neutral-500">Most recent activity</dt>
                <dd className="mt-0.5 font-medium text-ink">
                  {activity.lastActivityAt ? new Date(activity.lastActivityAt).toLocaleDateString() : "None yet"}
                </dd>
              </div>
            </dl>
          </Card>
        </Container>
      </Section>
    </>
  );
}

export { AdminParentDetail };
