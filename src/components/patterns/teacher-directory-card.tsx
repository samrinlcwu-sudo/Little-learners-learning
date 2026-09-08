import Link from "next/link";
import { BadgeCheck, GraduationCap, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAllTeacherAgeGroupOptions, formatTeacherAgeGroupLabel } from "@/config/teacher-options";
import { getAllLearningCategories } from "@/config/learning-categories";
import type { PublicTeacherProfile } from "@/lib/accounts/teacher-public-profile";

const ageGroupOptionById = new Map(getAllTeacherAgeGroupOptions().map((o) => [o.id, o] as const));
const categoryNameBySlug = new Map(getAllLearningCategories().map((c) => [c.slug, c.name] as const));

const MAX_VISIBLE_SUBJECTS = 3;
const MAX_VISIBLE_EXPERTISE = 2;

/**
 * The directory's result card — deliberately narrower than the full
 * profile (Prompt 29 Part 4 names exactly: photo, name, headline,
 * selected expertise, age groups, relevant subjects). No bio, education,
 * certifications, or region here — that's the full profile page's job;
 * loading a card for browsing shouldn't need everything a profile page
 * needs (Part 10). A `verified` badge only ever appears when the
 * platform actually set it — never implied, never guessed.
 */
function TeacherDirectoryCard({ teacher }: { teacher: PublicTeacherProfile }) {
  const visibleSubjects = teacher.subjects.slice(0, MAX_VISIBLE_SUBJECTS);
  const extraSubjects = teacher.subjects.length - visibleSubjects.length;
  const visibleExpertise = teacher.expertise.slice(0, MAX_VISIBLE_EXPERTISE);

  return (
    <Card interactive className="flex h-full flex-col overflow-hidden">
      <CardContent className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center gap-3">
          <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-100 text-neutral-400">
            {teacher.photo ? (
              // eslint-disable-next-line @next/next/no-img-element -- a locally-stored data URL, not a served/optimizable image
              <img src={teacher.photo} alt="" className="size-full object-cover" />
            ) : (
              <GraduationCap className="size-6" aria-hidden="true" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="truncate font-display text-lg font-semibold text-ink">{teacher.name}</p>
              {teacher.verified && (
                <BadgeCheck className="size-4 shrink-0 text-primary-600" aria-label="Verified" />
              )}
            </div>
            {teacher.headline && <p className="truncate text-sm text-neutral-600">{teacher.headline}</p>}
          </div>
        </div>

        {teacher.countryRegion && (
          <p className="flex items-center gap-1 text-xs text-neutral-500">
            <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
            {teacher.countryRegion}
          </p>
        )}

        {teacher.ageGroupsTaught.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
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

        {visibleSubjects.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {visibleSubjects.map((slug) => (
              <Badge key={slug} variant="secondary">
                {categoryNameBySlug.get(slug) ?? slug}
              </Badge>
            ))}
            {extraSubjects > 0 && <Badge variant="neutral">+{extraSubjects} more</Badge>}
          </div>
        )}

        {visibleExpertise.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {visibleExpertise.map((item) => (
              <Badge key={item} variant="accent">
                {item}
              </Badge>
            ))}
          </div>
        )}

        <Button size="sm" className="mt-auto w-full" asChild>
          <Link href={`/teachers/p/${teacher.slug}`}>View profile</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export { TeacherDirectoryCard };
