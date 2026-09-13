"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, BookOpen, Library, Gamepad2, ClipboardList, Bell, Settings, ShieldCheck, Sparkles, Crown } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/patterns/page-header";
import { ChildOverviewCard } from "@/components/patterns/child-overview-card";
import { ChildProfileForm } from "@/components/patterns/child-profile-form";
import { AiAssistantTrigger } from "@/components/patterns/ai-assistant";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
} from "@/components/ui/modal";
import { useChildProfiles } from "@/lib/accounts/use-child-profiles";
import { useProgressEvents } from "@/lib/progress/use-progress-events";
import type { ChildProfileValues } from "@/lib/validations/child-profile";
import type { ChildProfile } from "@/lib/accounts/types";
import { LOCAL_PARENT_ID } from "@/lib/accounts/local-children";
import { getAllMemberships } from "@/lib/memberships/memberships";
import { hasActiveMembership } from "@/lib/memberships/access";

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
  {
    icon: ClipboardList,
    title: "Applications",
    description: "Start or track an application for your child.",
    href: "/dashboard/applications",
    tone: "neutral" as const,
  },
  {
    icon: Bell,
    title: "Notifications",
    description: "Real updates about your applications and account.",
    href: "/dashboard/notifications",
    tone: "neutral" as const,
  },
];

const TONE_STYLES = {
  primary: "bg-primary-100 text-primary-700",
  secondary: "bg-secondary-100 text-secondary-700",
  accent: "bg-accent-100 text-accent-800",
  neutral: "bg-neutral-100 text-neutral-600",
};

/**
 * The parent dashboard reads and writes child profiles from this browser's
 * localStorage only (src/lib/accounts/use-child-profiles.ts) — there's no
 * account to sync them to yet. It's still a genuinely working feature, not
 * a preview: adding, editing, opening a child's view, and everything shown
 * in each ChildOverviewCard (real recorded progress, a real "what's next"
 * suggestion — see docs/PROGRESS_ARCHITECTURE.md and
 * docs/LEARNING_JOURNEY_ARCHITECTURE.md) all actually work. What it never
 * does is invent a statistic, achievement, or recommendation beyond what
 * that child's own events support.
 */
function ParentDashboard() {
  const { children, ready, addChild, updateChild } = useChildProfiles();
  const { events, ready: progressReady } = useProgressEvents();
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingChild, setEditingChild] = React.useState<ChildProfile | null>(null);

  // Always false today — getAllMemberships() returns [] because no
  // checkout flow anywhere in this codebase can create one (see
  // docs/MEMBERSHIP_ARCHITECTURE.md). Real, working logic against a real
  // (currently empty) source, not a hardcoded "Free" label.
  const isPremium = hasActiveMembership(LOCAL_PARENT_ID, getAllMemberships());

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

          <AiAssistantTrigger asChild>
            <button type="button" className="mb-10 block w-full rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/30">
              <Card interactive className="flex items-center gap-4 p-5">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
                  <Sparkles className="size-5" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <p className="font-display text-lg font-semibold text-ink">Ask about learning</p>
                  <p className="mt-1 text-sm text-neutral-600">
                    Find resources, understand a subject, or see progress-related help for your children.
                  </p>
                </div>
                <Badge variant="warning">Development preview</Badge>
              </Card>
            </button>
          </AiAssistantTrigger>

          <div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <Heading level="h2">My Children</Heading>
                <p className="mt-1 text-sm text-neutral-600">
                  Each child&apos;s own profile, real progress, and what to try next — in one place.
                </p>
              </div>
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
                  <ChildOverviewCard
                    key={child.id}
                    child={child}
                    events={events}
                    progressReady={progressReady}
                    onEdit={openEditModal}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="mt-14">
            <Heading level="h2">Find something to explore</Heading>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
            <Heading level="h2">Account</Heading>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="flex items-center justify-between gap-4 rounded-xl border border-neutral-200 p-5">
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
              <div className="flex items-center justify-between gap-4 rounded-xl border border-neutral-200 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600">
                    <ShieldCheck className="size-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-medium text-ink">Privacy</p>
                    <p className="text-sm text-neutral-600">What&apos;s collected and why.</p>
                  </div>
                </div>
                <Button variant="outline" asChild>
                  <Link href="/privacy">Open</Link>
                </Button>
              </div>
              <div className="flex flex-col items-start gap-4 rounded-xl border border-neutral-200 p-5 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600">
                    <Crown className="size-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-medium text-ink">Membership</p>
                    <p className="text-sm text-neutral-600">
                      {isPremium
                        ? "You have an active membership."
                        : "Free access — no membership yet. Every free resource and game stays available either way."}
                    </p>
                  </div>
                </div>
                <Button variant="outline" asChild className="w-full sm:w-auto">
                  <Link href="/offerings">See what&apos;s planned</Link>
                </Button>
              </div>
            </div>
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
