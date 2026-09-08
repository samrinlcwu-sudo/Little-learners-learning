"use client";

import Link from "next/link";
import { Library, GraduationCap, Settings, Sparkles, PenSquare, Globe2, LockKeyhole, ExternalLink } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { PageHeader } from "@/components/patterns/page-header";
import { CapabilityList } from "@/components/patterns/capability-list";
import { useTeacherProfile } from "@/lib/accounts/use-teacher-profile";
import { calculateProfileCompletion } from "@/lib/accounts/teacher-profile-completion";
import { getAllLearningCategories } from "@/config/learning-categories";
import { TEACHER_AGE_GROUP_OPTIONS, TEACHER_LANGUAGE_OPTIONS } from "@/config/teacher-options";
import type { TeacherProfileVisibility } from "@/lib/accounts/types";
import { cn } from "@/lib/utils/cn";

const categoryNameBySlug = new Map(getAllLearningCategories().map((c) => [c.slug, c.name] as const));
const ageGroupLabelById = new Map(TEACHER_AGE_GROUP_OPTIONS.map((o) => [o.id, o.label] as const));
const languageLabelById = new Map(TEACHER_LANGUAGE_OPTIONS.map((o) => [o.id, o.label] as const));

const futureFeatures = [
  {
    title: "Human-reviewed verification badge",
    description: "A \"verified\" mark on your profile once a real review process is connected — never set automatically.",
  },
  {
    title: "Contributing your own resources",
    description: "Sharing material you've made and being discoverable by families looking for your specialties.",
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

/**
 * The landing point after registration (Prompt 26, Part 4). Reads the same
 * local teacher record every step of the flow writes to
 * (src/lib/accounts/local-teacher.ts) — real and working in the browser,
 * exactly like the Parent Dashboard, with the same honesty banner about
 * there being no live backend yet.
 */
function TeacherDashboard() {
  const { teacher, ready, setVisibility } = useTeacherProfile();

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

  const completion = calculateProfileCompletion(teacher);

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

          <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
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
                {completion.sections.map((section) => (
                  <div key={section.title} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-neutral-700">{section.title}</span>
                    <span className={cn("font-medium", section.percent === 100 ? "text-success-700" : "text-neutral-500")}>
                      {section.fields.filter((f) => f.complete).length} of {section.fields.length}
                    </span>
                  </div>
                ))}
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

            <div className="flex flex-col gap-5">
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
                  <Button variant="outline" size="sm" className="mt-3 w-full" asChild>
                    <Link href={`/teachers/p/${teacher.slug}`}>
                      <ExternalLink aria-hidden="true" />
                      View public profile
                    </Link>
                  </Button>
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
                  {teacher.ageGroupsTaught.map((id) => (
                    <Badge key={id} variant="primary">
                      {ageGroupLabelById.get(id) ?? id}
                    </Badge>
                  ))}
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
              <p className={cn("mt-1", teacher.teachingInterests ? "text-ink" : "text-neutral-500")}>
                {teacher.teachingInterests || "Not added yet"}
              </p>
            </Card>
          </div>

          <div className="mt-14">
            <Heading level="h2">Resources</Heading>
            <p className="mt-2 text-neutral-600">{completion.resourcesNote}</p>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Link href="/resources?type=teacher-resource" className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/30">
                <Card interactive className="flex h-full flex-col gap-3 p-5">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-secondary-100 text-secondary-700">
                    <GraduationCap className="size-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-display text-lg font-semibold text-ink">Browse teacher resources</p>
                    <p className="mt-1 text-sm text-neutral-600">Classroom-ready material made for educators — from the platform, not from you yet.</p>
                  </div>
                </Card>
              </Link>
              <Link href="/resources" className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/30">
                <Card interactive className="flex h-full flex-col gap-3 p-5">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
                    <Library className="size-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-display text-lg font-semibold text-ink">Full resource library</p>
                    <p className="mt-1 text-sm text-neutral-600">Worksheets, activities, and ebooks for every subject.</p>
                  </div>
                </Card>
              </Link>
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
    </>
  );
}

export { TeacherDashboard };
