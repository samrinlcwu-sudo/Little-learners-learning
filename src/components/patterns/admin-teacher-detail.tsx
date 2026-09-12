"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ExternalLink, GraduationCap, UserX } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { PageHeader } from "@/components/patterns/page-header";
import { useAdminTeacherAccounts } from "@/lib/accounts/admin-teacher-directory";
import { useTeacherProfile } from "@/lib/accounts/use-teacher-profile";
import { useTeacherResources } from "@/lib/resources/use-teacher-resources";
import { canViewTeacherProfile } from "@/lib/accounts/teacher-visibility";
import { getAllLearningCategories } from "@/config/learning-categories";
import {
  getAllTeacherAgeGroupOptions,
  getAllTeacherLanguageOptions,
  getAllTeachingInterestOptions,
  formatTeacherAgeGroupLabel,
} from "@/config/teacher-options";
import { RESOURCE_TYPE_LABELS } from "@/lib/resources/types";
import {
  TEACHER_MODERATION_STATUSES,
  TEACHER_MODERATION_STATUS_LABELS,
  type TeacherModerationStatus,
} from "@/lib/accounts/types";
import { cn } from "@/lib/utils/cn";

const MODERATION_BADGE_VARIANT: Record<TeacherModerationStatus, "neutral" | "success" | "error"> = {
  pending: "neutral",
  approved: "success",
  rejected: "error",
  hidden: "error",
};

const categoryNameBySlug = new Map(getAllLearningCategories().map((c) => [c.slug, c.name] as const));
const ageGroupOptionById = new Map(getAllTeacherAgeGroupOptions().map((o) => [o.id, o] as const));
const languageLabelById = new Map(getAllTeacherLanguageOptions().map((o) => [o.id, o.label] as const));
const interestLabelById = new Map(getAllTeachingInterestOptions().map((o) => [o.id, o.label] as const));

/**
 * One teacher's full admin review — real fields only, read from the exact
 * same record the Teacher Dashboard itself reads
 * (src/lib/accounts/local-teacher.ts), since there is no separate "admin"
 * data plane. See docs/ADMIN_ARCHITECTURE.md for the honesty caveats this
 * page discloses (no real authentication yet) and what its moderation
 * controls actually do.
 */
