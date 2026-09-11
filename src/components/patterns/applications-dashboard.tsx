"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, ClipboardList } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/patterns/page-header";
import { ApplicationCard } from "@/components/patterns/application-card";
import { ApplicationForm } from "@/components/patterns/application-form";
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription } from "@/components/ui/modal";
import { useChildProfiles } from "@/lib/accounts/use-child-profiles";
import { useApplications } from "@/lib/admissions/use-applications";

/**
 * This family's own applications, stored in this browser only
 * (src/lib/admissions/local-applications.ts) — real drafts and real
 * submissions, with the same "no live review connected yet" honesty
 * banner every other not-yet-backed feature on this platform already
 * shows (Parent Dashboard, Teacher Dashboard). See
 * docs/ADMISSIONS_ARCHITECTURE.md.
 */
function ApplicationsDashboard() {
  const { children, ready: childrenReady } = useChildProfiles();
  const { applications, ready, createApplication } = useApplications();
  const [modalOpen, setModalOpen] = React.useState(false);

  function handleCreate(input: Parameters<typeof createApplication>[0]) {
    createApplication(input);
    setModalOpen(false);
  }

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Dashboard", href: "/dashboard" }, { label: "Applications" }]}
        eyebrow="Admissions"
        title="Your applications"
        description="Start a draft, pick up where you left off, or check a submitted application's status."
        surface="tint-primary"
      />

      <Section className="pt-10 sm:pt-12 lg:pt-14">
        <Container className="max-w-4xl">
          <Alert variant="info" className="mb-10">
            There&apos;s no live admissions review connected yet — an application saved or submitted here stays on
            this device only, and its status can&apos;t move beyond &ldquo;Submitted&rdquo; until a real review
            process exists.
          </Alert>

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-display text-lg font-semibold text-ink">Applications</p>
              <p className="mt-1 text-sm text-neutral-600">One per child, per set of learning interests.</p>
            </div>
            {childrenReady && children.length > 0 && (
              <Button size="sm" onClick={() => setModalOpen(true)}>
                <Plus aria-hidden="true" />
                Start an application
              </Button>
            )}
          </div>

          {!childrenReady || !ready ? null : children.length === 0 ? (
            <EmptyState
              className="mt-6"
              icon={ClipboardList}
              title="Add a child profile first"
              description="An application is linked to one of your children — add their profile before starting one."
              action={
                <Button size="sm" asChild>
                  <Link href="/dashboard">Go to your dashboard</Link>
                </Button>
              }
            />
          ) : applications.length === 0 ? (
            <EmptyState
              className="mt-6"
              icon={ClipboardList}
              title="No applications yet"
              description="Start a draft whenever you're ready — nothing is submitted until you choose to."
              action={
                <Button size="sm" onClick={() => setModalOpen(true)}>
                  Start an application
                </Button>
              }
            />
          ) : (
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {applications.map((application) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                  child={children.find((child) => child.id === application.childId)}
                />
              ))}
            </div>
          )}
        </Container>
      </Section>

      <Modal open={modalOpen} onOpenChange={setModalOpen}>
        <ModalContent className="max-h-[85vh] overflow-y-auto">
          <ModalHeader>
            <ModalTitle>Start an application</ModalTitle>
            <ModalDescription>Saved as a draft first — you choose when to submit it.</ModalDescription>
          </ModalHeader>
          <ApplicationForm childProfiles={children} onSave={handleCreate} onCancel={() => setModalOpen(false)} />
        </ModalContent>
      </Modal>
    </>
  );
}

export { ApplicationsDashboard };
