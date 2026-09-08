import type { ReactNode } from "react";
import { BadgeCheck, GraduationCap, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heading } from "@/components/ui/heading";
import { getAllLearningCategories } from "@/config/learning-categories";
import { getAllTeacherAgeGroupOptions, getAllTeacherLanguageOptions, formatTeacherAgeGroupLabel } from "@/config/teacher-options";
import type { PublicTeacherProfile } from "@/lib/accounts/teacher-public-profile";

const categoryNameBySlug = new Map(getAllLearningCategories().map((c) => [c.slug, c.name] as const));
const ageGroupOptionById = new Map(getAllTeacherAgeGroupOptions().map((o) => [o.id, o] as const));
const languageLabelById = new Map(getAllTeacherLanguageOptions().map((o) => [o.id, o.label] as const));

function ProfileSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-neutral-200 pt-6 first:border-t-0 first:pt-0">
      <Heading level="h4" as="h2" className="text-neutral-500">
        {title}
      </Heading>
      <div className="mt-2">{children}</div>
    </section>
  );
}

/**
 * The one place a public teacher profile is actually rendered — reused by
 * both the real route (/teachers/p/[slug]) and the profile editor's
 * "Preview" modal, so what a teacher previews is guaranteed to match what
 * a visitor would see. Deliberately styled as a formal, CV-like page —
 * labeled sections, no like/follow/share affordances, no feed — per
 * Prompt 27's explicit "not a social-media profile" direction.
 */
function TeacherPublicProfileContent({ profile }: { profile: PublicTeacherProfile }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col items-center gap-4 bg-surface-tint-primary px-6 py-10 text-center sm:flex-row sm:text-left">
        <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white text-neutral-400 shadow-sm">
          {profile.photo ? (
            // eslint-disable-next-line @next/next/no-img-element -- a locally-stored data URL, not a served/optimizable image
            <img src={profile.photo} alt="" className="size-full object-cover" />
          ) : (
            <GraduationCap className="size-9" aria-hidden="true" />
          )}
        </div>
        <div>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <Heading level="h2" as="h1">
              {profile.name}
            </Heading>
            {profile.verified && (
              <Badge variant="success" className="gap-1">
                <BadgeCheck className="size-3.5" aria-hidden="true" />
                Verified
              </Badge>
            )}
          </div>
          {profile.headline && <p className="mt-1 text-neutral-600">{profile.headline}</p>}
          {profile.countryRegion && (
            <p className="mt-1.5 flex items-center justify-center gap-1 text-sm text-neutral-500 sm:justify-start">
              <MapPin className="size-3.5" aria-hidden="true" />
              {profile.countryRegion}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-6 p-6 sm:p-8">
        {profile.bio && (
          <ProfileSection title="About">
            <p className="whitespace-pre-line text-ink">{profile.bio}</p>
          </ProfileSection>
        )}

        {profile.education && (
          <ProfileSection title="Education">
            <p className="whitespace-pre-line text-ink">{profile.education}</p>
          </ProfileSection>
        )}

        {profile.certifications && (
          <ProfileSection title="Certifications">
            <p className="whitespace-pre-line text-ink">{profile.certifications}</p>
          </ProfileSection>
        )}

        {profile.yearsExperience !== undefined && (
          <ProfileSection title="Experience">
            <p className="text-ink">
              {profile.yearsExperience} {profile.yearsExperience === 1 ? "year" : "years"} of teaching experience
            </p>
          </ProfileSection>
        )}

        {profile.ageGroupsTaught.length > 0 && (
          <ProfileSection title="Age Groups">
            <div className="flex flex-wrap gap-1.5">
              {profile.ageGroupsTaught.map((id) => {
                const option = ageGroupOptionById.get(id);
                return (
                  <Badge key={id} variant="primary">
                    {option ? formatTeacherAgeGroupLabel(option) : id}
                  </Badge>
                );
              })}
            </div>
          </ProfileSection>
        )}

        {profile.subjects.length > 0 && (
          <ProfileSection title="Subjects">
            <div className="flex flex-wrap gap-1.5">
              {profile.subjects.map((slug) => (
                <Badge key={slug} variant="secondary">
                  {categoryNameBySlug.get(slug) ?? slug}
                </Badge>
              ))}
            </div>
          </ProfileSection>
        )}

        {profile.languages.length > 0 && (
          <ProfileSection title="Languages">
            <div className="flex flex-wrap gap-1.5">
              {profile.languages.map((id) => (
                <Badge key={id} variant="neutral">
                  {languageLabelById.get(id) ?? id}
                </Badge>
              ))}
            </div>
          </ProfileSection>
        )}

        {profile.expertise.length > 0 && (
          <ProfileSection title="Expertise">
            <div className="flex flex-wrap gap-1.5">
              {profile.expertise.map((item) => (
                <Badge key={item} variant="accent">
                  {item}
                </Badge>
              ))}
            </div>
          </ProfileSection>
        )}

        <ProfileSection title="Resources">
          <p className="text-sm text-neutral-500">
            {profile.name.split(" ")[0]} hasn&apos;t published any resources yet.
          </p>
        </ProfileSection>
      </div>
    </Card>
  );
}

export { TeacherPublicProfileContent };