function AdminTeacherDetail() {
  const params = useParams<{ teacherId: string }>();
  const { teachers, ready } = useAdminTeacherAccounts();
  const { setModerationStatus, setVerified } = useTeacherProfile();
  const { resources, ready: resourcesReady, setReviewStatus } = useTeacherResources();

  if (!ready || !resourcesReady) {
    return <Section className="min-h-[60vh]" />;
  }

  const teacher = teachers.find((item) => item.id === params.teacherId);

  if (!teacher) {
    return (
      <Section surface="sunken" className="flex flex-1 flex-col justify-center">
        <Container className="max-w-md text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-500">
            <UserX className="size-7" aria-hidden="true" />
          </div>
          <Heading level="h1" className="mt-5">
            We couldn&apos;t find that teacher account
          </Heading>
          <p className="mt-3 text-neutral-600">
            Teacher accounts aren&apos;t connected to a shared database yet — this admin view can only ever see the
            one teacher account this device holds, if any.
          </p>
          <Button className="mt-6" asChild>
            <Link href="/admin/teachers">Back to teacher management</Link>
          </Button>
        </Container>
      </Section>
    );
  }

  const ownResources = resources.filter((r) => r.author.teacherId === teacher.id);
  const canViewPublicly = canViewTeacherProfile(teacher);

  return (
    <>
      <PageHeader
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Admin", href: "/admin" },
          { label: "Teachers", href: "/admin/teachers" },
          { label: teacher.name },
        ]}
        eyebrow="Admin · Teacher review"
        title={teacher.name}
        description={teacher.headline || teacher.email}
        surface="tint-secondary"
      />

      <Section className="pt-10 sm:pt-12 lg:pt-14">
        <Container className="max-w-3xl space-y-8">
          <Alert variant="warning">
            This admin area isn&apos;t protected by real authentication yet — see docs/ACCOUNTS_ARCHITECTURE.md.
            Every action below is real and changes this teacher&apos;s actual record on this device.
          </Alert>

          <Card className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="flex items-start gap-4">
                <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-100 text-neutral-400">
                  {teacher.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element -- a locally-stored data URL, not a served/optimizable image
                    <img src={teacher.photo} alt={teacher.name} className="size-full object-cover" />
                  ) : (
                    <GraduationCap className="size-7" aria-hidden="true" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-lg font-semibold text-ink">{teacher.name}</p>
                  <p className="text-sm text-neutral-600">{teacher.email}</p>
                  <p className="text-sm text-neutral-500">{teacher.countryRegion}</p>
                </div>
              </div>
              {canViewPublicly && (
                <Button size="sm" variant="outline" className="sm:ml-auto" asChild>
                  <Link href={`/teachers/p/${teacher.slug}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink aria-hidden="true" />
                    View public profile
                  </Link>
                </Button>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <Heading level="h3" as="h2">
              Account status
            </Heading>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-sm font-medium text-neutral-500">Directory moderation</p>
                <Badge className="mt-1" variant={MODERATION_BADGE_VARIANT[teacher.moderationStatus]}>
                  {TEACHER_MODERATION_STATUS_LABELS[teacher.moderationStatus]}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-500">Verification</p>
                <Badge className="mt-1" variant={teacher.verified ? "success" : "neutral"}>
                  {teacher.verified ? "Verified" : "Not verified"}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-500">Visibility (teacher&apos;s own choice)</p>
                <Badge className="mt-1" variant="neutral">
                  {teacher.visibility === "public" ? "Public" : "Private"}
                </Badge>
              </div>
            </div>

            <div className="mt-5 border-t border-neutral-200 pt-5">
              <p className="text-sm font-medium text-neutral-700">Moderation</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {TEACHER_MODERATION_STATUSES.map((status) => (
                  <Button
                    key={status}
                    size="sm"
                    variant={teacher.moderationStatus === status ? "primary" : "outline"}
                    disabled={teacher.moderationStatus === status}
                    onClick={() => setModerationStatus(status)}
                  >
                    {TEACHER_MODERATION_STATUS_LABELS[status]}
                  </Button>
                ))}
              </div>
              <p className="mt-2 text-xs text-neutral-500">
                Approving lets this profile appear in the searchable directory once a real backend exists (see
                docs/TEACHER_DIRECTORY_ARCHITECTURE.md); rejecting or hiding blocks it from{" "}
                <code>/teachers/p/{teacher.slug}</code> immediately, even via direct link.
              </p>
            </div>

            <div className="mt-5 border-t border-neutral-200 pt-5">
              <p className="text-sm font-medium text-neutral-700">Verification</p>
              <div className="mt-2">
                <Button
                  size="sm"
                  variant={teacher.verified ? "outline" : "primary"}
                  onClick={() => setVerified(!teacher.verified)}
                >
                  {teacher.verified ? "Remove verification" : "Mark as verified"}
                </Button>
              </div>
              <p className="mt-2 text-xs text-neutral-500">
                A real human decision, recorded honestly — never set automatically anywhere else in this codebase.
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <Heading level="h3" as="h2">
              Professional information
            </Heading>
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-neutral-500">Headline</p>
                <p className={cn("mt-1", teacher.headline ? "text-ink" : "text-neutral-500")}>
                  {teacher.headline || "Not added yet"}
                </p>
                <p className="mt-4 text-sm font-medium text-neutral-500">Years of experience</p>
                <p className="mt-1 text-ink">
                  {teacher.yearsExperience !== undefined ? teacher.yearsExperience : "Not added yet"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-500">Bio</p>
                <p className={cn("mt-1", teacher.bio ? "text-ink" : "text-neutral-500")}>{teacher.bio || "Not added yet"}</p>
                <p className="mt-4 text-sm font-medium text-neutral-500">Education</p>
                <p className={cn("mt-1 whitespace-pre-line", teacher.education ? "text-ink" : "text-neutral-500")}>
                  {teacher.education || "Not added yet"}
                </p>
                <p className="mt-4 text-sm font-medium text-neutral-500">Certifications</p>
                <p className={cn("mt-1 whitespace-pre-line", teacher.certifications ? "text-ink" : "text-neutral-500")}>
                  {teacher.certifications || "Not added yet"}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <Heading level="h3" as="h2">
              Teaching expertise
            </Heading>
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-sm font-medium text-neutral-500">Age groups taught</p>
                {teacher.ageGroupsTaught.length === 0 ? (
                  <p className="mt-1 text-sm text-neutral-500">Not added yet</p>
                ) : (
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
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
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-500">Subjects</p>
                {teacher.subjects.length === 0 ? (
                  <p className="mt-1 text-sm text-neutral-500">Not added yet</p>
                ) : (
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {teacher.subjects.map((slug) => (
                      <Badge key={slug} variant="secondary">
                        {categoryNameBySlug.get(slug) ?? slug}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-500">Expertise</p>
                {teacher.expertise.length === 0 ? (
                  <p className="mt-1 text-sm text-neutral-500">Not added yet</p>
                ) : (
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {teacher.expertise.map((item) => (
                      <Badge key={item} variant="accent">
                        {item}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-500">Languages</p>
                {teacher.languages.length === 0 ? (
                  <p className="mt-1 text-sm text-neutral-500">Not added yet</p>
                ) : (
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {teacher.languages.map((id) => (
                      <Badge key={id} variant="neutral">
                        {languageLabelById.get(id) ?? id}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-500">Teaching interests</p>
                {teacher.teachingInterests.length === 0 ? (
                  <p className="mt-1 text-sm text-neutral-500">Not added yet</p>
                ) : (
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {teacher.teachingInterests.map((id) => (
                      <Badge key={id} variant="primary">
                        {interestLabelById.get(id) ?? id}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <Heading level="h3" as="h2">
              Resources ({ownResources.length})
            </Heading>
            <p className="mt-1 text-sm text-neutral-600">
              Every resource created by this teacher, clearly owned by their account — admin can review status here,
              never edit the content itself.
            </p>
            {ownResources.length === 0 ? (
              <p className="mt-4 text-sm text-neutral-500">This teacher hasn&apos;t created any resources yet.</p>
            ) : (
              <div className="mt-4 overflow-x-auto rounded-xl border border-neutral-200">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="border-b border-neutral-200 bg-surface-sunken text-xs uppercase tracking-wide text-neutral-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">Title</th>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium">Submission</th>
                      <th className="px-4 py-3 font-medium">Review</th>
                      <th className="px-4 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {ownResources.map((resource) => (
                      <tr key={resource.id}>
                        <td className="px-4 py-3 font-medium text-ink">{resource.title}</td>
                        <td className="px-4 py-3 text-neutral-600">{RESOURCE_TYPE_LABELS[resource.resourceType]}</td>
                        <td className="px-4 py-3">
                          <Badge variant={resource.publicationStatus === "published" ? "primary" : "neutral"}>
                            {resource.publicationStatus === "published" ? "Submitted" : "Draft"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={
                              resource.reviewStatus === "approved"
                                ? "success"
                                : resource.reviewStatus === "rejected"
                                  ? "error"
                                  : "neutral"
                            }
                          >
                            {resource.reviewStatus === "approved"
                              ? "Approved"
                              : resource.reviewStatus === "rejected"
                                ? "Rejected"
                                : "Pending review"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {resource.publicationStatus === "published" ? (
                            <div className="flex justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant={resource.reviewStatus === "approved" ? "primary" : "outline"}
                                disabled={resource.reviewStatus === "approved"}
                                onClick={() => setReviewStatus(resource.id, "approved")}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant={resource.reviewStatus === "rejected" ? "primary" : "outline"}
                                disabled={resource.reviewStatus === "rejected"}
                                onClick={() => setReviewStatus(resource.id, "rejected")}
                              >
                                Reject
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-neutral-400">Not submitted yet</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </Container>
      </Section>
    </>
  );
}

export { AdminTeacherDetail };
