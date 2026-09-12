"use client";

import * as React from "react";
import Link from "next/link";
import { GraduationCap, ShieldAlert, Users } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/patterns/page-header";
import { useAdminTeacherAccounts } from "@/lib/accounts/admin-teacher-directory";
import { filterAdminTeachers, type AdminTeacherFilters } from "@/lib/accounts/admin-teacher-filters";
import { useTeacherResources } from "@/lib/resources/use-teacher-resources";
import { getAllLearningCategories } from "@/config/learning-categories";
import { getAllTeacherAgeGroupOptions, formatTeacherAgeGroupLabel } from "@/config/teacher-options";
import {
  TEACHER_MODERATION_STATUSES,
  TEACHER_MODERATION_STATUS_LABELS,
  type TeacherAgeGroup,
  type TeacherModerationStatus,
} from "@/lib/accounts/types";

const MODERATION_BADGE_VARIANT: Record<TeacherModerationStatus, "neutral" | "success" | "error"> = {
  pending: "neutral",
  approved: "success",
  rejected: "error",
  hidden: "error",
};

const categoryNameBySlug = new Map(getAllLearningCategories().map((c) => [c.slug, c.name] as const));
const ageGroupOptionById = new Map(getAllTeacherAgeGroupOptions().map((o) => [o.id, o] as const));

/**
 * Little Learners Learning's first admin area (Prompt 56) — see
 * docs/ADMIN_ARCHITECTURE.md for the full reasoning, including why "the
 * teacher list" can only ever show this browser's own one teacher account
 * today (no shared backend exists — src/lib/supabase/is-configured.ts —
 * exactly the same limitation the public directory already discloses in
 * docs/TEACHER_DIRECTORY_ARCHITECTURE.md). The search/filter logic itself
 * is real, tested, and ready to scale to a real multi-teacher result set
 * the moment one exists.
 */
