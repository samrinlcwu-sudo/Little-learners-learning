"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, BookOpen, Library, Gamepad2, Settings, Sparkles, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/patterns/page-header";
import { ChildCard } from "@/components/patterns/child-card";
import { ChildProfileForm } from "@/components/patterns/child-profile-form";
import { ChildAvatar } from "@/components/patterns/child-avatar";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
} from "@/components/ui/modal";
import { useChildProfiles } from "@/lib/accounts/use-child-profiles";
import { useProgressEvents } from "@/lib/progress/use-progress-events";
import { getEventsForChild } from "@/lib/progress/local-progress";
import { summarizeChildProgress, describeEvent } from "@/lib/progress/summarize";
import { getNextStepSuggestion } from "@/lib/learning-journey";
import { formatRelativeTime } from "@/lib/utils/format-relative-time";
import type { ChildProfileValues } from "@/lib/validations/child-profile";
import type { ChildProfile } from "@/lib/accounts/types";

const quickLinks = [
  {
    icon: BookOpen,
    title: "Explore Learning",
    description: "Browse subjects, ages 2 to 8.",
    href: "/learn",
    tone: "primary" as const,
  },
  {
    icon: Library,
    title: "Resources",
    description: "Worksheets, activities, and ebooks.",
    href: "/resources",
    tone: "secondary" as const,
  },
  {
    icon: Gamepad2,
    title: "Games",
    description: "Free games built around one skill each.",
    href: "/games",
    tone: "accent" as const,
  },
];

const TONE_STYLES = {
  primary: "bg-primary-100 text-primary-700",
  secondary: "bg-secondary-100 text-secondary-700",
  accent: "bg-accent-100 text-accent-800",
};

/**
 * The parent dashboard reads and writes child profiles from this browser's
 * localStorage only (src/lib/accounts/use-child-profiles.ts) — there's no
 * account to sync them to yet. It's still a genuinely working feature, not
 * a preview: adding, editing, and opening a child's view all actually work.
 * What it never does is show progress or activity data, because nothing
 * records that yet (see docs/ACCOUNTS_ARCHITECTURE.md).
 */
