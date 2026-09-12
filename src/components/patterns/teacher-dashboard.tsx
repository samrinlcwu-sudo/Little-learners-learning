"use client";

import * as React from "react";
import Link from "next/link";
import {
  Library,
  GraduationCap,
  Settings,
  Sparkles,
  PenSquare,
  Globe2,
  LockKeyhole,
  ExternalLink,
  Plus,
  Bell,
  type LucideIcon,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
} from "@/components/ui/modal";
import { PageHeader } from "@/components/patterns/page-header";
import { CapabilityList } from "@/components/patterns/capability-list";
import { TeacherResourceForm } from "@/components/patterns/teacher-resource-form";
import { TeacherResourceList } from "@/components/patterns/teacher-resource-list";
import { useOpenAiAssistant } from "@/components/patterns/ai-assistant";
import { useTeacherProfile } from "@/lib/accounts/use-teacher-profile";
import { calculateProfileCompletion } from "@/lib/accounts/teacher-profile-completion";
import { useTeacherResources } from "@/lib/resources/use-teacher-resources";
import { getAllLearningCategories } from "@/config/learning-categories";
import {
  getAllTeacherAgeGroupOptions,
  getAllTeacherLanguageOptions,
  getAllTeachingInterestOptions,
  formatTeacherAgeGroupLabel,
} from "@/config/teacher-options";
import type { NewTeacherResource } from "@/lib/resources/local-teacher-resources";
import type { Resource } from "@/lib/resources/types";
import type { TeacherModerationStatus, TeacherProfileVisibility } from "@/lib/accounts/types";
import { cn } from "@/lib/utils/cn";

const categoryNameBySlug = new Map(getAllLearningCategories().map((c) => [c.slug, c.name] as const));
const ageGroupOptionById = new Map(getAllTeacherAgeGroupOptions().map((o) => [o.id, o] as const));
const languageLabelById = new Map(getAllTeacherLanguageOptions().map((o) => [o.id, o.label] as const));
const interestLabelById = new Map(getAllTeachingInterestOptions().map((o) => [o.id, o.label] as const));

const MODERATION_STATUS_LABELS: Record<TeacherModerationStatus, string> = {
  pending: "Pending review",
  approved: "Approved",
  rejected: "Not approved",
  hidden: "Hidden",
};

const MODERATION_BADGE_VARIANT: Record<TeacherModerationStatus, "neutral" | "success" | "error"> = {
  pending: "neutral",
  approved: "success",
  rejected: "error",
  hidden: "error",
};

const futureFeatures = [
  {
    title: "Human-reviewed verification badge",
    description: "A \"verified\" mark on your profile once a real review process is connected — never set automatically.",
  },
  {
    title: "Resource review",
    description: "A real reviewer looking at what you submit, so an approved resource can actually appear in the library and on your public profile.",
  },
  {
    title: "A teacher community",
    description: "Professional development and connection with other early-years educators.",
  },
];

const VISIBILITY_OPTIONS: { id: TeacherProfileVisibility; label: string; description: string }[] = [
  { id: "private", label: "Private", description: "Only visible to you." },
  { id: "public", label: "Public", description: "Visible to anyone with the link." },
];

interface QuickAction {
  icon: LucideIcon;
  title: string;
  description: string;
  /** Exactly one of href/onClick — a real destination link, or an in-page action like opening a modal. */
  href?: string;
  onClick?: () => void;
  tone: "primary" | "secondary" | "accent" | "neutral";
  /** e.g. "Development preview" for the assistant entry — never implies a finished feature when it isn't one. */
  badge?: string;
}

const QUICK_ACTION_TONE_STYLES: Record<QuickAction["tone"], string> = {
  primary: "bg-primary-100 text-primary-700",
  secondary: "bg-secondary-100 text-secondary-700",
  accent: "bg-accent-100 text-accent-800",
  neutral: "bg-neutral-100 text-neutral-600",
};

