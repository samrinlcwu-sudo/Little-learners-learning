import type { Metadata } from "next";
import Link from "next/link";
import { Search as SearchIcon, Users } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { IconFeature } from "@/components/patterns/icon-feature";
import { PageHeader } from "@/components/patterns/page-header";
import { CapabilityList } from "@/components/patterns/capability-list";
import { TeacherDirectoryCard } from "@/components/patterns/teacher-directory-card";
import { TeacherDirectoryStructuredData } from "@/components/patterns/teacher-directory-structured-data";
import { teacherValuePoints } from "@/config/audience-value-points";
import { getAllLearningCategories } from "@/config/learning-categories";
import {
  getAllTeacherAgeGroupOptions,
  getAllTeacherLanguageOptions,
  getAllTeachingInterestOptions,
  formatTeacherAgeGroupLabel,
} from "@/config/teacher-options";
import { getApprovedTeacherDirectoryEntries } from "@/lib/accounts/teacher-directory";
import { filterTeacherDirectory, paginateTeacherDirectory, type TeacherDirectoryFilters } from "@/lib/accounts/teacher-directory-filters";
import type { TeacherAgeGroup, TeacherLanguage, TeachingInterest } from "@/lib/accounts/types";
import { siteConfig } from "@/config/site";
import { buildSocialMetadata } from "@/lib/seo/social-metadata";

const description =
  "Search Little Learners Learning's teacher directory by subject, age group, language, teaching interest, and expertise — or create your own professional profile.";

export const metadata: Metadata = {
  title: "For Teachers",
  description,
  // Every filter/search/page combination canonicalizes back to the base
  // directory URL, the same pattern /resources uses — a query-filtered
  // view is never its own indexable page (Prompt 29 Part 8: avoid
  // thousands of low-value URLs).
  alternates: { canonical: `${siteConfig.url}/teachers` },
  ...buildSocialMetadata("For Teachers — " + siteConfig.name, description, "/teachers"),
};

