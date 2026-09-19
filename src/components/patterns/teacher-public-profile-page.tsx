"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { UserX } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Heading } from "@/components/ui/heading";
import { TeacherPublicProfileContent } from "@/components/patterns/teacher-public-profile-content";
import { fetchPublicTeacherProfileBySlug } from "@/lib/accounts/remote-teacher";
import type { PublicTeacherProfile } from "@/lib/accounts/teacher-public-profile";
import { buildTeacherPersonSchema } from "@/lib/seo/author-schema";
import { toJsonLdHtml } from "@/lib/seo/json-ld";
import { getAllLearningCategories } from "@/config/learning-categories";
import { siteConfig } from "@/config/site";

/**
 * The real public route (/teachers/p/[slug]) — genuinely gated by
 * `visibility`, and, since Prompt 110, a genuine cross-browser database
 * lookup (see docs/AUTHENTICATION_BACKEND_AUDIT.md). Reads only from the
 * `public_teacher_profiles` view (`remote-teacher.ts`), whose own Row
 * Level Security policy is the real access control — this component
 * never re-implements or second-guesses it. "Doesn't exist" and "exists
 * but isn't public" are shown identically on purpose: telling them apart
 * would leak whether a given slug is a real, private profile.
 */
function TeacherPublicProfilePage() {
  const params = useParams<{ slug: string }>();
  const [profile, setProfile] = React.useState<PublicTeacherProfile | null | undefined>(undefined);

  React.useEffect(() => {
    let active = true;
    fetchPublicTeacherProfileBySlug(params.slug)
      .then((result) => {
        if (active) setProfile(result);
      })
      .catch(() => {
        if (active) setProfile(null);
      });
    return () => {
      active = false;
    };
  }, [params.slug]);

  if (profile === undefined) {
    return <Section className="min-h-[60vh]" />;
  }

  if (!profile) {
    return (
      <Section surface="sunken" className="flex flex-1 flex-col justify-center">
        <Container className="max-w-md text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-500">
            <UserX className="size-7" aria-hidden="true" />
          </div>
          <Heading level="h1" className="mt-5">
            We couldn&apos;t find this profile
          </Heading>
          <p className="mt-3 text-neutral-600">
            This profile doesn&apos;t exist, or its owner hasn&apos;t made it public.
          </p>
        </Container>
      </Section>
    );
  }

  const categoryNameBySlug = new Map(getAllLearningCategories().map((c) => [c.slug, c.name] as const));
  // Real subject/expertise names this teacher entered themselves — never a
  // fabricated specialty. See src/lib/seo/author-schema.ts.
  const knowsAbout = [...profile.subjects.map((slug) => categoryNameBySlug.get(slug) ?? slug), ...profile.expertise];
  const personSchema = buildTeacherPersonSchema({
    name: profile.name,
    url: `${siteConfig.url}/teachers/p/${profile.slug}`,
    headline: profile.headline,
    bio: profile.bio,
    knowsAbout,
  });

  return (
    <Section surface="sunken" className="py-12 sm:py-16">
      <Container className="max-w-2xl">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: toJsonLdHtml(personSchema) }} />
        <TeacherPublicProfileContent profile={profile} resources={[]} />
      </Container>
    </Section>
  );
}

export { TeacherPublicProfilePage };