function AdminTeacherList() {
  const { teachers, ready } = useAdminTeacherAccounts();
  const { resources, ready: resourcesReady } = useTeacherResources();
  const [query, setQuery] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [ageGroup, setAgeGroup] = React.useState<TeacherAgeGroup | "">("");
  const [moderationStatus, setModerationStatus] = React.useState<TeacherModerationStatus | "">("");
  const [expertise, setExpertise] = React.useState("");

  const filters: AdminTeacherFilters = {
    query: query || undefined,
    subject: subject || undefined,
    ageGroup: ageGroup || undefined,
    moderationStatus: moderationStatus || undefined,
    expertise: expertise || undefined,
  };
  const hasActiveFilters = Boolean(query || subject || ageGroup || moderationStatus || expertise);
  const filtered = filterAdminTeachers(teachers, filters);

  function clearFilters() {
    setQuery("");
    setSubject("");
    setAgeGroup("");
    setModerationStatus("");
    setExpertise("");
  }

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Home", href: "/" }, { label: "Admin", href: "/admin" }, { label: "Teachers" }]}
        eyebrow="Admin"
        title="Teacher management"
        description="Review teacher profiles, moderate visibility, and see resource ownership across the teacher ecosystem."
        surface="tint-secondary"
      />

      <Section className="pt-10 sm:pt-12 lg:pt-14">
        <Container className="max-w-5xl">
          <Alert variant="warning" className="mb-8">
            <p className="font-semibold">This admin area isn&apos;t protected by real authentication yet.</p>
            <p className="mt-1">
              There&apos;s no accounts/sessions backend connected (see docs/ACCOUNTS_ARCHITECTURE.md), so — exactly
              like every other unauthenticated area of this site — anyone with this URL can reach it today. Once
              real accounts exist, every <code>/admin</code> route will require a signed-in account with role
              &ldquo;admin,&rdquo; checked server-side, never a client-side flag.
            </p>
          </Alert>

          <Alert variant="info" className="mb-8">
            There&apos;s no shared backend yet, so this list can only ever show teacher accounts saved on{" "}
            <strong>this device</strong> — never another browser&apos;s. The search and filters below are real,
            working logic that will apply unchanged to a real multi-teacher list once one exists.
          </Alert>

          <div className="grid gap-4 rounded-xl border border-neutral-200 bg-surface p-5 sm:grid-cols-2 lg:grid-cols-5">
            <div className="sm:col-span-2 lg:col-span-1">
              <Label htmlFor="admin-teacher-q">Search</Label>
              <Input
                id="admin-teacher-q"
                type="search"
                placeholder="Name, email, region…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="admin-teacher-subject">Learning area</Label>
              <Select id="admin-teacher-subject" value={subject} onChange={(e) => setSubject(e.target.value)}>
                <option value="">Any subject</option>
                {getAllLearningCategories().map((category) => (
                  <option key={category.slug} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="admin-teacher-age">Age group</Label>
              <Select
                id="admin-teacher-age"
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value as TeacherAgeGroup | "")}
              >
                <option value="">Any age group</option>
                {getAllTeacherAgeGroupOptions().map((option) => (
                  <option key={option.id} value={option.id}>
                    {formatTeacherAgeGroupLabel(option)}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="admin-teacher-moderation">Account status</Label>
              <Select
                id="admin-teacher-moderation"
                value={moderationStatus}
                onChange={(e) => setModerationStatus(e.target.value as TeacherModerationStatus | "")}
              >
                <option value="">Any status</option>
                {TEACHER_MODERATION_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {TEACHER_MODERATION_STATUS_LABELS[status]}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="admin-teacher-expertise">Expertise</Label>
              <Input
                id="admin-teacher-expertise"
                placeholder="e.g. Bilingual"
                value={expertise}
                onChange={(e) => setExpertise(e.target.value)}
              />
            </div>
            {hasActiveFilters && (
              <div className="flex items-end sm:col-span-2 lg:col-span-5">
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
              </div>
            )}
          </div>

          <div className="mt-8">
            {!ready || !resourcesReady ? null : filtered.length === 0 ? (
              <EmptyState
                icon={hasActiveFilters ? Users : GraduationCap}
                title={hasActiveFilters ? "No teachers match your filters" : "No teacher accounts on this device yet"}
                description={
                  hasActiveFilters
                    ? "Try clearing a filter — this device only ever holds one local teacher account today."
                    : "A teacher account is created via /teachers/register — nothing here is invented in the meantime."
                }
                action={
                  hasActiveFilters ? (
                    <Button size="sm" variant="outline" onClick={clearFilters}>
                      Clear filters
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <div className="overflow-x-auto rounded-xl border border-neutral-200">
                <table className="w-full min-w-[860px] text-left text-sm">
                  <thead className="border-b border-neutral-200 bg-surface-sunken text-xs uppercase tracking-wide text-neutral-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">Teacher</th>
                      <th className="px-4 py-3 font-medium">Subjects</th>
                      <th className="px-4 py-3 font-medium">Age groups</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Verified</th>
                      <th className="px-4 py-3 font-medium">Visibility</th>
                      <th className="px-4 py-3 font-medium">Resources</th>
                      <th className="px-4 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {filtered.map((teacher) => {
                      const resourceCount = resources.filter((r) => r.author.teacherId === teacher.id).length;
                      return (
                        <tr key={teacher.id}>
                          <td className="px-4 py-3">
                            <p className="font-medium text-ink">{teacher.name}</p>
                            <p className="text-xs text-neutral-500">{teacher.email}</p>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {teacher.subjects.length === 0 ? (
                                <span className="text-neutral-400">—</span>
                              ) : (
                                teacher.subjects.slice(0, 2).map((slug) => (
                                  <Badge key={slug} variant="secondary">
                                    {categoryNameBySlug.get(slug) ?? slug}
                                  </Badge>
                                ))
                              )}
                              {teacher.subjects.length > 2 && <Badge variant="neutral">+{teacher.subjects.length - 2}</Badge>}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {teacher.ageGroupsTaught.length === 0 ? (
                                <span className="text-neutral-400">—</span>
                              ) : (
                                teacher.ageGroupsTaught.map((id) => (
                                  <Badge key={id} variant="primary">
                                    {ageGroupOptionById.get(id)?.label ?? id}
                                  </Badge>
                                ))
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={MODERATION_BADGE_VARIANT[teacher.moderationStatus]}>
                              {TEACHER_MODERATION_STATUS_LABELS[teacher.moderationStatus]}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={teacher.verified ? "success" : "neutral"}>
                              {teacher.verified ? "Verified" : "Not verified"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-neutral-600">
                            {teacher.visibility === "public" ? "Public" : "Private"}
                          </td>
                          <td className="px-4 py-3 text-neutral-600">{resourceCount}</td>
                          <td className="px-4 py-3 text-right">
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/admin/teachers/${teacher.id}`}>
                                <ShieldAlert aria-hidden="true" />
                                Review
                              </Link>
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Container>
      </Section>
    </>
  );
}

export { AdminTeacherList };