/**
 * The landing point after registration (Prompt 26, Part 4). Reads the same
 * local teacher record every step of the flow writes to
 * (src/lib/accounts/local-teacher.ts) — real and working in the browser,
 * exactly like the Parent Dashboard, with the same honesty banner about
 * there being no live backend yet.
 */
function TeacherDashboard() {
  const { teacher, ready, setVisibility } = useTeacherProfile();
  const { resources, addResource, updateResource, deleteResource } = useTeacherResources();
  const [resourceModalOpen, setResourceModalOpen] = React.useState(false);
  const [editingResource, setEditingResource] = React.useState<Resource | null>(null);
  const openAssistant = useOpenAiAssistant();

  if (!ready) {
    return <Section className="min-h-[60vh]" />;
  }

  if (!teacher) {
    return (
      <Section surface="sunken" className="flex flex-1 flex-col justify-center">
        <Container className="max-w-md text-center">
          <Heading level="h1">No teacher account yet</Heading>
          <p className="mt-3 text-neutral-600">
            We couldn&apos;t find one on this device — registration only
            saves to the browser it was created in.
          </p>
          <Button className="mt-6" asChild>
            <Link href="/teachers/register">Create teacher account</Link>
          </Button>
        </Container>
      </Section>
    );
  }

  if (teacher.accountStatus === "deactivated") {
    return (
      <Section surface="sunken" className="flex flex-1 flex-col justify-center">
        <Container className="max-w-md text-center">
          <Heading level="h1">This account has been deactivated</Heading>
          <p className="mt-3 text-neutral-600">
            Your dashboard and public profile aren&apos;t available while your account is deactivated. If you
            believe this is a mistake, contact support.
          </p>
          <Button className="mt-6" asChild>
            <Link href="/support">Contact support</Link>
          </Button>
        </Container>
      </Section>
    );
  }

  const completion = calculateProfileCompletion(teacher);
  const ownResources = resources.filter((r) => r.author.teacherId === teacher.id);

  function openCreateResourceModal() {
    setEditingResource(null);
    setResourceModalOpen(true);
  }

  function openEditResourceModal(resource: Resource) {
    setEditingResource(resource);
    setResourceModalOpen(true);
  }

  const teacherId = teacher.id;
  const teacherName = teacher.name;

  function handleSaveResource(values: NewTeacherResource, status: "draft" | "published") {
    if (editingResource) {
      updateResource(editingResource.id, { ...values, publicationStatus: status });
    } else {
      addResource(teacherId, teacherName, values, status);
    }
    setResourceModalOpen(false);
  }

  function handleDeleteResource(resource: Resource) {
    if (window.confirm(`Delete "${resource.title}"? This can't be undone.`)) {
      deleteResource(resource.id);
    }
  }

  const quickActions: QuickAction[] = [
    {
      icon: Sparkles,
      title: "Ask the Learning Assistant",
      description: "Find resources, explore by subject or age group, and check your own resource status.",
      onClick: () => openAssistant?.(),
      tone: "accent",
      badge: "Development preview",
    },
    {
      icon: PenSquare,
      title: "Edit profile",
      description: "Update your bio, expertise, and photo.",
      href: "/teachers/register/profile",
      tone: "primary",
    },
    ...(teacher.visibility === "public"
      ? [
          {
            icon: ExternalLink,
            title: "View public profile",
            description: "See exactly what families see.",
            href: `/teachers/p/${teacher.slug}`,
            tone: "secondary" as const,
          },
        ]
      : []),
    {
      icon: Plus,
      title: "Create resource",
      description: "Add a worksheet, activity, or ebook of your own.",
      onClick: openCreateResourceModal,
      tone: "primary",
    },
    {
      icon: GraduationCap,
      title: "Browse teacher resources",
      description: "Classroom-ready material from the platform.",
      href: "/resources?type=teacher-resource",
      tone: "accent",
    },
    {
      icon: Library,
      title: "Full resource library",
      description: "Worksheets, activities, and ebooks.",
      href: "/resources",
      tone: "secondary",
    },
    {
      icon: Bell,
      title: "Notifications",
      description: "Real updates about your account and resources.",
      href: "/dashboard/notifications",
      tone: "neutral",
    },
    {
      icon: Settings,
      title: "Account settings",
      description: "Manage your sign-in details.",
      href: "/account",
      tone: "neutral",
    },
  ];

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Teacher Dashboard" }]}
        eyebrow="Teacher Dashboard"
        title={`Welcome, ${teacher.name}`}
        description="Your professional home base — profile, teaching expertise, and resources in one place."
        surface="tint-secondary"
      />

      <Section className="pt-10 sm:pt-12 lg:pt-14">
        <Container className="max-w-4xl">
          <Alert variant="info" className="mb-10">
            This dashboard works in your browser only right now — it
            isn&apos;t connected to a real account yet. Everything you add
            stays on this device.
          </Alert>

          <div>
            <Heading level="h2">Quick actions</Heading>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {quickActions.map((action) => {
                const content = (
                  <Card interactive className="flex h-full flex-col gap-3 p-5 text-left">
                    <div className="flex items-start justify-between gap-2">
                      <div
                        className={cn(
                          "flex size-11 items-center justify-center rounded-xl",
                          QUICK_ACTION_TONE_STYLES[action.tone],
                        )}
                      >
                        <action.icon className="size-5" aria-hidden="true" />
                      </div>
                      {action.badge && <Badge variant="warning">{action.badge}</Badge>}
                    </div>
                    <div>
                      <p className="font-display text-lg font-semibold text-ink">{action.title}</p>
                      <p className="mt-1 text-sm text-neutral-600">{action.description}</p>
                    </div>
                  </Card>
                );
                const className = "rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/30";
                return action.href ? (
                  <Link key={action.title} href={action.href} className={className}>
                    {content}
                  </Link>
                ) : (
                  <button key={action.title} type="button" onClick={action.onClick} className={className}>
                    {content}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-14 grid gap-5 lg:grid-cols-[1.3fr_1fr]">
            <Card className="p-6">
              <div className="flex items-center justify-between gap-4">
                <Heading level="h3" as="h2">
                  Profile completion
                </Heading>
                <span className="font-display text-2xl font-semibold text-primary-700">
                  {completion.percent}%
                </span>
              </div>
              <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-neutral-100">
                <div
                  className="h-full rounded-full bg-primary-600 transition-[width] duration-300 motion-reduce:transition-none"
                  style={{ width: `${completion.percent}%` }}
                />
              </div>

              <div className="mt-5 space-y-3">
                {completion.sections.map((section) => {
                  const missing = section.fields.filter((f) => !f.complete);
                  return (
                    <div key={section.title}>
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="text-neutral-700">{section.title}</span>
                        <span className={cn("font-medium", section.percent === 100 ? "text-success-700" : "text-neutral-500")}>
                          {section.fields.filter((f) => f.complete).length} of {section.fields.length}
                        </span>
                      </div>
                      {missing.length > 0 && (
                        <p className="mt-1 text-xs text-neutral-500">
                          Still needed: {missing.map((f) => f.label).join(", ")}
                        </p>
                      )}
                    </div>
                  );
                })}
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-neutral-700">Resources</span>
                  <span className="text-neutral-500">Not scored yet</span>
                </div>
              </div>

              <Button className="mt-5" size="sm" asChild>
                <Link href="/teachers/register/profile">
                  <PenSquare aria-hidden="true" />
                  {completion.completedCount === 0 ? "Complete your profile" : "Edit profile"}
                </Link>
              </Button>
            </Card>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
              <Card className="flex flex-col items-center justify-center gap-2 p-5 text-center">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-secondary-100 text-secondary-700">
                  <GraduationCap className="size-6" aria-hidden="true" />
                </div>
                <p className="font-medium text-ink">Verification status</p>
                <Badge variant={teacher.verified ? "success" : "neutral"}>
                  {teacher.verified ? "Verified" : "Not yet verified"}
                </Badge>
                <p className="text-xs text-neutral-500">Set only by human review — never automatic.</p>
              </Card>

              <Card className="p-5">
                <div className="flex items-center gap-2">
                  {teacher.visibility === "public" ? (
                    <Globe2 className="size-4 text-primary-600" aria-hidden="true" />
                  ) : (
                    <LockKeyhole className="size-4 text-neutral-500" aria-hidden="true" />
                  )}
                  <p className="font-medium text-ink">Profile visibility</p>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {VISIBILITY_OPTIONS.map((option) => (
                    <label
                      key={option.id}
                      className={cn(
                        "flex cursor-pointer flex-col items-center gap-0.5 rounded-md border border-neutral-300 px-2 py-2 text-center transition-colors",
                        "has-[:checked]:border-primary-600 has-[:checked]:bg-primary-50",
                        "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary-600/30",
                      )}
                    >
                      <input
                        type="radio"
                        name="visibility"
                        value={option.id}
                        checked={teacher.visibility === option.id}
                        onChange={() => setVisibility(option.id)}
                        className="sr-only"
                      />
                      <span className="text-sm font-medium text-ink">{option.label}</span>
                    </label>
                  ))}
                </div>
                <p className="mt-2 text-xs text-neutral-500">
                  {VISIBILITY_OPTIONS.find((o) => o.id === teacher.visibility)?.description}
                </p>
                {teacher.visibility === "public" && (
                  <div className="mt-3 flex items-center justify-between gap-2 rounded-md bg-neutral-100 px-3 py-2">
                    <span className="text-xs font-medium text-neutral-600">Directory listing</span>
                    <Badge variant={MODERATION_BADGE_VARIANT[teacher.moderationStatus]}>
                      {MODERATION_STATUS_LABELS[teacher.moderationStatus]}
                    </Badge>
                  </div>
                )}
                {teacher.visibility === "public" && teacher.moderationStatus === "pending" && (
                  <p className="mt-2 text-xs text-neutral-500">
                    Your profile page is already live — see &quot;View public profile&quot; in Quick
                    actions above. It&apos;ll also appear in the searchable{" "}
                    <Link href="/teachers" className="underline">
                      teacher directory
                    </Link>{" "}
                    once a human reviews and approves it — nothing here is automatic.
                  </p>
                )}
              </Card>
            </div>
          </div>

          <div className="mt-14">
            <Heading level="h2">Professional information</Heading>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Card className="p-5">
                <p className="text-sm font-medium text-neutral-500">Headline</p>
                <p className={cn("mt-1", teacher.headline ? "text-ink" : "text-neutral-500")}>
                  {teacher.headline || "Not added yet"}
                </p>
                <p className="mt-4 text-sm font-medium text-neutral-500">Country / Region</p>
                <p className="mt-1 text-ink">{teacher.countryRegion}</p>
                <p className="mt-4 text-sm font-medium text-neutral-500">Years of experience</p>
                <p className="mt-1 text-ink">
                  {teacher.yearsExperience !== undefined ? teacher.yearsExperience : "Not added yet"}
                </p>
              </Card>
              <Card className="p-5">
                <p className="text-sm font-medium text-neutral-500">Bio</p>
                <p className={cn("mt-1", teacher.bio ? "text-ink" : "text-neutral-500")}>
                  {teacher.bio || "Not added yet"}
                </p>
                <p className="mt-4 text-sm font-medium text-neutral-500">Education</p>
                <p className={cn("mt-1 whitespace-pre-line", teacher.education ? "text-ink" : "text-neutral-500")}>
                  {teacher.education || "Not added yet"}
                </p>
                <p className="mt-4 text-sm font-medium text-neutral-500">Certifications</p>
                <p className={cn("mt-1 whitespace-pre-line", teacher.certifications ? "text-ink" : "text-neutral-500")}>
                  {teacher.certifications || "Not added yet"}
                </p>
              </Card>
            </div>
          </div>

          <div className="mt-14">
            <Heading level="h2">Teaching expertise</Heading>
            <Card className="mt-6 p-5">
              <p className="text-sm font-medium text-neutral-500">Age groups taught</p>
              {teacher.ageGroupsTaught.length === 0 ? (
                <p className="mt-1 text-sm text-neutral-500">Not added yet</p>
              ) : (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {teacher.ageGroupsTaught.map((id) => {
                    const option = ageGroupOptionById.get(id);
                    return (
                      <Badge key={id} variant="primary">
                        {option ? formatTeacherAgeGroupLabel(option) : id}
                      </Badge>
                    );
                  })}
                </div>
              )}

              <p className="mt-5 text-sm font-medium text-neutral-500">Subjects / learning areas</p>
              {teacher.subjects.length === 0 ? (
                <p className="mt-1 text-sm text-neutral-500">Not added yet</p>
              ) : (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {teacher.subjects.map((slug) => (
                    <Badge key={slug} variant="secondary">
                      {categoryNameBySlug.get(slug) ?? slug}
                    </Badge>
                  ))}
                </div>
              )}

              <p className="mt-5 text-sm font-medium text-neutral-500">Areas of expertise</p>
              {teacher.expertise.length === 0 ? (
                <p className="mt-1 text-sm text-neutral-500">Not added yet</p>
              ) : (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {teacher.expertise.map((item) => (
                    <Badge key={item} variant="accent">
                      {item}
                    </Badge>
                  ))}
                </div>
              )}

              <p className="mt-5 text-sm font-medium text-neutral-500">Languages</p>
              {teacher.languages.length === 0 ? (
                <p className="mt-1 text-sm text-neutral-500">Not added yet</p>
              ) : (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {teacher.languages.map((id) => (
                    <Badge key={id} variant="neutral">
                      {languageLabelById.get(id) ?? id}
                    </Badge>
                  ))}
                </div>
              )}

              <p className="mt-5 text-sm font-medium text-neutral-500">Teaching interests</p>
              {teacher.teachingInterests.length === 0 ? (
                <p className="mt-1 text-sm text-neutral-500">Not added yet</p>
              ) : (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {teacher.teachingInterests.map((id) => (
                    <Badge key={id} variant="primary">
                      {interestLabelById.get(id) ?? id}
                    </Badge>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <div className="mt-14">
            <div className="flex items-center justify-between gap-4">
              <Heading level="h2">Your resources</Heading>
              <Button size="sm" onClick={openCreateResourceModal}>
                <Plus aria-hidden="true" />
                Create resource
              </Button>
            </div>
            <p className="mt-2 text-neutral-600">{completion.resourcesNote}</p>
            <div className="mt-6">
              <TeacherResourceList
                resources={ownResources}
                onEdit={openEditResourceModal}
                onDelete={handleDeleteResource}
              />
            </div>
          </div>

          <div className="mt-14">
            <div className="flex items-center gap-3">
              <Sparkles className="size-5 text-accent-600" aria-hidden="true" />
              <Heading level="h2">What&apos;s ahead</Heading>
            </div>
            <p className="mt-2 text-neutral-600">
              A clear line between what already works and what&apos;s still being built.
            </p>
            <CapabilityList className="mt-6" title="Future professional features" status="coming" items={futureFeatures} />
          </div>
        </Container>
      </Section>

      <Modal open={resourceModalOpen} onOpenChange={setResourceModalOpen}>
        <ModalContent className="max-h-[85vh] overflow-y-auto">
          <ModalHeader>
            <ModalTitle>{editingResource ? `Edit "${editingResource.title}"` : "Create a resource"}</ModalTitle>
            <ModalDescription>
              {editingResource
                ? "Update the details below."
                : "Save as a draft to keep working on it, or submit it for review when it's ready."}
            </ModalDescription>
          </ModalHeader>
          <TeacherResourceForm
            resource={editingResource ?? undefined}
            onSave={handleSaveResource}
            onCancel={() => setResourceModalOpen(false)}
          />
        </ModalContent>
      </Modal>
    </>
  );
}

export { TeacherDashboard };