const comingLater = [
  {
    title: "Human-reviewed profile verification",
    description: "A \"verified\" badge on your profile once a real review process is connected.",
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

/**
 * Both the "For Teachers" audience page and the teacher directory
 * (Prompt 29) — one URL, like /resources and /games already combine an
 * explanation with a browsable grid, rather than splitting "what this is"
 * and "search it" across two pages. Server-rendered and URL-driven, same
 * architecture as the Resource Library, so it works without JavaScript
 * and a future real data source only changes
 * `getApprovedTeacherDirectoryEntries()` — nothing about this page.
 *
 * The directory is empty for every visitor today, honestly: teacher
 * profiles live only in the browser that created them (no shared
 * backend), and even once one exists, a profile only appears here once a
 * human has approved it (`moderationStatus === "approved"`) — nothing
 * automatic. See docs/TEACHER_DIRECTORY_ARCHITECTURE.md.
 */
export default async function TeachersPage({ searchParams }: PageProps<"/teachers">) {
  const params = await searchParams;
  const getParam = (key: string) => {
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };

  const filters: TeacherDirectoryFilters = {
    query: getParam("q") || undefined,
    subject: getParam("subject") || undefined,
    ageGroup: (getParam("age") as TeacherAgeGroup) || undefined,
    language: (getParam("language") as TeacherLanguage) || undefined,
    expertise: getParam("expertise") || undefined,
    teachingInterest: (getParam("interest") as TeachingInterest) || undefined,
  };
  const page = Number(getParam("page")) || 1;

  const allEntries = getApprovedTeacherDirectoryEntries();
  const filtered = filterTeacherDirectory(allEntries, filters);
  const { items, pageCount, totalCount } = paginateTeacherDirectory(filtered, page);
  const hasActiveFilters = Boolean(
    filters.query ||
      filters.subject ||
      filters.ageGroup ||
      filters.language ||
      filters.expertise ||
      filters.teachingInterest,
  );

  function pageHref(targetPage: number) {
    const next = new URLSearchParams();
    if (filters.query) next.set("q", filters.query);
    if (filters.subject) next.set("subject", filters.subject);
    if (filters.ageGroup) next.set("age", filters.ageGroup);
    if (filters.language) next.set("language", filters.language);
    if (filters.expertise) next.set("expertise", filters.expertise);
    if (filters.teachingInterest) next.set("interest", filters.teachingInterest);
    if (targetPage > 1) next.set("page", String(targetPage));
    const qs = next.toString();
    return qs ? `/teachers?${qs}` : "/teachers";
  }

  return (
    <>
      <PageHeader
        breadcrumb={[{ label: "Home", href: "/" }, { label: "For Teachers" }]}
        eyebrow="For educators"
        title="For Teachers"
        description="A professional home for your teaching profile and classroom-ready resources — and a directory where families and schools can find early-years educators by subject, age group, language, teaching interest, and expertise."
        surface="sunken"
      />

      <Section className="pt-10 sm:pt-12 lg:pt-14">
        <Container className="max-w-3xl">
          <div className="grid gap-4 sm:grid-cols-2">
            {teacherValuePoints.map((point) => (
              <Card key={point.title} className="p-5">
                <IconFeature {...point} tone="secondary" headingAs="h2" />
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      <Section surface="tint-secondary" className="py-12 sm:py-16">
        <Container className="max-w-5xl">
          <div className="flex items-center gap-3">
            <Users className="size-6 text-secondary-700" aria-hidden="true" />
            <Heading level="h2">Find a teacher</Heading>
          </div>
          <p className="mt-2 max-w-2xl text-neutral-600">
            Every teacher listed here has created a professional profile and
            chosen to make it public. Search by name, or filter by the
            subjects, age groups, languages, teaching interests, and
            expertise they&apos;ve added to their own profile — nothing here
            is inferred or assumed on their behalf.
          </p>

          <form method="get" className="mt-6 grid gap-4 rounded-xl border border-neutral-200 bg-surface p-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="sm:col-span-2 lg:col-span-1">
              <Label htmlFor="q">Search</Label>
              <Input id="q" name="q" type="search" placeholder="Name, region…" defaultValue={filters.query} />
            </div>
            <div>
              <Label htmlFor="subject">Learning area</Label>
              <Select id="subject" name="subject" defaultValue={filters.subject ?? ""}>
                <option value="">Any subject</option>
                {getAllLearningCategories().map((category) => (
                  <option key={category.slug} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="age">Age group</Label>
              <Select id="age" name="age" defaultValue={filters.ageGroup ?? ""}>
                <option value="">Any age group</option>
                {getAllTeacherAgeGroupOptions().map((option) => (
                  <option key={option.id} value={option.id}>
                    {formatTeacherAgeGroupLabel(option)}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="language">Language</Label>
              <Select id="language" name="language" defaultValue={filters.language ?? ""}>
                <option value="">Any language</option>
                {getAllTeacherLanguageOptions().map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="expertise">Expertise</Label>
              <Input id="expertise" name="expertise" placeholder="e.g. Bilingual" defaultValue={filters.expertise} />
            </div>
            <div>
              <Label htmlFor="interest">Teaching interest</Label>
              <Select id="interest" name="interest" defaultValue={filters.teachingInterest ?? ""}>
                <option value="">Any teaching interest</option>
                {getAllTeachingInterestOptions().map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-3">
              <Button type="submit">
                <SearchIcon aria-hidden="true" />
                Search
              </Button>
              {hasActiveFilters && (
                <Button variant="outline" asChild>
                  <Link href="/teachers">Clear filters</Link>
                </Button>
              )}
            </div>
          </form>

          <div className="mt-10">
            {items.length > 0 ? (
              <>
                <p className="text-sm text-neutral-500">
                  {totalCount} teacher{totalCount === 1 ? "" : "s"}
                </p>
                <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((teacher) => (
                    <TeacherDirectoryCard key={teacher.slug} teacher={teacher} />
                  ))}
                </div>

                {pageCount > 1 && (
                  <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1} asChild={page > 1}>
                      {page > 1 ? <Link href={pageHref(page - 1)}>Previous</Link> : <span>Previous</span>}
                    </Button>
                    <span className="text-sm text-neutral-600">
                      Page {page} of {pageCount}
                    </span>
                    <Button variant="outline" size="sm" disabled={page >= pageCount} asChild={page < pageCount}>
                      {page < pageCount ? <Link href={pageHref(page + 1)}>Next</Link> : <span>Next</span>}
                    </Button>
                  </nav>
                )}
              </>
            ) : (
              <EmptyState
                icon={Users}
                title={hasActiveFilters ? "No teachers match your search" : "Teacher profiles will appear here soon"}
                description={
                  hasActiveFilters
                    ? "The directory is still new — try clearing a filter, or check back as more educators join and are reviewed."
                    : "This directory lists real teacher profiles once their owners make them public and the platform reviews them — nothing here is invented in the meantime."
                }
                action={
                  hasActiveFilters ? (
                    <Button size="sm" variant="outline" asChild>
                      <Link href="/teachers">Clear filters</Link>
                    </Button>
                  ) : undefined
                }
              />
            )}
          </div>

          <div className="mt-10 flex flex-col items-center gap-3 rounded-xl border border-primary-200 bg-primary-50 p-6 text-center sm:flex-row sm:justify-between sm:text-left">
            <div>
              <p className="font-display text-lg font-semibold text-ink">Are you a teacher?</p>
              <p className="mt-1 text-sm text-neutral-600">
                Create a professional profile and choose to appear here once it&apos;s reviewed.
              </p>
            </div>
            <Button asChild>
              <Link href="/teachers/register">Register as a teacher</Link>
            </Button>
          </div>
        </Container>
      </Section>

      <Section className="py-12 sm:py-16">
        <Container className="max-w-3xl">
          <Heading level="h2">What you can do here</Heading>
          <p className="mt-2 text-neutral-600">
            A clear line between what already works and what&apos;s still being built.
          </p>
          <div className="mt-6 grid gap-8 sm:grid-cols-2">
            <CapabilityList
              title="Today"
              status="available"
              items={[
                {
                  title: "Create a teacher account and professional profile",
                  description: "Register, then add your bio, experience, subjects, and teaching interests — all live today.",
                },
                {
                  title: "Choose to appear in the directory",
                  description: "Set your profile to public from your dashboard — real access control, reviewed before listing.",
                },
                {
                  title: "Create your own resources",
                  description: "Add a worksheet, activity, or ebook from your dashboard — saved for real, awaiting review before it can appear publicly.",
                },
                {
                  title: "Browse classroom-ready material by subject and age",
                  description: "The Learning Hub and Resource Library are both live and organized for quick browsing.",
                },
              ]}
            />
            <CapabilityList title="Ahead" status="coming" items={comingLater} />
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="outline" asChild>
              <Link href="/learn">Explore Learning</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/resources">Browse Resources</Link>
            </Button>
          </div>
        </Container>
      </Section>

      <TeacherDirectoryStructuredData teachers={items} />
    </>
  );
}