function ParentDashboard() {
  const { children, ready, addChild, updateChild } = useChildProfiles();
  const { events, ready: progressReady } = useProgressEvents();
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingChild, setEditingChild] = React.useState<ChildProfile | null>(null);

  function openAddModal() {
    setEditingChild(null);
    setModalOpen(true);
  }

  function openEditModal(child: ChildProfile) {
    setEditingChild(child);
    setModalOpen(true);
  }

  function handleSave(values: ChildProfileValues) {
    if (editingChild) {
      updateChild(editingChild.id, values);
    } else {
      addChild(values);
    }
    setModalOpen(false);
  }

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Dashboard" }]}
        eyebrow="Parent Dashboard"
        title="Your dashboard"
        description="One calm place to manage your children's profiles and jump into learning."
        surface="tint-primary"
      />

      <Section className="pt-10 sm:pt-12 lg:pt-14">
        <Container className="max-w-4xl">
          <Alert variant="info" className="mb-10">
            This dashboard works in your browser only right now — it
            isn&apos;t connected to an account yet. Anything you add here
            stays on this device.
          </Alert>

          <div>
            <div className="flex items-center justify-between gap-4">
              <Heading level="h2">My Children</Heading>
              <Button size="sm" onClick={openAddModal}>
                <Plus aria-hidden="true" />
                Add a child
              </Button>
            </div>

            {!ready ? null : children.length === 0 ? (
              <EmptyState
                className="mt-6"
                icon={Sparkles}
                title="No children added yet"
                description="Add a child's name and age to get a personalized starting point for their learning."
                action={
                  <Button size="sm" onClick={openAddModal}>
                    Add a child
                  </Button>
                }
              />
            ) : (
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {children.map((child) => (
                  <ChildCard key={child.id} child={child} onEdit={openEditModal} />
                ))}
              </div>
            )}
          </div>

          <div className="mt-14">
            <Heading level="h2">Explore together</Heading>
            <div className="mt-6 grid gap-5 sm:grid-cols-3">
              {quickLinks.map((link) => (
                <Link key={link.href} href={link.href} className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/30">
                  <Card interactive className="flex h-full flex-col gap-3 p-5">
                    <div className={`flex size-11 items-center justify-center rounded-xl ${TONE_STYLES[link.tone]}`}>
                      <link.icon className="size-5" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="font-display text-lg font-semibold text-ink">{link.title}</p>
                      <p className="mt-1 text-sm text-neutral-600">{link.description}</p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-14">
            <Heading level="h2">Learning progress</Heading>
            <p className="mt-2 text-neutral-600">
              What each child has actually explored — nothing here is
              estimated or invented.
            </p>

            {!ready || !progressReady ? null : children.length === 0 ? (
              <EmptyState
                className="mt-6"
                title="Add a child to see their progress here"
                description="Once you add a child and they explore the site, what they did shows up here."
              />
            ) : (
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                {children.map((child) => {
                  const childEvents = getEventsForChild(events, child.id);
                  const summary = summarizeChildProgress(childEvents);
                  const nextStep = getNextStepSuggestion(childEvents);

                  return (
                    <Card key={child.id} className="p-5">
                      <div className="flex items-center gap-3">
                        <ChildAvatar avatar={child.avatar} />
                        <div>
                          <p className="font-medium text-ink">{child.name}</p>
                          {summary.lastActiveAt && (
                            <p className="text-xs text-neutral-500">
                              Last active {formatRelativeTime(summary.lastActiveAt)}
                            </p>
                          )}
                        </div>
                      </div>

                      {childEvents.length === 0 ? (
                        <p className="mt-4 text-sm text-neutral-600">
                          Nothing recorded yet — progress shows up here once{" "}
                          {child.name} explores a subject, resource, or game.
                        </p>
                      ) : (
                        <>
                          {summary.topicsExplored.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-1.5">
                              {summary.topicsExplored.slice(0, 4).map((topic) => (
                                <Badge key={topic} variant="neutral">
                                  {topic}
                                </Badge>
                              ))}
                            </div>
                          )}
                          <ul className="mt-4 space-y-2">
                            {summary.recentActivities.slice(0, 3).map((event) => (
                              <li key={event.id} className="flex items-center justify-between gap-3 text-sm">
                                <span className="text-neutral-700">{describeEvent(event)}</span>
                                <span className="shrink-0 text-xs text-neutral-500">
                                  {formatRelativeTime(event.occurredAt)}
                                </span>
                              </li>
                            ))}
                          </ul>
                          {nextStep && (
                            <Link
                              href={nextStep.href}
                              className="mt-4 flex items-center justify-between gap-2 rounded-lg border border-primary-200 bg-primary-50 px-3.5 py-2.5 text-sm transition-colors hover:border-primary-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/30"
                            >
                              <span>
                                <span className="block text-xs font-medium text-primary-700">{nextStep.label}</span>
                                <span className="font-medium text-ink">{nextStep.activityLabel}</span>
                              </span>
                              <ArrowRight className="size-4 shrink-0 text-primary-700" aria-hidden="true" />
                            </Link>
                          )}
                        </>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-14 flex items-center justify-between gap-4 rounded-xl border border-neutral-200 p-5">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600">
                <Settings className="size-5" aria-hidden="true" />
              </div>
              <div>
                <p className="font-medium text-ink">Account settings</p>
                <p className="text-sm text-neutral-600">Manage your sign-in details.</p>
              </div>
            </div>
            <Button variant="outline" asChild>
              <Link href="/account">Open</Link>
            </Button>
          </div>
        </Container>
      </Section>

      <Modal open={modalOpen} onOpenChange={setModalOpen}>
        <ModalContent className="max-h-[85vh] overflow-y-auto">
          <ModalHeader>
            <ModalTitle>{editingChild ? `Edit ${editingChild.name}'s profile` : "Add a child"}</ModalTitle>
            <ModalDescription>
              {editingChild
                ? "Update their details below."
                : "Just enough to personalize their learning — nothing else."}
            </ModalDescription>
          </ModalHeader>
          <ChildProfileForm
            initialValues={editingChild ?? undefined}
            onSave={handleSave}
            onCancel={() => setModalOpen(false)}
          />
        </ModalContent>
      </Modal>
    </>
  );
}

export { ParentDashboard };
