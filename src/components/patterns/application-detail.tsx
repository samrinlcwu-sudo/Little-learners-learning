"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Check, Circle, Lock } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { PageHeader } from "@/components/patterns/page-header";
import { ApplicationForm } from "@/components/patterns/application-form";
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription } from "@/components/ui/modal";
import { useChildProfiles } from "@/lib/accounts/use-child-profiles";
import { useApplications } from "@/lib/admissions/use-applications";
import { getAllLearningCategories } from "@/config/learning-categories";
import {
  APPLICATION_STATUS_LABELS,
  canEditApplication,
  canSubmitApplication,
  canWithdrawApplication,
  getApplicationLearningAreas,
  getApplicationTimeline,
} from "@/lib/admissions/types";
import { cn } from "@/lib/utils/cn";

/**
 * One application's full status view — a real, honest timeline built from
 * `getApplicationTimeline` (src/lib/admissions/types.ts), never a
 * simulated "in progress" state. See docs/ADMISSIONS_ARCHITECTURE.md.
 */
function ApplicationDetail() {
  const params = useParams<{ applicationId: string }>();
  const { children, ready: childrenReady } = useChildProfiles();
  const { applications, ready, updateApplication, submit, withdraw } = useApplications();
  const [editOpen, setEditOpen] = React.useState(false);

  if (!ready || !childrenReady) {
    return <Section className="min-h-[60vh]" />;
  }

  const application = applications.find((item) => item.id === params.applicationId);

  if (!application) {
    return (
      <Section surface="sunken" className="flex flex-1 flex-col justify-center">
        <Container className="max-w-md text-center">
          <Heading level="h1">We couldn&apos;t find that application</Heading>
          <p className="mt-3 text-neutral-600">
            Applications are only saved on the device they were created on — this link may be from a different
            browser, or the application may have been removed.
          </p>
          <Button className="mt-6" asChild>
            <Link href="/dashboard/applications">Back to your applications</Link>
          </Button>
        </Container>
      </Section>
    );
  }

  const child = children.find((item) => item.id === application.childId);
  const learningAreas = getApplicationLearningAreas(application, getAllLearningCategories());
  const timeline = getApplicationTimeline(application);
  const applicationId = application.id;

  function handleSubmit() {
    if (window.confirm("Submit this application? You can still withdraw it afterward, but you won't be able to edit it further.")) {
      submit(applicationId);
    }
  }

  function handleWithdraw() {
    if (window.confirm("Withdraw this application? This can't be undone.")) {
      withdraw(applicationId);
    }
  }

  return (
    <>
      <PageHeader
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "Applications", href: "/dashboard/applications" },
          { label: child?.name ?? "Application" },
        ]}
        eyebrow="Admissions"
        title={child ? `${child.name}'s application` : "Application"}
        description={application.referenceNumber ? `Reference ${application.referenceNumber}` : "Not yet submitted"}
        surface="tint-primary"
      />

      <Section className="pt-10 sm:pt-12 lg:pt-14">
        <Container className="max-w-3xl space-y-8">
          <Alert variant="info">
            There&apos;s no live admissions review connected yet — status can&apos;t move past &ldquo;Submitted&rdquo;
            until a real review process exists. Nothing shown here is a decision.
          </Alert>

          <Card className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Heading level="h3" as="h2">
                Status
              </Heading>
              <Badge variant={application.status === "draft" ? "neutral" : "primary"}>
                {APPLICATION_STATUS_LABELS[application.status]}
              </Badge>
            </div>

            <ol className="mt-6 space-y-4">
              {timeline.map((step) => (
                <li key={step.status} className="flex items-start gap-3">
                  <span
                    className={cn(
                      "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full",
                      step.reached
                        ? "bg-primary-600 text-white"
                        : step.unreachable
                          ? "bg-neutral-100 text-neutral-400"
                          : "border border-neutral-300 text-neutral-400",
                    )}
                  >
                    {step.reached ? (
                      <Check className="size-3.5" aria-hidden="true" />
                    ) : step.unreachable ? (
                      <Lock className="size-3" aria-hidden="true" />
                    ) : (
                      <Circle className="size-2 fill-current" aria-hidden="true" />
                    )}
                  </span>
                  <div>
                    <p className={cn("text-sm font-medium", step.reached ? "text-ink" : "text-neutral-500")}>
                      {step.label}
                    </p>
                    {step.occurredAt ? (
                      <p className="text-xs text-neutral-500">{new Date(step.occurredAt).toLocaleString()}</p>
                    ) : step.unreachable ? (
                      <p className="text-xs text-neutral-500">Not available until a real review process is connected.</p>
                    ) : (
                      <p className="text-xs text-neutral-500">Not reached yet.</p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </Card>

          <Card className="p-6">
            <Heading level="h3" as="h2">
              Details
            </Heading>
            <dl className="mt-4 space-y-4 text-sm">
              <div>
                <dt className="font-medium text-neutral-500">Child</dt>
                <dd className="mt-1 text-ink">{child?.name ?? "Child profile removed"}</dd>
              </div>
              <div>
                <dt className="font-medium text-neutral-500">Learning interests</dt>
                <dd className="mt-1 flex flex-wrap gap-1.5">
                  {learningAreas.map((area) => (
                    <Badge key={area.slug} variant="neutral">
                      {area.name}
                    </Badge>
                  ))}
                </dd>
              </div>
              {application.message && (
                <div>
                  <dt className="font-medium text-neutral-500">Message</dt>
                  <dd className="mt-1 whitespace-pre-line text-ink">{application.message}</dd>
                </div>
              )}
            </dl>

            <div className="mt-6 flex flex-wrap gap-3 border-t border-neutral-200 pt-6">
              {canEditApplication(application) && (
                <Button size="sm" variant="outline" onClick={() => setEditOpen(true)}>
                  Edit draft
                </Button>
              )}
              {canSubmitApplication(application) && (
                <Button size="sm" onClick={handleSubmit}>
                  Submit application
                </Button>
              )}
              {canWithdrawApplication(application) && (
                <Button size="sm" variant="outline" onClick={handleWithdraw}>
                  Withdraw
                </Button>
              )}
            </div>
          </Card>
        </Container>
      </Section>

      <Modal open={editOpen} onOpenChange={setEditOpen}>
        <ModalContent className="max-h-[85vh] overflow-y-auto">
          <ModalHeader>
            <ModalTitle>Edit draft</ModalTitle>
            <ModalDescription>Update your details below.</ModalDescription>
          </ModalHeader>
          <ApplicationForm
            childProfiles={children}
            application={application}
            onSave={(values) => {
              updateApplication(application.id, values);
              setEditOpen(false);
            }}
            onCancel={() => setEditOpen(false)}
          />
        </ModalContent>
      </Modal>
    </>
  );
}

export { ApplicationDetail };
